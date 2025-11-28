import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../services/db';
import { Appointment, Service, Professional, User } from '../types';

const AppointmentsPage: React.FC = () => {
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [professionals, setProfessionals] = useState<Record<string, Professional>>({});
  const [user, setUser] = useState<User | null>(null);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  // Toast Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  useEffect(() => {
    const currentUser = db.getUser();
    setUser(currentUser);
    
    if (currentUser) {
        setAppointments(db.getAppointments(currentUser.id));
    }
    
    // Map for easy lookup
    const srvMap: Record<string, Service> = {};
    db.getServices().forEach(s => srvMap[s.id] = s);
    setServices(srvMap);

    const profMap: Record<string, Professional> = {};
    db.getProfessionals().forEach(p => profMap[p.id] = p);
    setProfessionals(profMap);

    // Check for success message from navigation (e.g., after booking)
    if (location.state && location.state.message) {
        showToast(location.state.message, location.state.type || 'success');
        // Clear state to avoid showing again on refresh
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Separate appointments into Upcoming and History
  const { upcomingList, historyList } = useMemo(() => {
      const now = new Date();
      const upcoming: Appointment[] = [];
      const history: Appointment[] = [];

      appointments.forEach(apt => {
          const aptDate = new Date(`${apt.date}T${apt.time}`);
          const isPast = aptDate < now;
          const isCancelled = apt.status === 'cancelled';
          const isCompleted = apt.status === 'completed';

          if (isPast || isCancelled || isCompleted) {
              history.push(apt);
          } else {
              upcoming.push(apt);
          }
      });

      // Sort upcoming by nearest date
      upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
      
      // Sort history by most recent
      history.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

      return { upcomingList: upcoming, historyList: history };
  }, [appointments]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  const handleToggleFavorite = (serviceId: string, professionalId: string) => {
      const updatedUser = db.toggleFavorite(serviceId, professionalId);
      if (updatedUser) setUser(updatedUser);
  };

  const handleCancelAppointment = (appointmentId: string) => {
      if(window.confirm("Deseja realmente cancelar este agendamento?")) {
          db.cancelAppointment(appointmentId);
          setAppointments(prev => prev.map(a => a.id === appointmentId ? {...a, status: 'cancelled'} : a));
          showToast('Agendamento cancelado com sucesso.', 'error');
      }
  };

  const isFavorite = (serviceId: string, professionalId: string) => {
      return user?.favorites?.some(f => f.serviceId === serviceId && f.professionalId === professionalId);
  };

  const displayedAppointments = activeTab === 'upcoming' ? upcomingList : historyList;

  return (
    <div className="space-y-4 relative h-full flex flex-col">
      {/* Toast Notification Component */}
      {toast && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-fade-in-up border ${
              toast.type === 'success' 
              ? 'bg-green-600 text-white border-green-500' 
              : toast.type === 'error'
              ? 'bg-red-500 text-white border-red-400'
              : 'bg-blue-600 text-white border-blue-500'
          }`}>
              <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : toast.type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}`}></i>
              <span className="font-semibold text-sm">{toast.message}</span>
          </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Meus Agendamentos</h1>
      </div>

      {/* Tabs */}
      <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'upcoming' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
              Próximos ({upcomingList.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'history' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
              Histórico
          </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-4">
        {displayedAppointments.length === 0 ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <i className={`fas ${activeTab === 'upcoming' ? 'fa-calendar-day' : 'fa-history'} text-2xl`}></i>
                </div>
                <p>Nenhum agendamento {activeTab === 'upcoming' ? 'programado' : 'encontrado no histórico'}.</p>
            </div>
        ) : (
            <div className="space-y-3">
                {displayedAppointments.map(apt => {
                    const srv = services[apt.serviceId];
                    const prof = professionals[apt.professionalId];
                    const favorited = isFavorite(apt.serviceId, apt.professionalId);
                    
                    // FIX: Adicionando 'T12:00:00' para garantir que o objeto Date não retroceda o dia devido ao fuso horário (UTC-3)
                    const dateObj = new Date(apt.date + 'T12:00:00');
                    const formattedDate = dateObj.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                    });
                    const displayDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

                    const isCancelled = apt.status === 'cancelled';
                    const isHistoryItem = activeTab === 'history';

                    return (
                        <div key={apt.id} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col gap-3 relative transition-colors animate-fade-in ${isHistoryItem && !isCancelled ? 'opacity-90' : isCancelled ? 'opacity-75 grayscale' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex gap-3 w-full">
                                        {/* Ícone de Calendário */}
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isCancelled ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' : isHistoryItem ? 'bg-gray-100 dark:bg-gray-700 text-gray-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300'}`}>
                                            <i className="far fa-calendar-alt text-lg"></i>
                                        </div>
                                        
                                        <div className="pr-8 flex-1">
                                            {/* Data Completa */}
                                            <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isCancelled ? 'text-gray-500' : isHistoryItem ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {displayDate}
                                            </p>
                                            <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-tight">{srv?.name || 'Serviço'}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">com {prof?.name}</p>
                                        </div>
                                </div>
                            </div>
                            
                            {/* Botão Favoritar */}
                            <button 
                                onClick={() => handleToggleFavorite(apt.serviceId, apt.professionalId)}
                                className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-all group ${favorited ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-300 hover:text-red-300 dark:text-gray-600 dark:hover:text-red-400'}`}
                            >
                                <i className={`${favorited ? 'fas' : 'far'} fa-heart text-lg`}></i>
                                <span className="pointer-events-none absolute top-full mt-2 right-0 w-max px-2 py-1 bg-gray-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm">
                                    {favorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                                </span>
                            </button>

                            <div className="pt-3 border-t border-gray-50 dark:border-gray-700 flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                        apt.status === 'confirmed' ? (isHistoryItem ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300') : 
                                        apt.status === 'cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                                        'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                        {apt.status === 'confirmed' ? (isHistoryItem ? 'Concluído' : 'Confirmado') : apt.status === 'cancelled' ? 'Cancelado' : apt.status}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-600 text-xs">|</span>
                                    <div className="text-gray-600 dark:text-gray-300 font-medium">
                                        <i className="far fa-clock mr-1"></i> {apt.time}
                                    </div>
                                </div>
                                <div className="font-bold text-gray-800 dark:text-white">
                                    R$ {srv?.price.toFixed(2)}
                                </div>
                            </div>

                            {/* Botão de Cancelar (Apenas para abas 'upcoming') */}
                            {activeTab === 'upcoming' && !isCancelled && (
                                <div className="pt-2">
                                    <button 
                                        onClick={() => handleCancelAppointment(apt.id)}
                                        className="w-full py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                    >
                                        Cancelar Agendamento
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
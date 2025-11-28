import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { Service, Professional, Appointment, User } from '../types';

enum Step {
  SERVICE,
  PROFESSIONAL,
  DATETIME,
  CONFIRM
}

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(Step.SERVICE);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // Selection State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Favorites Search State
  const [favSearch, setFavSearch] = useState('');

  useEffect(() => {
    setServices(db.getServices());
    setProfessionals(db.getProfessionals());
    setUser(db.getUser());
  }, []);

  // Calcular horários ocupados
  const bookedTimes = useMemo(() => {
    if (!selectedDate || !selectedProfessional) return [];
    
    const allAppointments = db.getAllAppointments();
    
    return allAppointments
      .filter(apt => 
        apt.professionalId === selectedProfessional.id && 
        apt.date === selectedDate &&
        apt.status !== 'cancelled' // Se foi cancelado, o horário está livre
      )
      .map(apt => apt.time);
  }, [selectedDate, selectedProfessional]);

  const handleNext = () => {
    if (step === Step.SERVICE && selectedService) setStep(Step.PROFESSIONAL);
    else if (step === Step.PROFESSIONAL && selectedProfessional) setStep(Step.DATETIME);
    else if (step === Step.DATETIME && selectedDate && selectedTime) setStep(Step.CONFIRM);
  };

  const handleBack = () => {
    if (step > Step.SERVICE) setStep(step - 1);
  };

  const handleConfirm = () => {
    const currentUser = db.getUser(); // Refresh user just in case
    if (currentUser && selectedService && selectedProfessional) {
        const newAppointment: Appointment = {
            id: 'apt_' + Date.now(),
            userId: currentUser.id,
            serviceId: selectedService.id,
            professionalId: selectedProfessional.id,
            date: selectedDate,
            time: selectedTime,
            status: 'confirmed',
            createdAt: Date.now()
        };
        db.addAppointment(newAppointment);
        // Passa mensagem de sucesso via state para a próxima tela
        navigate('/appointments', { state: { message: 'Agendamento Confirmado com Sucesso!', type: 'success' } });
    }
  };

  // Função para usar favorito (Atalho)
  const handleUseFavorite = (serviceId: string, professionalId: string) => {
      const srv = services.find(s => s.id === serviceId);
      const prof = professionals.find(p => p.id === professionalId);

      if (srv && prof) {
          setSelectedService(srv);
          setSelectedProfessional(prof);
          // Pula direto para data/hora
          setStep(Step.DATETIME);
      }
  };

  // Função para remover favorito
  const handleRemoveFavorite = (e: React.MouseEvent, serviceId: string, professionalId: string) => {
    e.stopPropagation(); // Impede que o clique selecione o serviço
    if (window.confirm("Remover este item dos favoritos?")) {
        const updatedUser = db.toggleFavorite(serviceId, professionalId);
        if (updatedUser) setUser(updatedUser);
    }
  };

  // Filtrar favoritos
  const filteredFavorites = useMemo(() => {
    if (!user?.favorites) return [];
    const query = favSearch.toLowerCase();
    
    return user.favorites.filter(fav => {
        const srv = services.find(s => s.id === fav.serviceId);
        const prof = professionals.find(p => p.id === fav.professionalId);
        if (!srv || !prof) return false;
        
        return srv.name.toLowerCase().includes(query) || prof.name.toLowerCase().includes(query);
    });
  }, [user?.favorites, favSearch, services, professionals]);

  // Generate Mock Time Slots
  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  
  // Helpers para UI de disponibilidade
  const availableSlotsCount = timeSlots.length - bookedTimes.length;
  const isDayFull = availableSlotsCount === 0;

  return (
    <div className="h-full flex flex-col">
      {/* Step Indicator */}
      <div className="mb-6 flex justify-between px-2">
         {[Step.SERVICE, Step.PROFESSIONAL, Step.DATETIME, Step.CONFIRM].map((s, i) => (
             <div key={i} className={`h-1.5 flex-1 mx-1 rounded-full ${step >= s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
         ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* Step 1: Services */}
        {step === Step.SERVICE && (
            <div className="space-y-4 animate-fade-in">
                
                {/* Meus Favoritos Section - Acesso Rápido */}
                {user?.favorites && user.favorites.length > 0 && services.length > 0 && professionals.length > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-3">
                            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                                <i className="fas fa-heart text-red-500"></i> Agendamento Rápido
                            </h2>
                        </div>
                        
                        {/* Campo de Busca de Favoritos */}
                        <div className="relative mb-3">
                            <i className="fas fa-search absolute left-3 top-3 text-gray-400 text-xs"></i>
                            <input 
                                type="text" 
                                placeholder="Filtrar favoritos..." 
                                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-700/50 border border-transparent focus:bg-white dark:focus:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-colors dark:text-white"
                                value={favSearch}
                                onChange={(e) => setFavSearch(e.target.value)}
                            />
                        </div>

                        {filteredFavorites.length === 0 ? (
                            <div className="text-center py-4 text-gray-400 text-xs italic bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                Nenhum favorito encontrado para "{favSearch}"
                            </div>
                        ) : (
                            <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                                {filteredFavorites.map((fav, idx) => {
                                    const favService = services.find(s => s.id === fav.serviceId);
                                    const favProf = professionals.find(p => p.id === fav.professionalId);
                                    if (!favService || !favProf) return null;

                                    return (
                                        <div key={idx} className="relative group">
                                            <button 
                                                onClick={() => handleUseFavorite(fav.serviceId, fav.professionalId)}
                                                className="min-w-[200px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl flex items-center gap-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-left snap-start h-full"
                                            >
                                                <div className="relative">
                                                    <img src={favProf.avatar} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-600 shadow-sm" alt="Pro" />
                                                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                                                        <i className="fas fa-bolt"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-white text-sm truncate w-24">{favService.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-24">com {favProf.name}</p>
                                                </div>
                                            </button>
                                            
                                            {/* Remove Button */}
                                            <button 
                                                onClick={(e) => handleRemoveFavorite(e, fav.serviceId, fav.professionalId)}
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 flex items-center justify-center text-xs transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remover"
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Escolha o Serviço</h2>
                {services.map(srv => (
                    <div 
                        key={srv.id} 
                        onClick={() => setSelectedService(srv)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex gap-4 items-center ${selectedService?.id === srv.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-white dark:bg-gray-800 shadow-sm'}`}
                    >
                        <img src={srv.image} alt="" className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800 dark:text-white">{srv.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{srv.durationMinutes} min • R$ {srv.price}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedService?.id === srv.id ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'}`}>
                            {selectedService?.id === srv.id && <div className="w-3 h-3 rounded-full bg-blue-600" />}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Step 2: Professional */}
        {step === Step.PROFESSIONAL && (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Escolha o Profissional</h2>
                <div className="grid grid-cols-2 gap-4">
                    {professionals.map(prof => (
                        <div 
                            key={prof.id} 
                            onClick={() => setSelectedProfessional(prof)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center ${selectedProfessional?.id === prof.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-transparent bg-white dark:bg-gray-800 shadow-sm'}`}
                        >
                            <img src={prof.avatar} alt="" className="w-20 h-20 rounded-full object-cover mb-3" />
                            <h3 className="font-bold text-gray-800 dark:text-white text-sm">{prof.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{prof.specialty}</p>
                            <div className="flex items-center gap-1 mt-2 text-yellow-400 text-xs">
                                <i className="fas fa-star"></i> {prof.rating}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Step 3: Date & Time */}
        {step === Step.DATETIME && (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Data e Hora</h2>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm transition-colors">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Selecione o Dia</label>
                    <input 
                        type="date" 
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
                        min={new Date().toISOString().split('T')[0]}
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedTime(''); // Limpar horário ao mudar a data
                        }}
                    />
                </div>

                {selectedDate && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-3">
                             <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Horários</label>
                             {isDayFull ? (
                                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                                    <i className="fas fa-exclamation-circle mr-1"></i> Agenda Lotada
                                </span>
                             ) : (
                                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-md">
                                    <i className="fas fa-check-circle mr-1"></i> {availableSlotsCount} disponíveis
                                </span>
                             )}
                        </div>

                        {isDayFull ? (
                            <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-xl text-center border border-red-100 dark:border-red-900/30">
                                <i className="fas fa-calendar-times text-3xl text-red-300 dark:text-red-500 mb-2"></i>
                                <p className="text-gray-700 dark:text-gray-300 font-medium">Ops! Sem horários livres.</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Tente selecionar outro dia no calendário acima.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {timeSlots.map(time => {
                                    const isBooked = bookedTimes.includes(time);
                                    return (
                                        <button
                                            key={time}
                                            disabled={isBooked}
                                            onClick={() => setSelectedTime(time)}
                                            className={`py-2 rounded-xl text-sm font-medium transition-colors 
                                                ${isBooked 
                                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through' 
                                                    : selectedTime === time 
                                                        ? 'bg-blue-600 text-white shadow-md' 
                                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        
                        {!isDayFull && bookedTimes.length > 0 && (
                            <p className="text-xs text-gray-400 mt-2 text-center">Horários riscados já foram reservados.</p>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* Step 4: Confirm */}
        {step === Step.CONFIRM && (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Confirmar Agendamento</h2>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm space-y-4 relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-bl-full -mr-4 -mt-4"></div>

                    <div className="relative z-10">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Serviço</h3>
                        <p className="font-bold text-gray-800 dark:text-white text-lg">{selectedService?.name}</p>
                        <p className="text-blue-600 dark:text-blue-400 font-bold">R$ {selectedService?.price.toFixed(2)}</p>
                    </div>

                    <div className="relative z-10">
                         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Profissional</h3>
                         <div className="flex items-center gap-2 mt-1">
                             <img src={selectedProfessional?.avatar} className="w-6 h-6 rounded-full" />
                             <p className="font-medium text-gray-700 dark:text-gray-300">{selectedProfessional?.name}</p>
                         </div>
                    </div>

                    <div className="relative z-10 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-8">
                        <div>
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data</h3>
                             {/* FIX: Adicionando 'T12:00:00' para garantir que a data não volte um dia devido ao fuso horário */}
                             <p className="font-medium text-gray-700 dark:text-gray-300">
                                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                             </p>
                        </div>
                        <div>
                             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Horário</h3>
                             <p className="font-medium text-gray-700 dark:text-gray-300">{selectedTime}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* Footer Controls */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-4">
         {step > Step.SERVICE && (
             <button onClick={handleBack} className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800">
                 Voltar
             </button>
         )}
         <button 
            onClick={step === Step.CONFIRM ? handleConfirm : handleNext}
            disabled={
                (step === Step.SERVICE && !selectedService) ||
                (step === Step.PROFESSIONAL && !selectedProfessional) ||
                (step === Step.DATETIME && (!selectedDate || !selectedTime))
            }
            className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                ((step === Step.SERVICE && !selectedService) ||
                (step === Step.PROFESSIONAL && !selectedProfessional) ||
                (step === Step.DATETIME && (!selectedDate || !selectedTime)))
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
            }`}
         >
            {step === Step.CONFIRM ? 'Confirmar' : 'Próximo'}
         </button>
      </div>
    </div>
  );
};

export default BookingPage;
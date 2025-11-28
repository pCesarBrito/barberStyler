import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { Appointment, Service, User } from '../types';

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const u = db.getUser();
    setUser(u);
    if (u) {
      setAppointments(db.getAppointments(u.id));
    }
    setServices(db.getServices());
  }, []);

  const nextAppointment = appointments.find(a => new Date(a.date + 'T' + a.time) > new Date());

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
            <h2 className="text-lg opacity-90">Olá, {user?.name?.split(' ')[0]}!</h2>
            <h1 className="text-2xl font-bold mt-1">Hora de renovar o estilo?</h1>
            <Link to="/booking" className="inline-block mt-4 bg-white text-blue-600 px-5 py-2 rounded-full font-semibold text-sm shadow-md hover:bg-gray-50 transition-colors">
                Agendar Agora
            </Link>
        </div>
        <i className="fas fa-cut absolute -bottom-4 -right-4 text-9xl text-white opacity-10 transform -rotate-12"></i>
      </div>

      {/* Next Appointment Card */}
      {nextAppointment && (
        <div>
           <div className="flex justify-between items-center mb-3 px-2">
                <h3 className="font-bold text-gray-800 dark:text-white">Próximo Agendamento</h3>
           </div>
           <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-l-4 border-green-500 shadow-sm flex items-center justify-between transition-colors">
                <div>
                    {/* FIX: Adicionando 'T12:00:00' para garantir interpretação correta do dia */}
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">
                        {new Date(nextAppointment.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{nextAppointment.time}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <i className="fas fa-check-circle text-green-500 mr-1"></i>
                        Confirmado
                    </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-xl">
                    <i className="fas fa-calendar-day text-2xl text-gray-400 dark:text-gray-300"></i>
                </div>
           </div>
        </div>
      )}

      {/* Popular Services Horizontal Scroll */}
      <div>
        <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="font-bold text-gray-800 dark:text-white">Serviços Populares</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {services.slice(0, 3).map(service => (
                <div key={service.id} className="min-w-[160px] bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm snap-start border border-gray-100 dark:border-gray-700 flex flex-col transition-colors">
                    <img src={service.image} alt={service.name} className="w-full h-24 object-cover rounded-xl mb-3" />
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm">{service.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{service.description}</p>
                    <div className="mt-auto pt-3 flex justify-between items-center">
                        <span className="font-bold text-blue-600 dark:text-blue-400">R$ {service.price}</span>
                        <Link to="/booking" className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-200 dark:hover:bg-blue-800">
                            <i className="fas fa-plus text-xs"></i>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
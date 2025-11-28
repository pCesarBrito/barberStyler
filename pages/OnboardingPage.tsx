import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    birthDate: '',
    avatar: ''
  });

  useEffect(() => {
    const user = db.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setFormData(prev => ({
        ...prev,
        email: user.email || '',
        phone: user.phone || '',
        name: user.name || '',
        avatar: user.avatar || ''
    }));
  }, [navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, avatar: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = db.getUser();
    if (user) {
      const updatedUser = {
        ...user,
        ...formData,
        completedOnboarding: true
      };
      db.saveUser(updatedUser);
      navigate('/');
    }
  };

  return (
    <div className="p-6 pt-8 max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Complete seu Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400">Personalize sua conta para agendamentos.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center mb-6">
            <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <i className="fas fa-user text-4xl text-gray-400 dark:text-gray-600"></i>
                    )}
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md border-2 border-white dark:border-gray-900 group-hover:bg-blue-700 transition-colors">
                    <i className="fas fa-camera text-sm"></i>
                </div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Toque para alterar a foto</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nome</label>
                <input 
                    type="text" required 
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Sobrenome</label>
                <input 
                    type="text" required 
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                    value={formData.surname}
                    onChange={e => setFormData({...formData, surname: e.target.value})}
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email</label>
            <input 
                type="email" required 
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-gray-400 cursor-not-allowed"
                value={formData.email}
                readOnly
                onChange={e => setFormData({...formData, email: e.target.value})}
            />
        </div>

        <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">WhatsApp</label>
            <input 
                type="tel" required 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition-colors"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
            />
        </div>

        <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Data de Nascimento</label>
            <input 
                type="date" required 
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-600 dark:text-gray-300 transition-colors"
                value={formData.birthDate}
                onChange={e => setFormData({...formData, birthDate: e.target.value})}
            />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all mt-8 transform active:scale-95">
            Finalizar Cadastro <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </form>
    </div>
  );
};

export default OnboardingPage;
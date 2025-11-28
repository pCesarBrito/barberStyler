import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { ThemeMode } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = db.getUser();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('theme') as ThemeMode) || 'system';
  });
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');

    if (theme === 'dark' || theme === 'purple') {
        root.classList.add('dark');
    } else if (theme === 'light') {
        root.classList.remove('dark');
    } else if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            root.classList.add('dark');
        }
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setIsThemeDropdownOpen(false);
  };

  const getThemeIcon = () => {
      if (theme === 'light') return 'fa-sun';
      if (theme === 'dark') return 'fa-moon';
      if (theme === 'purple') return 'fa-bolt';
      return 'fa-adjust';
  };

  const getThemeLabel = () => {
      if (theme === 'light') return 'Claro';
      if (theme === 'dark') return 'Escuro';
      if (theme === 'purple') return 'Intenso';
      return 'Sistema';
  };

  const handleLogout = () => {
    db.logout();
    navigate('/auth');
  };

  // Hide nav on auth and onboarding pages if needed
  const isAuthPage = location.pathname === '/auth';

  // Common background logic for Auth page or Purple Theme
  const purpleGradientClass = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-700 via-indigo-950 to-black";

  if (isAuthPage) {
    return (
        <div className={`min-h-screen ${purpleGradientClass} flex items-center justify-center p-4 transition-colors`}>
            {children}
        </div>
    );
  }

  // Determine Main Background based on Theme
  const mainBgClass = theme === 'purple' 
    ? purpleGradientClass 
    : "bg-gray-50 dark:bg-gray-900";

  // Header and Nav transparency for Purple theme
  const glassEffectClass = theme === 'purple' 
    ? "bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-white/10" 
    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";

  return (
    <div className={`min-h-screen ${mainBgClass} flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 dark:border-gray-800 transition-colors`}>
      {/* Top Bar */}
      <header className={`${glassEffectClass} p-4 shadow-sm flex justify-between items-center sticky top-0 z-20 transition-all border-b`}>
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-blue-500/30">
            <i className="fas fa-cut"></i>
          </div>
          <h1 className="font-bold text-gray-800 dark:text-white text-lg tracking-tight">Barber Styles</h1>
        </div>
        
        <div className="flex items-center gap-3">
             {/* Theme Dropdown */}
             <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)} 
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-300 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-all border border-transparent dark:border-gray-600"
                    title="Alterar Tema"
                >
                    <i className={`fas ${getThemeIcon()}`}></i>
                </button>

                {isThemeDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-fade-in">
                        <div className="p-2 space-y-1">
                            {[
                                { id: 'light', label: 'Claro', icon: 'fa-sun' },
                                { id: 'dark', label: 'Escuro', icon: 'fa-moon' },
                                { id: 'purple', label: 'Intenso', icon: 'fa-bolt', color: 'text-purple-500' },
                                { id: 'system', label: 'Sistema', icon: 'fa-adjust' },
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleThemeChange(opt.id as ThemeMode)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors
                                        ${theme === opt.id 
                                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <i className={`fas ${opt.icon} w-5 text-center ${opt.color || ''}`}></i>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             {user && (
                 <>
                    {user.avatar ? (
                        <img 
                            src={user.avatar} 
                            alt="Profile" 
                            className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 shadow-sm"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {user.name.charAt(0)}
                        </div>
                    )}
                    <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-1 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                 </>
             )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24 dark:text-gray-200">
        {children}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      {user && user.completedOnboarding && (
        <>
            {/* New Service Shortcut FAB */}
            <Link 
                to="/booking" 
                className="fixed bottom-20 right-4 bg-blue-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all z-30 hover:scale-105 active:scale-95 border-2 border-white dark:border-gray-900"
                title="Novo Serviço"
            >
                <i className="fas fa-plus text-2xl"></i>
            </Link>

            <nav className={`${glassEffectClass} border-t fixed bottom-0 w-full max-w-md pb-safe transition-all z-20`}>
                <div className="flex justify-around items-center h-16">
                    <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <i className="fas fa-home text-xl"></i>
                        <span className="text-xs font-medium">Início</span>
                    </Link>
                    <Link to="/booking" className={`flex flex-col items-center gap-1 -mt-6`}>
                        <div className={`bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform border-4 ${theme === 'purple' ? 'border-indigo-900' : 'border-gray-50 dark:border-gray-900'}`}>
                            <i className="fas fa-plus text-xl"></i>
                        </div>
                    </Link>
                    <Link to="/appointments" className={`flex flex-col items-center gap-1 transition-colors ${location.pathname === '/appointments' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <i className="fas fa-calendar-alt text-xl"></i>
                        <span className="text-xs font-medium">Agendas</span>
                    </Link>
                </div>
            </nav>
        </>
      )}
    </div>
  );
};

export default Layout;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { AuthState } from '../types';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<AuthState>(AuthState.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [showSmsInput, setShowSmsInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API latency
    setTimeout(() => {
      // 1. Tenta encontrar usuário existente no "Banco de Dados"
      const existingUser = db.findUserByEmail(email);

      if (existingUser) {
          // Usuário Encontrado: Restaura sessão e verifica onboarding
          db.saveUser(existingUser);
          
          if (existingUser.completedOnboarding) {
              navigate('/');
          } else {
              navigate('/onboarding');
          }
      } else {
          // Usuário Não Encontrado (Demo): Cria um novo para facilitar teste
          // Na vida real aqui daria erro "Usuário não encontrado"
          const newUser = {
            id: 'u_' + Date.now(),
            email: email || 'user@example.com',
            name: email.split('@')[0] || 'Usuário',
            completedOnboarding: false
          };
          
          db.saveUser(newUser);
          navigate('/onboarding');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
        // Verifica se já existe antes de criar
        const existingUser = db.findUserByEmail(email);
        if (existingUser) {
            alert("Este email já está cadastrado. Faça login.");
            setView(AuthState.LOGIN);
            setIsLoading(false);
            return;
        }

        const user = {
            id: 'u_' + Date.now(),
            email: email,
            name: email.split('@')[0],
            completedOnboarding: false
        };
        db.saveUser(user);
        navigate('/onboarding');
        setIsLoading(false);
    }, 1000);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        alert(`Um link de recuperação foi enviado para ${email}`);
        setView(AuthState.LOGIN);
        setIsLoading(false);
    }, 1000);
  };

  const handleSmsLogin = () => {
     if(!showSmsInput) {
        setIsLoading(true);
        setTimeout(() => {
            setShowSmsInput(true);
            setIsLoading(false);
            alert("Código simulado: 1234");
        }, 1000);
     } else {
         if(smsCode === '1234') {
             // Mock simples para SMS: cria user baseado no telefone se não tiver lógica complexa
             const user = {
                 id: 'u_' + Date.now(),
                 email: '',
                 phone: phone,
                 name: 'Usuário Mobile',
                 completedOnboarding: false
             };
             db.saveUser(user);
             navigate('/onboarding');
         } else {
             alert("Código incorreto");
         }
     }
  };

  const getTitle = () => {
      switch(view) {
          case AuthState.REGISTER: return 'Criar Conta';
          case AuthState.RECOVERY: return 'Recuperar Senha';
          default: return 'Bem-vindo de volta';
      }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm transition-all duration-300">
      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-3">
          <i className="fas fa-cut text-3xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {getTitle()}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Agende seu estilo em segundos.</p>
      </div>

      {/* LOGIN FORM */}
      {view === AuthState.LOGIN && (
        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div className="space-y-4">
                <button type="button" onClick={(e) => handleLogin(e)} className="w-full border border-gray-300 dark:border-gray-600 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-200">
                    <i className="fab fa-google text-red-500"></i>
                    Continuar com Google
                </button>
                <div className="relative flex items-center justify-center">
                    <hr className="w-full border-gray-200 dark:border-gray-600" />
                    <span className="absolute bg-white dark:bg-gray-800 px-2 text-xs text-gray-400">OU EMAIL</span>
                </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                <input 
                    key="login-email"
                    type="email" 
                    required 
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value.replace(/,/g, '.'))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Senha</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                <input 
                    key="login-password"
                    type="password" 
                    required 
                    autoComplete="current-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
                <button type="button" onClick={() => setView(AuthState.RECOVERY)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Esqueceu a senha?</button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all transform active:scale-95">
                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Entrar'}
            </button>
        </form>
      )}

      {/* REGISTER FORM */}
      {view === AuthState.REGISTER && (
        <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                <input 
                    key="register-email"
                    type="email" 
                    required 
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value.replace(/,/g, '.'))}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Senha</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                <input 
                    key="register-password"
                    type="password" 
                    required 
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Confirmar Senha</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3 text-gray-400"></i>
                <input 
                    key="register-confirm-password"
                    type="password" 
                    required 
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all transform active:scale-95">
                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Criar Conta'}
            </button>
        </form>
      )}

      {/* RECOVERY FORM */}
      {view === AuthState.RECOVERY && (
        <form onSubmit={handleRecovery} className="space-y-4 animate-fade-in">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Informe seu email para receber o link de redefinição.</p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Email</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3 text-gray-400"></i>
                <input 
                    key="recovery-email"
                    type="email" 
                    required 
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-gray-700 dark:text-white"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value.replace(/,/g, '.'))}
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all transform active:scale-95">
                {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Enviar Link'}
            </button>
            
            <button type="button" onClick={() => setView(AuthState.LOGIN)} className="w-full text-center text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 py-2">
                Voltar ao Login
            </button>
        </form>
      )}

      {/* SMS Login Variation (Only on Login View) */}
      {view === AuthState.LOGIN && (
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <h3 className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Ou via SMS</h3>
              <div className="flex gap-2">
                 {!showSmsInput ? (
                    <>
                        <input 
                            type="tel" 
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:text-white" 
                            placeholder="(11) 99999-9999"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                        />
                        <button onClick={handleSmsLogin} className="bg-green-500 text-white px-4 rounded-lg hover:bg-green-600">
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </>
                 ) : (
                    <>
                         <input 
                            type="text" 
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none text-center tracking-widest dark:bg-gray-700 dark:text-white" 
                            placeholder="0000"
                            value={smsCode}
                            maxLength={4}
                            onChange={e => setSmsCode(e.target.value)}
                        />
                        <button onClick={handleSmsLogin} className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700">
                            OK
                        </button>
                    </>
                 )}
              </div>
          </div>
      )}

      {/* View Switcher Footer */}
      {view !== AuthState.RECOVERY && (
        <div className="mt-6 text-center text-sm">
            {view === AuthState.LOGIN ? (
                <p className="text-gray-600 dark:text-gray-400">Não tem conta? <button onClick={() => setView(AuthState.REGISTER)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Cadastre-se</button></p>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">Já tem conta? <button onClick={() => setView(AuthState.LOGIN)} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Fazer Login</button></p>
            )}
        </div>
      )}
    </div>
  );
};

export default AuthPage;
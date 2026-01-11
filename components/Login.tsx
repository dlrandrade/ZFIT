
import React, { useState } from 'react';
import { ZFitLogo } from './Logo';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const simulateLogin = (type: 'google' | 'apple') => {
    setLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        id: 'me',
        name: 'Alex Rivera',
        email: 'alex@zfit.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZFIT',
        level: 1,
        xp: 0,
        role: 'admin', // Definido como admin para fins de demonstração do SaaS
        joinDate: new Date().toISOString()
      };
      onLogin(mockUser);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#adf94e] opacity-[0.07] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#adf94e] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-sm w-full space-y-12 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center text-center space-y-6">
          <ZFitLogo size={48} />
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-[0.8]">
              DOMINE SEU<br/>POTENCIAL
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">O Próximo Nível do Treino PWA</p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => simulateLogin('google')}
            disabled={loading}
            className="w-full h-16 bg-white rounded-[25px] flex items-center justify-center space-x-4 group active:scale-95 transition-all disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
            <span className="text-black font-black uppercase text-xs tracking-widest">Entrar com Google</span>
            {loading && <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />}
          </button>

          <button 
            onClick={() => simulateLogin('apple')}
            disabled={loading}
            className="w-full h-16 bg-[#1A1A1A] border border-white/5 rounded-[25px] flex items-center justify-center space-x-4 group active:scale-95 transition-all disabled:opacity-50"
          >
            <img src="https://www.svgrepo.com/show/303108/apple-black-logo.svg" alt="Apple" className="w-6 h-6 invert" />
            <span className="text-white font-black uppercase text-xs tracking-widest">Entrar com Apple</span>
          </button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-20">
            Ao entrar você concorda com nossos <br/> 
            <span className="underline opacity-100">Termos</span> e <span className="underline opacity-100">Privacidade</span>
          </p>
          
          <div className="pt-8">
            <span className="text-[8px] font-black uppercase tracking-[0.5em] opacity-10">ZFIT SaaS • v2.5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

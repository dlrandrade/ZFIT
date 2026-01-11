import React, { useState, useEffect } from 'react';
import { ZFitLogo } from './Logo';
import { User } from '../types';
import { db } from '../services/database';
import { User as UserIcon, Mail, Loader2, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Estado para capturar a altura real visível (ignora teclado)
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
        // Se a viewport diminuir consideravelmente, assumimos que o teclado está aberto
        setIsKeyboardOpen(window.visualViewport.height < window.innerHeight * 0.8);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (isSignUp && !name.trim())) {
      setError('Por favor, preencha os campos obrigatórios.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let user;
      if (isSignUp) {
        user = await db.signUp(name, email);
      } else {
        user = await db.login(email);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center justify-center p-6 overflow-hidden touch-none select-none"
      style={{ height: `${viewportHeight}px` }}
    >
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#adf94e] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#adf94e] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className={`max-w-sm w-full relative z-10 transition-all duration-500 flex flex-col ${isKeyboardOpen ? 'gap-4 justify-start pt-4' : 'gap-8 justify-center'}`}>
        
        {/* Logo e Título que encolhem se o teclado estiver aberto */}
        <div className={`flex flex-col items-center text-center transition-all ${isKeyboardOpen ? 'scale-75 opacity-60' : 'scale-100 opacity-100'}`}>
          <ZFitLogo size={isKeyboardOpen ? 24 : 32} />
          <div className="mt-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-[0.8]">
              {isSignUp ? 'FAÇA PARTE' : 'BEM-VINDO'}<br/>DA ELITE
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 mt-2">
              {isSignUp ? 'Crie sua conta agora' : 'Identifique-se para entrar'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className={`flex bg-white/5 p-1 rounded-2xl border border-white/5 transition-all ${isKeyboardOpen ? 'scale-90' : ''}`}>
          <button 
            type="button"
            onClick={() => { setIsSignUp(false); setError(null); }}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!isSignUp ? 'bg-[#adf94e] text-black shadow-lg shadow-[#adf94e]/10' : 'text-white/40'}`}
          >
            Entrar
          </button>
          <button 
            type="button"
            onClick={() => { setIsSignUp(true); setError(null); }}
            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isSignUp ? 'bg-[#adf94e] text-black shadow-lg shadow-[#adf94e]/10' : 'text-white/40'}`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-2xl text-[9px] font-black uppercase text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-2.5">
            {isSignUp && (
              <div className="relative group animate-in slide-in-from-top-2 duration-300">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#adf94e] transition-colors">
                  <UserIcon size={16} />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome" 
                  autoComplete="name"
                  className="w-full h-12 bg-white/5 rounded-[20px] border border-white/5 pl-14 pr-6 font-black uppercase text-[11px] tracking-widest focus:border-[#adf94e]/30 outline-none transition-all focus:bg-white/[0.08]"
                />
              </div>
            )}

            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#adf94e] transition-colors">
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu E-mail" 
                autoComplete="email"
                className="w-full h-12 bg-white/5 rounded-[20px] border border-white/5 pl-14 pr-6 font-black uppercase text-[11px] tracking-widest focus:border-[#adf94e]/30 outline-none transition-all focus:bg-white/[0.08]"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full h-14 bg-[#adf94e] rounded-[22px] flex items-center justify-center space-x-3 active:scale-95 transition-all disabled:opacity-50 shadow-[0_10px_30px_rgba(173,249,78,0.2)] ${isKeyboardOpen ? 'h-12' : 'h-14'}`}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            ) : (
              <>
                <span className="text-black font-black uppercase text-xs tracking-widest">
                  {isSignUp ? 'Criar Minha Conta' : 'Entrar no App'}
                </span>
                <ArrowRight className="w-5 h-5 text-black" />
              </>
            )}
          </button>
        </form>

        {!isKeyboardOpen && (
          <div className="text-center pt-2 animate-in fade-in duration-700">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-20 leading-relaxed">
              Seus dados são protegidos e sincronizados <br/>
              pela infraestrutura ZFIT Cloud.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
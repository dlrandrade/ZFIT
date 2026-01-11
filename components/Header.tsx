
import React from 'react';
import { Moon, Sun, Crown, Zap } from 'lucide-react';
import { ZFitLogo } from './Logo';
import { User } from '../types';

interface HeaderProps {
  onToggleTheme: () => void;
  isDark: boolean;
  user?: User | null;
  onLogoClick?: () => void;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleTheme, isDark, user, onLogoClick, onProfileClick }) => {
  const isElite = user?.plan === 'Elite';
  const isPro = user?.plan === 'Pro';

  return (
    <header className="flex justify-between items-center py-4 px-6 relative z-20 md:py-8">
      <div className="flex items-center gap-3">
        <ZFitLogo size={18} onClick={onLogoClick} />
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={onToggleTheme}
          className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
          title={isDark ? "Mudar para modo Mint" : "Mudar para modo Escuro"}
        >
          {isDark ? (
            <Sun size={16} className="opacity-40" />
          ) : (
            <Moon size={16} className="opacity-40" />
          )}
        </button>
        
        <button 
          onClick={onProfileClick}
          className="relative focus:outline-none"
        >
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-[#adf94e]/10 border border-[#adf94e]/20 flex items-center justify-center overflow-hidden active:scale-95 transition-transform">
            <img 
              src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ZFIT"} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {(isElite || isPro) && (
            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-lg border-2 border-[#050505] flex items-center justify-center shadow-lg ${isElite ? 'bg-[#adf94e] text-black' : 'bg-white/20 text-white'}`}>
              {isElite ? <Crown size={8} fill="currentColor" /> : <Zap size={8} fill="currentColor" />}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

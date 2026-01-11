
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { ZFitLogo } from './Logo';

interface HeaderProps {
  onToggleTheme: () => void;
  isDark: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleTheme, isDark }) => {
  return (
    <header className="flex justify-between items-center py-8 px-6 relative z-20">
      <div className="flex items-center gap-3">
        <ZFitLogo />
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleTheme}
          className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
          title={isDark ? "Mudar para modo Mint" : "Mudar para modo Escuro"}
        >
          {isDark ? (
            <Sun size={20} className="opacity-40" />
          ) : (
            <Moon size={20} className="opacity-40" />
          )}
        </button>
        <div className="w-11 h-11 rounded-2xl bg-[#adf94e]/10 border border-[#adf94e]/20 flex items-center justify-center overflow-hidden active:scale-95 transition-transform">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=ZFIT" 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

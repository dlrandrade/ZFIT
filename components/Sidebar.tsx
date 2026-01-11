
import React from 'react';
import { Home, Dumbbell, BarChart2, User, LogOut, Play, ShieldCheck, BookOpen } from 'lucide-react';
import { ZFitLogo } from './Logo';

interface SidebarProps {
  activePage: 'home' | 'feed' | 'stats' | 'profile' | 'admin' | 'blog';
  onPageChange: (page: 'home' | 'feed' | 'stats' | 'profile' | 'admin' | 'blog') => void;
  onStartWorkout: () => void;
  theme: any;
  onLogout: () => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange, onStartWorkout, theme, onLogout, isAdmin }) => {
  const navItems = [
    { id: 'home', label: 'Início', icon: <Home size={22} /> },
    { id: 'blog', label: 'Blog', icon: <BookOpen size={22} /> },
    { id: 'feed', label: 'Feed', icon: <Dumbbell size={22} /> },
    { id: 'stats', label: 'Estatísticas', icon: <BarChart2 size={22} /> },
    { id: 'profile', label: 'Perfil', icon: <User size={22} /> },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: <ShieldCheck size={22} /> });
  }

  const isDarkSidebar = theme.sidebar === '#050505' || theme.sidebar === '#004D40';

  return (
    <aside 
      className="hidden lg:flex flex-col w-72 border-r h-screen sticky top-0 z-50 p-8 transition-colors duration-500"
      style={{ backgroundColor: theme.sidebar, borderColor: theme.border }}
    >
      <div className="mb-12">
        <ZFitLogo color={theme.primary} />
      </div>

      <nav className="flex-1 space-y-4">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as any)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-[22px] transition-all duration-300 ${
                isActive 
                  ? 'shadow-[0_10px_20px_rgba(0,0,0,0.1)]' 
                  : 'hover:bg-white/5'
              }`}
              style={{ 
                backgroundColor: isActive ? theme.primary : 'transparent',
                color: isActive ? (theme.name === 'ZFIT Mint' ? '#FFFFFF' : '#000000') : (isDarkSidebar ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)')
              }}
            >
              <div>{item.icon}</div>
              <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="space-y-4">
        <button 
          onClick={onStartWorkout}
          className="w-full h-16 rounded-[25px] flex items-center justify-center space-x-3 font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mb-4"
          style={{ 
            backgroundColor: theme.primary, 
            color: theme.name === 'ZFIT Mint' ? '#FFFFFF' : '#000000'
          }}
        >
          <Play size={20} fill="currentColor" strokeWidth={0} />
          <span>Iniciar Treino</span>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-4 px-6 py-4 rounded-[22px] transition-all"
          style={{ color: isDarkSidebar ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
        >
          <LogOut size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

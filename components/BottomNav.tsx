
import React from 'react';
import { Home, Dumbbell, Play, BarChart2, User } from 'lucide-react';

interface BottomNavProps {
  activePage: 'home' | 'feed' | 'stats' | 'profile';
  onPageChange: (page: 'home' | 'feed' | 'stats' | 'profile') => void;
  onStartWorkout: () => void;
  primaryColor: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, onPageChange, onStartWorkout, primaryColor }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-black/40 backdrop-blur-3xl rounded-[35px] p-2 flex items-center justify-between border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-50 bottom-nav-container">
      <div className="flex flex-1 justify-around items-center">
        <button 
          onClick={() => onPageChange('home')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activePage === 'home' ? 'text-[#adf94e]' : 'text-white/40'}`}
        >
          <Home size={22} strokeWidth={activePage === 'home' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Início</span>
        </button>
        
        <button 
          onClick={() => onPageChange('feed')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activePage === 'feed' ? 'text-[#adf94e]' : 'text-white/40'}`}
        >
          <Dumbbell size={22} strokeWidth={activePage === 'feed' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Feed</span>
        </button>
      </div>

      <button 
        onClick={onStartWorkout}
        className="w-16 h-16 -mt-8 rounded-full bg-[#adf94e] flex items-center justify-center text-black shadow-[0_10px_30px_rgba(173,249,78,0.4)] transition-all duration-300 hover:scale-110 active:scale-90 border-4 border-[#050505]"
      >
        <Play size={28} fill="black" strokeWidth={0} className="ml-1" />
      </button>

      <div className="flex flex-1 justify-around items-center">
        <button 
          onClick={() => onPageChange('stats')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activePage === 'stats' ? 'text-[#adf94e]' : 'text-white/40'}`}
        >
          <BarChart2 size={22} strokeWidth={activePage === 'stats' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Stats</span>
        </button>
        
        <button 
          onClick={() => onPageChange('profile')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 ${activePage === 'profile' ? 'text-[#adf94e]' : 'text-white/40'}`}
        >
          <User size={22} strokeWidth={activePage === 'profile' ? 2.5 : 2} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNav;

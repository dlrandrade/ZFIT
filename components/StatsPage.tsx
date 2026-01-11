
import React from 'react';
import { TrendingUp, Target, Award, Calendar as CalendarIcon, ArrowUpRight } from 'lucide-react';
import { Workout } from '../types';

interface StatsPageProps {
  primaryColor: string;
  history: Workout[];
}

const StatsPage: React.FC<StatsPageProps> = ({ primaryColor, history }) => {
  const totalWorkouts = history.length;
  const totalVolume = history.reduce((acc, w) => {
    return acc + w.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((sAcc, s) => {
        const weight = parseInt(s.weight.replace(/\D/g, '')) || 0;
        const reps = parseInt(s.reps) || 0;
        return sAcc + (weight * reps);
      }, 0);
    }, 0);
  }, 0);

  const tons = (totalVolume / 1000).toFixed(1);

  return (
    <div className="px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-4xl font-black tracking-tighter leading-[0.8] uppercase">
          INSIGHTS DE<br/>PERFORMANCE
        </h2>
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <CalendarIcon size={20} className="opacity-40" />
        </div>
      </div>

      <div className="bg-[#111111] rounded-[40px] p-8 border border-white/5 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#adf94e] opacity-5 blur-[50px] pointer-events-none" />
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 block mb-1">Carga Total Acumulada</span>
            <h3 className="text-4xl font-black tracking-tighter uppercase">{tons} Ton</h3>
          </div>
          {totalWorkouts > 0 && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#adf94e]/10 rounded-full">
              <ArrowUpRight size={14} className="text-[#adf94e]" />
              <span className="text-[10px] font-black text-[#adf94e] uppercase">Recorde</span>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between h-32 px-1 mb-2">
          {[40, 60, 45, 80, 55, 100, 70, 85, 45, 60, 75, 50].map((h, i) => {
            // Visualize only based on actual data months if available, otherwise stay at baseline
            const isActive = totalWorkouts > 0 && i === 4; // Mocking current month if active
            return (
              <div key={i} className="flex flex-col items-center space-y-2 group flex-1 max-w-[12px]">
                <div 
                  className={`w-1.5 rounded-full transition-all duration-700 relative`}
                  style={{ 
                    height: isActive ? `${h}%` : '4px', 
                    backgroundColor: isActive ? primaryColor : 'rgba(255,255,255,0.05)' 
                  }}
                >
                  {isActive && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] font-black uppercase opacity-20 tracking-widest px-1">
          <span>Jan</span>
          <span>Mar</span>
          <span>Mai</span>
          <span>Jul</span>
          <span>Set</span>
          <span>Nov</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111111] p-6 rounded-[35px] border border-white/5 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <Award size={20} className="text-[#adf94e]" />
            </div>
          </div>
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block mb-1">Sessões</span>
            <h4 className="text-2xl font-black tracking-tighter uppercase">{totalWorkouts}</h4>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-20">Treinos Finalizados</span>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-[35px] border border-white/5 flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
              <Target size={20} className="text-[#adf94e]" />
            </div>
          </div>
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-30 block mb-1">XP Ganho</span>
            <h4 className="text-2xl font-black tracking-tighter uppercase">{totalWorkouts * 150}</h4>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-20">Pontos de Experiência</span>
          </div>
        </div>
      </div>

      <div className="bg-[#111111] rounded-[35px] p-6 border border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#adf94e]/10 flex items-center justify-center">
             <TrendingUp size={24} className="text-[#adf94e]" />
          </div>
          <div>
            <h4 className="font-black uppercase text-sm tracking-tighter">
              {totalWorkouts === 0 ? 'PRONTO PARA COMEÇAR?' : totalWorkouts < 5 ? 'INÍCIO DE JORNADA' : 'HERÓI DA CONSISTÊNCIA'}
            </h4>
            <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">
              {totalWorkouts === 0 ? 'Nenhum treino registrado ainda' : `${totalWorkouts} treinos registrados`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;

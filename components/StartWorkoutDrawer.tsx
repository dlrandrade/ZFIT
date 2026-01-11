
import React from 'react';
import { X, Plus, Copy, ChevronRight, Dumbbell } from 'lucide-react';
import { Workout } from '../types';

interface StartWorkoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartNew: () => void;
  onManageRoutines: () => void;
  onStartRoutine: (routine: Workout) => void;
  routines: Workout[];
}

const StartWorkoutDrawer: React.FC<StartWorkoutDrawerProps> = ({ isOpen, onClose, onStartNew, onManageRoutines, onStartRoutine, routines }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md mx-auto bg-[#1A1A1A] border-t border-white/10 rounded-t-[45px] p-8 animate-slide-up shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black tracking-tighter uppercase">INICIAR TREINO</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <button 
            onClick={() => { onStartNew(); onClose(); }}
            className="bg-white/5 p-6 rounded-[35px] border border-white/5 flex flex-col items-start space-y-4 active:scale-95 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#adf94e] flex items-center justify-center text-black group-hover:scale-110 transition-transform">
              <Plus size={24} strokeWidth={3} />
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="font-black text-xs uppercase tracking-tighter">CRIAR NOVO</span>
              <ChevronRight size={16} className="opacity-40" />
            </div>
          </button>

          <button className="bg-white/5 p-6 rounded-[35px] border border-white/5 flex flex-col items-start space-y-4 active:scale-95 transition-all group opacity-20 cursor-not-allowed">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
              <Copy size={24} />
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="font-black text-xs uppercase tracking-tighter">COPIAR ANTERIOR</span>
              <ChevronRight size={16} className="opacity-40" />
            </div>
          </button>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h3 className="font-black tracking-widest text-[10px] uppercase opacity-40">Rotinas Salvas ({routines.length})</h3>
          <button 
            onClick={() => { onManageRoutines(); onClose(); }}
            className="text-[10px] font-black uppercase text-[#adf94e] tracking-widest hover:opacity-70"
          >
            Gerenciar
          </button>
        </div>

        <div className="space-y-3">
          {routines.slice(0, 5).map((routine) => (
            <button 
              key={routine.id} 
              onClick={() => { onStartRoutine(routine); onClose(); }}
              className="w-full bg-white/5 min-h-16 px-6 py-4 rounded-[25px] flex items-center justify-between border border-white/5 active:bg-white/10 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-[#adf94e]/10 flex items-center justify-center">
                  <Dumbbell size={16} className="text-[#adf94e]" />
                </div>
                <div>
                  <span className="font-black text-sm uppercase tracking-tighter block">{routine.title}</span>
                  <span className="text-[8px] font-black uppercase opacity-20">{routine.muscleGroups.join(' & ')}</span>
                </div>
              </div>
              <ChevronRight size={18} className="opacity-40" />
            </button>
          ))}
          
          {routines.length === 0 && (
            <div className="p-10 text-center bg-white/5 rounded-[30px] border border-dashed border-white/10">
               <p className="text-[9px] font-black uppercase tracking-widest opacity-20">Nenhuma rotina criada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartWorkoutDrawer;


import React from 'react';
import { ChevronLeft, Plus, X, Home, LayoutList, BarChart2, History, Check } from 'lucide-react';
import { Workout, ExerciseSet } from '../types';

interface WorkoutExecutionProps {
  workout: Workout;
  onUpdate: (workout: Workout) => void;
  onComplete: () => void;
  onBack: () => void;
  primaryColor: string;
}

const WorkoutExecution: React.FC<WorkoutExecutionProps> = ({ workout, onUpdate, onComplete, onBack, primaryColor }) => {
  
  const toggleSetCompletion = (exerciseId: string, setIndex: number) => {
    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      exercise.sets[setIndex].completed = !exercise.sets[setIndex].completed;
      onUpdate(updatedWorkout);
    }
  };

  const addSet = (exerciseId: string) => {
    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises.find(e => e.id === exerciseId);
    if (exercise) {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      exercise.sets.push({
        weight: lastSet ? lastSet.weight : '0kg',
        reps: lastSet ? lastSet.reps : '0',
        difficulty: 'Normal',
        color: primaryColor,
        completed: false
      });
      onUpdate(updatedWorkout);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
      <header className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#050505]/80 backdrop-blur-md z-30 border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black tracking-tighter uppercase">{workout.title}</h1>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">{workout.muscleGroups.join(' • ')}</p>
        </div>
        <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-20">
          <Plus size={20} />
        </button>
      </header>

      <div className="px-4 mt-6 space-y-6">
        {workout.exercises.map((exercise) => (
          <div key={exercise.id} className="bg-[#111111] rounded-[35px] p-6 border border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-black tracking-tighter uppercase text-white/90">{exercise.name}</h3>
                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">{exercise.muscleGroup} • {exercise.sets.length} Séries</p>
              </div>
              <button onClick={() => addSet(exercise.id)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white">
                <Plus size={18} />
              </button>
            </div>

            <div className="grid grid-cols-[35px_1fr_1fr_40px] gap-2 mb-4 px-2 opacity-30">
              <span className="text-[9px] font-black uppercase tracking-tighter">Série</span>
              <span className="text-[9px] font-black uppercase tracking-tighter">Peso</span>
              <span className="text-[9px] font-black uppercase tracking-tighter">Reps</span>
              <span className="text-[9px] font-black uppercase tracking-tighter text-center">OK</span>
            </div>

            <div className="space-y-2.5">
              {exercise.sets.map((set, idx) => (
                <div 
                  key={idx} 
                  onClick={() => toggleSetCompletion(exercise.id, idx)}
                  className={`grid grid-cols-[35px_1fr_1fr_40px] gap-2 items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                    set.completed 
                    ? 'bg-[#adf94e]/10 border-[#adf94e]/20 opacity-100' 
                    : 'bg-white/5 border-white/5 opacity-60'
                  }`}
                >
                  <span className={`text-[11px] font-black flex justify-center items-center w-7 h-7 rounded-lg ${set.completed ? 'bg-[#adf94e] text-black' : 'bg-white/5 text-white/30'}`}>
                    {idx + 1}
                  </span>
                  <div className="text-[13px] font-black tracking-tighter">{set.weight}</div>
                  <div className="text-[13px] font-black tracking-tighter">{set.reps}</div>
                  <div className="flex justify-center">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${set.completed ? 'bg-[#adf94e]' : 'bg-white/10'}`}>
                      {set.completed && <Check size={14} className="text-black" strokeWidth={4} />}
                    </div>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => addSet(exercise.id)}
                className="w-full h-12 rounded-2xl border border-dashed border-white/10 flex items-center justify-center space-x-2 text-white/20 hover:text-white/40 hover:border-white/20 transition-all mt-4"
              >
                <Plus size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Nova Série</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md bg-white/[0.03] backdrop-blur-2xl rounded-full p-2 flex items-center justify-between border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] z-50">
        <button onClick={onBack} className="w-12 h-12 rounded-full flex items-center justify-center text-white/40 hover:text-white">
          <Home size={20} />
        </button>
        <div className="flex items-center bg-white/10 rounded-full px-4 py-1.5 space-x-4">
          <button className="flex items-center space-x-2 text-[#adf94e]">
            <LayoutList size={18} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Exercícios</span>
          </button>
        </div>
        <button 
          onClick={onComplete}
          className="w-12 h-12 rounded-full bg-[#adf94e] flex items-center justify-center text-black shadow-[0_0_20px_rgba(173,249,78,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <Check size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

export default WorkoutExecution;

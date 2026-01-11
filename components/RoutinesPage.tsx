
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Play, Trash2, Dumbbell, Zap, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Workout, Exercise } from '../types';
import { MUSCLE_GROUPS } from '../constants';

interface RoutinesPageProps {
  routines: Workout[];
  theme: any;
  onBack: () => void;
  onStartRoutine: (routine: Workout) => void;
  onDeleteRoutine: (id: string) => void;
}

const RoutinesPage: React.FC<RoutinesPageProps> = ({ routines, theme, onBack, onStartRoutine, onDeleteRoutine }) => {
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  
  const isMint = theme.name === 'ZFIT Mint';
  const depthClass = isMint ? 'premium-depth-light' : 'premium-depth-dark';

  // Filtragem das rotinas baseada no grupo selecionado
  const filteredRoutines = useMemo(() => {
    if (selectedGroup === 'Todos') return routines;
    return routines.filter(routine => 
      routine.muscleGroups.some(group => group === selectedGroup)
    );
  }, [routines, selectedGroup]);

  const handleQuickStartExercise = (exercise: Exercise, routineTitle: string) => {
    const quickWorkout: Workout = {
      id: `quick-${Date.now()}`,
      title: `${exercise.name} (Rápido)`,
      muscleGroups: [exercise.muscleGroup],
      exercises: [{
        ...exercise,
        id: `ex-${Date.now()}`,
        sets: exercise.sets.map(s => ({ ...s, completed: false }))
      }]
    };
    onStartRoutine(quickWorkout);
  };

  return (
    <div className="px-4 md:px-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 mt-4">
        <button 
          onClick={onBack}
          className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90"
          style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border, color: theme.text }}
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase" style={{ color: theme.text }}>
          MINHAS ROTINAS
        </h2>
        <div className="w-12" />
      </div>

      {/* Filtros de Grupo Muscular */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <Filter size={12} className="opacity-40" style={{ color: theme.text }} />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: theme.text }}>Filtrar por foco</span>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 gap-3 py-1">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => {
                setSelectedGroup(group);
                setExpandedRoutine(null); // Fecha expansão ao mudar filtro para evitar confusão
              }}
              className={`flex-shrink-0 px-6 h-11 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                selectedGroup === group 
                  ? 'shadow-lg scale-105' 
                  : 'opacity-40 hover:opacity-100'
              }`}
              style={{ 
                backgroundColor: selectedGroup === group ? theme.primary : theme.cardSecondary,
                color: selectedGroup === group ? (isMint ? '#FFF' : '#000') : theme.text,
                borderColor: selectedGroup === group ? theme.primary : theme.border
              }}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Rotinas */}
      <div className="space-y-4">
        {filteredRoutines.map((routine) => {
          const isExpanded = expandedRoutine === routine.id;
          
          // Filtrar exercícios internos se um grupo específico estiver selecionado
          const displayExercises = selectedGroup === 'Todos' 
            ? routine.exercises 
            : routine.exercises.filter(ex => ex.muscleGroup === selectedGroup);

          return (
            <div 
              key={routine.id}
              className={`rounded-[35px] border p-5 md:p-6 transition-all duration-500 ${depthClass}`}
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <div className="flex justify-between items-start mb-6">
                <div 
                  className="flex items-center gap-4 cursor-pointer flex-1"
                  onClick={() => setExpandedRoutine(isExpanded ? null : routine.id)}
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center border" style={{ backgroundColor: `${theme.primary}10`, color: theme.primary, borderColor: theme.border }}>
                    <Dumbbell size={24} />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-black tracking-tighter uppercase leading-tight" style={{ color: theme.text }}>{routine.title}</h3>
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mt-1">
                      {routine.exercises.length} Exercícios • {routine.muscleGroups.join(' & ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onDeleteRoutine(routine.id)}
                    className="p-2 text-red-500 opacity-30 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button 
                    onClick={() => setExpandedRoutine(isExpanded ? null : routine.id)}
                    className="p-2 opacity-30 hover:opacity-100 transition-opacity"
                    style={{ color: theme.text }}
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Lista de Exercícios (Início Rápido) */}
              {isExpanded && (
                <div className="mb-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-3 ml-1">
                    <div className="flex items-center gap-2">
                      <Zap size={10} style={{ color: theme.primary }} fill="currentColor" />
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
                        {selectedGroup === 'Todos' ? 'Início Rápido' : `Foco em ${selectedGroup}`}
                      </span>
                    </div>
                    {selectedGroup !== 'Todos' && (
                      <span className="text-[7px] font-black uppercase opacity-20">{displayExercises.length} de {routine.exercises.length} exercícios</span>
                    )}
                  </div>

                  {displayExercises.length > 0 ? displayExercises.map((ex, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-white/10 transition-all"
                    >
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-tighter" style={{ color: theme.text }}>{ex.name}</span>
                        <p className="text-[8px] font-black opacity-20 uppercase">{ex.muscleGroup}</p>
                      </div>
                      <button 
                        onClick={() => handleQuickStartExercise(ex, routine.title)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 hover:scale-110 shadow-lg"
                        style={{ backgroundColor: theme.primary, color: isMint ? '#FFF' : '#000' }}
                        title="Iniciar Apenas Este Exercício"
                      >
                        <Zap size={16} fill="currentColor" strokeWidth={0} />
                      </button>
                    </div>
                  )) : (
                    <div className="py-4 text-center opacity-20 border border-dashed border-white/5 rounded-2xl">
                      <p className="text-[8px] font-black uppercase tracking-widest">Nenhum exercício de {selectedGroup}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => onStartRoutine(routine)}
                  className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg"
                  style={{ backgroundColor: theme.primary, color: isMint ? '#FFF' : '#000' }}
                >
                  <Play size={16} fill="currentColor" strokeWidth={0} /> Começar Sessão Completa
                </button>
              </div>
            </div>
          );
        })}

        {filteredRoutines.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-white/10 opacity-20">
               <Dumbbell size={32} />
            </div>
            <p className="font-black uppercase tracking-widest text-[10px] opacity-20">
              {routines.length === 0 ? 'Nenhuma rotina salva' : `Nenhuma rotina para ${selectedGroup}`}
            </p>
            <p className="text-[9px] font-black uppercase tracking-tighter opacity-10 mt-1">
              {routines.length === 0 
                ? 'Crie um treino e salve-o para aparecer aqui' 
                : 'Tente outro grupo muscular ou limpe o filtro'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutinesPage;

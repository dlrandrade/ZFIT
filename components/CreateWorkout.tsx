
import React, { useState, useMemo } from 'react';
import { X, Check, Search, Plus, ChevronDown, Save, Play, Dumbbell, LayoutGrid, Info } from 'lucide-react';
import { MUSCLE_GROUPS, EXERCISE_DATABASE } from '../constants';
import { Exercise, Workout } from '../types';

interface CreateWorkoutProps {
  onBack: () => void;
  onStart: (exercises: Exercise[], title: string, saveAsRoutine: boolean) => void;
}

const CreateWorkout: React.FC<CreateWorkoutProps> = ({ onBack, onStart }) => {
  const [step, setStep] = useState<'selection' | 'naming'>('selection');
  const [selectedGroup, setSelectedGroup] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [routineName, setRoutineName] = useState('');
  const [saveRoutine, setSaveRoutine] = useState(true);

  const filteredExercises = useMemo(() => {
    return EXERCISE_DATABASE.filter(ex => {
      const matchesGroup = selectedGroup === 'Todos' || ex.muscleGroup === selectedGroup;
      const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [selectedGroup, search]);

  const selectedExerciseDetails = useMemo(() => {
    return selectedExercises.map(name => EXERCISE_DATABASE.find(e => e.name === name)!);
  }, [selectedExercises]);

  const toggleExercise = (name: string) => {
    setSelectedExercises(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleNextStep = () => {
    if (selectedExercises.length === 0) return;
    setStep('naming');
  };

  const handleFinish = () => {
    if (!routineName.trim()) return;
    
    const exercises: Exercise[] = selectedExercises.map((name, idx) => {
      const dbInfo = EXERCISE_DATABASE.find(e => e.name === name)!;
      return {
        id: `ex-${idx}-${Date.now()}`,
        name: name,
        muscleGroup: dbInfo.muscleGroup,
        sets: [
          { weight: '10kg', reps: '10', difficulty: 'Normal', color: '#adf94e', completed: false }
        ]
      };
    });
    
    onStart(exercises, routineName, saveRoutine);
  };

  if (step === 'naming') {
    const uniqueGroups = Array.from(new Set(selectedExerciseDetails.map(e => e.muscleGroup)));

    return (
      <div className="min-h-screen bg-[#050505] animate-in fade-in zoom-in-95 duration-500 flex flex-col p-6">
        <header className="flex justify-between items-center mb-12">
           <button onClick={() => setStep('selection')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
             <X size={20} />
           </button>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Passo 02 de 02</span>
           <div className="w-12" />
        </header>

        <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-5xl font-black tracking-tighter uppercase leading-[0.85]">REVISAR<br/>ROTINA</h2>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
               {uniqueGroups.map(g => (
                 <span key={g} className="px-2.5 py-1 rounded-lg bg-[#adf94e]/10 text-[#adf94e] text-[8px] font-black uppercase tracking-widest border border-[#adf94e]/20">{g}</span>
               ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase opacity-40 ml-4 tracking-widest">Identificação do Treino</label>
              <div className="relative">
                <input 
                  autoFocus
                  type="text" 
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="Ex: Leg Day Explosivo" 
                  className="w-full h-16 bg-white/5 rounded-[30px] border border-white/10 px-8 font-black uppercase tracking-tighter outline-none focus:border-[#adf94e] transition-all text-lg"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
                  <Dumbbell size={20} />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSaveRoutine(!saveRoutine)}
              className={`w-full h-20 rounded-[35px] border flex items-center justify-between px-8 transition-all duration-500 premium-depth-dark ${saveRoutine ? 'bg-[#adf94e]/10 border-[#adf94e]/30' : 'bg-white/5 border-white/5'}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${saveRoutine ? 'bg-[#adf94e] text-black' : 'bg-white/10 opacity-40'}`}>
                  <Save size={18} />
                </div>
                <div className="text-left">
                  <span className={`text-[10px] font-black uppercase tracking-widest block ${saveRoutine ? 'text-white' : 'opacity-20'}`}>Salvar na Biblioteca</span>
                  <span className="text-[8px] font-black uppercase opacity-20 tracking-tighter">Ficará disponível em 'Rotinas'</span>
                </div>
              </div>
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${saveRoutine ? 'bg-[#adf94e] border-[#adf94e]' : 'border-white/10'}`}>
                {saveRoutine && <Check size={14} className="text-black" strokeWidth={4} />}
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleFinish}
              disabled={!routineName.trim()}
              className="w-full h-20 rounded-[35px] bg-[#adf94e] text-black font-black uppercase text-xs tracking-widest shadow-[0_15px_40px_rgba(173,249,78,0.25)] flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-20"
            >
              <Play size={20} fill="currentColor" strokeWidth={0} /> Iniciar Treino Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] animate-in fade-in slide-in-from-bottom-6 duration-500 pb-40">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-xl z-30 border-b border-white/5">
        <button onClick={onBack} className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
          <X size={20} />
        </button>
        <div className="text-center">
           <h1 className="font-black text-sm tracking-tighter uppercase">Montar Sessão</h1>
           <span className="text-[8px] font-black uppercase tracking-widest opacity-30">{selectedExercises.length} Exercícios selecionados</span>
        </div>
        <button 
          onClick={handleNextStep}
          disabled={selectedExercises.length === 0}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-black shadow-lg transition-all active:scale-90 ${selectedExercises.length > 0 ? 'bg-[#adf94e] shadow-[#adf94e]/20' : 'bg-white/10 opacity-20'}`}
        >
          <Check size={20} strokeWidth={3} />
        </button>
      </header>

      <div className="px-4 mt-8 space-y-10">
        {/* Search Bar Refinada */}
        <div className="relative group mx-2">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#adf94e] transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Qual exercício você busca?" 
            className="w-full h-16 bg-white/5 rounded-[30px] pl-16 pr-6 font-black uppercase text-[10px] tracking-widest border border-white/5 focus:border-[#adf94e]/20 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Muscle Group Filter Pills */}
        <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-6 space-x-3 py-1">
          {MUSCLE_GROUPS.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`flex-shrink-0 px-8 h-12 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                selectedGroup === group 
                  ? 'bg-[#adf94e] text-black border-[#adf94e] shadow-lg scale-105' 
                  : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'
              }`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 gap-3 pb-20">
          {filteredExercises.length > 0 ? filteredExercises.map((ex, i) => {
            const isSelected = selectedExercises.includes(ex.name);
            return (
              <div 
                key={i} 
                onClick={() => toggleExercise(ex.name)}
                className={`flex items-center justify-between h-20 rounded-[30px] px-7 active:scale-[0.98] transition-all cursor-pointer border premium-depth-dark group ${isSelected ? 'bg-[#adf94e]/10 border-[#adf94e]/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isSelected ? 'bg-[#adf94e] text-black border-transparent' : 'bg-white/5 border-white/10 text-white/20'}`}>
                    <Dumbbell size={18} />
                  </div>
                  <div>
                    <span className={`font-black text-xs uppercase tracking-tighter block transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}>
                      {ex.name}
                    </span>
                    <span className="text-[8px] font-black uppercase opacity-20 tracking-widest block mt-0.5">{ex.muscleGroup}</span>
                  </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                  isSelected ? 'bg-[#adf94e] border-[#adf94e] rotate-0' : 'border-white/10 rotate-90 opacity-20'
                }`}>
                  {isSelected ? <Check size={16} className="text-black" strokeWidth={4} /> : <Plus size={16} className="text-white" />}
                </div>
              </div>
            );
          }) : (
            <div className="py-20 text-center space-y-4 opacity-20">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                 <Search size={24} />
              </div>
              <p className="font-black uppercase tracking-widest text-[9px]">Nenhum exercício encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Flutuante de Resumo e Ação */}
      {selectedExercises.length > 0 && (
        <div className="fixed bottom-10 left-6 right-6 z-40 animate-in slide-in-from-bottom-10 duration-500">
           <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-4 flex items-center justify-between shadow-2xl premium-depth-dark">
              <div className="flex items-center gap-3 pl-4">
                 <div className="flex -space-x-2">
                    {selectedExerciseDetails.slice(0, 3).map((ex, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#adf94e] border-2 border-black flex items-center justify-center text-black text-[10px] font-black">
                        {ex.name.charAt(0)}
                      </div>
                    ))}
                    {selectedExercises.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-black flex items-center justify-center text-white text-[10px] font-black">
                        +{selectedExercises.length - 3}
                      </div>
                    )}
                 </div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-white block leading-none">Pronto?</span>
                    <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">{selectedExercises.length} selecionados</span>
                 </div>
              </div>
              <button 
                onClick={handleNextStep}
                className="h-14 px-8 rounded-full bg-[#adf94e] text-black font-black uppercase text-[10px] tracking-widest flex items-center gap-2 active:scale-95 transition-all shadow-[0_5px_15px_rgba(173,249,78,0.3)]"
              >
                Revisar <ArrowRight size={14} />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

// Helper component for Arrow icon
const ArrowRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default CreateWorkout;

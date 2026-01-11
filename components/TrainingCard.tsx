import React from 'react';
import { Maximize2, Activity, Plus } from 'lucide-react';

interface TrainingCardData {
  title: string;
  value: string;
  subtitle: string;
  progress?: number;
  chartData?: number[];
}

interface TrainingCardProps {
  data: TrainingCardData;
  isMain?: boolean;
  theme: any;
  onClick?: () => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ data, isMain = false, theme, onClick }) => {
  const primaryColor = theme.primary;
  const isMint = theme.name === 'ZFIT Mint';
  const depthClass = isMint ? 'premium-depth-light' : 'premium-depth-dark';
  
  if (isMain) {
    return (
      <div 
        onClick={onClick}
        className={`group relative w-full rounded-[30px] md:rounded-[40px] p-5 md:p-8 border overflow-hidden transition-all duration-500 active:scale-[0.98] cursor-pointer ${depthClass}`}
        style={{ backgroundColor: theme.card, color: theme.text, borderColor: theme.border }}
      >
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-64 h-64 blur-[100px] pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundColor: primaryColor }} />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-3 md:mb-6">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border }}>
                <Activity size={14} md:size={18} style={{ color: primaryColor }} />
              </div>
              <span className="text-[7px] md:text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">{data.title}</span>
            </div>
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center opacity-20 border" style={{ borderColor: theme.border }}>
              <Maximize2 size={10} md:size={14} />
            </div>
          </div>

          <div className="mb-3 md:mb-6">
            <h3 className="text-[2.8rem] sm:text-6xl md:text-7xl font-black tracking-tighter leading-none mb-1">{data.value}</h3>
            <p className="opacity-30 text-[7px] md:text-[9px] font-black uppercase tracking-[0.3em]">{data.subtitle}</p>
          </div>

          <div className="flex items-end justify-between h-8 md:h-16 px-1 gap-1">
             {data.chartData?.map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center">
                 <div 
                   className="w-full rounded-full transition-all duration-1000"
                   style={{ 
                     height: `${Math.max(h, 8)}%`, 
                     backgroundColor: i === 4 ? primaryColor : theme.cardSecondary 
                   }}
                 />
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`rounded-[22px] md:rounded-[30px] p-3.5 md:p-5 border flex flex-col justify-between w-full transition-all duration-500 active:scale-[0.96] text-left group overflow-hidden relative ${depthClass}`}
      style={{ 
        backgroundColor: isMint ? '#FFFFFF' : theme.primary, 
        color: '#000000',
        borderColor: theme.border
      }}
    >
      <div className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-black/5 blur-[20px] rounded-full pointer-events-none" />
      
      <div className="w-full relative z-10">
        <div className="flex justify-between items-start mb-1 md:mb-4">
          <span className="opacity-40 text-[7px] md:text-[8px] uppercase font-black tracking-widest">{data.title}</span>
          <div className="bg-black/5 p-0.5 rounded-lg">
            <Plus size={10} />
          </div>
        </div>
        <h3 className="text-lg md:text-2xl font-black tracking-tighter leading-none">{data.value}</h3>
        <p className="text-[7px] md:text-[8px] font-black uppercase opacity-20 mt-0.5">{data.subtitle}</p>
      </div>

      <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden mt-3 md:mt-5">
        <div 
          className="h-full bg-black/80 transition-all duration-1000" 
          style={{ width: `${Math.min(data.progress || 0, 100)}%` }} 
        />
      </div>
    </button>
  );
};

export default TrainingCard;
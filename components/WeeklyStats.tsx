
import React from 'react';

interface WeeklyStatsProps {
  primaryColor: string;
  progress: number;
  theme?: any;
}

const WeeklyStats: React.FC<WeeklyStatsProps> = ({ primaryColor, progress, theme }) => {
  const isMint = theme?.name === 'ZFIT Mint';
  const depthClass = isMint ? 'premium-depth-light' : 'premium-depth-dark';

  return (
    <div className="px-4 md:px-6 mb-12 relative z-10">
      <div 
        className={`rounded-[35px] md:rounded-[40px] p-6 md:p-8 border shadow-xl transition-all duration-500 ${depthClass}`}
        style={{ 
          backgroundColor: isMint ? '#004D40' : '#adf94e', 
          color: isMint ? '#FFFFFF' : '#000000',
          borderColor: isMint ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }}
      >
        <h2 className="text-[9px] md:text-[10px] font-black opacity-40 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-6 md:mb-8">Consistência Semanal</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2 md:space-x-3">
            <span className="text-4xl md:text-5xl font-black tracking-tighter">{progress}%</span>
            <div className="px-2 md:px-3 py-1 rounded-full flex items-center space-x-1 md:space-x-1.5 bg-black/10">
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] md:border-l-[5px] md:border-b-[8px] border-b-black" style={{ borderBottomColor: isMint ? 'white' : 'black' }} />
              <span className="text-xs md:text-sm font-black">15%</span>
            </div>
          </div>
          
          <div className="flex items-end space-x-1 md:space-x-1.5 h-10 md:h-12">
            {[6, 12, 18, 10, 14, 22, 16, 10].map((h, i) => (
              <div 
                key={i} 
                style={{ height: `${h * 1.5}px` }} 
                className="w-1.5 md:w-2 rounded-full bg-black/20 hover:bg-black transition-all cursor-pointer" 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyStats;

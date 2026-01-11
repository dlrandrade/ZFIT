
import React from 'react';
import { Day } from '../types';

interface CalendarProps {
  days: Day[];
  primaryColor: string;
  theme: any;
}

const Calendar: React.FC<CalendarProps> = ({ days, primaryColor, theme }) => {
  return (
    <div className="px-4 md:px-6 mb-8 relative z-10">
      <div className="flex justify-between items-end mb-6 md:mb-8">
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter leading-[0.85] uppercase" style={{ color: theme.text }}>
          ANÁLISE &<br/>RELATÓRIOS
        </h2>
        <div 
          className="px-3 py-1.5 rounded-xl flex items-center space-x-2 border cursor-pointer active:scale-95 transition-all"
          style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border }}
        >
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: theme.text }}>Hoje</span>
          <div className="w-1.5 h-1.5 border-r-2 border-b-2 rotate-45 mb-1" style={{ borderColor: theme.text, opacity: 0.4 }} />
        </div>
      </div>
      
      <div className="flex space-x-2.5 overflow-x-auto hide-scrollbar py-2 -mx-4 px-4">
        {days.map((day, idx) => (
          <div
            key={idx}
            style={{ 
              backgroundColor: day.isActive ? primaryColor : theme.cardSecondary,
              color: day.isActive ? (theme.name === 'ZFIT Mint' ? '#FFFFFF' : '#000000') : theme.text,
              borderColor: day.isActive ? primaryColor : theme.border
            }}
            className={`flex-shrink-0 w-12 h-16 md:w-14 md:h-20 rounded-[20px] flex flex-col items-center justify-center transition-all duration-300 border ${
              day.isActive ? 'shadow-[0_10px_20px_rgba(0,0,0,0.2)] scale-110 z-10' : 'opacity-30'
            }`}
          >
            <span className="text-[7px] md:text-[9px] font-black uppercase mb-1">{day.label}</span>
            <span className="text-lg md:text-xl font-black tracking-tighter leading-none">{day.number}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;

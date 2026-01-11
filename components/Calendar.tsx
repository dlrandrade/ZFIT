import React from 'react';
import { Day } from '../types';

interface CalendarProps {
  days: Day[];
  primaryColor: string;
  theme: any;
}

const Calendar: React.FC<CalendarProps> = ({ days, primaryColor, theme }) => {
  return (
    <div className="px-6 mb-8 relative z-10">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-4xl font-black tracking-tighter leading-[0.8] uppercase" style={{ color: theme.text }}>
          ANÁLISE &<br />RELATÓRIOS
        </h2>
        <div
          className="px-3 py-1.5 rounded-lg flex items-center space-x-1.5 border cursor-pointer active:scale-95 transition-all"
          style={{ backgroundColor: theme.cardSecondary, borderColor: theme.border }}
        >
          <span className="text-[9px] font-black uppercase tracking-widest opacity-60" style={{ color: theme.text }}>Hoje</span>
          <div className="w-1 h-1 border-r border-b rotate-45 mb-0.5" style={{ borderColor: theme.text, opacity: 0.4 }} />
        </div>
      </div>

      <div className="flex space-x-2.5 overflow-x-auto hide-scrollbar py-1 -mx-6 px-6">
        {days.map((day, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: day.isActive ? primaryColor : theme.cardSecondary,
              color: day.isActive ? (theme.name === 'ZFIT Mint' ? '#FFFFFF' : '#000000') : theme.text,
              borderColor: day.isActive ? primaryColor : theme.border
            }}
            className={`flex-shrink-0 w-14 h-20 rounded-[18px] flex flex-col items-center justify-center transition-all duration-300 border ${day.isActive ? 'shadow-[0_8px_16px_rgba(0,0,0,0.15)] scale-105 z-10' : 'opacity-25'
              }`}
          >
            <span className="text-[9px] font-black uppercase mb-0.5">{day.label}</span>
            <span className="text-xl font-black tracking-tighter leading-none">{day.number}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
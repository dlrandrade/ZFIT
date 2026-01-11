
import React from 'react';

export const ZFitLogo: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = "#adf94e" }) => {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <div 
        style={{ width: size + 8, height: size + 8 }} 
        className="bg-[#adf94e] rounded-lg flex items-center justify-center relative overflow-hidden"
      >
        <span className="text-black font-black text-xl relative z-10">Z</span>
      </div>
      <span className="font-black text-2xl tracking-tighter uppercase" style={{ color: '#FFFFFF' }}>
        FIT
      </span>
    </div>
  );
};

import React from 'react';

export default function CoachWorm({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50 flex items-end gap-4 pointer-events-none transition-all duration-500 animate-slide-in-bottom">
      <img 
        src="/assets/helper_worm.png" 
        alt="Coach Worm" 
        className="w-24 md:w-36 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform -scale-x-100" 
      />
      <div className="relative bg-clay/90 backdrop-blur-md text-sunflower p-4 rounded-3xl rounded-bl-none shadow-2xl border-4 border-sunflower max-w-xs md:max-w-sm mb-4">
        <p className="font-display text-sm md:text-lg leading-tight uppercase tracking-wider">{message}</p>
        {/* Speech bubble pointer */}
        <div className="absolute -bottom-4 left-6 w-0 h-0 border-r-[16px] border-r-transparent border-t-[16px] border-t-sunflower border-l-[16px] border-l-transparent"></div>
        <div className="absolute -bottom-[10px] left-[26px] w-0 h-0 border-r-[12px] border-r-transparent border-t-[12px] border-t-clay border-l-[12px] border-l-transparent"></div>
      </div>
    </div>
  );
}

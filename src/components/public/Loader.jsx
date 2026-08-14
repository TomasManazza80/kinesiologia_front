import React, { useState, useEffect } from 'react';

export default function Loader({ fullScreen = false, isLoading = true }) {
  const [render, setRender] = useState(isLoading || fullScreen);

  useEffect(() => {
    if (isLoading) {
      setRender(true);
    } else {
      // Time the unmount to match the transition duration (300ms)
      const timer = setTimeout(() => setRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!render && !isLoading) return null;

  const isExiting = !isLoading && fullScreen;

  const containerClasses = fullScreen
    ? `fixed inset-0 z-[9999] bg-[#f7f9fc] flex flex-col items-center justify-center min-h-screen pointer-events-none transition-transform duration-300 ease-in-out ${isExiting ? 'translate-y-full' : 'translate-y-0'}`
    : "flex flex-col items-center justify-center p-10 w-full h-full min-h-[300px] bg-blue-50/50 rounded-3xl transition-all duration-300";

  return (
    <div className={containerClasses}>
      <div className="relative flex flex-col items-center justify-center">
        {/* Pulsing glow effect behind logo (soft blue) */}
        <div className="absolute inset-0 bg-[#0a47d4] rounded-full blur-[80px] opacity-20 animate-pulse"></div>
        
        {/* New CSS Logo with pulsing animation */}
        <div className="relative z-10 flex items-center gap-4 md:gap-6 animate-pulse">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#3B82F6] rounded-xl md:rounded-2xl flex flex-wrap gap-1 p-2.5 md:p-3.5 items-center justify-center transform rotate-45 shadow-lg shadow-blue-500/30">
                 <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-white rounded-full"></div>
                 <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-white rounded-full"></div>
                 <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-white rounded-full"></div>
                 <div className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-white rounded-full"></div>
            </div>
            <span className="text-4xl md:text-5xl font-bold text-[#1E293B] tracking-tight">PAUSES</span>
        </div>
      </div>
    </div>
  );
}

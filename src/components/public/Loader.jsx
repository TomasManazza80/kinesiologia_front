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
            <img src="/images/pausesLogo.png" alt="Pauses Logo" className="h-28 md:h-40 w-auto object-contain drop-shadow-lg relative z-10 animate-pulse scale-125" />
      </div>
    </div>
  );
}

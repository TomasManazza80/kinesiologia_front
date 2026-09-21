import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loader({ fullScreen = false, isLoading = true }) {
  const containerClasses = fullScreen
    ? "fixed inset-0 z-[9999] bg-[#f7f9fc] flex flex-col items-center justify-center min-h-screen pointer-events-none"
    : "flex flex-col items-center justify-center p-10 w-full h-full min-h-[300px] bg-blue-50/50 rounded-3xl";

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader-container"
          initial={fullScreen ? { y: 0 } : { opacity: 0 }}
          animate={fullScreen ? { y: 0 } : { opacity: 1 }}
          exit={fullScreen ? { y: '100%' } : { opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={containerClasses}
        >
          <div className="relative flex flex-col items-center justify-center">
            {/* Pulsing glow effect behind logo (soft blue) */}
            <motion.div 
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.9, 1.1, 0.9] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute inset-0 bg-[#0a47d4] rounded-full blur-[80px]"
            />
            
            {/* Logo with pulsing animation */}
            <motion.img 
              animate={{ scale: [1.15, 1.25, 1.15] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              src="/images/pausesLogo.png" 
              alt="Pauses Logo" 
              className="h-28 md:h-40 w-auto object-contain drop-shadow-lg relative z-10" 
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';
import { LiveEditorProvider, useLiveEditor } from '../../components/admin/contenido/LiveEditorProvider';
import LiveEditorToolbar from '../../components/admin/contenido/LiveEditorToolbar';
import HeroSection from '../../components/admin/contenido/sections/HeroSection';
import StatementSection from '../../components/admin/contenido/sections/StatementSection';
import ServicesSection from '../../components/admin/contenido/sections/ServicesSection';
import ContactSection from '../../components/admin/contenido/sections/ContactSection';

// Inner component to access context
const LiveViewContent = () => {
  const { isEditing } = useLiveEditor();
  
  return (
    <div className={`relative min-h-screen ${isEditing ? 'pb-24' : ''}`}>
      {/* Visual indicator when editing is active */}
      {isEditing && (
        <div className="fixed inset-0 pointer-events-none border-[6px] border-blue-500/20 z-40 transition-all duration-500">
          <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            MODO EDICIÓN ACTIVADO
          </div>
        </div>
      )}

      {/* The actual landing page sections */}
      <div className="w-full">
        <HeroSection />
        <StatementSection />
        <ServicesSection />
        <ContactSection />
      </div>

      <LiveEditorToolbar />
    </div>
  );
};

const LiveViewPage = () => {
  return (
    <LiveEditorProvider>
      <LiveViewContent />
    </LiveEditorProvider>
  );
};

export default LiveViewPage;

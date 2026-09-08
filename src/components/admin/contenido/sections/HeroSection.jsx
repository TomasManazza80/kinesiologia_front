import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, ArrowUpRight, ChevronDown, Award, ChevronLeft, ChevronRight, Plus, Trash2, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import EditableElement from '../EditableElement';
import { useLiveEditor } from '../LiveEditorProvider';

const HeroSection = () => {
  const { pageData, isEditing, addArrayItem, removeArrayItem, updateField } = useLiveEditor();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Guarantee slides is an array, even if the database saved it as an object
  const rawSlides = pageData?.hero?.slides;
  const slides = Array.isArray(rawSlides) 
    ? rawSlides 
    : (rawSlides && typeof rawSlides === 'object' ? Object.values(rawSlides) : [pageData?.hero || {}]); 
  
  useEffect(() => {
    if (isEditing || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isEditing, slides.length]);

  const heroTextRef = useRef(null);
  const heroMediaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroTextRef.current) {
        gsap.fromTo(heroTextRef.current, 
          { opacity: 0, x: -20 }, 
          { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
        );
      }
      if (heroMediaRef.current) {
        gsap.fromTo(heroMediaRef.current,
          { opacity: 0.5, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
        );
      }
    });
    return () => ctx.revert();
  }, [currentSlide]);

  const handleAddSlide = () => {
    const newSlide = slides.length > 0 ? { ...slides[currentSlide] } : {
      badge: 'NUEVA DIAPOSITIVA',
      title1: 'Nuevo Título',
      title2: 'Secundario',
      subtitle: 'Descripción de la nueva diapositiva',
      ctaPrimary: 'Acción Principal',
      ctaSecondary: 'Secundaria',
      stats: [
        { value: '0', label: 'Estadística' },
        { value: '0', label: 'Estadística' },
        { value: '0', label: 'Estadística' }
      ],
      imageBadge: { title: 'Atención', subtitle: 'Rehabilitación' },
      mediaType: 'image',
      mediaUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'
    };
    addArrayItem('hero.slides', newSlide);
    setCurrentSlide(slides.length);
  };

  const handleRemoveSlide = () => {
    if (slides.length > 1) {
      removeArrayItem('hero.slides', currentSlide);
      setCurrentSlide(prev => (prev > 0 ? prev - 1 : 0));
    }
  };

  const handleMediaUrlChange = (e) => {
    updateField(`hero.slides.${currentSlide}.mediaUrl`, e.target.value);
  };

  const toggleMediaType = () => {
    const newType = slides[currentSlide]?.mediaType === 'video' ? 'image' : 'video';
    updateField(`hero.slides.${currentSlide}.mediaType`, newType);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      const result = await response.json();
      if (result.success && result.url) {
        updateField(`hero.slides.${currentSlide}.mediaUrl`, result.url);
      } else {
        alert('Error al subir el archivo: ' + (result.message || 'Desconocido'));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error de red al subir el archivo.');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  if (!slides || slides.length === 0) return null;

  const currentData = slides[currentSlide];
  const slidePath = `hero.slides.${currentSlide}`;

  return (
    <section id="inicio" className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden">
      {/* Fixed Background Video for the entire Hero section */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/40 to-[#f8fafc] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editor Controls Overlay */}
        {isEditing && (
          <div className="absolute top-0 right-4 z-50 flex items-center gap-2 bg-white p-2 rounded-xl shadow-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-500 mr-2">SLIDES ({currentSlide + 1}/{slides.length})</span>
            <button onClick={() => setCurrentSlide(prev => (prev > 0 ? prev - 1 : slides.length - 1))} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button onClick={handleAddSlide} className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors flex items-center gap-1" title="Añadir Diapositiva">
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={handleRemoveSlide} disabled={slides.length <= 1} className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${slides.length <= 1 ? 'opacity-50 cursor-not-allowed text-slate-400' : 'hover:bg-red-50 text-red-500'}`} title="Eliminar Diapositiva">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div ref={heroTextRef} className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <EditableElement tag="span" dataPath={`${slidePath}.badge`} className="inline-block" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              <EditableElement tag="span" dataPath={`${slidePath}.title1`} className="inline-block" /> <br />
              <EditableElement tag="span" dataPath={`${slidePath}.title2`} className="text-blue-600 italic font-serif inline-block" />
            </h1>

            <EditableElement 
              tag="p" 
              dataPath={`${slidePath}.subtitle`} 
              className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed" 
            />

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-full shadow-xl shadow-blue-600/30 transition-all">
                <EditableElement tag="span" dataPath={`${slidePath}.ctaPrimary`} className="inline-block" />
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </button>
              <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-7 py-4 rounded-full border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                <EditableElement tag="span" dataPath={`${slidePath}.ctaSecondary`} className="inline-block" />
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <EditableElement tag="div" dataPath={`${slidePath}.stats.0.value`} className="text-2xl sm:text-3xl font-extrabold text-slate-900" />
                <EditableElement tag="div" dataPath={`${slidePath}.stats.0.label`} className="text-xs text-slate-500 font-semibold mt-0.5" />
              </div>
              <div>
                <EditableElement tag="div" dataPath={`${slidePath}.stats.1.value`} className="text-2xl sm:text-3xl font-extrabold text-slate-900" />
                <EditableElement tag="div" dataPath={`${slidePath}.stats.1.label`} className="text-xs text-slate-500 font-semibold mt-0.5" />
              </div>
              <div>
                <EditableElement tag="div" dataPath={`${slidePath}.stats.2.value`} className="text-2xl sm:text-3xl font-extrabold text-slate-900" />
                <EditableElement tag="div" dataPath={`${slidePath}.stats.2.label`} className="text-xs text-slate-500 font-semibold mt-0.5" />
              </div>
            </div>
          </div>

          {/* Right Column Image & Floating Card */}
          <div ref={heroMediaRef} className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-black group h-[460px]">
              
              {/* Media Renderer */}
              {currentData?.mediaType === 'video' ? (
                <video 
                  src={currentData?.mediaUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'} 
                  className="w-full h-full object-cover opacity-90"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img 
                  src={currentData?.mediaUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'} 
                  alt="Hero Media"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

              {/* Carousel Navigation Arrows */}
              {slides.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/90 backdrop-blur-md flex items-center justify-center text-white hover:text-slate-900 transition-all z-20 opacity-0 group-hover:opacity-100 shadow-xl border border-white/20"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button 
                    onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/90 backdrop-blur-md flex items-center justify-center text-white hover:text-slate-900 transition-all z-20 opacity-0 group-hover:opacity-100 shadow-xl border border-white/20"
                    aria-label="Siguiente"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </>
              )}
              {/* Media Editor Controls overlay */}
              {isEditing && (
                <div className="absolute inset-x-0 top-0 p-4 bg-black/60 backdrop-blur-sm border-b border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Configuración Multimedia</span>
                    <button onClick={toggleMediaType} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors">
                      {currentData?.mediaType === 'video' ? <VideoIcon className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                      {currentData?.mediaType === 'video' ? 'Usar Imagen' : 'Usar Video'}
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <label className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {isUploading ? 'Subiendo...' : 'Subir Archivo Local'}
                      <input 
                        type="file" 
                        accept={currentData?.mediaType === 'video' ? 'video/*' : 'image/*'} 
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden" 
                      />
                    </label>
                    
                    <span className="text-white/40 text-xs text-center sm:text-left">O</span>

                    <input
                      type="text"
                      value={currentData?.mediaUrl || ''}
                      onChange={handleMediaUrlChange}
                      placeholder="Pegar URL (https://...)"
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white text-sm rounded-lg focus:outline-none focus:border-blue-500 placeholder:text-white/40"
                    />
                  </div>
                </div>
              )}

              {/* Floating Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 space-y-2 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableElement tag="h4" dataPath={`${slidePath}.imageBadge.title`} className="font-bold text-slate-900 text-sm" />
                    <EditableElement tag="p" dataPath={`${slidePath}.imageBadge.subtitle`} className="text-xs text-slate-500 font-medium" />
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel navigation indicators (Dots) */}
            {!isEditing && slides.length > 1 && (
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? 'bg-blue-600 w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Calendar, Clock, UserCheck, ShieldCheck, Heart, 
    Sparkles, ArrowUpRight, ChevronDown, CheckCircle2, Phone, Mail, 
    MapPin, Users, Zap, Award, Stethoscope, ChevronRight, ChevronLeft, Menu, X, LogIn, CalendarCheck,
    Check, ArrowRight, User, Target
} from 'lucide-react';
import { useGetPublicProfessionalsQuery, useGetAvailableSlotsQuery } from '../../services/api/kinesioApi.js';
import PublicNavbar from '../nav/PublicNavbar.jsx';

// Import background videos
import video1 from '../../videos/video1.mp4';
import video2 from '../../videos/video 2.mp4';
import video3 from '../../videos/video 3.mp4';

// Framer Motion spring presets for interactive elements
const springConfig = { type: "spring", stiffness: 300, damping: 24 };

const initialPageData = {
  hero: {
    badge: 'CENTRO ESPECIALIZADO EN MENOPAUSIA',
    title1: 'Cuidado Integral',
    title2: 'Climaterio & Plenitud',
    subtitle: 'Acompañamos a mujeres y hombres en su etapa de transición hormonal. Especialistas en endocrinología, suelo pélvico y bienestar emocional para una vida plena.',
    ctaPrimary: 'Reservar Turno',
    ctaSecondary: 'Conocer Profesionales',
    stats: [
      { value: '15+', label: 'Años de Experiencia' },
      { value: '10k+', label: 'Pacientes Atendidos' },
      { value: '100%', label: 'Atención Personalizada' }
    ],
    imageBadge: {
      title: 'Atención Integral',
      subtitle: 'Endocrinología y Rehabilitación'
    }
  },
  statement: {
    badge: 'CUIDADO MULTIDISCIPLINARIO',
    title1: 'Integramos',
    title2: 'múltiples especialidades',
    title3: 'para brindar un acompañamiento completo, restaurando el',
    title4: 'equilibrio, vitalidad y salud pélvica',
    cta: 'Solicitar Evaluación'
  },
  services: {
    badge: 'Especialidades',
    title: 'Abordaje Integral y Personalizado',
    linkText: 'Ver profesionales disponibles',
    items: [
      { 
        id: 1, 
        icon: 'Stethoscope',
        title: 'Endocrinología Especializada', 
        description: 'Control hormonal y metabólico enfocado en el climaterio, menopausia y andropausia para un óptimo bienestar.',
        footerText: 'Atención en consultorio',
        btnText: 'Agendar'
      },
      { 
        id: 2, 
        icon: 'Zap',
        isHighlighted: true,
        badge: 'SERVICIO DESTACADO',
        title: 'Rehabilitación Suelo Pélvico', 
        description: 'Tratamiento kinésico especializado para incontinencia, disfunciones sexuales y fortalecimiento del piso pélvico en mujeres y hombres.',
        footerText: 'Individual o Empresas',
        btnText: 'Reservar Ahora'
      },
      { 
        id: 3, 
        icon: 'ShieldCheck',
        title: 'Acompañamiento Psicológico', 
        description: 'Espacio terapéutico para abordar los cambios emocionales, estrés y ansiedad durante la transición hormonal.',
        footerText: 'Diagnóstico kinésico',
        btnText: 'Agendar'
      }
    ]
  },
  contact: {
    title: 'Contacto',
    email: 'contacto@centrokinesiologico.com',
    phone: '+54 11 1234-5678'
  },
  procedure: {
    badge: 'TU CAMINO AL BIENESTAR',
    title: 'Programa Integral de 3 Meses',
    subtitle: 'Un recorrido estructurado donde serás acompañado paso a paso por nuestro equipo interdisciplinario.',
    items: [
      {
        id: 1,
        title: 'Evaluación Inicial',
        description: 'Consulta exhaustiva con endocrinología, clínica médica y evaluación kinesiológica para definir tu plan personalizado.',
        badge: 'M1',
        icon: 'CalendarCheck',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600&h=400',
        color: 'bg-[#13263E]',
        textColor: 'text-white'
      },
      {
        id: 2,
        title: 'Intervención Activa',
        description: 'Sesiones semanales focalizadas con especialistas asignados: suelo pélvico, apoyo psicológico y nutrición.',
        badge: 'M2',
        icon: 'Activity',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600&h=400',
        color: 'bg-[#B59970]',
        textColor: 'text-white'
      },
      {
        id: 3,
        title: 'Reevaluación y Alta',
        description: 'Análisis de resultados, ajustes metabólicos finales y entrega de pautas de mantenimiento a largo plazo.',
        badge: 'M3',
        icon: 'Award',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127d09e?auto=format&fit=crop&q=80&w=600&h=400',
        color: 'bg-emerald-600',
        textColor: 'text-white'
      }
    ]
  }
};

const IconMap = { Activity, Calendar, Clock, UserCheck, ShieldCheck, Heart, Sparkles, Zap, Award, Stethoscope, Users, Phone, Mail, MapPin };

const AvailabilityIndicator = ({ professionalId }) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const { data: slotsData, isLoading } = useGetAvailableSlotsQuery({ 
        professional_id: professionalId, 
        date: dateStr 
    }, { skip: !professionalId });
    
    if (isLoading) {
        return (
             <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                 ...
             </span>
        );
    }
    
    const slots = slotsData?.data || [];
    const hasSlots = slots.length > 0;
    
    if (hasSlots) {
        return (
             <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 Turnos hoy
             </span>
        );
    }
    
    return (
         <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
             <span className="w-2 h-2 rounded-full bg-slate-300" />
             Sin turnos hoy
         </span>
    );
};

export default function PausasLanding() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const containerRef = useRef(null);
    const [pageData, setPageData] = useState(initialPageData);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const backgroundVideos = [video1, video2, video3];

    // Guarantee slides is an array, even if the database saved it as an object
    const rawSlides = pageData?.hero?.slides;
    const slides = Array.isArray(rawSlides) 
      ? rawSlides 
      : (rawSlides && typeof rawSlides === 'object' ? Object.values(rawSlides) : [pageData?.hero || {}]);

    const heroTextRef = useRef(null);
    const heroMediaRef = useRef(null);

    useEffect(() => {
        if (isContentLoading) return;
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
    }, [currentSlide, isContentLoading]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [slides.length]);

    // We no longer use a fixed interval. The transition is triggered by the onEnded event of each video.

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Hacemos el fetch y un delay mínimo de 1200ms en paralelo
                const [response] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings/content`),
                    new Promise(resolve => setTimeout(resolve, 1200))
                ]);
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        let fetchedData = result.data;
                        if (!fetchedData.procedure) {
                            fetchedData.procedure = initialPageData.procedure;
                        }
                        setPageData(fetchedData);
                    }
                }
            } catch (error) {
                console.error("Error loading page content:", error);
            } finally {
                setIsContentLoading(false);
                // Le avisamos a App.jsx que ya cargó todo para que oculte el loader blanco original
                setTimeout(() => window.dispatchEvent(new Event('pausas-loaded')), 50);
            }
        };
        fetchContent();
    }, []);

    // Queries
    const { data: profData, isLoading: isLoadingProfs } = useGetPublicProfessionalsQuery();
    const professionals = profData?.data || [];

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "¿A quiénes están dirigidos sus tratamientos?",
            a: "Nuestros tratamientos están diseñados para mujeres y hombres que atraviesan la etapa de la menopausia y andropausia, ofreciendo un abordaje integral para mejorar su calidad de vida."
        },
        {
            q: "¿Cómo reservo mi turno online?",
            a: "Simplemente haz clic en el botón 'Reservar Turno', selecciona la especialidad (Endocrinología, Suelo Pélvico, Psicología, etc.) o tu profesional de preferencia, escoge el día y horario disponible y confirma tus datos en menos de 1 minuto."
        },
        {
            q: "¿Qué especialistas trabajan en el centro?",
            a: "Contamos con un equipo multidisciplinario que incluye endocrinólogos, kinesiólogos especializados en suelo pélvico, psicólogas, nutricionistas y ginecólogos enfocados en el climaterio."
        },
        {
            q: "¿Puedo cancelar o modificar la fecha de mi turno?",
            a: "Por supuesto. Desde el apartado 'Mis Turnos' en nuestra plataforma o vía WhatsApp puedes gestionar tus citas de forma rápida."
        }
    ];

    const currentData = slides[currentSlide] || slides[0] || {};

    if (isContentLoading) {
        return null;
    }

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#B59970]/50/20 selection:text-[#13263E] pb-16 md:pb-0 overflow-x-clip">
            
            {/* TOP HEADER / NAVBAR */}
            <PublicNavbar />

            {/* HERO SECTION */}
            <section id="inicio" className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-[#0a0a0a]">
                {/* Background Video Slider for the entire Hero section */}
                {backgroundVideos.map((videoSrc, index) => (
                    <video
                        key={index}
                        src={videoSrc}
                        muted
                        playsInline
                        ref={(el) => { 
                            if (el) {
                                el.playbackRate = 0.75; 
                                // Solamente reproducimos el video activo.
                                // Usamos useEffect-like behaviour aquí o simplemente confiamos en el render.
                                // Pero para asegurar el inicio, lo manejamos dinámicamente:
                                if (index === activeVideoIndex && el.paused) {
                                    el.play().catch(() => {});
                                } else if (index !== activeVideoIndex && !el.paused) {
                                    // Let it play for a bit during the fade out, then pause and reset
                                    setTimeout(() => {
                                        el.pause();
                                        el.currentTime = 0;
                                    }, 1000);
                                }
                            }
                        }}
                        onEnded={() => setActiveVideoIndex((prev) => (prev + 1) % backgroundVideos.length)}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                            index === activeVideoIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                    />
                ))}
                {/* Dark overlay to ensure white text readability */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none z-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] from-0% via-[#f8fafc]/50 via-15% to-transparent to-40% pointer-events-none z-20" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column Text */}
                        <div ref={heroTextRef} className="lg:col-span-7 space-y-6 text-left drop-shadow-lg">
                            {/* Eyebrow badge */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white text-xs font-bold tracking-wide shadow-lg"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-[#B59970]" />
                                <span>{currentData.badge}</span>
                            </motion.div>

                            {/* Main Title */}
                            <motion.h1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]"
                            >
                                {currentData.title1} <br />
                                <span className="text-[#e2c697] italic font-serif drop-shadow-md">{currentData.title2}</span>
                            </motion.h1>

                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                                className="text-base sm:text-lg text-white/90 max-w-xl font-medium leading-relaxed"
                            >
                                {currentData.subtitle}
                            </motion.p>

                            {/* Hero Action Buttons */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                                className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    whileTap={{ scale: 0.96 }}
                                    transition={springConfig}
                                    onClick={() => navigate('/reservar')}
                                    className="flex items-center justify-center gap-3 bg-[#13263E] hover:bg-[#B59970] text-white font-bold text-base px-8 py-4 rounded-full shadow-xl shadow-[#13263E]/30 transition-all"
                                >
                                    <span>{currentData.ctaPrimary}</span>
                                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                        <ArrowUpRight className="w-4 h-4 text-white" />
                                    </div>
                                </motion.button>
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href="#profesionales"
                                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold text-base px-7 py-4 rounded-full border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
                                >
                                    <span>{currentData.ctaSecondary}</span>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </motion.a>
                            </motion.div>

                            {/* Stats Row */}
                            {currentData.stats && Array.isArray(currentData.stats) && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                                    className="pt-8 border-t border-white/20 grid grid-cols-3 gap-6 max-w-lg"
                                >
                                    {currentData.stats.map((stat, idx) => (
                                        <div key={idx}>
                                            <div className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</div>
                                            <div className="text-xs text-white/80 font-semibold mt-0.5">{stat.label}</div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column Image & Floating Card */}
                        <div ref={heroMediaRef} className="gsap-hero-image lg:col-span-5 relative group">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-black group h-[460px]">
                                {currentData.mediaType === 'video' ? (
                                    <video 
                                        src={currentData.mediaUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'} 
                                        className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                    />
                                ) : (
                                    <img 
                                        src={currentData.mediaUrl || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'} 
                                        alt="Hero Media"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

                                {/* Floating Overlay Badge */}
                                {currentData.imageBadge && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.6 }}
                                        className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 space-y-2 z-10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 flex items-center justify-center text-[#B59970]">
                                                <Award className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">{currentData.imageBadge.title}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{currentData.imageBadge.subtitle}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Carousel navigation indicators (Dots) */}
                            {slides.length > 1 && (
                                <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentSlide(idx)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === idx ? 'bg-[#13263E] w-6' : 'bg-slate-300 hover:bg-slate-400'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* QUIÉNES SOMOS SECTION */}
            <section id="quienes-somos" className="py-24 bg-[#B59970]/5/50 border-y border-blue-100/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#B59970]/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#13263E]/5 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
                
                <div className="gsap-statement max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="text-center mb-16"
                    >
                        <span className="text-xs font-bold uppercase tracking-widest text-[#B59970] bg-[#B59970]/15/80 px-3.5 py-1.5 rounded-full mb-4 inline-block">
                            Quiénes Somos
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#13263E] max-w-4xl mx-auto mt-4 leading-tight">
                            La Menopausia y la Andropausia son el inicio de una nueva forma de vivir
                        </h2>
                        <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto mt-6 italic">
                            "Merecen algo más que una consulta rápida, merecen tiempo y una mirada completa."
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                        <div className="space-y-8">
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-[#13263E]/5 hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="w-14 h-14 bg-[#13263E] rounded-2xl flex items-center justify-center mb-6 text-[#B59970] shadow-md">
                                    <Users className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Programa Integral</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    <strong className="text-[#13263E]">Pauses</strong> es un espacio donde cinco profesionales de la salud fusionamos nuestras especialidades para acompañarte de manera personalizada, derribando tabúes, devolviendo el control de tu cuerpo y tu bienestar.
                                </p>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-[#13263E]/5 hover:-translate-y-2 transition-transform duration-300"
                            >
                                <div className="w-14 h-14 bg-[#B59970] rounded-2xl flex items-center justify-center mb-6 text-white shadow-md">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">Salud Sin Fragmentar</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    En lugar de fragmentar tu salud, unimos las piezas. Cuando ingresas al programa no tenés varias consultas aisladas, sino un <strong>equipo médico trabajando en sintonía para vos</strong>.
                                </p>
                            </motion.div>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                            className="relative"
                        >
                            <div className="bg-gradient-to-br from-[#13263E] to-[#1d3a5f] p-10 sm:p-12 rounded-[2.5rem] border border-[#B59970]/20 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#B59970]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="relative z-10 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[#B59970] text-sm font-bold">
                                        <Target className="w-4 h-4" />
                                        Tu Hoja de Ruta
                                    </div>
                                    <h3 className="text-2xl font-bold text-white leading-tight">
                                        Diseñamos un plan de acción personalizado
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                                        Cada persona que ingrese al programa tendrá a disposición una consulta individual y profunda con cada una de las profesionales. 
                                        Una vez finalizada estas evaluaciones, con una historia clínica única y compartida, y con una visión completa de tu estado actual, creamos una hoja de ruta con <strong>tratamientos médicos, pautas nutricionales, fitoterapéuticas, acompañamiento psicológico, Kinesiología</strong> y soporte integral adaptado exclusivamente a tus necesidades.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className="max-w-3xl mx-auto text-center mt-20"
                    >
                        <Heart className="w-10 h-10 text-[#B59970] mx-auto mb-6 animate-pulse" />
                        <p className="text-xl sm:text-2xl font-medium text-slate-800 leading-relaxed mb-8">
                            No creemos en las soluciones de talla única ni en las recetas universales, queremos conocer tu historia, tus antecedentes, tus síntomas, tus deseos, tus miedos y tus metas.
                        </p>
                        <span className="inline-block px-8 py-3 bg-[#13263E] text-white font-bold rounded-full shadow-lg text-lg tracking-wide">
                            Grupo Pauses
                        </span>
                    </motion.div>
                </div>
            </section>

            {/* SECCIÓN INFORMACIÓN DE PAUSAS Y SERVICIOS */}
            <section id="servicios" className="py-20 bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#B59970]">{pageData.services.badge}</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                                {pageData.services.title}
                            </h2>
                        </div>
                        <a href="#profesionales" className="text-sm font-bold text-[#B59970] hover:text-[#13263E] flex items-center gap-1">
                            <span>{pageData.services.linkText}</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Procedimiento de 3 Meses */}
                    {pageData.procedure && (
                        <div id="procedure-section" className="mb-24 pt-8">
                            <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.8 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="text-center max-w-2xl mx-auto mb-14"
                        >
                                <span className="inline-block py-1.5 px-4 rounded-full bg-[#13263E]/5 text-[#13263E] text-xs font-bold tracking-widest mb-3 border border-[#13263E]/10">
                                    {pageData.procedure.badge}
                                </span>
                                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{pageData.procedure.title}</h3>
                                <p className="text-slate-600 text-base mt-4 font-medium">{pageData.procedure.subtitle}</p>
                            </motion.div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                                {/* Línea conectora animada (solo desktop) */}
                                <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#13263E] via-[#B59970] to-emerald-600 opacity-40 z-0 animate-pulse"></div>
                                
                                {pageData.procedure.items && pageData.procedure.items.map((item, index) => {
                                    const delay = 0.1 + (index * 0.15);
                                    let ringColor = '';
                                    let borderColorHover = '';
                                    
                                    if (index === 0) {
                                        ringColor = 'bg-[#13263E]';
                                        borderColorHover = 'hover:border-[#13263E]/30';
                                    } else if (index === 1) {
                                        ringColor = 'bg-[#B59970]';
                                        borderColorHover = 'hover:border-[#B59970]/40';
                                    } else {
                                        ringColor = 'bg-emerald-600';
                                        borderColorHover = 'hover:border-emerald-500/40';
                                    }
                                    
                                    const hoverBgColor = index === 0 ? 'group-hover:bg-[#B59970]' : index === 1 ? 'group-hover:bg-[#13263E]' : 'group-hover:bg-[#B59970]';
                                    
                                    const IconComp = IconMap[item.icon] || CalendarCheck;

                                    return (
                                        <motion.div 
                                            key={item.id || index}
                                            initial={{ opacity: 0, y: 80, scale: 0.9 }}
                                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                            viewport={{ once: true, amount: 0.3 }}
                                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: delay }}
                                            className={`bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl ${borderColorHover} transition-all duration-300 relative z-10 flex flex-col overflow-hidden group hover:-translate-y-2 hover:scale-[1.02]`}
                                        >
                                            <div className="w-full h-52 relative overflow-hidden">
                                                <img src={item.image || "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600&h=400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 border border-white/30 text-white shadow-lg">
                                                    <IconComp className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <div className="p-8 pt-12 flex flex-col items-center text-center relative flex-1">
                                                <div className={`absolute -top-10 w-20 h-20 rounded-full ${ringColor} text-white flex items-center justify-center font-extrabold text-2xl shadow-xl border-4 border-white ${hoverBgColor} transition-colors duration-300`}>
                                                    {item.badge}
                                                </div>
                                                <h4 className="font-bold text-slate-900 text-xl mb-3">{item.title}</h4>
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Services Cards Grid */}
                    <div id="services-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pageData.services.items.map((item, index) => {
                            const IconComp = IconMap[item.icon] || Stethoscope;
                            if (item.isHighlighted) {
                                return (
                                    <motion.div 
                                        key={item.id || index}
                                        initial={{ opacity: 0, y: 60, scale: 0.95 }}
                                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                        viewport={{ once: true, amount: 0.2 }}
                                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
                                        className="bg-[#13263E] text-white rounded-3xl p-8 border border-[#13263E] shadow-2xl flex flex-col justify-between space-y-6 transform lg:-translate-y-2 hover:-translate-y-4 hover:shadow-[0_20px_40px_rgba(19,38,62,0.3)] transition-all duration-300"
                                    >
                                        <div className="space-y-4">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B59970]/50/20 border border-[#B59970]/30 text-[#B59970] text-xs font-bold">
                                                <IconComp className="w-3.5 h-3.5 text-[#B59970]" />
                                                <span>{item.badge}</span>
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-white">{item.title}</h3>
                                            <p className="text-sm text-white/80 leading-relaxed font-normal">
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                                            <span className="text-xs text-[#B59970] font-semibold">{item.footerText}</span>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                transition={springConfig}
                                                onClick={() => navigate('/reservar')}
                                                className="bg-[#13263E] hover:bg-[#B59970]/50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                            >
                                                <span>{item.btnText}</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                        } else {
                            return (
                                <motion.div 
                                    key={item.id || index}
                                    initial={{ opacity: 0, y: 60, scale: 0.95 }}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
                                    className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#B59970]/30 hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between space-y-6"
                                >
                                        <div className="space-y-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#B59970]/5 text-[#B59970] flex items-center justify-center">
                                                <IconComp className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                {item.description}
                                            </p>
                                        </div>
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400">{item.footerText}</span>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => navigate('/reservar')}
                                            className="bg-slate-100 hover:bg-[#13263E] hover:text-white text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                        >
                                            {item.btnText}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        }
                        })}
                    </div>
                </div>
            </section>

            {/* SECCIÓN PROFESIONALES DISPONIBLES */}
            <section id="profesionales" className="py-20 bg-white border-t border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#B59970] bg-[#B59970]/5 px-3.5 py-1.5 rounded-full">
                            NUESTRO EQUIPO
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                            Profesionales Disponibles
                        </h2>
                        <p className="text-slate-600 text-sm font-medium">
                            Selecciona al especialista con quien deseas realizar tu consulta de evaluación integral.
                        </p>
                    </div>

                    {/* Professionals Grid */}
                    {isLoadingProfs ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((n) => (
                                <div key={n} className="h-72 bg-slate-100 rounded-3xl animate-pulse" />
                            ))}
                        </div>
                    ) : professionals.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {professionals.map((prof) => {
                                const specialtiesList = Array.isArray(prof.specialty) 
                                    ? prof.specialty.join(', ') 
                                    : (prof.specialty || 'Kinesiología & Pausas');

                                return (
                                    <motion.div 
                                        key={prof.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.35, ease: "easeOut" }}
                                        whileHover={{ y: -6, transition: springConfig }}
                                        className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-200 hover:border-[#B59970]/40 hover:shadow-xl transition-all flex flex-col justify-between group"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-[#B59970]/15 border border-[#B59970]/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-[#B59970] group-hover:scale-105 transition-transform">
                                                    {prof.profile_picture || prof.avatar_url || prof.image ? (
                                                        <img src={prof.profile_picture || prof.avatar_url || prof.image} alt={prof.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-[#B59970] transition-colors">
                                                        {prof.name}
                                                    </h3>
                                                    <span className="inline-block text-xs font-bold text-[#B59970] bg-[#B59970]/15/70 px-3 py-1 rounded-full mt-1 border border-[#B59970]/30">
                                                        {specialtiesList}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                                                {prof.bio || prof.description || 'Profesional certificado con amplia experiencia en atención integral de la menopausia y andropausia.'}
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center justify-between">
                                            <AvailabilityIndicator professionalId={prof.id} />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigate(`/reservar?profesional=${prof.id}`)}
                                                className="bg-[#13263E] hover:bg-[#B59970] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1"
                                            >
                                                <span>Reservar</span>
                                                <ArrowUpRight className="w-3.5 h-3.5" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        // Fallback Professionals Grid
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: "Dra. Carolina Rossi", spec: "Endocrinología", desc: "Especialista en climaterio, menopausia y regulación metabólica integral." },
                                { name: "Lic. Martín Gómez", spec: "Kinesiólogo Pélvico", desc: "Experto en rehabilitación de suelo pélvico, incontinencia y disfunciones sexuales." },
                                { name: "Lic. Ana Martínez", spec: "Psicología Clínica", desc: "Acompañamiento terapéutico durante las transiciones hormonales y vitales." }
                            ].map((prof, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35, ease: "easeOut" }}
                                    whileHover={{ y: -6, transition: springConfig }} 
                                    className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-200 flex flex-col justify-between"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center font-bold">
                                                <User className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base">{prof.name}</h3>
                                                <span className="text-xs font-bold text-[#B59970] bg-[#B59970]/15 px-2.5 py-0.5 rounded-full">
                                                    {prof.spec}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{prof.desc}</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-600">Turnos Disponibles</span>
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/reservar')} className="bg-[#13263E] text-white text-xs font-bold px-4 py-2 rounded-xl">
                                            Reservar
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SECCIÓN POR QUÉ ELEGIRNOS */}
            <section className="py-20 bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Image Left */}
                        <motion.div 
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="lg:col-span-5 relative"
                        >
                            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                                <img 
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                                    alt="Por qué elegirnos"
                                    className="w-full h-[440px] object-cover"
                                />
                            </div>
                        </motion.div>

                        {/* Features Right */}
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#B59970]">POR QUÉ ELEGIRNOS</span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                                    Excelencia en cada atención
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                                    className="space-y-2"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Equipamiento Moderno</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Tecnología kinésica de vanguardia para acelerar tu proceso de recuperación.
                                    </p>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                                    className="space-y-2"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Kinesiologos Certificados</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Profesionales altamente capacitados con amplia trayectoria clínica.
                                    </p>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
                                    className="space-y-2"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Turnos Online 24/7</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Reserva rápida y sin demoras en cualquier momento del día.
                                    </p>
                                </motion.div>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
                                    className="space-y-2"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Abordaje Integral</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Tratamientos que contemplan cuerpo, mente y salud hormonal.
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECCIÓN BANNER CTA FINAL */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.96 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-[#13263E] rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 shadow-2xl relative overflow-hidden"
                >
                    <div className="max-w-2xl mx-auto space-y-4">
                        <h2 className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
                            ¿Listo para vivir tu transición con plenitud?
                        </h2>
                        <p className="text-white text-sm sm:text-base font-normal leading-relaxed">
                            Reserva tu consulta hoy mismo y da el primer paso hacia un bienestar hormonal, físico y emocional.
                        </p>
                    </div>
                    <div>
                        <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                            transition={springConfig}
                            onClick={() => navigate('/reservar')}
                            className="inline-flex items-center gap-3 bg-[#13263E] hover:bg-[#B59970]/50 text-white font-bold text-base px-9 py-4 rounded-full shadow-xl shadow-[#13263E]/40 transition-all"
                        >
                            <span>Reservar Mi Turno Ahora</span>
                            <ArrowUpRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* SECCIÓN FAQ */}
            <section id="faq" className="py-16 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-2 mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#B59970]">FAQS</span>
                        <h2 className="text-3xl font-extrabold text-slate-900">Preguntas Frecuentes</h2>
                    </div>

                    <div className="space-y-4 max-w-4xl mx-auto">
                        {faqs.map((faq, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.5 }}
                                transition={{ duration: 0.35, delay: idx * 0.05, ease: "easeOut" }}
                                className="bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 hover:text-[#B59970] transition-colors text-base"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-[#B59970] transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                                </button>
                                
                                <AnimatePresence>
                                    {activeFaq === idx && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="px-5 pb-5 text-slate-600 text-sm font-medium leading-relaxed border-t border-slate-200/60 pt-3 overflow-hidden"
                                        >
                                            {faq.a}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="bg-white border-t border-slate-200 py-12 text-slate-500 text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-900 font-bold text-base">
                                <img src="/images/pausesLogo.png" alt="Pauses Logo" className="h-16 w-auto object-contain" />
                            </div>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                Atención multidisciplinaria especializada en menopausia, andropausia y suelo pélvico.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3">Navegación</h4>
                            <ul className="space-y-2 font-medium">
                                <li><a href="#pausas" className="hover:text-[#B59970]">Especialidades</a></li>
                                <li><a href="#servicios" className="hover:text-[#B59970]">Servicios</a></li>
                                <li><a href="#profesionales" className="hover:text-[#B59970]">Profesionales</a></li>
                                <li><Link to="/reservar" className="hover:text-[#B59970]">Reservar Turno</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3">Contacto</h4>
                            <ul className="space-y-2 font-medium">
                                <li>+54 9 342 554-7811</li>
                                <li>contacto@centrokinesiologico.com</li>
                                <li>Santa Fe, Argentina</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3">Acceso Staff</h4>
                            <Link to="/login" className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-4 py-2 rounded-xl transition-colors">
                                <LogIn className="w-4 h-4 text-[#B59970]" /> Personal Login
                            </Link>
                        </div>

                    </div>

                    <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 font-medium">
                        <p>© {new Date().getFullYear()} Centro Kinesiológico. Todos los derechos reservados.</p>
                        <p>Diseño basado en SoludMedia / Innovation Clinic</p>
                    </div>
                </div>
            </footer>

            {/* MOBILE BOTTOM NAVIGATION BAR */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-2 flex items-center justify-around text-[10px] font-bold text-slate-600 shadow-lg">
                <a href="#inicio" className="flex flex-col items-center gap-0.5 hover:text-[#B59970]">
                    <Activity className="w-5 h-5 text-[#B59970]" />
                    <span>Inicio</span>
                </a>
                <a href="#pausas" className="flex flex-col items-center gap-0.5 hover:text-[#B59970]">
                    <Zap className="w-5 h-5 text-[#B59970]" />
                    <span>Especialidades</span>
                </a>
                <button onClick={() => navigate('/reservar')} className="flex flex-col items-center gap-0.5 text-[#B59970]">
                    <div className="w-9 h-9 rounded-full bg-[#13263E] text-white flex items-center justify-center shadow-md">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span>Turnos</span>
                </button>
                <a href="#profesionales" className="flex flex-col items-center gap-0.5 hover:text-[#B59970]">
                    <Users className="w-5 h-5 text-[#B59970]" />
                    <span>Equipo</span>
                </a>
            </div>

        </div>
    );
}

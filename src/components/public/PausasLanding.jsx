import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, Calendar, Clock, UserCheck, ShieldCheck, Heart, 
    Sparkles, ArrowUpRight, ChevronDown, CheckCircle2, Phone, Mail, 
    MapPin, Users, Zap, Award, Stethoscope, ChevronRight, Menu, X, LogIn, CalendarCheck,
    Check, ArrowRight, User
} from 'lucide-react';
import { useGetPublicProfessionalsQuery } from '../../services/api/kinesioApi.js';
import PublicNavbar from '../nav/PublicNavbar.jsx';

// Register GSAP ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Framer Motion spring presets for interactive elements
const springConfig = { type: "spring", stiffness: 300, damping: 24 };

export default function PausasLanding() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const containerRef = useRef(null);

    // Queries
    const { data: profData, isLoading: isLoadingProfs } = useGetPublicProfessionalsQuery();
    const professionals = profData?.data || [];

    // GSAP ScrollTrigger & Entrance Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            
            // 1. Initial Hero Entrance (fast & snappy)
            const heroTl = gsap.timeline({ delay: 0.1 });

            heroTl.from(".gsap-header", {
                y: -30,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            });

            heroTl.from(".gsap-hero-item", {
                y: 25,
                opacity: 0,
                duration: 0.4,
                stagger: 0.06,
                ease: "power2.out"
            }, "-=0.2");

            heroTl.from(".gsap-hero-image", {
                scale: 0.96,
                opacity: 0,
                duration: 0.45,
                ease: "power2.out"
            }, "-=0.3");

            heroTl.from(".gsap-floating-badge", {
                y: 20,
                opacity: 0,
                duration: 0.35,
                ease: "back.out(1.5)"
            }, "-=0.2");

            // 2. ScrollTrigger Animations as user scrolls down

            // Statement Section Scroll Animation
            gsap.from(".gsap-statement", {
                scrollTrigger: {
                    trigger: ".gsap-statement",
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                y: 30,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            });

            // Services Cards Scroll Animation
            gsap.from(".gsap-service-card", {
                scrollTrigger: {
                    trigger: "#pausas",
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                y: 30,
                opacity: 0,
                duration: 0.4,
                stagger: 0.08,
                ease: "power2.out"
            });

            // Why Choose Us Section Scroll Animation
            gsap.from(".gsap-why-img", {
                scrollTrigger: {
                    trigger: ".gsap-why-choose",
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                x: -30,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            });

            gsap.from(".gsap-why-item", {
                scrollTrigger: {
                    trigger: ".gsap-why-choose",
                    start: "top 80%",
                    toggleActions: "play none none none"
                },
                x: 25,
                opacity: 0,
                duration: 0.4,
                stagger: 0.06,
                ease: "power2.out"
            });

            // Final Banner CTA Scroll Animation
            gsap.from(".gsap-cta-banner", {
                scrollTrigger: {
                    trigger: ".gsap-cta-banner",
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                scale: 0.96,
                opacity: 0,
                duration: 0.4,
                ease: "power2.out"
            });

            // FAQ Items Scroll Animation
            gsap.from(".gsap-faq-item", {
                scrollTrigger: {
                    trigger: "#faq",
                    start: "top 85%",
                    toggleActions: "play none none none"
                },
                y: 20,
                opacity: 0,
                duration: 0.35,
                stagger: 0.05,
                ease: "power2.out"
            });

        }, containerRef);

        return () => ctx.revert();
    }, [professionals]);

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

    return (
        <div ref={containerRef} className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-500/20 selection:text-blue-900 pb-16 md:pb-0 overflow-x-clip">
            
            {/* TOP HEADER / NAVBAR */}
            <PublicNavbar />

            {/* HERO SECTION */}
            <section id="inicio" className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column Text */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            {/* Eyebrow badge */}
                            <div className="gsap-hero-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>CENTRO ESPECIALIZADO EN MENOPAUSIA</span>
                            </div>

                            {/* Main Title */}
                            <h1 className="gsap-hero-item text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                                Cuidado Integral <br />
                                <span className="text-blue-600 italic font-serif">Climaterio & Plenitud</span>
                            </h1>

                            <p className="gsap-hero-item text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
                                Acompañamos a mujeres y hombres en su etapa de transición hormonal. Especialistas en endocrinología, suelo pélvico y bienestar emocional para una vida plena.
                            </p>

                            {/* Hero Action Buttons */}
                            <div className="gsap-hero-item pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    whileTap={{ scale: 0.96 }}
                                    transition={springConfig}
                                    onClick={() => navigate('/reservar')}
                                    className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-full shadow-xl shadow-blue-600/30 transition-all"
                                >
                                    <span>Reservar Turno</span>
                                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                                        <ArrowUpRight className="w-4 h-4 text-white" />
                                    </div>
                                </motion.button>
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href="#profesionales"
                                    className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-7 py-4 rounded-full border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
                                >
                                    <span>Conocer Profesionales</span>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </motion.a>
                            </div>

                            {/* Stats Row */}
                            <div className="gsap-hero-item pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
                                <div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">15+</div>
                                    <div className="text-xs text-slate-500 font-semibold mt-0.5">Años de Experiencia</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">10k+</div>
                                    <div className="text-xs text-slate-500 font-semibold mt-0.5">Pacientes Atendidos</div>
                                </div>
                                <div>
                                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</div>
                                    <div className="text-xs text-slate-500 font-semibold mt-0.5">Atención Personalizada</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column Image & Floating Card */}
                        <div className="gsap-hero-image lg:col-span-5 relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white group">
                                <img 
                                    src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" 
                                    alt="Kinesiología y Pausas"
                                    className="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

                                {/* Floating Overlay Badge */}
                                <div className="gsap-floating-badge absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">Atención Integral</h4>
                                            <p className="text-xs text-slate-500 font-medium">Endocrinología y Rehabilitación</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATEMENT SECTION */}
            <section className="py-16 bg-blue-50/50 border-y border-blue-100/80">
                <div className="gsap-statement max-w-4xl mx-auto px-4 text-center space-y-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/80 px-3.5 py-1.5 rounded-full">
                        CUIDADO MULTIDISCIPLINARIO
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-relaxed max-w-3xl mx-auto">
                        Integramos <span className="text-blue-600 italic font-serif">múltiples especialidades</span> para brindar un acompañamiento completo, restaurando el <span className="text-blue-600 italic font-serif">equilibrio, vitalidad y salud pélvica</span>.
                    </h2>
                    <div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={springConfig}
                            onClick={() => navigate('/reservar')}
                            className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
                        >
                            <span>Solicitar Evaluación</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* SECCIÓN INFORMACIÓN DE PAUSAS Y SERVICIOS */}
            <section id="pausas" className="py-20 bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Especialidades</span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                                Abordaje Integral y Personalizado
                            </h2>
                        </div>
                        <a href="#profesionales" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                            <span>Ver profesionales disponibles</span>
                            <ArrowUpRight className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Services Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        {/* Card 1: Kinesiología General */}
                        <motion.div 
                            whileHover={{ y: -8, transition: springConfig }}
                            className="gsap-service-card bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Endocrinología Especializada</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Control hormonal y metabólico enfocado en el climaterio, menopausia y andropausia para un óptimo bienestar.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Atención en consultorio</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/reservar')}
                                    className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                >
                                    Agendar
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Card 2: DESTACADA (Blue Royal Navy Accent - Pausas Activas) */}
                        <motion.div 
                            whileHover={{ y: -8, transition: springConfig }}
                            className="gsap-service-card bg-[#0f2b6e] text-white rounded-3xl p-8 border border-blue-900 shadow-2xl flex flex-col justify-between space-y-6 transform lg:-translate-y-2"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold">
                                    <Zap className="w-3.5 h-3.5 text-blue-300" />
                                    <span>SERVICIO DESTACADO</span>
                                </div>
                                <h3 className="text-2xl font-extrabold text-white">Rehabilitación Suelo Pélvico</h3>
                                <p className="text-sm text-blue-100 leading-relaxed font-normal">
                                    Tratamiento kinésico especializado para incontinencia, disfunciones sexuales y fortalecimiento del piso pélvico en mujeres y hombres.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-blue-800/80 flex items-center justify-between">
                                <span className="text-xs text-blue-200 font-semibold">Individual o Empresas</span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={springConfig}
                                    onClick={() => navigate('/reservar')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                                >
                                    <span>Reservar Ahora</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </motion.button>
                            </div>
                        </motion.div>

                        {/* Card 3: RPG y Postura */}
                        <motion.div 
                            whileHover={{ y: -8, transition: springConfig }}
                            className="gsap-service-card bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between space-y-6"
                        >
                            <div className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Acompañamiento Psicológico</h3>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                    Espacio terapéutico para abordar los cambios emocionales, estrés y ansiedad durante la transición hormonal.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400">Diagnóstico kinésico</span>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/reservar')}
                                    className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all"
                                >
                                    Agendar
                                </motion.button>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* SECCIÓN PROFESIONALES DISPONIBLES */}
            <section id="profesionales" className="py-20 bg-white border-t border-slate-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full">
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
                                        className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all flex flex-col justify-between group"
                                    >
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                                                    {prof.avatar_url || prof.image ? (
                                                        <img src={prof.avatar_url || prof.image} alt={prof.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                        {prof.name}
                                                    </h3>
                                                    <span className="inline-block text-xs font-bold text-blue-600 bg-blue-100/70 px-3 py-1 rounded-full mt-1 border border-blue-200">
                                                        {specialtiesList}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 font-medium line-clamp-3 leading-relaxed">
                                                {prof.bio || prof.description || 'Profesional certificado con amplia experiencia en atención integral de la menopausia y andropausia.'}
                                            </p>
                                        </div>

                                        <div className="pt-6 border-t border-slate-200/80 mt-6 flex items-center justify-between">
                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Turnos hoy
                                            </span>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigate(`/reservar?profesional=${prof.id}`)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1"
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
                                            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                                <User className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base">{prof.name}</h3>
                                                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                                                    {prof.spec}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{prof.desc}</p>
                                    </div>
                                    <div className="pt-6 border-t border-slate-200 mt-6 flex items-center justify-between">
                                        <span className="text-xs font-bold text-emerald-600">Turnos Disponibles</span>
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/reservar')} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl">
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
            <section className="gsap-why-choose py-20 bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Image Left */}
                        <div className="gsap-why-img lg:col-span-5 relative">
                            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                                <img 
                                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800" 
                                    alt="Por qué elegirnos"
                                    className="w-full h-[440px] object-cover"
                                />
                            </div>
                        </div>

                        {/* Features Right */}
                        <div className="lg:col-span-7 space-y-8">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">POR QUÉ ELEGIRNOS</span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                                    Excelencia en cada atención
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Equipamiento Moderno</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Tecnología kinésica de vanguardia para acelerar tu proceso de recuperación.
                                    </p>
                                </div>

                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Kinesiologos Certificados</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Profesionales altamente capacitados con amplia trayectoria clínica.
                                    </p>
                                </div>

                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Turnos Online 24/7</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Reserva rápida y sin demoras en cualquier momento del día.
                                    </p>
                                </div>

                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                        <Heart className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Abordaje Integral</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Tratamientos que contemplan cuerpo, mente y salud hormonal.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* SECCIÓN BANNER CTA FINAL */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="gsap-cta-banner bg-[#0a183d] rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            ¿Listo para vivir tu transición con plenitud?
                        </h2>
                        <p className="text-blue-100 text-sm sm:text-base font-normal leading-relaxed">
                            Reserva tu consulta hoy mismo y da el primer paso hacia un bienestar hormonal, físico y emocional.
                        </p>
                    </div>
                    <div>
                        <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.95 }}
                            transition={springConfig}
                            onClick={() => navigate('/reservar')}
                            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-base px-9 py-4 rounded-full shadow-xl shadow-blue-600/40 transition-all"
                        >
                            <span>Reservar Mi Turno Ahora</span>
                            <ArrowUpRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>
            </section>

            {/* SECCIÓN FAQ */}
            <section id="faq" className="py-16 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-2 mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-blue-600">FAQS</span>
                        <h2 className="text-3xl font-extrabold text-slate-900">Preguntas Frecuentes</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="gsap-faq-item bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full p-5 text-left flex items-center justify-between font-bold text-slate-900 hover:text-blue-600 transition-colors text-base"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
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
                            </div>
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
                                <li><a href="#pausas" className="hover:text-blue-600">Especialidades</a></li>
                                <li><a href="#servicios" className="hover:text-blue-600">Servicios</a></li>
                                <li><a href="#profesionales" className="hover:text-blue-600">Profesionales</a></li>
                                <li><Link to="/reservar" className="hover:text-blue-600">Reservar Turno</Link></li>
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
                            <Link to="/login" className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2 rounded-xl transition-colors">
                                <LogIn className="w-4 h-4 text-blue-600" /> Personal Login
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
                <a href="#inicio" className="flex flex-col items-center gap-0.5 hover:text-blue-600">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>Inicio</span>
                </a>
                <a href="#pausas" className="flex flex-col items-center gap-0.5 hover:text-blue-600">
                    <Zap className="w-5 h-5 text-blue-600" />
                    <span>Especialidades</span>
                </a>
                <button onClick={() => navigate('/reservar')} className="flex flex-col items-center gap-0.5 text-blue-600">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <span>Turnos</span>
                </button>
                <a href="#profesionales" className="flex flex-col items-center gap-0.5 hover:text-blue-600">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Equipo</span>
                </a>
            </div>

        </div>
    );
}

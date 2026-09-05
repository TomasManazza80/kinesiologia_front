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
  }
};

const IconMap = { Activity, Calendar, Clock, UserCheck, ShieldCheck, Heart, Sparkles, Zap, Award, Stethoscope, Users, Phone, Mail, MapPin };

export default function PausasLanding() {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeFaq, setActiveFaq] = useState(null);
    const containerRef = useRef(null);
    const [pageData, setPageData] = useState(initialPageData);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings/content`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setPageData(result.data);
                    }
                }
            } catch (error) {
                console.error("Error loading page content:", error);
            }
        };
        fetchContent();
    }, []);

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
        <div ref={containerRef} className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#B59970]/50/20 selection:text-[#13263E] pb-16 md:pb-0 overflow-x-clip">
            
            {/* TOP HEADER / NAVBAR */}
            <PublicNavbar />

            {/* HERO SECTION */}
            <section id="inicio" className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-[#B59970]/10 via-white to-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column Text */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            {/* Eyebrow badge */}
                            <div className="gsap-hero-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#B59970]/15/70 border border-[#B59970]/30/80 text-[#13263E] text-xs font-bold tracking-wide">
                                <Sparkles className="w-3.5 h-3.5 text-[#B59970]" />
                                <span>{pageData.hero.badge}</span>
                            </div>

                            {/* Main Title */}
                            <h1 className="gsap-hero-item text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                                {pageData.hero.title1} <br />
                                <span className="text-[#B59970] italic font-serif">{pageData.hero.title2}</span>
                            </h1>

                            <p className="gsap-hero-item text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed">
                                {pageData.hero.subtitle}
                            </p>

                            {/* Hero Action Buttons */}
                            <div className="gsap-hero-item pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.04, y: -2 }}
                                    whileTap={{ scale: 0.96 }}
                                    transition={springConfig}
                                    onClick={() => navigate('/reservar')}
                                    className="flex items-center justify-center gap-3 bg-[#13263E] hover:bg-[#B59970] text-white font-bold text-base px-8 py-4 rounded-full shadow-xl shadow-[#13263E]/30 transition-all"
                                >
                                    <span>{pageData.hero.ctaPrimary}</span>
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
                                    <span>{pageData.hero.ctaSecondary}</span>
                                    <ChevronDown className="w-4 h-4 text-slate-500" />
                                </motion.a>
                            </div>

                            {/* Stats Row */}
                            <div className="gsap-hero-item pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
                                {pageData.hero.stats.map((stat, idx) => (
                                    <div key={idx}>
                                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stat.value}</div>
                                        <div className="text-xs text-slate-500 font-semibold mt-0.5">{stat.label}</div>
                                    </div>
                                ))}
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
                                        <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 flex items-center justify-center text-[#B59970]">
                                            <Award className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{pageData.hero.imageBadge.title}</h4>
                                            <p className="text-xs text-slate-500 font-medium">{pageData.hero.imageBadge.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATEMENT SECTION */}
            <section className="py-16 bg-[#B59970]/5/50 border-y border-blue-100/80">
                <div className="gsap-statement max-w-4xl mx-auto px-4 text-center space-y-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#B59970] bg-[#B59970]/15/80 px-3.5 py-1.5 rounded-full">
                        {pageData.statement.badge}
                    </span>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-relaxed max-w-3xl mx-auto">
                        {pageData.statement.title1} <span className="text-[#B59970] italic font-serif">{pageData.statement.title2}</span> {pageData.statement.title3} <span className="text-[#B59970] italic font-serif">{pageData.statement.title4}</span>.
                    </h2>
                    <div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={springConfig}
                            onClick={() => navigate('/reservar')}
                            className="inline-flex items-center gap-2 bg-[#B59970]/15 text-[#13263E] hover:bg-blue-200 font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
                        >
                            <span>{pageData.statement.cta}</span>
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

                    {/* Services Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {pageData.services.items.map((item, index) => {
                            const IconComp = IconMap[item.icon] || Stethoscope;
                            if (item.isHighlighted) {
                                return (
                                    <motion.div 
                                        key={item.id || index}
                                        whileHover={{ y: -8, transition: springConfig }}
                                        className="gsap-service-card bg-[#13263E] text-white rounded-3xl p-8 border border-[#13263E] shadow-2xl flex flex-col justify-between space-y-6 transform lg:-translate-y-2"
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
                                        whileHover={{ y: -8, transition: springConfig }}
                                        className="gsap-service-card bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#B59970]/30 transition-all flex flex-col justify-between space-y-6"
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
                                                    {prof.avatar_url || prof.image ? (
                                                        <img src={prof.avatar_url || prof.image} alt={prof.name} className="w-full h-full object-cover" />
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
                                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Turnos hoy
                                            </span>
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
                                <span className="text-xs font-bold uppercase tracking-widest text-[#B59970]">POR QUÉ ELEGIRNOS</span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
                                    Excelencia en cada atención
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Equipamiento Moderno</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Tecnología kinésica de vanguardia para acelerar tu proceso de recuperación.
                                    </p>
                                </div>

                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Kinesiologos Certificados</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Profesionales altamente capacitados con amplia trayectoria clínica.
                                    </p>
                                </div>

                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-base">Turnos Online 24/7</h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        Reserva rápida y sin demoras en cualquier momento del día.
                                    </p>
                                </div>

                                <div className="gsap-why-item space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-[#B59970]/15 text-[#B59970] flex items-center justify-center">
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
                <div className="gsap-cta-banner bg-[#13263E] rounded-3xl p-10 sm:p-14 text-center text-white space-y-6 shadow-2xl relative overflow-hidden">
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
                </div>
            </section>

            {/* SECCIÓN FAQ */}
            <section id="faq" className="py-16 bg-white border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-2 mb-12">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#B59970]">FAQS</span>
                        <h2 className="text-3xl font-extrabold text-slate-900">Preguntas Frecuentes</h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="gsap-faq-item bg-[#f8fafc] rounded-2xl border border-slate-200 overflow-hidden">
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

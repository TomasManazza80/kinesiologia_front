import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CalendarCheck, LogIn, ArrowUpRight, Menu, X, LayoutDashboard, LogOut, User
} from 'lucide-react';
import { logoutUser } from '../../services/auth/authActions.js';

const springConfig = { type: "spring", stiffness: 300, damping: 24 };

export default function PublicNavbar({ className = '' }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const token = useSelector((state) => state.authSlice?.accessToken);
    const userInfo = useSelector((state) => state.authSlice?.userInfo);

    const isAdminOrStaff = userInfo?.role === 'ADMIN' || userInfo?.role === 'EMPLOYEE' || userInfo?.role === 'SUPERADMIN';

    const handleNavClick = (e, hash) => {
        e.preventDefault();
        setMobileMenuOpen(false);
        if (location.pathname !== '/' && location.pathname !== '/pausas') {
            navigate('/' + hash);
        } else {
            const el = document.querySelector(hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            } else if (hash === '#inicio') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    return (
        <header className={`gsap-header sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    
                    {/* Logo / Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.img 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            src="/images/pausesLogo.png" 
                            alt="Pauses Logo" 
                            className="h-16 md:h-[70px] w-auto object-contain scale-150 ml-6 md:ml-8"
                        />
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="/#inicio" onClick={(e) => handleNavClick(e, '#inicio')} className="hover:text-blue-600 transition-colors">Inicio</a>
                        <a href="/#pausas" onClick={(e) => handleNavClick(e, '#pausas')} className="hover:text-blue-600 transition-colors">Pausas Activas</a>
                        <a href="/#servicios" onClick={(e) => handleNavClick(e, '#servicios')} className="hover:text-blue-600 transition-colors">Servicios</a>
                        <a href="/#profesionales" onClick={(e) => handleNavClick(e, '#profesionales')} className="hover:text-blue-600 transition-colors">Profesionales</a>
                        <a href="/#faq" onClick={(e) => handleNavClick(e, '#faq')} className="hover:text-blue-600 transition-colors">FAQ</a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Link 
                            to="/mis-turnos"
                            className="text-xs font-bold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                        >
                            <CalendarCheck className="w-4 h-4 text-blue-600" />
                            Mis Turnos
                        </Link>

                        {isAdminOrStaff && (
                            <Link 
                                to="/dashboard"
                                className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                                Panel Admin
                            </Link>
                        )}

                        {!token ? (
                            <Link 
                                to="/login"
                                className="text-xs font-bold text-slate-500 hover:text-slate-900 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <LogIn className="w-4 h-4" />
                                Staff Login
                            </Link>
                        ) : (
                            <button
                                onClick={logoutUser}
                                className="text-xs font-bold text-slate-500 hover:text-red-600 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                            >
                                <LogOut className="w-4 h-4" />
                                Salir
                            </button>
                        )}

                        {location.pathname !== '/reservar' && (
                            <motion.button
                                whileHover={{ scale: 1.05, y: -1 }}
                                whileTap={{ scale: 0.96 }}
                                transition={springConfig}
                                onClick={() => navigate('/reservar')}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all"
                            >
                                <span>Reservar Turno</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </motion.button>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <div className="md:hidden flex items-center gap-2">
                        {location.pathname !== '/reservar' && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/reservar')}
                                className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-blue-500/20"
                            >
                                Turnos
                            </motion.button>
                        )}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 overflow-hidden"
                    >
                        <nav className="flex flex-col space-y-3 font-semibold text-sm text-slate-700">
                            <a href="/#inicio" onClick={(e) => handleNavClick(e, '#inicio')}>Inicio</a>
                            <a href="/#pausas" onClick={(e) => handleNavClick(e, '#pausas')}>Pausas Activas</a>
                            <a href="/#servicios" onClick={(e) => handleNavClick(e, '#servicios')}>Servicios</a>
                            <a href="/#profesionales" onClick={(e) => handleNavClick(e, '#profesionales')}>Profesionales</a>
                            <a href="/#faq" onClick={(e) => handleNavClick(e, '#faq')}>FAQ</a>
                        </nav>
                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                            <Link to="/mis-turnos" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 py-2 flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-blue-600" /> Mis Turnos
                            </Link>
                            {isAdminOrStaff && (
                                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-blue-600 py-2 flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4 text-blue-600" /> Panel Admin
                                </Link>
                            )}
                            {!token ? (
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-500 py-2 flex items-center gap-2">
                                    <LogIn className="w-4 h-4" /> Acceso Staff
                                </Link>
                            ) : (
                                <button onClick={() => { setMobileMenuOpen(false); logoutUser(); }} className="text-sm font-semibold text-red-600 py-2 flex items-center gap-2">
                                    <LogOut className="w-4 h-4" /> Salir
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

import React, { useState } from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {LogOut, Settings, Bell, LayoutDashboard, Users, Calendar, FileText, Home, Menu, X} from "lucide-react";
import {logout} from "../../services/auth/authSlice.js";

const Navbar = ({children}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.authSlice.user)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    }

    const navItems = [
        {
            path: '/dashboard',
            title: 'Panel',
        },
        {
            path: '/pacientes',
            title: 'Pacientes',
        },
        {
            path: '/historial',
            title: 'Historial',
        },
        {
            path: '/balance',
            title: 'Balance',
        },
        {
            path: '/tareas',
            title: 'Tareas',
        },
        {
            path: '/disponibilidad',
            title: 'Disponibilidad',
        },
        {
            path: '/profesionales',
            title: 'Equipo',
        }
    ];

    return (
        <div className="flex h-screen bg-[#F0F4F8] font-sans overflow-hidden">
            {/* Main App Container */}
            <div className="flex-1 bg-white flex flex-col overflow-hidden">
                
                {/* Top Navigation Bar */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-gray-100 shrink-0">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex flex-wrap gap-0.5 p-1.5 items-center justify-center transform rotate-45">
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                             <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <span className="text-xl font-bold text-[#1E293B] tracking-tight">PAUSES</span>
                    </div>

                    {/* Centered Navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 ${
                                        isActive
                                            ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-5">
                        <Link 
                            to="/reservar" 
                            className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                            title="Ir a la web del sistema"
                        >
                            <Home size={18} />
                            <span className="text-sm font-semibold hidden sm:inline">Inicio</span>
                        </Link>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                            <Settings size={20} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="w-px h-6 bg-gray-200 mx-1"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="h-9 w-9 rounded-full bg-gray-100 overflow-hidden border-2 border-transparent group-hover:border-[#3B82F6] transition-all">
                                <img src="https://ui-avatars.com/api/?name=Tomas+Manazza&background=random" alt="Avatar" className="w-full h-full object-cover"/>
                            </div>
                            <button onClick={handleLogout} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 mt-14 bg-white shadow-lg px-4 py-2 rounded-lg border border-gray-100 flex items-center gap-2 text-sm font-medium z-50">
                                <LogOut size={16}/> Salir
                            </button>
                        </div>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                <div 
                    className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                ></div>

                {/* Mobile Menu Drawer */}
                <div 
                    className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex flex-wrap gap-0.5 p-1.5 items-center justify-center transform rotate-45">
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xl font-bold text-[#1E293B] tracking-tight">PAUSES</span>
                        </div>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <nav className="flex flex-col p-4 gap-2 overflow-y-auto flex-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-[15px] font-semibold transition-all ${
                                        isActive
                                            ? 'bg-[#3B82F6] text-white shadow-md shadow-blue-500/20'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                        <div className="h-px bg-gray-100 w-full my-4"></div>
                        <Link 
                            to="/reservar" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                            <Home size={20} /> Ir al Inicio
                        </Link>
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold text-red-500 hover:bg-red-50 transition-colors mt-auto mb-4"
                        >
                            <LogOut size={20}/> Cerrar Sesión
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white">
                    <div className="min-h-full w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Navbar;
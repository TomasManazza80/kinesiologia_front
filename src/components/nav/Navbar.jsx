import {Link, useLocation, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {LogOut, Settings, Bell, LayoutDashboard, Users, Calendar, FileText, Home} from "lucide-react";
import {logout} from "../../services/auth/authSlice.js";

const Navbar = ({children}) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(state => state.authSlice.user)

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
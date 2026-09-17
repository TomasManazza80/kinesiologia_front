import React, { useState, useMemo } from 'react';
import { toast } from '../../components/ui/use-toast';
import { 
    Menu, X, CheckCircle2, Circle, ChevronLeft, ChevronRight, 
    ArrowRight, Home, CalendarPlus, ClipboardList, User, Activity, Loader2, Check, Eye, EyeOff
} from 'lucide-react';
import { 
    useGetPublicProfessionalsQuery, 
    useGetAvailableSlotsQuery, 
    useCreatePublicAppointmentMutation 
} from '../../services/api/kinesioApi.js';
import { useLogoutMutation } from '../../services/api/authApi.js';
import { useGetUserQuery } from '../../services/api/userApi.js';
import { logout } from '../../services/auth/authSlice.js';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import PublicNavbar from '../../components/nav/PublicNavbar.jsx';

dayjs.extend(isoWeek);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

export default function BookingPage() {
    const [selectedService, setSelectedService] = useState(null);
    const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [weekOffset, setWeekOffset] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [patientDni, setPatientDni] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const userInfo = useSelector((state) => state.authSlice?.userInfo);
    const accessToken = useSelector((state) => state.authSlice?.accessToken);

    // Fetch user info if logged in so we can prepopulate the booking form
    useGetUserQuery(undefined, { skip: !accessToken });

    const [logoutApi] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logoutApi().unwrap();
        } catch (error) {
            console.error(error);
        }
        dispatch(logout());
        toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión exitosamente.' });
    };

    React.useEffect(() => {
        if (userInfo) {
            if (userInfo.firstName || userInfo.lastName) {
                setPatientName(`${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim());
            }
            if (userInfo.email) {
                setPatientEmail(userInfo.email);
            }
            if (userInfo.dni) {
                setPatientDni(userInfo.dni);
            }
        }
    }, [userInfo]);

    // Handle redirect success from MercadoPago
    React.useEffect(() => {
        const successParam = searchParams.get('success');
        if (successParam) {
            if (successParam === 'true' || successParam === 'pending') {
                setIsSuccess(true);
                setShowModal(true);
            } else if (successParam === 'false') {
                toast({ title: 'Atención', description: 'El pago no pudo completarse. Por favor, intenta de nuevo.', variant: 'destructive' });
            }
            // Limpiamos los params de la url
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Queries
    const { data: profData, isLoading: isLoadingProfs } = useGetPublicProfessionalsQuery();
    const professionals = profData?.data || [];

    // Preselect professional if query param 'profesional' or 'professional_id' is present
    React.useEffect(() => {
        const profIdParam = searchParams.get('profesional') || searchParams.get('professional_id');
        if (profIdParam && professionals.length > 0) {
            const foundProf = professionals.find(p => String(p.id) === String(profIdParam));
            if (foundProf) {
                setSelectedSpecialistId(foundProf.id);
                if (foundProf.specialty) {
                    const spec = Array.isArray(foundProf.specialty) ? foundProf.specialty[0] : foundProf.specialty;
                    setSelectedService(spec);
                }
            }
        }
    }, [searchParams, professionals]);

    // Generate days
    const days = useMemo(() => {
        const d = [];
        // Empezamos la semana actual (offset = 0) o avanzamos semanas completas
        const startOfWeek = dayjs().startOf('isoWeek').add(weekOffset, 'weeks');
        // Mostrar de lunes a viernes (5 días)
        for(let i=0; i<5; i++) {
            const current = dayjs(startOfWeek).add(i, 'days');
            d.push({
                day: current.format('ddd').charAt(0).toUpperCase() + current.format('ddd').slice(1, 3), // Lun, Mar
                date: current.format('YYYY-MM-DD'),
                displayNum: current.format('D'),
                fullDisplay: current.format('ddd, D MMM')
            });
        }
        return d;
    }, [weekOffset]);

    const weekStartDate = days.length > 0 ? days[0].date : null;
    const weekEndDate = days.length > 0 ? days[days.length - 1].date : null;

    const { data: weeklySlotsData, isLoading: isLoadingSlots, isFetching: isFetchingSlots } = useGetAvailableSlotsQuery(
        { professional_id: selectedSpecialistId, start_date: weekStartDate, end_date: weekEndDate, service: selectedService },
        { skip: !selectedSpecialistId || !weekStartDate || !weekEndDate }
    );
    
    const weeklySlots = weeklySlotsData?.data || {};
    const availableSlots = selectedDate ? (weeklySlots[selectedDate.date] || []) : [];

    const [createAppointment, { isLoading: isCreating }] = useCreatePublicAppointmentMutation();

    const handleConfirmClick = () => {
        if (!selectedSpecialistId || !selectedDate || !selectedTime) return;
        setShowModal(true);
    };

    const handleSubmitAppointment = async () => {
        if (!patientName || !patientDni || !patientPhone) return;
        try {
            if (!accessToken && password && password !== confirmPassword) {
                toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
                return;
            }

            const response = await createAppointment({
                professional_id: selectedSpecialistId,
                date: selectedDate.date,
                time: selectedTime,
                service: selectedService,
                patient_name: patientName,
                patient_dni: patientDni,
                patient_phone: patientPhone,
                patient_email: patientEmail,
                password: password || undefined
            }).unwrap();

            if (response.init_point) {
                // Redirect to MercadoPago
                window.location.href = response.init_point;
                return;
            }

            setIsSuccess(true);
            setTimeout(() => {
                setShowModal(false);
                setIsSuccess(false);
                setSelectedTime(null); // reset selected time
                setPatientName('');
                setPatientDni('');
                setPatientPhone('');
                setPassword('');
                setConfirmPassword('');
            }, 3000);
        } catch (error) {
            toast({ title: 'Error', description: error?.data?.message || 'Error al confirmar el turno', variant: 'destructive' });
        }
    };

    const selectedSpecialist = professionals.find(p => p.id === selectedSpecialistId);
    const requiresPayment = selectedSpecialist && selectedSpecialist.require_payment && selectedSpecialist.session_fee > 0 && !!selectedSpecialist.mp_access_token;
    
    const currentMonthLabel = dayjs().startOf('isoWeek').add(weekOffset, 'weeks').format('MMMM YYYY');
    const isReadyToConfirm = selectedSpecialistId && selectedDate && selectedTime;

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900 pb-20 md:pb-0 overflow-x-hidden">
            <PublicNavbar />
            
            {/* Main Container */}
            <div className="max-w-md md:max-w-4xl mx-auto bg-transparent min-h-screen relative flex flex-col">

                {/* Mobile Navigation Drawer & Overlay */}
                <div 
                    className={`fixed inset-0 bg-gray-900/60 z-40 transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />

                <div 
                    className={`fixed top-0 left-0 h-full w-[300px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menú principal"
                >
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <span className="text-xl font-bold text-gray-900">Menú</span>
                        <button 
                            onClick={() => setIsMobileMenuOpen(false)} 
                            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-lg transition-colors"
                            aria-label="Cerrar menú"
                        >
                            <X size={28} aria-hidden="true" />
                        </button>
                    </div>
                    <div className="flex flex-col p-6 gap-4">
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/reservar-turno'); }} 
                            className="text-left text-lg font-bold text-blue-700 py-3 px-4 bg-blue-50 rounded-xl hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors flex items-center gap-3"
                        >
                            <CalendarPlus size={24} aria-hidden="true" />
                            Reservar Turno
                        </button>
                        <button 
                            onClick={() => { setIsMobileMenuOpen(false); navigate('/mis-turnos'); }} 
                            className="text-left text-lg font-medium text-gray-700 py-3 px-4 hover:bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors flex items-center gap-3"
                        >
                            <ClipboardList size={24} aria-hidden="true" />
                            Mis Turnos
                        </button>
                        
                        {userInfo?.role === 'ADMIN' || userInfo?.role === 'EMPLOYEE' ? (
                            <button 
                                onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }}
                                className="text-left text-lg font-medium text-blue-700 py-3 px-4 hover:bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors flex items-center gap-3"
                            >
                                <Home size={24} aria-hidden="true" />
                                Panel de Administración
                            </button>
                        ) : null}

                        <hr className="border-gray-200 my-2" />

                        {accessToken ? (
                            <button 
                                onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                className="text-left text-lg font-medium text-red-700 py-3 px-4 hover:bg-red-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors flex items-center gap-3"
                            >
                                <User size={24} aria-hidden="true" />
                                Cerrar Sesión
                            </button>
                        ) : (
                            <button 
                                onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                                className="text-left text-lg font-medium text-blue-700 py-3 px-4 hover:bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors flex items-center gap-3"
                            >
                                <User size={24} aria-hidden="true" />
                                Iniciar Sesión
                            </button>
                        )}
                    </div>
                </div>

                <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    {/* Header & Progress Indicator */}
                    <header className="mb-8 md:mb-10">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight">
                            Reservar Turno
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6 max-w-2xl">
                            Siga los pasos a continuación para programar su sesión de manera rápida y sencilla.
                        </p>

                        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 md:px-6 md:py-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex gap-2 flex-1 md:flex-none">
                                <div className={`h-2.5 flex-1 md:w-20 rounded-full transition-colors duration-500 ${currentStep >= 1 ? 'bg-blue-700' : 'bg-gray-200'}`}></div>
                                <div className={`h-2.5 flex-1 md:w-20 rounded-full transition-colors duration-500 ${currentStep >= 2 ? 'bg-blue-700' : 'bg-gray-200'}`}></div>
                                <div className={`h-2.5 flex-1 md:w-20 rounded-full transition-colors duration-500 ${currentStep >= 3 ? 'bg-blue-700' : 'bg-gray-200'}`}></div>
                            </div>
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                Paso {currentStep} de 3
                            </span>
                        </div>
                    </header>

                    <div className="relative">
                        {/* Step 1: Especialista */}
                        {currentStep === 1 && (
                            <section className="animate-in fade-in slide-in-from-right-8 duration-700 bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 ring-1 ring-gray-900/5 max-w-4xl mx-auto">
                                <header className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-md" aria-hidden="true">1</div>
                                    <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Elija un especialista</h2>
                                </header>
                                <p className="text-gray-600 text-base md:text-lg mb-6 ml-0 md:ml-16">Seleccione el profesional para su atención.</p>
                                
                                <div className="ml-0 md:ml-16 min-h-[250px]">
                                    {isLoadingProfs ? (
                                        <div className="flex items-center justify-center h-[200px] gap-3 text-gray-600 bg-gray-50 rounded-xl border border-gray-200 text-xl font-medium">
                                            <Loader2 className="animate-spin text-blue-700" size={32} aria-hidden="true" /> 
                                            <span>Buscando especialistas disponibles...</span>
                                        </div>
                                    ) : professionals.length === 0 ? (
                                        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
                                            <User size={48} className="text-yellow-500 mx-auto mb-4" />
                                            <p className="text-yellow-800 text-lg font-medium">No hay especialistas disponibles actualmente.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2 md:gap-4 lg:gap-5">
                                            {professionals.map(prof => {
                                                const isSelected = selectedSpecialistId === prof.id;
                                                return (
                                                    <button 
                                                        key={prof.id}
                                                        onClick={() => { 
                                                            setSelectedSpecialistId(prof.id); 
                                                            setSelectedTime(null);
                                                            const spec = Array.isArray(prof.specialty) && prof.specialty.length > 0 ? prof.specialty[0] : (prof.specialty || 'Kinesiología General');
                                                            setSelectedService(spec);
                                                        }}
                                                        className={`rounded-xl border-2 transition-all duration-300 ease-in-out flex flex-col items-center text-center focus:outline-none focus:ring-4 focus:ring-blue-200 overflow-hidden transform ${
                                                            isSelected 
                                                            ? 'border-blue-700 bg-blue-50 shadow-lg -translate-y-1' 
                                                            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:-translate-y-1'
                                                        }`}
                                                        aria-pressed={isSelected}
                                                    >
                                                        <div className="w-full h-24 md:h-32 bg-gray-100 flex items-center justify-center flex-shrink-0 relative overflow-hidden group" aria-hidden="true">
                                                            {prof.profile_picture ? (
                                                                <img src={prof.profile_picture} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                            ) : (
                                                                <User className="w-8 h-8 md:w-10 md:h-10 text-gray-400 transition-transform duration-700 group-hover:scale-110" />
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        </div>
                                                        <div className="p-2 md:p-3 flex flex-col items-center w-full">
                                                            <h3 className={`font-extrabold text-[11px] leading-tight md:text-sm md:leading-snug mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{prof.name || prof.email}</h3>
                                                            <span className="inline-block mt-0.5 md:mt-1 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full bg-white border border-gray-200 text-gray-700 text-[9px] md:text-[10px] font-bold shadow-sm leading-none text-center">
                                                                {(prof.specialty && prof.specialty.length > 0) ? (Array.isArray(prof.specialty) ? prof.specialty.join(', ') : prof.specialty) : 'Kinesiología'}
                                                            </span>
                                                            {isSelected && (
                                                                <div className="mt-1.5 md:mt-2 text-blue-700 flex items-center justify-center gap-1 font-bold bg-blue-100/60 py-1 px-2 md:py-1 md:px-2 rounded-full shadow-sm text-[9px] md:text-[10px] w-full" aria-hidden="true">
                                                                    <CheckCircle2 size={12} className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" /> <span className="hidden sm:inline">Seleccionado</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end ml-0 md:ml-16">
                                    <button 
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!selectedSpecialistId}
                                        className={`w-full sm:w-auto py-4 px-10 rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                                            selectedSpecialistId ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-xl shadow-blue-700/20 transform hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>Siguiente paso</span>
                                        <ArrowRight size={24} aria-hidden="true" />
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* Step 2: Fecha y Hora */}
                        {currentStep === 2 && (
                            <section className="animate-in fade-in slide-in-from-right-8 duration-700 bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 ring-1 ring-gray-900/5">
                                <header className="flex items-center gap-5 mb-4">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xl md:text-2xl shadow-md" aria-hidden="true">2</div>
                                    <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Seleccione fecha y hora</h2>
                                </header>
                                <p className="text-gray-600 text-lg md:text-xl mb-10 ml-0 md:ml-16">Elija el día y el horario que mejor se adapte a usted.</p>
                                
                                <div className="ml-0 md:ml-16">
                                    <div className="bg-gray-50/50 rounded-3xl p-6 md:p-10 border border-gray-200 min-h-[400px]">
                                        
                                        {/* Calendar Header */}
                                        <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <button 
                                                onClick={() => setWeekOffset(w => w - 1)} 
                                                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center justify-center"
                                                aria-label="Ver semana anterior"
                                            >
                                                <ChevronLeft size={24} className="text-gray-700" aria-hidden="true" />
                                            </button>
                                            <h3 className="font-bold text-xl text-gray-900 capitalize" aria-live="polite">{currentMonthLabel}</h3>
                                            <button 
                                                onClick={() => setWeekOffset(w => w + 1)} 
                                                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 flex items-center justify-center"
                                                aria-label="Ver semana siguiente"
                                            >
                                                <ChevronRight size={24} className="text-gray-700" aria-hidden="true" />
                                            </button>
                                        </div>
                                        
                                        {/* Days */}
                                        <div className="grid grid-cols-5 gap-3 md:gap-6 mb-8">
                                            {days.map((d) => {
                                                const isSelected = selectedDate?.date === d.date;
                                                const isLoading = isLoadingSlots || isFetchingSlots;
                                                const hasSlots = weeklySlots[d.date] && weeklySlots[d.date].length > 0;
                                                const isUnavailable = !isLoading && !hasSlots;
                                                const isDisabled = isLoading || isUnavailable;
                                                
                                                return (
                                                    <button 
                                                        key={d.date} 
                                                        onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                                        disabled={isDisabled}
                                                        className={`flex flex-col items-center justify-center py-5 px-2 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-200 relative overflow-hidden ${
                                                            isUnavailable
                                                                ? 'bg-gray-200 border-gray-300 cursor-not-allowed opacity-80 shadow-inner'
                                                                : isSelected 
                                                                    ? 'bg-blue-700 border-blue-700 text-white shadow-md transform -translate-y-1' 
                                                                    : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:shadow-sm'
                                                        }`}
                                                        aria-pressed={isSelected}
                                                        aria-disabled={isDisabled}
                                                        aria-label={`Día ${d.displayNum}, ${d.day}`}
                                                    >
                                                        {isUnavailable && (
                                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="w-[120%] h-[3px] bg-gray-400/40 transform -rotate-45"></div>
                                                            </div>
                                                        )}
                                                        <span className={`text-sm md:text-base font-medium mb-1 z-10 ${isUnavailable ? 'text-gray-400 line-through decoration-gray-400/50' : isSelected ? 'text-blue-100' : 'text-gray-500'}`}>{d.day}</span>
                                                        <span className={`text-2xl md:text-3xl font-bold z-10 ${isUnavailable ? 'text-gray-400 line-through decoration-gray-400/50' : ''}`}>{d.displayNum}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Times */}
                                        <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-200 shadow-sm mt-8">
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">Horarios disponibles</h4>
                                            <p className="text-gray-500 mb-6 text-base">
                                                {selectedDate ? `Mostrando horarios para el ${selectedDate.fullDisplay}` : 'Seleccione un día para ver los horarios.'}
                                            </p>

                                            {!selectedDate ? (
                                                <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                                                    <CalendarPlus size={40} className="text-gray-400 mx-auto mb-3" />
                                                    <p className="text-gray-600 text-lg">Seleccione un día en el calendario de arriba.</p>
                                                </div>
                                            ) : isFetchingSlots || isLoadingSlots ? (
                                                <div className="flex flex-col items-center justify-center h-[150px] gap-4 text-gray-600">
                                                    <Loader2 className="animate-spin text-blue-700" size={40} aria-hidden="true" /> 
                                                    <span className="text-lg font-medium">Consultando disponibilidad...</span>
                                                </div>
                                            ) : availableSlots.length === 0 ? (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex gap-4 items-center">
                                                    <Activity className="text-yellow-600 shrink-0" size={32} />
                                                    <p className="text-yellow-800 text-lg font-medium">No hay horarios libres para este día. Por favor, seleccione otra fecha en el calendario.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {availableSlots.map((time) => {
                                                        const isSelected = selectedTime === time;
                                                        return (
                                                            <button 
                                                                key={time}
                                                                onClick={() => setSelectedTime(time)}
                                                                className={`py-4 px-4 rounded-xl text-xl font-bold border-2 transition-all focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                                                                    isSelected 
                                                                    ? 'border-blue-700 bg-blue-700 text-white shadow-md' 
                                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50'
                                                                }`}
                                                                aria-pressed={isSelected}
                                                            >
                                                                {time}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4 ml-0 md:ml-16">
                                    <button 
                                        onClick={() => setCurrentStep(1)}
                                        className="py-4 px-8 rounded-2xl font-bold text-lg md:text-xl text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors flex items-center justify-center gap-3"
                                    >
                                        <ChevronLeft size={24} /> Atrás
                                    </button>
                                    <button 
                                        onClick={() => setCurrentStep(3)}
                                        disabled={!selectedTime}
                                        className={`py-4 px-10 rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                                            selectedTime ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-lg transform hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <span>Ver Resumen</span>
                                        <ArrowRight size={24} aria-hidden="true" />
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* Step 3: Resumen (Ex Right Column Box) */}
                        {currentStep === 3 && (
                            <section className="animate-in fade-in slide-in-from-right-8 duration-700 bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 ring-1 ring-gray-900/5 max-w-3xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 flex items-center gap-5 border-b border-gray-100 pb-8">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center shadow-sm">
                                        <ClipboardList size={32} className="md:w-8 md:h-8" aria-hidden="true" />
                                    </div>
                                    Resumen Final
                                </h2>
                                
                                <div className="space-y-8 mb-12">
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                        <p className="text-gray-500 text-base font-medium mb-1">Servicio seleccionado</p>
                                        <p className="font-bold text-gray-900 text-2xl">{selectedService}</p>
                                    </div>
                                    
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-center gap-4">
                                        {selectedSpecialist?.profile_picture ? (
                                            <img src={selectedSpecialist.profile_picture} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-500 text-base font-medium mb-1">Especialista</p>
                                            <p className="font-bold text-gray-900 text-2xl">
                                                {selectedSpecialist ? (selectedSpecialist.name || selectedSpecialist.email) : ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex-1">
                                            <p className="text-blue-800 text-base font-medium mb-1">Día asignado</p>
                                            <p className="font-extrabold text-blue-900 text-2xl capitalize">
                                                {selectedDate?.fullDisplay}
                                            </p>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex-1">
                                            <p className="text-blue-800 text-base font-medium mb-1">Hora acordada</p>
                                            <p className="font-extrabold text-blue-900 text-2xl">
                                                {selectedTime}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-between gap-4">
                                    <button 
                                        onClick={() => setCurrentStep(2)}
                                        className="py-4 px-8 rounded-2xl font-bold text-lg md:text-xl text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors flex items-center justify-center gap-3 w-full sm:w-auto"
                                    >
                                        <ChevronLeft size={24} /> Volver
                                    </button>
                                    <button 
                                        onClick={handleConfirmClick}
                                        className="py-4 px-10 rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 bg-blue-700 text-white hover:bg-blue-800 shadow-xl shadow-blue-700/20 transform hover:-translate-y-1 w-full sm:w-auto flex-1"
                                    >
                                        Confirmar Turno
                                        <CheckCircle2 size={28} aria-hidden="true" />
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal de confirmación final */}
            {showModal && (
                <div 
                    className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="bg-white rounded-3xl p-6 md:p-10 w-full max-w-2xl shadow-2xl my-8 mx-auto relative">
                        {isSuccess ? (
                            <div className="flex flex-col items-center py-10 text-center">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-inner">
                                    <Check size={48} strokeWidth={3} aria-hidden="true" />
                                </div>
                                <h3 id="modal-title" className="text-3xl font-extrabold text-gray-900 mb-4">¡Reserva Confirmada!</h3>
                                <p className="text-lg text-gray-600 mb-2">Su turno ha sido guardado exitosamente en nuestro sistema.</p>
                                <p className="text-lg font-medium text-gray-900 bg-gray-50 py-3 px-6 rounded-xl border border-gray-200 mt-4">
                                    Lo esperamos el día <strong>{selectedDate?.fullDisplay}</strong> a las <strong>{selectedTime}</strong> hs.
                                </p>
                            </div>
                        ) : (
                            <>
                                <header className="mb-8">
                                    <h3 id="modal-title" className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Complete sus datos</h3>
                                    <p className="text-gray-600 text-lg">Necesitamos esta información básica para registrar su reserva de forma segura.</p>
                                </header>
                                
                                <div className="flex flex-col gap-6 mb-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="patientName" className="block text-base font-bold text-gray-900 mb-2">Nombre y Apellido *</label>
                                            <input 
                                                id="patientName"
                                                type="text" 
                                                value={patientName}
                                                onChange={(e) => setPatientName(e.target.value)}
                                                placeholder="Ej. Juan Pérez"
                                                className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-lg text-gray-900 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" 
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="patientDni" className="block text-base font-bold text-gray-900 mb-2">Documento (DNI) *</label>
                                            <input 
                                                id="patientDni"
                                                type="text" 
                                                value={patientDni}
                                                onChange={(e) => setPatientDni(e.target.value)}
                                                placeholder="Ej. 12345678"
                                                className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-lg text-gray-900 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" 
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="patientPhone" className="block text-base font-bold text-gray-900 mb-2">Teléfono de contacto *</label>
                                            <input 
                                                id="patientPhone"
                                                type="tel" 
                                                value={patientPhone}
                                                onChange={(e) => setPatientPhone(e.target.value)}
                                                placeholder="Ej. 1122334455"
                                                className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-lg text-gray-900 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" 
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="patientEmail" className="block text-base font-bold text-gray-900 mb-2">Correo Electrónico</label>
                                            <input 
                                                id="patientEmail"
                                                type="email" 
                                                value={patientEmail}
                                                onChange={(e) => setPatientEmail(e.target.value)}
                                                placeholder="tu@email.com"
                                                className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-lg text-gray-900 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white" 
                                            />
                                        </div>
                                    </div>
                                    
                                    {!accessToken && (
                                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200 mt-2">
                                            <h4 className="font-bold text-blue-900 text-lg mb-2 flex items-center gap-2">
                                                <User size={24} aria-hidden="true" />
                                                Crea una cuenta (Opcional)
                                            </h4>
                                            <p className="text-base text-blue-800 mb-5">
                                                Ingresa una contraseña para poder gestionar tus turnos desde nuestro sistema en el futuro.
                                            </p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">Crear Contraseña</label>
                                                    <div className="relative">
                                                        <input 
                                                            id="password"
                                                            type={showPassword ? "text" : "password"}
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            placeholder="Mínimo 6 caracteres"
                                                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 transition-all bg-white pr-12" 
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-700 focus:outline-none rounded-lg focus:ring-2 focus:ring-blue-600"
                                                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                        >
                                                            {showPassword ? <EyeOff size={24} aria-hidden="true" /> : <Eye size={24} aria-hidden="true" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-2">Repetir Contraseña</label>
                                                    <div className="relative">
                                                        <input 
                                                            id="confirmPassword"
                                                            type={showConfirmPassword ? "text" : "password"}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Vuelva a escribirla"
                                                            className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 transition-all bg-white pr-12" 
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-700 focus:outline-none rounded-lg focus:ring-2 focus:ring-blue-600"
                                                            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                                        >
                                                            {showConfirmPassword ? <EyeOff size={24} aria-hidden="true" /> : <Eye size={24} aria-hidden="true" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {requiresPayment && (
                                    <div className="mb-8 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl flex gap-4 items-start">
                                        <Activity className="text-yellow-700 shrink-0 mt-1" size={28} aria-hidden="true" />
                                        <div>
                                            <h4 className="font-bold text-yellow-900 text-lg mb-1">Pago requerido para reservar</h4>
                                            <p className="text-base text-yellow-800">
                                                Para confirmar su turno con el especialista, debe abonar el monto de la sesión (<strong>${selectedSpecialist.session_fee}</strong>). Al hacer clic en el botón de abajo, será redirigido a MercadoPago de forma segura.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="w-full sm:w-1/3 py-4 bg-gray-100 text-gray-800 rounded-xl font-bold text-lg hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors"
                                    >
                                        Volver atrás
                                    </button>
                                    <button 
                                        onClick={handleSubmitAppointment}
                                        disabled={isCreating || !patientName || !patientDni || !patientPhone}
                                        className={`w-full sm:w-2/3 py-4 text-white rounded-xl font-bold text-lg flex justify-center items-center gap-3 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300
                                            ${isCreating || !patientName || !patientDni || !patientPhone 
                                                ? 'bg-blue-400 cursor-not-allowed opacity-70' 
                                                : 'bg-blue-700 hover:bg-blue-800 shadow-lg'
                                            }
                                        `}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="animate-spin" size={24} aria-hidden="true" />
                                                <span>Procesando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{requiresPayment ? 'Pagar con MercadoPago' : 'Confirmar Turno Ahora'}</span>
                                                <CheckCircle2 size={24} aria-hidden="true" />
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-2">
                                    <Check size={16} className="text-green-600" aria-hidden="true"/>
                                    Tus datos están protegidos y seguros con nosotros.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

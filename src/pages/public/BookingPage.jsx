import React, { useState, useMemo } from 'react';
import { toast } from '../../components/ui/use-toast';
import { 
    Menu, CheckCircle2, Circle, ChevronLeft, ChevronRight, 
    ArrowRight, Home, CalendarPlus, ClipboardList, User, Activity, Loader2, Check
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
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

export default function BookingPage() {
    const [selectedService, setSelectedService] = useState('Kinesiología General');
    const [selectedSpecialistId, setSelectedSpecialistId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
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

    const { data: slotsData, isLoading: isLoadingSlots, isFetching: isFetchingSlots } = useGetAvailableSlotsQuery(
        { professional_id: selectedSpecialistId, date: selectedDate?.date, service: selectedService },
        { skip: !selectedSpecialistId || !selectedDate }
    );
    const availableSlots = slotsData?.data || [];

    const [createAppointment, { isLoading: isCreating }] = useCreatePublicAppointmentMutation();

    // Generate days
    const days = useMemo(() => {
        const d = [];
        // Empezamos la semana actual (offset = 0) o avanzamos semanas completas
        const startOfWeek = moment().startOf('isoWeek').add(weekOffset, 'weeks');
        // Mostrar de lunes a viernes (5 días)
        for(let i=0; i<5; i++) {
            const current = moment(startOfWeek).add(i, 'days');
            d.push({
                day: current.format('ddd').charAt(0).toUpperCase() + current.format('ddd').slice(1, 3), // Lun, Mar
                date: current.format('YYYY-MM-DD'),
                displayNum: current.format('D'),
                fullDisplay: current.format('ddd, D MMM')
            });
        }
        return d;
    }, [weekOffset]);

    const handleConfirmClick = () => {
        if (!selectedSpecialistId || !selectedDate || !selectedTime) return;
        setShowModal(true);
    };

    const handleSubmitAppointment = async () => {
        if (!patientName || !patientPhone) return;
        try {
            const response = await createAppointment({
                professional_id: selectedSpecialistId,
                date: selectedDate.date,
                time: selectedTime,
                service: selectedService,
                patient_name: patientName,
                patient_phone: patientPhone,
                patient_email: patientEmail
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
                setPatientPhone('');
            }, 3000);
        } catch (error) {
            toast({ title: 'Error', description: error?.data?.message || 'Error al confirmar el turno', variant: 'destructive' });
        }
    };

    const selectedSpecialist = professionals.find(p => p.id === selectedSpecialistId);
    const requiresPayment = selectedSpecialist && selectedSpecialist.require_payment && selectedSpecialist.session_fee > 0 && !!selectedSpecialist.mp_access_token;
    
    const currentMonthLabel = moment().startOf('isoWeek').add(weekOffset, 'weeks').format('MMMM YYYY');
    const isReadyToConfirm = selectedSpecialistId && selectedDate && selectedTime;

    return (
        <div className="bg-[#f7f9fc] md:bg-white min-h-screen font-sans text-gray-800 pb-20 md:pb-0">
            {/* Main Container */}
            <div className="max-w-md md:max-w-[1400px] mx-auto bg-white min-h-screen relative flex flex-col md:px-6 lg:px-12">
                
                {/* Header Navbar */}
                <header className="flex items-center justify-between px-6 py-4 bg-white sticky top-0 z-10 md:px-10 md:py-6 md:border-b md:border-gray-100">
                    <div className="flex items-center gap-4">
                        <button className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors md:hidden">
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#3B82F6] rounded-lg flex flex-wrap gap-0.5 p-1.5 items-center justify-center transform rotate-45">
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                                 <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                            <span className="text-xl md:text-2xl font-bold text-[#1E293B] tracking-tight">PAUSES</span>
                        </div>
                    </div>
                    
                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
                        <button className="text-[#0a47d4]">Reservar Turno</button>
                        <button onClick={() => navigate('/mis-turnos')} className="hover:text-[#0a47d4] transition-colors">Mis Turnos</button>
                        
                        {userInfo?.role === 'ADMIN' || userInfo?.role === 'EMPLOYEE' ? (
                            <button 
                                onClick={() => navigate('/dashboard')}
                                className="text-[#0a47d4] font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                Panel Admin
                            </button>
                        ) : null}

                        {accessToken ? (
                            <button 
                                onClick={handleLogout}
                                className="hover:text-red-600 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        ) : (
                            <button 
                                onClick={() => navigate('/login')}
                                className="hover:text-[#0a47d4] transition-colors"
                            >
                                Iniciar Sesión
                            </button>
                        )}
                    </nav>

                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex justify-center items-center">
                        <User size={20} className="text-gray-400" />
                    </div>
                </header>

                <main className="flex-1 px-6 pt-4 pb-24 md:pb-10 md:px-10 md:pt-8">
                    {/* Title Section */}
                    <div className="mb-8 md:mb-12">
                        <h1 className="text-[28px] md:text-4xl font-bold text-[#0a47d4] mb-3 leading-tight">
                            Reservar Turno
                        </h1>
                        <p className="text-gray-500 text-[15px] md:text-base leading-relaxed md:max-w-2xl">
                            Siga los pasos a continuación para programar su sesión con nuestros especialistas en kinesiología y rehabilitación.
                        </p>
                    </div>

                    <div className="md:grid md:grid-cols-12 md:gap-12">
                        {/* Left Column: Steps */}
                        <div className="md:col-span-7 lg:col-span-8">
                            
                            {/* Step 1: Servicio */}
                            <div className="mb-8 md:mb-10">
                                <div className="flex items-center gap-3 mb-4 md:mb-5">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#0a47d4] text-white flex items-center justify-center font-bold text-sm md:text-base">1</div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Seleccione un Servicio</h2>
                                </div>
                                
                                <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-5">
                                    {/* Option 1 */}
                                    <div 
                                        onClick={() => { setSelectedService('Kinesiología General'); setSelectedTime(null); }}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedService === 'Kinesiología General' ? 'border-[#0a47d4] bg-[#f0f5ff] shadow-md shadow-blue-500/10' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#e1ebff] flex items-center justify-center text-[#0a47d4]">
                                                <Activity size={20} className="md:w-6 md:h-6" />
                                            </div>
                                            {selectedService === 'Kinesiología General' ? <CheckCircle2 className="text-[#0a47d4]" size={22} fill="white" /> : <Circle className="text-gray-300" size={22} />}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1 text-[15px] md:text-base">Kinesiología General</h3>
                                        <p className="text-sm text-gray-500 leading-snug">Evaluación y tratamiento integral para dolor agudo y crónico.</p>
                                    </div>

                                    {/* Option 2 */}
                                    <div 
                                        onClick={() => { setSelectedService('Rehabilitación Deportiva'); setSelectedTime(null); }}
                                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer relative ${selectedService === 'Rehabilitación Deportiva' ? 'border-[#0a47d4] bg-[#f0f5ff] shadow-md shadow-blue-500/10' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#f0f2f5] flex items-center justify-center text-gray-500">
                                                <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><path d="m19 9-5.5-3.5a3 3 0 0 0-4.6 1.7L7 12"/><path d="M7 12h5l3 4 3.5 1.5"/><path d="M12 16v6"/><path d="M8 22 5.5 15.5"/></svg>
                                            </div>
                                            {selectedService === 'Rehabilitación Deportiva' ? <CheckCircle2 className="text-[#0a47d4]" size={22} fill="white" /> : <Circle className="text-gray-300" size={22} />}
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1 text-[15px] md:text-base">Rehabilitación Deportiva</h3>
                                        <p className="text-sm text-gray-500 leading-snug">Recuperación enfocada en atletas y lesiones deportivas específicas.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Especialista */}
                            <div className="mb-8 md:mb-10">
                                <div className="flex items-center gap-3 mb-4 md:mb-5">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#e1ebff] text-[#0a47d4] flex items-center justify-center font-bold text-sm md:text-base">2</div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Elija un Especialista</h2>
                                </div>
                                
                                {isLoadingProfs ? (
                                    <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={20}/> Cargando especialistas...</div>
                                ) : professionals.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No hay especialistas disponibles por el momento.</p>
                                ) : (
                                    <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                                        {professionals.map(prof => (
                                            <div 
                                                key={prof.id}
                                                onClick={() => { setSelectedSpecialistId(prof.id); setSelectedTime(null); }}
                                                className={`min-w-[160px] md:min-w-[180px] p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${selectedSpecialistId === prof.id ? 'border-[#0a47d4] bg-white shadow-md shadow-blue-500/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                                            >
                                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-3 border-2 border-transparent bg-gray-100 flex items-center justify-center">
                                                    {prof.profile_picture ? (
                                                        <img src={prof.profile_picture} alt={prof.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={32} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-[14px] md:text-base">{prof.name || prof.email}</h3>
                                                <span className="mt-1 px-2 py-0.5 rounded-full bg-[#f0f5ff] text-[#0a47d4] text-[10px] md:text-[11px] font-semibold">{prof.specialty || 'Kinesiología'}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Fecha y Hora */}
                            <div className="mb-8 md:mb-0">
                                <div className="flex items-center gap-3 mb-4 md:mb-5">
                                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#e1ebff] text-[#0a47d4] flex items-center justify-center font-bold text-sm md:text-base">3</div>
                                    <h2 className="text-lg md:text-xl font-bold text-gray-900">Fecha y Hora</h2>
                                </div>
                                
                                <div className={`border border-gray-100 rounded-2xl p-5 md:p-6 bg-white shadow-sm transition-opacity ${!selectedSpecialistId ? 'opacity-50 pointer-events-none' : ''}`}>
                                    
                                    {/* Calendar Header */}
                                    <div className="flex items-center justify-between mb-5 md:mb-6">
                                        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronLeft size={20} className="text-gray-600"/></button>
                                        <h3 className="font-bold text-[15px] md:text-lg text-gray-900 capitalize">{currentMonthLabel}</h3>
                                        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={20} className="text-gray-600"/></button>
                                    </div>
                                    
                                    {/* Days */}
                                    <div className="flex justify-between mb-6 md:mb-8 md:px-4">
                                        {days.map((d) => (
                                            <div 
                                                key={d.date} 
                                                onClick={() => { setSelectedDate(d); setSelectedTime(null); }}
                                                className={`flex flex-col items-center justify-center w-12 h-14 md:w-16 md:h-20 rounded-xl cursor-pointer transition-colors ${selectedDate?.date === d.date ? 'bg-[#0a47d4] text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                <span className="text-[11px] md:text-sm font-medium mb-0.5 md:mb-1">{d.day}</span>
                                                <span className={`text-[15px] md:text-lg font-bold ${selectedDate?.date === d.date ? 'text-white' : 'text-gray-900'}`}>{d.displayNum}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Times */}
                                    <div>
                                        <h4 className="text-xs md:text-sm text-gray-400 font-medium mb-3 md:mb-4">Horarios Disponibles</h4>
                                        {(!selectedSpecialistId || !selectedDate) ? (
                                            <p className="text-sm text-gray-400 italic">Seleccione un especialista y una fecha para ver horarios.</p>
                                        ) : isFetchingSlots || isLoadingSlots ? (
                                            <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="animate-spin" size={16}/> Buscando disponibilidad...</div>
                                        ) : availableSlots.length === 0 ? (
                                            <p className="text-sm text-red-500">No hay horarios libres este día.</p>
                                        ) : (
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                                                {availableSlots.map((time) => (
                                                    <button 
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold border transition-colors ${selectedTime === time ? 'border-[#0a47d4] text-[#0a47d4] bg-[#f0f5ff] shadow-sm' : 'border-gray-200 text-gray-600 hover:border-[#0a47d4] hover:text-[#0a47d4] hover:bg-blue-50/30'}`}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Summary Box */}
                        <div className="md:col-span-5 lg:col-span-4 mt-8 md:mt-0">
                            <div className="bg-[#f7f9fc] rounded-2xl p-6 md:p-8 border border-[#edf1f7] md:sticky md:top-24 shadow-sm">
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Resumen de Turno</h2>
                                <div className="h-px bg-gray-200 w-full mb-4 md:mb-6"></div>
                                
                                <div className="flex flex-col gap-4 mb-8">
                                    <div className="flex justify-between items-center text-[15px] md:text-base">
                                        <span className="text-gray-500">Servicio</span>
                                        <span className="font-semibold text-gray-900 text-right w-1/2">{selectedService}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px] md:text-base">
                                        <span className="text-gray-500">Especialista</span>
                                        <span className="font-semibold text-gray-900 text-right w-1/2 text-sm md:text-base">
                                            {selectedSpecialist ? selectedSpecialist.name || selectedSpecialist.email : 'A definir'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px] md:text-base">
                                        <span className="text-gray-500">Fecha</span>
                                        <span className="font-semibold text-gray-900 text-right w-1/2 text-sm md:text-base capitalize">
                                            {selectedDate ? selectedDate.fullDisplay : '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[15px] md:text-base">
                                        <span className="text-gray-500">Hora</span>
                                        <span className="font-semibold text-gray-900">{selectedTime || '-'}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleConfirmClick}
                                    disabled={!isReadyToConfirm}
                                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all md:text-lg
                                        ${isReadyToConfirm ? 'bg-[#0a47d4] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                    `}
                                >
                                    Confirmar Turno
                                    <ArrowRight size={20} />
                                </button>
                                
                                <p className="text-center text-[12px] md:text-[13px] text-gray-400 mt-5">
                                    Al confirmar, acepta nuestras políticas de cancelación.
                                </p>
                            </div>
                        </div>
                    </div>

                </main>

            </div>

            {/* Modal de confirmación final */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl transform transition-all">
                        {isSuccess ? (
                            <div className="flex flex-col items-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                                    <Check size={32} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Turno Confirmado!</h3>
                                <p className="text-center text-gray-500">Tu reserva ha sido guardada exitosamente. Te esperamos.</p>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Completa tu Reserva</h3>
                                <p className="text-gray-500 text-sm mb-6">Ingresa tus datos para finalizar la confirmación del turno.</p>
                                
                                <div className="flex flex-col gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={patientName}
                                            onChange={(e) => setPatientName(e.target.value)}
                                            placeholder="Ej. Juan Pérez"
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0a47d4] focus:ring-1 focus:ring-[#0a47d4]" 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                                            <input 
                                                type="tel" 
                                                value={patientPhone}
                                                onChange={(e) => setPatientPhone(e.target.value)}
                                                placeholder="Ej. 1122334455"
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0a47d4] focus:ring-1 focus:ring-[#0a47d4]" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                value={patientEmail}
                                                onChange={(e) => setPatientEmail(e.target.value)}
                                                placeholder="tu@email.com"
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#0a47d4] focus:ring-1 focus:ring-[#0a47d4]" 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {requiresPayment && (
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <p className="text-sm text-blue-800 text-center font-medium">
                                            Se requiere abonar un monto de <strong>${selectedSpecialist.session_fee}</strong> para reservar el turno.
                                            <br/>Serás redirigido a MercadoPago.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        onClick={handleSubmitAppointment}
                                        disabled={isCreating || !patientName || !patientPhone}
                                        className="flex-1 py-3 bg-[#0a47d4] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isCreating ? <Loader2 className="animate-spin" size={18} /> : (requiresPayment ? 'Proceder al Pago' : 'Finalizar')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Filter, CalendarDays, Download, Search, HeadphonesIcon, LayoutGrid, ChevronLeft, ChevronRight, X, Check, List, History } from "lucide-react";
import {
    useGetProfessionalsQuery,
    useGetAppointmentsQuery,
    useGetPatientsQuery,
    useCreateAppointmentMutation,
    useUpdateAppointmentMutation,
    useCreatePatientMutation,
    useGetAvailabilityQuery,
    useCancelAppointmentMutation,
    useNotifyAppointmentMutation
} from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast';

// Date Helpers
const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    return new Date(dateString);
};

const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const AppointmentCalendar = () => {
    const user = useSelector(state => state.authSlice.userInfo);
    const navigate = useNavigate();
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [selectedApptDetail, setSelectedApptDetail] = useState(null);

    // States for Date Navigation
    const [currentDate, setCurrentDate] = useState(new Date());
    const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [newAppt, setNewAppt] = useState({ patient_id: '', fecha_hora: '', duration: 30, motivo: '' });
    const [isCreatingPatient, setIsCreatingPatient] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');
    const [isAllApptsModalOpen, setIsAllApptsModalOpen] = useState(false);
    
    // Cancellation State
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('ausencia_paciente');

    const [viewMode, setViewMode] = useState('Semanal');
    const [isCompact, setIsCompact] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');

    // Data Fetching
    const { data: professionalsData, isLoading: isProfLoading } = useGetProfessionalsQuery();
    const professionals = professionalsData?.data || [];
    const activeProfessionalId = (['ADMIN', 'EMPLOYEE'].includes(user?.role) && selectedProfessional) ? selectedProfessional : user?.id;

    const { data: patientsData } = useGetPatientsQuery();
    const patients = patientsData || [];

    const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
    const [updateAppointment] = useUpdateAppointmentMutation();
    const [cancelAppointmentMutation] = useCancelAppointmentMutation();
    const [notifyAppointment, { isLoading: isNotifying }] = useNotifyAppointmentMutation();
    const [createPatient, { isLoading: isCreatingPatientLoading }] = useCreatePatientMutation();

    const handleCompleteAppointment = async (id) => {
        try {
            await updateAppointment({ id, estado: 'completado' }).unwrap();
            toast({ title: 'Éxito', description: 'Turno marcado como completado' });
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'No se pudo actualizar el turno', variant: 'destructive' });
        }
    };

    const handleCancelAppointment = async () => {
        if (!selectedApptDetail) return;
        try {
            await cancelAppointmentMutation({ 
                id: selectedApptDetail.id, 
                cancel_reason: cancelReason 
            }).unwrap();
            toast({ title: 'Éxito', description: 'Turno cancelado correctamente' });
            setIsCancelModalOpen(false);
            setSelectedApptDetail(null);
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'No se pudo cancelar el turno', variant: 'destructive' });
        }
    };

    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const { data: appointments, isLoading: isApptLoading } = useGetAppointmentsQuery({
        professional_id: activeProfessionalId,
        start_date: startOfWeek.toISOString(),
        end_date: endOfWeek.toISOString()
    }, {
        skip: !activeProfessionalId
    });

    const { data: allAppointments, isLoading: isAllApptsLoading } = useGetAppointmentsQuery({
        professional_id: activeProfessionalId
    }, {
        skip: !isAllApptsModalOpen || !activeProfessionalId
    });

    const displayDays = viewMode === 'Semanal'
        ? Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek);
            d.setDate(d.getDate() + i);
            return d;
        })
        : [currentDate];

    const appointmentsByDay = Array.from({ length: displayDays.length }, () => []);
    if (appointments && Array.isArray(appointments)) {
        appointments.forEach(appt => {
            if (!appt.fecha_hora) return;

            // Filters
            if (appt.estado === 'cancelado') return;
            if (statusFilter && appt.estado !== statusFilter) return;
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const patientName = appt.patient?.nombre?.toLowerCase() || '';
                const patientDni = appt.patient?.dni?.toLowerCase() || '';
                if (!patientName.includes(searchLower) && !patientDni.includes(searchLower)) return;
            }

            const date = parseLocalDate(appt.fecha_hora);

            if (viewMode === 'Semanal') {
                const dayOfWeek = date.getDay();
                const colIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                if (colIndex >= 0 && colIndex < 7) {
                    appointmentsByDay[colIndex].push(appt);
                }
            } else {
                // Diario mode
                if (date.toDateString() === currentDate.toDateString()) {
                    appointmentsByDay[0].push(appt);
                }
            }
        });
    }

    // Handlers for Navigation
    const prevWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentDate(newDate);
        setMiniCalendarDate(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentDate(newDate);
        setMiniCalendarDate(newDate);
    };

    const goToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setMiniCalendarDate(today);
    };

    // Mini Calendar Generation
    const generateMiniCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = firstDay === 0 ? 6 : firstDay - 1;

        const days = [];
        for (let i = 0; i < startDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        while (days.length % 7 !== 0) days.push(null);
        return days;
    };
    const miniCalendarDays = generateMiniCalendar(miniCalendarDate);

    const prevMonth = () => {
        const newDate = new Date(miniCalendarDate);
        newDate.setMonth(newDate.getMonth() - 1);
        setMiniCalendarDate(newDate);
    };

    const nextMonth = () => {
        const newDate = new Date(miniCalendarDate);
        newDate.setMonth(newDate.getMonth() + 1);
        setMiniCalendarDate(newDate);
    };

    const selectMiniDay = (day) => {
        if (day) {
            setCurrentDate(day);
        }
    };

    // Create Appointment Handler
    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        try {
            let calculatedEndTime = null;
            if (newAppt.fecha_hora && newAppt.duration) {
                const date = new Date(newAppt.fecha_hora);
                date.setMinutes(date.getMinutes() + parseInt(newAppt.duration));
                calculatedEndTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            }

            await createAppointment({
                patient_id: newAppt.patient_id,
                professional_id: activeProfessionalId,
                fecha_hora: newAppt.fecha_hora,
                end_time: calculatedEndTime,
                motivo: newAppt.motivo
            }).unwrap();
            setIsModalOpen(false);
            setNewAppt({ patient_id: '', fecha_hora: '', duration: 30, motivo: '' });
        } catch (err) {
            console.error("Failed to create appointment", err);
            toast({ title: 'Error', description: 'Error al crear el turno', variant: 'destructive' });
        }
    };

    const handleNotify = async (id) => {
        try {
            await notifyAppointment(id).unwrap();
            toast({ title: 'Éxito', description: 'Notificación enviada correctamente por WhatsApp' });
        } catch (err) {
            toast({ title: 'Error', description: err.data?.error || 'Error al enviar notificación', variant: 'destructive' });
        }
    };

    const renderAppointment = (appt) => {
        const date = parseLocalDate(appt.fecha_hora);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        const hourHeight = isCompact ? 40 : 60;

        let top = (hours - 8) * hourHeight + (minutes / 60) * hourHeight;
        if (top < 0) top = 0;

        let height = hourHeight;
        if (appt.end_time) {
            const endDate = parseLocalDate(appt.end_time);
            const durationMinutes = (endDate - date) / (1000 * 60);
            if (durationMinutes > 15) height = (durationMinutes / 60) * hourHeight;
        }

        const colors = [
            { bg: '#FCF0FF', border: '#F2D5FA', text: '#83389A', timeText: '#A975BD' },
            { bg: '#F0FDF4', border: '#D1FADF', text: '#059669', timeText: '#34D399' },
            { bg: '#FEFCE8', border: '#FEF08A', text: '#CA8A04', timeText: '#FBBF24' },
            { bg: '#F0FDFA', border: '#CCFBF1', text: '#0D9488', timeText: '#5EEAD4' },
            { bg: '#FFF7ED', border: '#FFEDD5', text: '#EA580C', timeText: '#FDBA74' },
            { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', timeText: '#60A5FA' },
        ];
        const color = colors[appt.id % colors.length] || colors[0];

        const isCompleted = appt.estado === 'completado';
        const patientName = appt.patient ? appt.patient.nombre : '';

        const showPatient = height >= 36;
        const showTime = height >= 52;
        const paddingStyle = height < 36 ? '2px 6px' : (height < 52 ? '4px 6px' : '6px 8px');

        return (
            <div key={appt.id} className={`absolute left-1 right-1 rounded-xl border overflow-hidden transition-all cursor-pointer z-20 flex flex-col ${isCompleted ? 'opacity-70 shadow-none grayscale-[0.3]' : 'shadow-sm hover:shadow-md hover:scale-[1.02] hover:z-30'}`}
                onClick={() => setSelectedApptDetail(appt)}
                style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    minHeight: '26px',
                    padding: paddingStyle,
                    backgroundColor: isCompleted ? '#F3F4F6' : color.bg,
                    borderColor: isCompleted ? '#D1D5DB' : color.border,
                    borderStyle: isCompleted ? 'dashed' : 'solid'
                }}>
                <div className="flex justify-between items-start gap-1">
                    <div className={`font-bold truncate ${isCompleted ? 'line-through text-gray-500' : ''} ${height < 36 ? 'text-[10px] leading-[20px]' : 'text-xs sm:text-sm leading-tight'}`} style={{ color: isCompleted ? undefined : color.text }}>{appt.motivo || 'Turno'}</div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(appt.id); }}
                        className={`shrink-0 flex items-center justify-center rounded-full transition-colors ${isCompleted ? 'text-white bg-green-500 hover:bg-green-600 shadow-sm' : 'text-gray-400 hover:text-green-600 hover:bg-white/50'} ${height < 36 ? 'w-4 h-4 mt-0.5' : 'w-5 h-5 p-0.5 mt-0'}`}
                        title={isCompleted ? "Completado" : "Marcar como completado"}
                    >
                        <Check size={height < 36 ? 10 : 12} strokeWidth={isCompleted ? 3 : 2} />
                    </button>
                </div>
                {showPatient && patientName && <div className={`text-[10px] font-semibold truncate mt-0.5 ${isCompleted ? 'text-gray-500' : ''}`} style={{ color: isCompleted ? undefined : color.text }}>{patientName}</div>}
                {showTime && (
                    <div className={`text-[9px] font-medium mt-auto pt-0.5 flex justify-between items-center ${isCompleted ? 'text-gray-400' : ''}`} style={{ color: isCompleted ? undefined : color.timeText }}>
                        <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isCompleted && <span className="text-[8px] uppercase tracking-wider font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Hecho</span>}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col h-full bg-white p-4 md:p-8 relative">
            {/* Header Area */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Turnos</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#3B82F6] hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-sm transition-all flex items-center gap-2 text-sm"
                >
                    <span>+</span> Nuevo Turno
                </button>
            </div>

            {/* Toolbar Area */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={() => setStatusFilter(statusFilter ? '' : 'confirmado')}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${statusFilter ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Filter size={16} /> {statusFilter ? 'Solo Confirmados' : 'Filtro'}
                    </button>
                    <button
                        onClick={() => setViewMode(viewMode === 'Semanal' ? 'Diario' : 'Semanal')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-[120px] justify-center"
                    >
                        <CalendarDays size={16} /> {viewMode} <ChevronDown size={14} className="ml-1" />
                    </button>
                    <button
                        onClick={() => setIsListModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <List size={16} /> Ver listado
                    </button>
                    <button
                        onClick={() => setIsAllApptsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                    >
                        <History size={16} /> Todos los turnos
                    </button>
                    <button
                        onClick={() => navigate('/historial-turnos')}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0A58CA] border border-blue-600 rounded-full text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <History size={16} /> Historial Turnos
                    </button>
                </div>
                <div className="flex items-center gap-4 relative">
                    {isSearchOpen && (
                        <input
                            type="text"
                            placeholder="Buscar paciente o DNI..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="absolute right-[240px] px-3 py-1.5 border border-gray-200 rounded-full text-sm outline-none focus:border-[#0a47d4] shadow-sm animate-in fade-in slide-in-from-right-4 w-[200px]"
                            autoFocus
                        />
                    )}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Search size={20} />
                    </button>
                    <div className="w-px h-5 bg-gray-200"></div>
                    <button
                        onClick={() => window.open('https://wa.me/3245937358', '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                    >
                        <HeadphonesIcon size={16} /> Soporte
                    </button>
                    <button
                        onClick={() => setIsCompact(!isCompact)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition-colors ${isCompact ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                        <LayoutGrid size={16} /> Diseño
                    </button>
                </div>
            </div>

            {/* Main Grid Area */}
            <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">

                {/* Left Sidebar (Mini Calendar & List) */}
                <div className="w-full lg:w-72 flex flex-col gap-8 shrink-0 border-r border-gray-100 pr-6">

                    {/* Mini Calendar */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-[16px] font-bold text-[#1E293B]">
                                {monthNames[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
                            </h2>
                            <div className="flex gap-1">
                                <button onClick={prevMonth} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><ChevronLeft size={16} /></button>
                                <button onClick={nextMonth} className="p-1 rounded-full bg-[#3B82F6] text-white shadow-sm shadow-blue-500/30"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                            <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div><div>Do</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
                            {miniCalendarDays.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`}></div>;
                                const isSelected = day.toDateString() === currentDate.toDateString();
                                const isToday = day.toDateString() === new Date().toDateString();
                                return (
                                    <div
                                        key={i}
                                        onClick={() => selectMiniDay(day)}
                                        className={`p-1.5 rounded-full cursor-pointer transition-colors ${isSelected ? 'bg-[#3B82F6] text-white shadow-sm'
                                            : isToday ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {['ADMIN', 'EMPLOYEE'].includes(user?.role) && (
                        <>
                            <div className="w-full h-px bg-gray-100"></div>

                            {/* Doctor List */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-[16px] font-bold text-[#1E293B]">Profesionales</h2>
                                </div>
                                <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-2">
                                    {isProfLoading ? (
                                        <div className="text-sm text-gray-500">Cargando...</div>
                                    ) : professionals.map((prof) => (
                                        <div
                                            key={prof.id}
                                            onClick={() => setSelectedProfessional(prof.id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${activeProfessionalId === prof.id
                                                ? 'bg-blue-50 border border-blue-200 shadow-sm'
                                                : 'hover:bg-gray-50 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <img src={`https://ui-avatars.com/api/?name=${prof.name || 'Doc'}&background=F3F4F6&color=374151`} className="w-10 h-10 rounded-full" alt="Doctor" />
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{prof.name || prof.email}</h3>
                                                    <p className="text-xs font-medium text-blue-500">{prof.specialty || 'Kinesiólogo'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Right Calendar Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-white">
                    {/* Calendar Header Controls */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h2>
                            <div className="flex items-center bg-gray-50 border border-gray-100 rounded-full p-1 gap-1">
                                <button onClick={goToday} className="px-4 py-1 text-sm font-semibold text-blue-600 bg-white rounded-full shadow-sm hover:bg-blue-50">Hoy</button>
                                <button onClick={prevWeek} className="p-1.5 text-gray-400 hover:text-gray-600"><ChevronLeft size={16} /></button>
                                <button onClick={nextWeek} className="p-1.5 text-gray-400 hover:text-gray-600"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                        {isApptLoading && <div className="text-sm text-gray-500 animate-pulse">Cargando turnos...</div>}
                    </div>

                    {/* Calendar Grid Container */}
                    <div className="flex-1 overflow-auto border border-gray-300 rounded-2xl relative bg-[linear-gradient(#D1D5DB_1px,transparent_1px)]" style={{ backgroundSize: `100% ${isCompact ? 40 : 60}px` }}>
                        <div className={`grid ${viewMode === 'Semanal' ? 'grid-cols-7' : 'grid-cols-1'} min-w-[800px] divide-x divide-gray-300 relative pt-12 pl-12 pb-12`} style={{ minHeight: isCompact ? '600px' : '800px' }}>

                            {/* Absolute Day Headers */}
                            <div className="absolute top-0 left-12 right-0 h-12 flex divide-x divide-gray-300 border-b border-gray-300 bg-white/90 backdrop-blur-sm z-30">
                                {displayDays.map((day, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${day.toDateString() === new Date().toDateString() ? 'text-blue-600' : 'text-gray-800'}`}>
                                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][day.getDay()]} {day.getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Absolute Time Labels (Left) */}
                            <div className="absolute top-12 left-0 bottom-0 w-12 flex flex-col text-[10px] font-bold text-gray-800 items-center pt-4 bg-white/90 z-30" style={{ gap: isCompact ? '25px' : '45px' }}>
                                <span>08 AM</span>
                                <span>09 AM</span>
                                <span>10 AM</span>
                                <span>11 AM</span>
                                <span>12 PM</span>
                                <span>01 PM</span>
                                <span>02 PM</span>
                                <span>03 PM</span>
                                <span>04 PM</span>
                                <span>05 PM</span>
                                <span>06 PM</span>
                                <span>07 PM</span>
                                <span>08 PM</span>
                            </div>

                            {/* Dynamic Columns */}
                            {appointmentsByDay.map((dayAppts, colIndex) => (
                                <div key={colIndex} className="relative group border-r border-transparent">
                                    <div className="absolute inset-0 bg-transparent group-hover:bg-gray-50/50 transition-colors pointer-events-none" />
                                    {dayAppts.map(renderAppointment)}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Nuevo Turno */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Nuevo Turno</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateAppointment} className="p-4 flex flex-col gap-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-semibold text-gray-700">Paciente</label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreatingPatient(!isCreatingPatient)}
                                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        {isCreatingPatient ? 'Usar Existente' : '+ Nuevo Paciente'}
                                    </button>
                                </div>
                                {isCreatingPatient ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Nombre del paciente"
                                            className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                            value={newPatientName}
                                            onChange={(e) => setNewPatientName(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            disabled={!newPatientName.trim() || isCreatingPatientLoading}
                                            onClick={async () => {
                                                try {
                                                    const result = await createPatient({ nombre: newPatientName.trim() }).unwrap();
                                                    setNewAppt({ ...newAppt, patient_id: result.id });
                                                    setIsCreatingPatient(false);
                                                    setNewPatientName('');
                                                } catch (e) {
                                                    toast({ title: 'Error', description: 'Error creando paciente', variant: 'destructive' });
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg hover:bg-blue-200 disabled:opacity-50"
                                        >
                                            Guardar
                                        </button>
                                    </div>
                                ) : (
                                    <select
                                        required
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                        value={newAppt.patient_id}
                                        onChange={(e) => setNewAppt({ ...newAppt, patient_id: e.target.value })}
                                    >
                                        <option value="">Seleccione un paciente</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Inicio</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                                        value={newAppt.fecha_hora}
                                        onChange={(e) => setNewAppt({ ...newAppt, fecha_hora: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duración (minutos)</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                        value={newAppt.duration}
                                        onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })}
                                    >
                                        <option value="15">15 minutos</option>
                                        <option value="30">30 minutos</option>
                                        <option value="45">45 minutos</option>
                                        <option value="60">1 hora</option>
                                        <option value="90">1 hora 30 min</option>
                                        <option value="120">2 horas</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Motivo</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Chequeo de rutina"
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={newAppt.motivo}
                                    onChange={(e) => setNewAppt({ ...newAppt, motivo: e.target.value })}
                                />
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg disabled:opacity-50"
                                >
                                    {isCreating ? 'Guardando...' : 'Crear Turno'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalles del Turno */}
            {selectedApptDetail && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-900">Detalles del Turno</h3>
                            <button onClick={() => setSelectedApptDetail(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Paciente</p>
                                <p className="text-base font-semibold text-gray-900">{selectedApptDetail.patient?.nombre || 'Sin nombre'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Motivo</p>
                                <p className="text-base font-semibold text-gray-900">{selectedApptDetail.motivo || 'No especificado'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Inicio</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {parseLocalDate(selectedApptDetail.fecha_hora).toLocaleString()}
                                    </p>
                                </div>
                                {selectedApptDetail.end_time && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fin</p>
                                        <p className="text-sm font-medium text-gray-800">
                                            {parseLocalDate(selectedApptDetail.end_time).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedApptDetail.estado !== 'cancelado' && selectedApptDetail.estado !== 'completado' && (
                                <div className="mt-2 flex flex-col gap-2">
                                    <button
                                        onClick={() => handleNotify(selectedApptDetail.id)}
                                        disabled={isNotifying}
                                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        {isNotifying ? 'Enviando...' : 'Notificar por WhatsApp'}
                                    </button>
                                    <button
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        Cancelar Turno
                                    </button>
                                </div>
                            )}

                            {selectedApptDetail.patient && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => navigate(`/historial/${selectedApptDetail.patient.id}`)}
                                        className="w-full bg-[#0A58CA] hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold shadow-sm transition-colors text-sm flex items-center justify-center gap-2"
                                    >
                                        Ver Perfil / Historial
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Cancelar Turno */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-2xl shadow-xl w-[400px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-red-50">
                            <h3 className="font-bold text-lg text-red-700">Cancelar Turno</h3>
                            <button onClick={() => setIsCancelModalOpen(false)} className="text-red-400 hover:text-red-600"><X size={20} /></button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <p className="text-sm text-gray-600">Por favor, seleccione el motivo de la cancelación. Si el paciente falta, se registrará una inasistencia en su historial.</p>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Motivo de cancelación</label>
                                <select 
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                >
                                    <option value="ausencia_paciente">Falta de asistencia del paciente</option>
                                    <option value="cancelacion_profesional">Cancelación por parte del profesional / clínica</option>
                                </select>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg text-sm"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleCancelAppointment}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm"
                                >
                                    Confirmar Cancelación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Listado de Turnos del Día */}
            {isListModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[500px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                            <h3 className="font-bold text-lg text-gray-900">Turnos del {currentDate.toLocaleDateString()}</h3>
                            <button onClick={() => setIsListModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                            {(() => {
                                const dayAppts = appointments ? appointments.filter(a => parseLocalDate(a.fecha_hora).toDateString() === currentDate.toDateString()) : [];
                                if (dayAppts.length === 0) {
                                    return <p className="text-sm text-gray-500 text-center py-4">No hay turnos para este día.</p>;
                                }
                                return dayAppts.sort((a,b) => parseLocalDate(a.fecha_hora) - parseLocalDate(b.fecha_hora)).map(appt => (
                                    <div key={appt.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedApptDetail(appt); setIsListModalOpen(false); }}>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{appt.patient?.nombre || 'Sin nombre'}</p>
                                            <p className="text-xs text-gray-500">{parseLocalDate(appt.fecha_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {appt.motivo}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${appt.estado === 'completado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {appt.estado || 'Confirmado'}
                                            </span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleCompleteAppointment(appt.id); }}
                                                className={`p-1.5 rounded-full transition-colors ${appt.estado === 'completado' ? 'text-white bg-green-500' : 'text-gray-400 hover:text-green-600 hover:bg-gray-100'}`}
                                                title="Marcar como completado"
                                            >
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Todos los Turnos */}
            {isAllApptsModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[800px] max-w-[95vw] h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-gray-50">
                            <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                <History size={24} className="text-purple-600" />
                                Historial Completo de Turnos
                            </h3>
                            <button onClick={() => setIsAllApptsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white p-1.5 rounded-full shadow-sm"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white">
                            {isAllApptsLoading ? (
                                <div className="p-8 flex justify-center items-center w-full h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Past Appointments */}
                                    <div className="flex-1 flex flex-col overflow-hidden">
                                        <div className="p-4 bg-gray-50/80 border-b border-gray-100 shrink-0">
                                            <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                Turnos Pasados
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-auto">
                                                    {allAppointments?.filter(a => parseLocalDate(a.fecha_hora) < new Date()).length || 0}
                                                </span>
                                            </h4>
                                        </div>
                                        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                                            {(() => {
                                                const past = allAppointments?.filter(a => parseLocalDate(a.fecha_hora) < new Date()).sort((a,b) => parseLocalDate(b.fecha_hora) - parseLocalDate(a.fecha_hora)) || [];
                                                if (past.length === 0) return <p className="text-sm text-gray-500 text-center py-4">No hay turnos pasados.</p>;
                                                return past.map(appt => (
                                                    <div key={appt.id} className="flex justify-between items-start p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => { setSelectedApptDetail(appt); setIsAllApptsModalOpen(false); }}>
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{appt.patient?.nombre || 'Sin nombre'}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5 truncate">{appt.motivo}</p>
                                                            <p className="text-xs font-medium text-gray-400 mt-1">{parseLocalDate(appt.fecha_hora).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                        </div>
                                                        <div className="shrink-0 flex flex-col items-end gap-2">
                                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${appt.estado === 'completado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {appt.estado || 'Pasado'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    {/* Future Appointments */}
                                    <div className="flex-1 flex flex-col overflow-hidden">
                                        <div className="p-4 bg-blue-50/50 border-b border-gray-100 shrink-0">
                                            <h4 className="font-bold text-blue-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                Próximos Turnos
                                                <span className="text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full ml-auto">
                                                    {allAppointments?.filter(a => parseLocalDate(a.fecha_hora) >= new Date()).length || 0}
                                                </span>
                                            </h4>
                                        </div>
                                        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-3">
                                            {(() => {
                                                const future = allAppointments?.filter(a => parseLocalDate(a.fecha_hora) >= new Date()).sort((a,b) => parseLocalDate(a.fecha_hora) - parseLocalDate(b.fecha_hora)) || [];
                                                if (future.length === 0) return <p className="text-sm text-gray-500 text-center py-4">No hay próximos turnos.</p>;
                                                return future.map(appt => (
                                                    <div key={appt.id} className="flex justify-between items-start p-3 border border-blue-100 bg-white rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all" onClick={() => { setSelectedApptDetail(appt); setIsAllApptsModalOpen(false); }}>
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <p className="text-sm font-bold text-gray-900 truncate">{appt.patient?.nombre || 'Sin nombre'}</p>
                                                            <p className="text-xs text-gray-600 mt-0.5 truncate">{appt.motivo}</p>
                                                            <p className="text-xs font-semibold text-blue-600 mt-1">{parseLocalDate(appt.fecha_hora).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                                        </div>
                                                        <div className="shrink-0 flex flex-col items-end gap-2">
                                                            <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-md bg-blue-100 text-blue-700">
                                                                {appt.estado || 'Confirmado'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Helper component for ChevronDown
const ChevronDown = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

export default AppointmentCalendar;

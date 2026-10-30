import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Calendar as CalendarIcon,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    X,
    Check,
    List,
    History,
    Search,
    Clock,
    User,
    CheckCircle2,
    Building2,
    Info,
    ArrowRight,
    Phone,
    HeadphonesIcon,
    AlertCircle,
    UserCheck,
    Plus,
    Globe,
    CalendarX
} from "lucide-react";
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
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/es';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

// Date Helpers
const parseLocalDate = (dateString) => {
    if (!dateString) return dayjs().tz('America/Argentina/Buenos_Aires');
    return dayjs(dateString).tz('America/Argentina/Buenos_Aires');
};

const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const JS_TO_SPANISH_DAY = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
};

const parseTimeStrToMinutes = (timeStr) => {
    if (!timeStr) return 480;
    const str = timeStr.trim().toUpperCase();
    const isPM = str.includes('PM');
    const isAM = str.includes('AM');
    const cleaned = str.replace(/[^0-9:]/g, '');
    const parts = cleaned.split(':');
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

const getInitials = (name) => {
    if (!name) return 'DR';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

const AppointmentCalendar = () => {
    const user = useSelector(state => state.authSlice.userInfo);
    const navigate = useNavigate();

    // Professional Selection
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [selectedApptDetail, setSelectedApptDetail] = useState(null);

    // Date Navigation States
    const [currentDate, setCurrentDate] = useState(new Date());
    const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

    // View Modes: 'Semanal' | 'Diario' | 'Lista'
    const [viewMode, setViewMode] = useState('Semanal');
    const [rangeDays, setRangeDays] = useState(7); // 7 or 15

    // Filters and Modals
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAppt, setNewAppt] = useState({ patient_id: '', fecha_hora: '', duration: 45, motivo: '' });
    const [isCreatingPatient, setIsCreatingPatient] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientDni, setNewPatientDni] = useState('');
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
    const patientComboboxRef = useRef(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('ausencia_paciente');
    const [isAllApptsModalOpen, setIsAllApptsModalOpen] = useState(false);
    const [historySearchTerm, setHistorySearchTerm] = useState('');

    // Fetch Professionals
    const { data: professionalsData, isLoading: isProfLoading } = useGetProfessionalsQuery();
    const professionals = (professionalsData?.data || []).filter(
        p => p.is_active !== false && p.is_active !== 0 && p.is_active !== 'false' && p.is_active !== null && (p.is_public === true || p.is_public === 1 || p.is_public === 'true')
    );

    const isCurrentUserProfessional = Boolean(
        professionals.some(p => p.id === user?.id) || user?.is_public || (Array.isArray(user?.specialty) && user.specialty.length > 0)
    );

    const defaultProfId = isCurrentUserProfessional
        ? user?.id
        : (professionals.find(p => p.id === user?.id)?.id || professionals[0]?.id || user?.id);

    const activeProfessionalId = isCurrentUserProfessional
        ? user?.id
        : (selectedProfessional || defaultProfId);

    useEffect(() => {
        if (isCurrentUserProfessional) {
            setSelectedProfessional(user?.id);
        } else if (!selectedProfessional && professionals && professionals.length > 0) {
            setSelectedProfessional(professionals[0].id);
        }
    }, [professionals, user?.id, isCurrentUserProfessional, selectedProfessional]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (patientComboboxRef.current && !patientComboboxRef.current.contains(event.target)) {
                setIsPatientDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Active Professional Entity
    const currentProf = activeProfessionalId === 'all'
        ? { name: 'Todos los Profesionales', specialty: 'General', id: 'all' }
        : professionals.find(p => p.id === activeProfessionalId) || { name: user?.name || 'Profesional', specialty: 'Kinesiología' };

    // Fetch Patients
    const { data: patientsData } = useGetPatientsQuery();
    const patients = patientsData || [];

    const selectedPatientObj = (patients || []).find(p => String(p.id) === String(newAppt.patient_id));

    const filteredPatients = (patients || []).filter(p => {
        if (!patientSearchTerm.trim()) return true;
        const term = patientSearchTerm.toLowerCase();
        const nameMatch = (p.nombre || '').toLowerCase().includes(term);
        const dniMatch = String(p.dni || '').toLowerCase().includes(term);
        return nameMatch || dniMatch;
    });

    // Mutations
    const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
    const [updateAppointment] = useUpdateAppointmentMutation();
    const [cancelAppointmentMutation] = useCancelAppointmentMutation();
    const [notifyAppointment, { isLoading: isNotifying }] = useNotifyAppointmentMutation();
    const [createPatient, { isLoading: isCreatingPatientLoading }] = useCreatePatientMutation();

    // Calculate Display Days (Always starting from today or selected future date, never past days)
    const todayStart = dayjs().startOf('day');
    const baseDate = dayjs(currentDate).isBefore(todayStart) ? todayStart : dayjs(currentDate).startOf('day');
    const numDisplayDays = viewMode === 'Diario' ? 1 : rangeDays;

    const displayDays = Array.from({ length: numDisplayDays }, (_, i) => {
        return baseDate.add(i, 'day').toDate();
    });

    const rangeEndDate = new Date(displayDays[displayDays.length - 1]);
    rangeEndDate.setHours(23, 59, 59, 999);

    const startQueryDate = displayDays[0];
    const endQueryDate = rangeEndDate;

    // Fetch Appointments for Active Range
    const { data: appointments, isLoading: isApptLoading } = useGetAppointmentsQuery({
        professional_id: isCurrentUserProfessional ? user?.id : (activeProfessionalId === 'all' ? undefined : activeProfessionalId),
        start_date: startQueryDate.toISOString(),
        end_date: endQueryDate.toISOString()
    }, {
        skip: !activeProfessionalId && activeProfessionalId !== 'all'
    });

    // Fetch All Appointments for History Modal
    const { data: allAppointments, isLoading: isAllApptsLoading } = useGetAppointmentsQuery({
        professional_id: isCurrentUserProfessional ? user?.id : (activeProfessionalId === 'all' ? undefined : activeProfessionalId)
    }, {
        skip: !isAllApptsModalOpen
    });

    // Fetch Availability of active professional
    const { data: availabilityData } = useGetAvailabilityQuery({
        professional_id: isCurrentUserProfessional ? user?.id : (activeProfessionalId === 'all' ? undefined : activeProfessionalId)
    }, {
        skip: !activeProfessionalId || activeProfessionalId === 'all'
    });

    const availabilityItems = availabilityData?.data || [];

    // Navigation Handlers
    const isAtToday = dayjs(currentDate).isSame(dayjs().startOf('day'), 'day') || dayjs(currentDate).isBefore(dayjs().startOf('day'));

    const prevWeek = () => {
        const step = viewMode === 'Diario' ? 1 : (rangeDays === 15 ? 15 : 7);
        const newDate = dayjs(currentDate).subtract(step, 'day');
        const todayStart = dayjs().startOf('day');
        const finalDate = newDate.isBefore(todayStart) ? todayStart : newDate;
        setCurrentDate(finalDate.toDate());
        setMiniCalendarDate(finalDate.toDate());
    };

    const nextWeek = () => {
        const step = viewMode === 'Diario' ? 1 : (rangeDays === 15 ? 15 : 7);
        const newDate = dayjs(currentDate).add(step, 'day');
        setCurrentDate(newDate.toDate());
        setMiniCalendarDate(newDate.toDate());
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
        const startDay = firstDay === 0 ? 6 : firstDay - 1; // Mon-first

        const days = [];
        // Previous month filler days
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthLastDate - i),
                isCurrentMonth: false
            });
        }
        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }
        // Trailing filler days
        let nextDay = 1;
        while (days.length % 7 !== 0) {
            days.push({
                date: new Date(year, month + 1, nextDay++),
                isCurrentMonth: false
            });
        }
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

    // Check if a day is available for the professional
    const checkDayAvailability = (dayDate) => {
        const dateStr = dayjs(dayDate).format('YYYY-MM-DD');
        const dayOfWeekStr = JS_TO_SPANISH_DAY[dayDate.getDay()];

        // Check if there is an exception blocking this specific date
        const isException = availabilityItems.some(item => {
            if (!item.is_exception || !item.exception_date) return false;
            const excDateStr = typeof item.exception_date === 'string'
                ? item.exception_date.slice(0, 10)
                : dayjs(item.exception_date).format('YYYY-MM-DD');
            return excDateStr === dateStr;
        });
        if (isException) {
            return { isAvailable: false, reason: 'Día bloqueado' };
        }

        // Check weekly schedule configured by the professional
        const regularSchedules = availabilityItems.filter(item => !item.is_exception);
        if (regularSchedules.length > 0) {
            const hasSchedule = regularSchedules.some(
                item => item.day_of_week === dayOfWeekStr && item.start_time && item.end_time
            );
            return { isAvailable: hasSchedule, reason: hasSchedule ? '' : 'Día no laborable' };
        }

        // Fallback default: clinic standard schedule is Monday to Friday (days 1 to 5)
        const dayNum = dayDate.getDay();
        const isStandardWorkDay = dayNum !== 0 && dayNum !== 6;
        return { isAvailable: isStandardWorkDay, reason: isStandardWorkDay ? '' : 'Fin de semana' };
    };

    // Slot Generation for each Day (only real appointments: booked from web or created by admin)
    const getSlotsForDay = (dayDate) => {
        const dayStr = dayjs(dayDate).format('YYYY-MM-DD');
        const availInfo = checkDayAvailability(dayDate);

        // Filter booked appointments for this day
        const dayAppts = (appointments || []).filter(appt => {
            if (!appt.fecha_hora) return false;
            if (appt.estado === 'cancelado') return false;
            if (statusFilter && appt.estado !== statusFilter) return false;

            // Strict privacy filter: only display appointments of the active / logged-in professional
            const apptProfId = appt.professional?.id || appt.professional_id;
            if (isCurrentUserProfessional) {
                if (apptProfId && String(apptProfId) !== String(user?.id)) return false;
            } else if (activeProfessionalId && activeProfessionalId !== 'all') {
                if (apptProfId && String(apptProfId) !== String(activeProfessionalId)) return false;
            }

            if (searchQuery) {
                const term = searchQuery.toLowerCase();
                const pName = (appt.patient?.nombre || appt.patient_name || '').toLowerCase();
                const pDni = String(appt.patient?.dni || appt.patient_dni || '').toLowerCase();
                if (!pName.includes(term) && !pDni.includes(term)) return false;
            }
            return parseLocalDate(appt.fecha_hora).format('YYYY-MM-DD') === dayStr;
        });

        const slots = dayAppts.map(appt => {
            const aStart = parseLocalDate(appt.fecha_hora);
            const aEnd = appt.end_time ? parseLocalDate(appt.end_time) : aStart.add(45, 'minute');
            return {
                type: 'occupied',
                appointment: appt,
                startTime: aStart.format('HH:mm'),
                endTime: aEnd.format('HH:mm'),
                dateTime: aStart
            };
        });

        slots.sort((a, b) => a.dateTime.valueOf() - b.dateTime.valueOf());

        return {
            date: dayDate,
            slots,
            occupiedCount: slots.length,
            isAvailable: availInfo.isAvailable,
            unavailabilityReason: availInfo.reason
        };
    };

    const daysData = displayDays.map(getSlotsForDay);

    const totalProgramados = daysData.reduce((acc, d) => acc + d.occupiedCount, 0);

    // Create Appointment
    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (!newAppt.patient_id) {
            toast({ title: 'Atención', description: 'Por favor seleccione o cree un paciente.', variant: 'destructive' });
            return;
        }

        try {
            let fechaHoraUtc = null;
            let calculatedEndTime = null;

            if (newAppt.fecha_hora) {
                const localDate = dayjs.tz(newAppt.fecha_hora, 'America/Argentina/Buenos_Aires');
                fechaHoraUtc = localDate.utc().format();
                if (newAppt.duration) {
                    calculatedEndTime = localDate.add(parseInt(newAppt.duration), 'minute').utc().format();
                }
            }

            const profIdToUse = isCurrentUserProfessional
                ? user?.id
                : (activeProfessionalId === 'all' ? professionals[0]?.id : activeProfessionalId);

            await createAppointment({
                patient_id: newAppt.patient_id,
                professional_id: profIdToUse,
                fecha_hora: fechaHoraUtc,
                end_time: calculatedEndTime,
                motivo: newAppt.motivo
            }).unwrap();

            toast({ title: 'Éxito', description: 'Turno asignado correctamente' });
            setIsModalOpen(false);
            setIsPatientDropdownOpen(false);
            setPatientSearchTerm('');
            setIsCreatingPatient(false);
            setNewPatientName('');
            setNewPatientDni('');
            setNewAppt({ patient_id: '', fecha_hora: '', duration: 45, motivo: '' });
        } catch (err) {
            console.error("Failed to create appointment", err);
            if (err.status === 409) {
                toast({
                    title: 'Horario Ocupado',
                    description: err.data?.error || 'Ya existe un turno en este horario.',
                    variant: 'destructive'
                });
            } else {
                toast({ title: 'Error', description: 'Error al crear el turno', variant: 'destructive' });
            }
        }
    };

    const handleHacerPasar = async (id) => {
        try {
            await updateAppointment({ id, estado: 'en_consulta' }).unwrap();
            toast({ title: 'Paciente en Consulta', description: 'Se actualizó el estado a en consulta' });
        } catch (err) {
            console.error(err);
            toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
        }
    };

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

    const handleNotify = async (id) => {
        try {
            await notifyAppointment(id).unwrap();
            toast({ title: 'Éxito', description: 'Notificación enviada por WhatsApp' });
        } catch (err) {
            toast({ title: 'Error', description: err.data?.error || 'Error al enviar notificación', variant: 'destructive' });
        }
    };

    const handleOpenFreeSlot = (dateTime) => {
        const formatted = dayjs(dateTime).tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DDTHH:mm');
        setNewAppt({
            patient_id: '',
            fecha_hora: formatted,
            duration: 45,
            motivo: ''
        });
        setPatientSearchTerm('');
        setIsPatientDropdownOpen(false);
        setIsCreatingPatient(false);
        setNewPatientName('');
        setNewPatientDni('');
        setIsModalOpen(true);
    };

    // Range display text
    const formatRangeBannerText = () => {
        const startDayjs = dayjs(displayDays[0]).locale('es');
        const endDayjs = dayjs(displayDays[displayDays.length - 1]).locale('es');

        const startText = `${capitalize(startDayjs.format('dddd'))} ${startDayjs.format('D')} de ${capitalize(startDayjs.format('MMMM'))}`;
        const endText = `${capitalize(endDayjs.format('dddd'))} ${endDayjs.format('D')} de ${capitalize(endDayjs.format('MMMM'))} de ${endDayjs.format('YYYY')}`;

        return `${startText} al ${endText}`;
    };

    const nextWeekStart = dayjs(displayDays[0]).add(numDisplayDays, 'day').toDate();
    const nextWeekEnd = dayjs(nextWeekStart).add(4, 'day').toDate();

    const nextWeekBannerText = `${capitalize(dayjs(nextWeekStart).format('dddd D de MMMM'))} al ${capitalize(dayjs(nextWeekEnd).format('dddd D de MMMM'))}`;

    // Helper for Day Badge & Title
    const getDayHeaderInfo = (date) => {
        const todayStr = dayjs().format('YYYY-MM-DD');
        const dateStr = dayjs(date).format('YYYY-MM-DD');
        const diffDays = dayjs(dateStr).diff(dayjs(todayStr), 'day');

        let badge = null;
        let titleSuffix = '';

        if (diffDays === 0) {
            badge = { text: 'DÍA ACTUAL', bg: 'bg-[#1D68F2]' };
            titleSuffix = ' (HOY)';
        } else if (diffDays === 1) {
            badge = { text: 'MAÑANA', bg: 'bg-[#0F172A]' };
        } else if (diffDays === 2) {
            badge = { text: 'EN 2 DÍAS', bg: 'bg-[#0F172A]' };
        } else if (diffDays > 2) {
            badge = { text: `EN ${diffDays} DÍAS`, bg: 'bg-slate-700' };
        } else {
            badge = { text: 'ANTERIOR', bg: 'bg-gray-500' };
        }

        const dayName = capitalize(dayjs(date).format('dddd'));
        const fullTitle = `${dayName}, ${dayjs(date).format('D')} de ${capitalize(dayjs(date).format('MMMM'))}${titleSuffix}`;

        return { badge, fullTitle, diffDays, dayName };
    };

    return (
        <div className="w-full flex flex-col min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            {/* Top Planning Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
                        Planificación Semanal de Turnos
                    </h1>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Visualice y reserve con antelación las consultas de los próximos días sin confusiones.
                    </p>
                    <button
                        onClick={() => {
                            setNewAppt({ patient_id: '', fecha_hora: dayjs().format('YYYY-MM-DDTHH:mm'), duration: 45, motivo: '' });
                            setPatientSearchTerm('');
                            setIsPatientDropdownOpen(false);
                            setIsCreatingPatient(false);
                            setNewPatientName('');
                            setNewPatientDni('');
                            setIsModalOpen(true);
                        }}
                        className="mt-4 bg-[#1D68F2] hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 text-sm transition-all cursor-pointer"
                    >
                        <Plus size={18} strokeWidth={2.5} /> Asignar Nuevo Turno
                    </button>
                </div>

                {/* View Mode Switcher */}
                <div className="flex flex-col items-start lg:items-end">
                    <span className="text-xs font-bold text-gray-700 mb-1.5">Modo de Vista:</span>
                    <div className="bg-white border border-gray-200 rounded-2xl p-1 shadow-sm flex items-center gap-1">
                        <button
                            onClick={() => {
                                setViewMode('Diario');
                                setCurrentDate(new Date());
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                viewMode === 'Diario'
                                    ? 'bg-[#1D68F2] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <CalendarDays size={15} /> Vista Diaria (Hoy)
                        </button>
                        <button
                            onClick={() => setViewMode('Semanal')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                viewMode === 'Semanal'
                                    ? 'bg-[#1D68F2] text-white shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <List size={15} /> Vista Semanal (Próximos Días)
                        </button>
                        <button
                            onClick={() => setIsAllApptsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <History size={15} /> Lista Completa
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation and Range Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={goToday}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                        <CalendarIcon size={14} /> Ir a Hoy (Próximos Días)
                    </button>
                    <div className="bg-white border border-gray-200 rounded-xl flex items-center shadow-sm divide-x divide-gray-200 text-xs font-bold text-gray-700 overflow-hidden">
                        <button
                            onClick={prevWeek}
                            disabled={isAtToday}
                            className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            title={isAtToday ? 'Ya se encuentra en el día actual' : undefined}
                        >
                            <ChevronLeft size={16} /> Semana Anterior
                        </button>
                        <button
                            onClick={nextWeek}
                            className="px-4 py-2.5 hover:bg-gray-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            Semana Siguiente <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {viewMode === 'Semanal' && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400">VER:</span>
                        <div className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex items-center gap-1">
                            <button
                                onClick={() => setRangeDays(7)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    rangeDays === 7
                                        ? 'bg-[#1D68F2] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Próximos 7 días
                            </button>
                            <button
                                onClick={() => setRangeDays(15)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                    rangeDays === 15
                                        ? 'bg-[#1D68F2] text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                Próximos 15 días
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Blue Banner with Active Range & Legend */}
            <div className="bg-[#F0F5FE] border border-[#CCE0FD] rounded-2xl p-4 px-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#BFDBFE] text-[#1D68F2] flex items-center justify-center shadow-xs shrink-0">
                        <CalendarIcon size={20} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-[#1D68F2] tracking-wider block">
                            SEMANA EN PANTALLA:
                        </span>
                        <h2 className="text-sm md:text-base font-black text-[#0F172A] leading-tight">
                            {formatRangeBannerText()}
                        </h2>
                    </div>
                </div>

                {/* Status Legend */}
                <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                        <span>Turno Confirmado</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1D68F2]"></span>
                        <span>Turno Web</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
                        <span>En Sala de Espera</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                        <span className="text-gray-400 line-through decoration-gray-400/70">No Disponible</span>
                    </div>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Left Sidebar */}
                <div className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-6">

                    {/* Mini Calendar Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-black text-gray-900">
                                {monthNames[miniCalendarDate.getMonth()]} {miniCalendarDate.getFullYear()}
                            </h3>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={prevMonth}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={nextMonth}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-gray-400 mb-2">
                            <div>Lu</div>
                            <div>Ma</div>
                            <div>Mi</div>
                            <div>Ju</div>
                            <div>Vi</div>
                            <div>Sá</div>
                            <div className="text-red-500">Do</div>
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {miniCalendarDays.map((item, i) => {
                                const dayDate = item.date;
                                const isCurrent = item.isCurrentMonth;
                                const isToday = dayDate.toDateString() === new Date().toDateString();

                                // Check if this day is within displayDays range
                                const isInVisibleRange = displayDays.some(
                                    d => d.toDateString() === dayDate.toDateString()
                                );

                                const isSunday = dayDate.getDay() === 0;
                                const isDayUnavailable = !checkDayAvailability(dayDate).isAvailable;
                                const isPast = dayjs(dayDate).isBefore(dayjs().startOf('day'));

                                let dayStyle = "text-gray-700 hover:bg-gray-100 cursor-pointer";
                                if (!isCurrent) {
                                    dayStyle = isDayUnavailable || isPast
                                        ? "text-gray-300 line-through decoration-gray-300/60 cursor-not-allowed"
                                        : "text-gray-300 cursor-pointer";
                                } else if (isPast) {
                                    dayStyle = "text-gray-300 line-through decoration-gray-300/60 cursor-not-allowed";
                                } else if (isToday) {
                                    dayStyle = isDayUnavailable
                                        ? "bg-slate-300 text-gray-700 font-black line-through decoration-gray-600/70 shadow-xs cursor-pointer"
                                        : "bg-[#1D68F2] text-white font-black shadow-xs cursor-pointer";
                                } else if (isDayUnavailable) {
                                    dayStyle = isInVisibleRange
                                        ? "bg-gray-100 text-gray-400 font-bold line-through decoration-gray-400/80 hover:bg-gray-200 cursor-pointer"
                                        : "text-gray-400 font-medium line-through decoration-gray-400/70 hover:bg-gray-100 cursor-pointer";
                                } else if (isInVisibleRange) {
                                    dayStyle = "bg-[#E6F0FE] text-[#1D68F2] font-black cursor-pointer";
                                } else if (isSunday) {
                                    dayStyle = "text-red-500 font-bold hover:bg-red-50 cursor-pointer";
                                }

                                return (
                                    <div
                                        key={i}
                                        onClick={() => {
                                            if (!isPast) {
                                                setCurrentDate(dayDate);
                                            }
                                        }}
                                        title={isPast ? 'Día anterior' : (isDayUnavailable ? 'Día no disponible' : undefined)}
                                        className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg transition-all ${dayStyle}`}
                                    >
                                        {dayDate.getDate()}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sub-legend */}
                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded bg-[#E6F0FE] border border-blue-200"></span>
                                <span>Semana visible</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3.5 h-3.5 rounded-full bg-[#1D68F2]"></span>
                                <span>Día Hoy ({new Date().getDate()})</span>
                            </div>
                        </div>
                    </div>

                    {/* Professional Filter Card */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="text-sm font-black text-gray-900">
                                {isCurrentUserProfessional ? 'Mi Agenda Profesional' : 'Médico a Consultar'}
                            </h3>
                            {!isCurrentUserProfessional && (
                                <button
                                    onClick={() => setSelectedProfessional('all')}
                                    className="text-[11px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-wider transition-colors"
                                >
                                    FILTRAR
                                </button>
                            )}
                        </div>

                        {/* All Professionals Option - hidden for professionals to ensure privacy */}
                        {!isCurrentUserProfessional && (
                            <div
                                onClick={() => setSelectedProfessional('all')}
                                className={`border rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all ${
                                    activeProfessionalId === 'all'
                                        ? 'border-[#1D68F2] bg-[#F4F8FE] shadow-xs'
                                        : 'border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                                        <Building2 size={18} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">Ver Todos los Profesionales</span>
                                </div>
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                                    {professionals.length} Médicos
                                </span>
                            </div>
                        )}

                        {/* Professional Cards List */}
                        <div className="flex flex-col gap-2.5">
                            {(isCurrentUserProfessional
                                ? professionals.filter(p => p.id === user?.id)
                                : professionals
                            ).map((prof, index) => {
                                const isSelected = activeProfessionalId === prof.id;
                                const initials = getInitials(prof.name);

                                return (
                                    <div
                                        key={prof.id}
                                        onClick={() => {
                                            if (!isCurrentUserProfessional) {
                                                setSelectedProfessional(prof.id);
                                            }
                                        }}
                                        className={`relative rounded-2xl p-3.5 transition-all ${
                                            isSelected
                                                ? 'border-2 border-[#1D68F2] bg-[#F4F8FE] shadow-xs'
                                                : 'border border-gray-200 bg-white hover:bg-gray-50'
                                        } ${isCurrentUserProfessional ? 'cursor-default' : 'cursor-pointer'}`}
                                    >
                                        {/* Selected Badge */}
                                        {isSelected && (
                                            <span className="absolute -top-2.5 right-3 bg-[#1D68F2] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                                                {isCurrentUserProfessional ? 'MI CONSULTORIO' : 'SELECCIONADA'}
                                            </span>
                                        )}

                                        <div className="flex items-start gap-3">
                                            {/* Avatar Initials */}
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                                                    isSelected
                                                        ? 'bg-[#1D68F2] text-white shadow-xs'
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                {initials}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-black text-gray-900 truncate">
                                                    {prof.name}
                                                </h4>
                                                <p className="text-[11px] font-bold text-[#1D68F2] truncate mt-0.5">
                                                    {prof.specialty || 'Kinesiología'}
                                                </p>
                                                <p className="text-[10px] font-medium text-gray-500 mt-0.5">
                                                    Consultorio {index + 1} • Turnos de 45 min
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Right Agenda Content */}
                <div className="flex-1 min-w-0 w-full flex flex-col gap-6">

                    {/* Doctor Header Banner */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-lg font-black text-gray-900">
                                Agenda Semanal Anticipada
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Atendiendo:{' '}
                                <span className="font-bold text-[#1D68F2]">
                                    {currentProf?.name}
                                </span>{' '}
                                ({currentProf?.specialty || 'Kinesiología'} • Consultorio 1)
                            </p>
                        </div>

                        {/* Top Badges */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="border border-emerald-400 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {totalProgramados} {totalProgramados === 1 ? 'Turno Agendado' : 'Turnos Agendados'}
                            </span>
                        </div>
                    </div>

                    {/* Day Sections */}
                    <div className="flex flex-col gap-6">
                        {daysData.map((dayObj, dayIndex) => {
                            const { badge, fullTitle } = getDayHeaderInfo(dayObj.date);
                            const isDayUnavailable = !dayObj.isAvailable;

                            return (
                                <div key={dayIndex} className={`flex flex-col gap-3 transition-opacity ${isDayUnavailable ? 'opacity-85' : ''}`}>
                                    {/* Day Header Bar */}
                                    <div className={`bg-white border rounded-2xl p-3 px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs ${
                                        isDayUnavailable ? 'border-gray-200 bg-gray-50/60' : 'border-gray-200'
                                    }`}>
                                        <div className="flex items-center gap-3">
                                            {isDayUnavailable ? (
                                                <span className="bg-slate-200 text-slate-600 font-black text-[10px] tracking-wider px-2.5 py-1 rounded-md line-through decoration-slate-400">
                                                    NO DISPONIBLE
                                                </span>
                                            ) : (
                                                badge && (
                                                    <span className={`${badge.bg} text-white font-black text-[10px] tracking-wider px-2.5 py-1 rounded-md`}>
                                                        {badge.text}
                                                    </span>
                                                )
                                            )}
                                            <h3 className={`font-black text-sm md:text-base transition-colors ${
                                                isDayUnavailable
                                                    ? 'text-gray-400 line-through decoration-gray-400/70'
                                                    : 'text-gray-900'
                                            }`}>
                                                {fullTitle}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                            {isDayUnavailable ? (
                                                <span className="border border-gray-200 bg-gray-100/70 text-gray-400 text-xs font-bold px-3 py-1 rounded-lg line-through decoration-gray-400/60">
                                                    Día no disponible
                                                </span>
                                            ) : (
                                                <span className="border border-gray-200 bg-gray-50 text-gray-700 text-xs font-bold px-3 py-1 rounded-lg">
                                                    {dayObj.occupiedCount} {dayObj.occupiedCount === 1 ? 'Turno agendado' : 'Turnos agendados'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Day Slot Cards List */}
                                    <div className="flex flex-col gap-3">
                                        {dayObj.slots.length === 0 ? (
                                            isDayUnavailable ? (
                                                <div className="bg-white/80 border border-dashed border-gray-300 rounded-2xl p-6 py-7 text-center flex flex-col items-center justify-center gap-2 text-gray-400 shadow-xs">
                                                    <CalendarX size={24} className="text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-500 line-through decoration-gray-400/70">
                                                        Día no disponible para atención.
                                                    </p>
                                                    <span className="text-[11px] text-gray-400">
                                                        {dayObj.unavailabilityReason || 'Sin horarios de atención programados para este día.'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-6 py-8 text-center flex flex-col items-center justify-center gap-2 text-gray-400 shadow-xs">
                                                    <CalendarIcon size={24} className="text-gray-300" />
                                                    <p className="text-xs font-medium text-gray-500">
                                                        No hay turnos agendados para este día.
                                                    </p>
                                                    <button
                                                        onClick={() => handleOpenFreeSlot(dayObj.date)}
                                                        className="mt-1 text-xs font-bold text-[#1D68F2] hover:underline flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Plus size={14} /> Asignar Turno Manual
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            dayObj.slots.map((slot, slotIndex) => {
                                                const appt = slot.appointment;
                                                const patientName = appt.patient?.nombre || appt.patient_name || 'Paciente sin nombre';
                                                const patientDni = appt.patient?.dni || appt.patient_dni;
                                                const isWaiting = appt.estado === 'en_espera';
                                                const isCompleted = appt.estado === 'completado';
                                                const isPhoneConfirmed = appt.patient_phone || appt.patient?.datos_contacto?.telefono;
                                                const isWebBooking = Boolean(appt.patient_name && !appt.patient?.id) || appt.type === 'web' || !appt.patient_id;

                                                return (
                                                    <div
                                                        key={slotIndex}
                                                        className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                                                    >
                                                        {/* Left Time Box */}
                                                        <div className="border border-blue-200 bg-[#F4F8FE] text-center rounded-xl p-2 px-3 min-w-[95px] shrink-0">
                                                            <span className="font-black text-base text-gray-900 block leading-tight">
                                                                {slot.startTime}
                                                            </span>
                                                            <span className="text-[11px] font-semibold text-gray-500">
                                                                a {slot.endTime} hs
                                                            </span>
                                                        </div>

                                                        {/* Middle Patient Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                {isWebBooking ? (
                                                                    <span className="bg-blue-50 border border-blue-200 text-[#1D68F2] text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                        <Globe size={11} /> Turno Web
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                        <User size={11} /> Turno Admin
                                                                    </span>
                                                                )}

                                                                {isWaiting ? (
                                                                    <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                        <Clock size={11} /> En Sala de Espera
                                                                    </span>
                                                                ) : isCompleted ? (
                                                                    <span className="bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                        <Check size={11} /> Completado
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                                                                        <Check size={11} /> {isPhoneConfirmed ? 'Confirmado Telefónicamente' : 'Confirmado'}
                                                                    </span>
                                                                )}

                                                                {patientDni && (
                                                                    <span className="text-[11px] font-medium text-gray-500">
                                                                        DNI: {patientDni}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <h4 className="text-base font-black text-gray-900 leading-snug">
                                                                {patientName}
                                                            </h4>

                                                            <p className="text-xs text-gray-600 mt-0.5 truncate">
                                                                {appt.motivo || 'Control de rutina'}
                                                                {appt.patient?.admissionData?.obra_social && ` • ${appt.patient.admissionData.obra_social}`}
                                                                {(appt.patient_phone || appt.patient?.datos_contacto?.telefono) && ` • Tel: ${appt.patient_phone || appt.patient?.datos_contacto?.telefono}`}
                                                            </p>
                                                        </div>

                                                        {/* Right Actions */}
                                                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                                            {isWaiting ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleHacerPasar(appt.id)}
                                                                        className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                                                                    >
                                                                        Hacer Pasar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setSelectedApptDetail(appt)}
                                                                        className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                                                                    >
                                                                        Ficha
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => setSelectedApptDetail(appt)}
                                                                        className="border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                                                                    >
                                                                        Ver Ficha
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setSelectedApptDetail(appt)}
                                                                        className="border border-rose-300 hover:bg-rose-50 text-rose-600 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                                                                    >
                                                                        Reprogramar
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Next Week Card Banner */}
                    <div className="bg-[#F4F8FE] border border-[#BFDBFE] rounded-2xl p-5 px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-white border border-[#BFDBFE] text-[#1D68F2] flex items-center justify-center shadow-xs shrink-0">
                                <CalendarIcon size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-gray-900">
                                    ¿Desea adelantar turnos para la Semana Siguiente?
                                </h4>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    {nextWeekBannerText} con horarios disponibles.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={nextWeek}
                            className="border border-[#1D68F2] bg-white hover:bg-blue-50 text-[#1D68F2] font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                        >
                            Ver Semana Siguiente <ArrowRight size={15} />
                        </button>
                    </div>

                    {/* Accessibility Footer */}
                    <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <Info size={16} className="text-[#1D68F2] shrink-0" />
                            <span>
                                ¿Dificultad para leer la pantalla? Puede mantener presionada la tecla{' '}
                                <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-[11px] font-bold text-gray-700">
                                    Ctrl
                                </kbd>{' '}
                                y pulsar{' '}
                                <kbd className="bg-gray-100 border border-gray-300 px-1.5 py-0.5 rounded text-[11px] font-bold text-gray-700">
                                    +
                                </kbd>{' '}
                                para agrandar la letra.
                            </span>
                        </div>
                        <span className="text-[11px] text-gray-400">
                            PAUSES Sistema Médico • Versión de Accesibilidad v2.4
                        </span>
                    </div>

                </div>
            </div>

            {/* Modal: Asignar Nuevo Turno */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                            <h3 className="font-black text-lg text-gray-900">Asignar Nuevo Turno</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAppointment} className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
                            {/* Selector / Buscador / Creador de Pacientes */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Paciente <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreatingPatient(!isCreatingPatient);
                                            if (!isCreatingPatient && patientSearchTerm) {
                                                setNewPatientName(patientSearchTerm);
                                            }
                                        }}
                                        className="text-xs font-bold text-[#1D68F2] hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus size={12} /> {isCreatingPatient ? 'Buscar Existente' : 'Nuevo Paciente'}
                                    </button>
                                </div>

                                {isCreatingPatient ? (
                                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-3 flex flex-col gap-2 animate-in fade-in duration-150">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nombre y Apellido *"
                                                className="flex-1 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 bg-white"
                                                value={newPatientName}
                                                onChange={(e) => setNewPatientName(e.target.value)}
                                                autoFocus
                                            />
                                            <input
                                                type="text"
                                                placeholder="DNI (Opcional)"
                                                className="w-full sm:w-28 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 bg-white"
                                                value={newPatientDni}
                                                onChange={(e) => setNewPatientDni(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsCreatingPatient(false);
                                                    setNewPatientName('');
                                                    setNewPatientDni('');
                                                }}
                                                className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!newPatientName.trim() || isCreatingPatientLoading}
                                                onClick={async () => {
                                                    try {
                                                        const payload = { nombre: newPatientName.trim() };
                                                        if (newPatientDni.trim()) payload.dni = newPatientDni.trim();
                                                        const res = await createPatient(payload).unwrap();
                                                        setNewAppt({ ...newAppt, patient_id: res.id });
                                                        setIsCreatingPatient(false);
                                                        setNewPatientName('');
                                                        setNewPatientDni('');
                                                        toast({ title: 'Paciente Creado', description: res.nombre });
                                                    } catch (e) {
                                                        toast({ title: 'Error', description: 'No se pudo crear paciente', variant: 'destructive' });
                                                    }
                                                }}
                                                className="px-3 py-1.5 bg-[#1D68F2] hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 text-xs shadow-xs cursor-pointer flex items-center gap-1"
                                            >
                                                <Check size={13} /> Guardar y Seleccionar
                                            </button>
                                        </div>
                                    </div>
                                ) : selectedPatientObj ? (
                                    <div className="flex items-center justify-between border border-blue-200 bg-blue-50/60 rounded-xl p-2.5 px-3">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1D68F2] flex items-center justify-center font-bold text-xs shrink-0">
                                                {selectedPatientObj.nombre?.charAt(0).toUpperCase() || 'P'}
                                            </div>
                                            <div className="truncate">
                                                <span className="font-bold text-xs text-gray-900 block truncate">
                                                    {selectedPatientObj.nombre}
                                                </span>
                                                <span className="text-[11px] text-gray-500 block truncate">
                                                    {selectedPatientObj.dni ? `DNI: ${selectedPatientObj.dni}` : 'Sin DNI registrado'}
                                                    {(selectedPatientObj.patient_phone || selectedPatientObj.datos_contacto?.telefono) && ` • Tel: ${selectedPatientObj.patient_phone || selectedPatientObj.datos_contacto?.telefono}`}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewAppt({ ...newAppt, patient_id: '' });
                                                setPatientSearchTerm('');
                                                setIsPatientDropdownOpen(true);
                                            }}
                                            className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                                            title="Cambiar paciente"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative" ref={patientComboboxRef}>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white placeholder-gray-400 font-medium"
                                                placeholder="Seleccione o busque un paciente por nombre..."
                                                value={patientSearchTerm}
                                                onChange={(e) => {
                                                    setPatientSearchTerm(e.target.value);
                                                    setIsPatientDropdownOpen(true);
                                                }}
                                                onFocus={() => setIsPatientDropdownOpen(true)}
                                            />
                                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            {patientSearchTerm ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setPatientSearchTerm('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                                                >
                                                    <X size={14} />
                                                </button>
                                            ) : (
                                                <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
                                            )}
                                        </div>

                                        {/* Dropdown flotante con lista filtrada y opción de crear */}
                                        {isPatientDropdownOpen && (
                                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto flex flex-col py-1 animate-in fade-in zoom-in-95 duration-150">
                                                {filteredPatients.length > 0 ? (
                                                    filteredPatients.map(p => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => {
                                                                setNewAppt({ ...newAppt, patient_id: p.id });
                                                                setPatientSearchTerm('');
                                                                setIsPatientDropdownOpen(false);
                                                            }}
                                                            className="w-full text-left px-3.5 py-2 hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-2 border-b border-gray-50 last:border-b-0 cursor-pointer"
                                                        >
                                                            <div className="truncate">
                                                                <span className="font-bold text-xs text-gray-900 block truncate">
                                                                    {p.nombre}
                                                                </span>
                                                                <span className="text-[11px] text-gray-500 block truncate">
                                                                    {p.dni ? `DNI: ${p.dni}` : 'Sin DNI'}
                                                                    {(p.patient_phone || p.datos_contacto?.telefono) && ` • Tel: ${p.patient_phone || p.datos_contacto?.telefono}`}
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] font-bold text-[#1D68F2] bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                                                                Seleccionar
                                                            </span>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-center text-xs text-gray-500">
                                                        No se encontraron pacientes con "{patientSearchTerm}"
                                                    </div>
                                                )}

                                                {/* Botón para crear rápidamente si no existe */}
                                                {patientSearchTerm.trim() && (
                                                    <div className="p-1.5 border-t border-gray-100 bg-gray-50/90 sticky bottom-0">
                                                        <button
                                                            type="button"
                                                            disabled={isCreatingPatientLoading}
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await createPatient({ nombre: patientSearchTerm.trim() }).unwrap();
                                                                    setNewAppt({ ...newAppt, patient_id: res.id });
                                                                    setPatientSearchTerm('');
                                                                    setIsPatientDropdownOpen(false);
                                                                    toast({ title: 'Paciente Creado', description: `Se creó y seleccionó a ${res.nombre}` });
                                                                } catch (e) {
                                                                    toast({ title: 'Error', description: 'No se pudo crear paciente', variant: 'destructive' });
                                                                }
                                                            }}
                                                            className="w-full bg-[#1D68F2] hover:bg-blue-700 text-white font-bold text-xs p-2 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                                                        >
                                                            <Plus size={14} strokeWidth={2.5} /> Crear nuevo paciente "{patientSearchTerm.trim()}"
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Fecha y Hora
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500"
                                        value={newAppt.fecha_hora}
                                        onChange={(e) => setNewAppt({ ...newAppt, fecha_hora: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Duración
                                    </label>
                                    <select
                                        className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-blue-500 bg-white"
                                        value={newAppt.duration}
                                        onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })}
                                    >
                                        <option value="30">30 minutos</option>
                                        <option value="45">45 minutos</option>
                                        <option value="60">1 hora</option>
                                        <option value="90">1 hora 30 min</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Motivo de Consulta
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Control de Nódulos Tiroideos"
                                    className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:border-blue-500"
                                    value={newAppt.motivo}
                                    onChange={(e) => setNewAppt({ ...newAppt, motivo: e.target.value })}
                                />
                            </div>

                            <div className="mt-4 flex justify-end gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl text-xs"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="px-5 py-2.5 bg-[#1D68F2] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-50"
                                >
                                    {isCreating ? 'Guardando...' : 'Asignar Turno'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Ficha / Detalles del Turno */}
            {selectedApptDetail && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
                            <h3 className="font-black text-lg text-gray-900">Ficha del Turno</h3>
                            <button
                                onClick={() => setSelectedApptDetail(null)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1">
                            <div>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                                    Paciente
                                </span>
                                <h4 className="text-base font-black text-gray-900 mt-0.5">
                                    {selectedApptDetail.patient?.nombre || selectedApptDetail.patient_name || 'Sin nombre registrado'}
                                </h4>
                            </div>

                            {(selectedApptDetail.patient?.dni || selectedApptDetail.patient_dni) && (
                                <div>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                                        DNI
                                    </span>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {selectedApptDetail.patient?.dni || selectedApptDetail.patient_dni}
                                    </p>
                                </div>
                            )}

                            {(selectedApptDetail.patient?.datos_contacto?.telefono || selectedApptDetail.patient_phone) && (
                                <div>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                                        Teléfono de Contacto
                                    </span>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {selectedApptDetail.patient?.datos_contacto?.telefono || selectedApptDetail.patient_phone}
                                    </p>
                                </div>
                            )}

                            <div>
                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                                    Motivo
                                </span>
                                <p className="text-sm font-semibold text-gray-800">
                                    {selectedApptDetail.motivo || 'Consulta General'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                                        Inicio
                                    </span>
                                    <p className="text-xs font-bold text-gray-900 mt-0.5">
                                        {parseLocalDate(selectedApptDetail.fecha_hora).format('DD/MM/YYYY HH:mm')} hs
                                    </p>
                                </div>
                                {selectedApptDetail.end_time && (
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
                                            Fin Estimado
                                        </span>
                                        <p className="text-xs font-bold text-gray-900 mt-0.5">
                                            {parseLocalDate(selectedApptDetail.end_time).format('DD/MM/YYYY HH:mm')} hs
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions within Modal */}
                            {selectedApptDetail.estado !== 'cancelado' && (
                                <div className="flex flex-col gap-2 mt-2">
                                    {selectedApptDetail.estado !== 'completado' && (
                                        <button
                                            onClick={() => {
                                                handleCompleteAppointment(selectedApptDetail.id);
                                                setSelectedApptDetail(null);
                                            }}
                                            className="w-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                                        >
                                            <Check size={16} /> Marcar como Completado
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleNotify(selectedApptDetail.id)}
                                        disabled={isNotifying}
                                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
                                    >
                                        <Phone size={15} /> Notificar por WhatsApp
                                    </button>

                                    <button
                                        onClick={() => setIsCancelModalOpen(true)}
                                        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-2 rounded-xl text-xs transition-all"
                                    >
                                        Cancelar / Reprogramar Turno
                                    </button>
                                </div>
                            )}

                            {selectedApptDetail.patient && (
                                <div className="mt-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            navigate(`/pacientes/${selectedApptDetail.patient.id}`);
                                            setSelectedApptDetail(null);
                                        }}
                                        className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                                    >
                                        <User size={15} /> Ver Perfil Clínico / Historial
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Cancelar Turno */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[380px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
                            <h4 className="font-black text-rose-800 text-sm">Cancelar Turno</h4>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="text-rose-400 hover:text-rose-600"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Seleccione el motivo de la cancelación. Si se selecciona ausencia, se asentará en el registro del paciente.
                            </p>
                            <select
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500 bg-white"
                            >
                                <option value="ausencia_paciente">Falta de asistencia del paciente</option>
                                <option value="cancelacion_profesional">Cancelación por la clínica / profesional</option>
                            </select>
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => setIsCancelModalOpen(false)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleCancelAppointment}
                                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs"
                                >
                                    Confirmar Cancelación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Historial Completo / Lista de Turnos */}
            {isAllApptsModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[850px] h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-black text-lg text-gray-900">Listado Completo de Turnos</h3>
                                <p className="text-xs text-gray-500">Historial histórico y turnos próximos agendados</p>
                            </div>
                            <button
                                onClick={() => setIsAllApptsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl bg-white shadow-xs"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-3 border-b border-gray-100 bg-white">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar por paciente o DNI..."
                                    value={historySearchTerm}
                                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                            {isAllApptsLoading ? (
                                <div className="text-center py-10 text-xs text-gray-400">Cargando turnos...</div>
                            ) : (
                                (allAppointments || [])
                                    .filter(a => {
                                        // Strict privacy filter: only display appointments belonging to the active/logged-in professional
                                        const apptProfId = a.professional?.id || a.professional_id;
                                        if (isCurrentUserProfessional) {
                                            if (apptProfId && String(apptProfId) !== String(user?.id)) return false;
                                        } else if (activeProfessionalId && activeProfessionalId !== 'all') {
                                            if (apptProfId && String(apptProfId) !== String(activeProfessionalId)) return false;
                                        }

                                        if (!historySearchTerm) return true;
                                        const term = historySearchTerm.toLowerCase();
                                        const pName = (a.patient?.nombre || a.patient_name || '').toLowerCase();
                                        const pDni = String(a.patient?.dni || a.patient_dni || '').toLowerCase();
                                        return pName.includes(term) || pDni.includes(term);
                                    })
                                    .map(a => (
                                        <div
                                            key={a.id}
                                            onClick={() => {
                                                setSelectedApptDetail(a);
                                                setIsAllApptsModalOpen(false);
                                            }}
                                            className="p-3 border border-gray-100 rounded-xl hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-colors"
                                        >
                                            <div>
                                                <h5 className="font-bold text-xs text-gray-900">
                                                    {a.patient?.nombre || a.patient_name || 'Sin nombre'}
                                                </h5>
                                                <p className="text-[11px] text-gray-500 mt-0.5">
                                                    {parseLocalDate(a.fecha_hora).format('DD/MM/YYYY HH:mm')} hs • {a.motivo}
                                                </p>
                                            </div>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                    a.estado === 'completado'
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : a.estado === 'cancelado'
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-blue-100 text-[#1D68F2]'
                                                }`}
                                            >
                                                {a.estado || 'Confirmado'}
                                            </span>
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentCalendar;

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Clock, Plus, CalendarX, X, ChevronLeft, ChevronRight, Trash2, DollarSign, ExternalLink, CheckCircle, Loader2, AlertTriangle, User } from 'lucide-react';
import { useGetAvailabilityQuery, useSaveAvailabilityMutation, useGetProfileQuery, useUpdateProfileMutation, useGetProfessionalsQuery } from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import WhatsAppSettings from '../profile/WhatsAppSettings.jsx';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const AvailabilityManager = () => {
    const currentUser = useSelector(state => state.authSlice?.userInfo);
    const isAdmin = currentUser?.role === 'ADMIN';
    const { data: profsResponse } = useGetProfessionalsQuery(undefined, { skip: !isAdmin });
    const professionals = (profsResponse?.data || []).filter(p => p.is_active !== false && p.is_active !== 'false');

    const [selectedProfId, setSelectedProfId] = useState(null);

    useEffect(() => {
        if (currentUser?.id && selectedProfId === null) {
            setSelectedProfId(currentUser.id);
        }
    }, [currentUser, selectedProfId]);

    const activeProfId = selectedProfId || currentUser?.id;

    const { data, isLoading } = useGetAvailabilityQuery(
        activeProfId ? { professional_id: activeProfId } : undefined,
        { skip: !activeProfId }
    );
    const [saveAvailability, { isLoading: isSaving }] = useSaveAvailabilityMutation();

    const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery();
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

    // Map day -> array of { start_time, end_time }
    const [schedules, setSchedules] = useState({});
    const [exceptions, setExceptions] = useState([]);
    const [appointmentCost, setAppointmentCost] = useState('');
    const [requirePayment, setRequirePayment] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);
    const [sessionFee, setSessionFee] = useState('');
    const [mpAccessToken, setMpAccessToken] = useState('');
    const [mpAuthUrl, setMpAuthUrl] = useState('');

    useEffect(() => {
        if (profileData?.data) {
            const fee = Number(profileData.data.session_fee);
            setSessionFee(fee === 0 || isNaN(fee) ? '' : fee.toString());
            setRequirePayment(!!profileData.data.require_payment);
            setMpAccessToken(profileData.data.mp_access_token || '');
        }
    }, [profileData]);

    useEffect(() => {
        // Fetch MP Auth URL if token is missing
        if (!mpAccessToken) {
            const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:10000';
            const token = localStorage.getItem('token');
            if (token) {
                fetch(`${backendUrl}/api/kinesio/mp-auth-url`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                .then(res => res.json())
                .then(data => {
                    if (data.url) setMpAuthUrl(data.url);
                })
                .catch(err => console.error('Error fetching MP auth url:', err));
            }
        }
    }, [mpAccessToken]);

    useEffect(() => {
        if (data?.data) {
            const newSchedules = {};
            const newExceptions = [];

            data.data.forEach(item => {
                if (item.is_exception && item.exception_date) {
                    const dateStr = typeof item.exception_date === 'string'
                        ? item.exception_date.slice(0, 10)
                        : new Date(item.exception_date).toISOString().slice(0, 10);
                    newExceptions.push({ exception_date: dateStr, exception_title: item.exception_title });
                } else if (!item.is_exception) {
                    if (!newSchedules[item.day_of_week]) newSchedules[item.day_of_week] = [];
                    newSchedules[item.day_of_week].push({
                        start_time: item.start_time,
                        end_time: item.end_time,
                        session_duration: item.session_duration || 30
                    });
                }
            });

            setSchedules(newSchedules);
            setExceptions(newExceptions);
        }
    }, [data]);

    const handleAddBlock = (day) => {
        setSchedules(prev => {
            const daySched = prev[day] || [];
            return { ...prev, [day]: [...daySched, { start_time: '09:00', end_time: '13:00', session_duration: 30 }] };
        });
    };

    const handleRemoveBlock = (day, index) => {
        setSchedules(prev => {
            const daySched = [...(prev[day] || [])];
            daySched.splice(index, 1);
            return { ...prev, [day]: daySched };
        });
    };

    const handleTimeChange = (day, index, field, value) => {
        setSchedules(prev => {
            const daySched = [...(prev[day] || [])];
            daySched[index] = { ...daySched[index], [field]: value };
            return { ...prev, [day]: daySched };
        });
    };

    const handleSave = async (customExceptions = null) => {
        const payloadSchedules = [];
        Object.keys(schedules).forEach(day => {
            schedules[day].forEach(block => {
                if (block.start_time && block.end_time) {
                    payloadSchedules.push({
                        day_of_week: day,
                        start_time: block.start_time,
                        end_time: block.end_time,
                        session_duration: block.session_duration || 30
                    });
                }
            });
        });

        const excsToUse = customExceptions !== null ? customExceptions : exceptions;
        const cleanExceptions = excsToUse.map(exc => ({
            exception_date: typeof exc.exception_date === 'string' ? exc.exception_date.slice(0, 10) : exc.exception_date,
            exception_title: exc.exception_title || 'Día no disponible'
        }));

        try {
            await saveAvailability({ schedules: payloadSchedules, exceptions: cleanExceptions, professional_id: activeProfId }).unwrap();
            if (activeProfId === currentUser?.id) {
                await updateProfile({ 
                    session_fee: sessionFee === '' ? 0 : Number(sessionFee),
                    require_payment: requirePayment
                }).unwrap();
            }
            toast({ title: 'Éxito', description: 'Disponibilidad guardada correctamente', variant: 'success' });
            return true;
        } catch (error) {
            toast({ title: 'Error', description: 'No se pudo guardar la configuración', variant: 'error' });
            return false;
        }
    };

    const [showExceptionsModal, setShowExceptionsModal] = useState(false);
    const [calendarViewDate, setCalendarViewDate] = useState(new Date());
    const [selectedCalendarDates, setSelectedCalendarDates] = useState([]);
    const [newExceptionTitle, setNewExceptionTitle] = useState('');

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const generateCalendarDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = firstDay === 0 ? 6 : firstDay - 1; // Mon-first

        const days = [];
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDate - i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(d.getDate()).padStart(2, '0');
            days.push({
                date: d,
                dateStr: `${y}-${m}-${dayNum}`,
                isCurrentMonth: false,
                dayNumber: d.getDate()
            });
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(i).padStart(2, '0');
            days.push({
                date: d,
                dateStr: `${y}-${m}-${dayNum}`,
                isCurrentMonth: true,
                dayNumber: i
            });
        }
        let nextDay = 1;
        while (days.length % 7 !== 0) {
            const d = new Date(year, month + 1, nextDay++);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dayNum = String(d.getDate()).padStart(2, '0');
            days.push({
                date: d,
                dateStr: `${y}-${m}-${dayNum}`,
                isCurrentMonth: false,
                dayNumber: d.getDate()
            });
        }
        return days;
    };

    const toggleCalendarDate = async (dateStr) => {
        const isBlocked = exceptions.some(e => e.exception_date === dateStr);
        let updatedExceptions;
        if (isBlocked) {
            updatedExceptions = exceptions.filter(e => e.exception_date !== dateStr);
        } else {
            const titleToUse = newExceptionTitle.trim() || 'Día no disponible';
            updatedExceptions = [...exceptions, { exception_date: dateStr, exception_title: titleToUse }];
        }
        setExceptions(updatedExceptions);

        const ok = await handleSave(updatedExceptions);
        if (ok) {
            if (isBlocked) {
                toast({ title: 'Día habilitado', description: `Se desbloqueó la fecha ${dateStr}.` });
            } else {
                toast({ title: 'Día bloqueado', description: `Se bloqueó la fecha ${dateStr} y ya figura tachada en el turnero.` });
            }
        }
    };

    const handleBlockSelectedDates = async () => {
        if (selectedCalendarDates.length === 0) {
            toast({ title: 'Atención', description: 'Por favor selecciona al menos un día en el calendario.', variant: 'destructive' });
            return;
        }
        const titleToUse = newExceptionTitle.trim() || 'Día no disponible';
        const newEntries = selectedCalendarDates
            .filter(d => !exceptions.some(e => e.exception_date === d))
            .map(d => ({ exception_date: d, exception_title: titleToUse }));
        const updatedExceptions = [...exceptions, ...newEntries];
        setExceptions(updatedExceptions);
        setSelectedCalendarDates([]);
        setNewExceptionTitle('');

        await handleSave(updatedExceptions);
    };

    const handleRemoveException = async (index) => {
        const updatedExceptions = exceptions.filter((_, i) => i !== index);
        setExceptions(updatedExceptions);
        await handleSave(updatedExceptions);
    };

    if (isLoading || isProfileLoading) return <div className="p-8">Cargando...</div>;

    return (
        <div className="w-full h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 font-sans overflow-y-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Gestión de Disponibilidad</h1>
                    <p className="text-gray-500 mt-1">Configura tus horarios de atención y días no laborables.</p>
                </div>
                {isAdmin && professionals.length > 0 && (
                    <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-2xl px-4 py-2.5 shadow-xs">
                        <User size={18} className="text-[#0A58CA]" />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Profesional:</span>
                        <select
                            value={activeProfId || ''}
                            onChange={(e) => setSelectedProfId(Number(e.target.value))}
                            className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold text-gray-900 outline-none focus:border-[#0A58CA] cursor-pointer"
                        >
                            {professionals.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name || p.email} {p.id === currentUser?.id ? '(Tú)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Column: Settings */}
                <div className="w-full lg:w-[450px] flex flex-col gap-6">

                    {/* Horarios Regulares */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[#0A58CA] font-bold text-lg mb-2">
                            <Clock size={20} strokeWidth={2.5} />
                            <h2>Horarios Regulares</h2>
                        </div>

                        {DAYS.map(day => {
                            const blocks = schedules[day] || [];
                            const isActive = blocks.length > 0;

                            return (
                                <div key={day} className={`border rounded-xl p-4 flex flex-col gap-3 ${isActive ? 'border-[#0A58CA] bg-blue-50/20' : 'border-gray-200 bg-white'}`}>
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 font-bold text-gray-900 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={() => {
                                                    if (isActive) {
                                                        const newScheds = { ...schedules };
                                                        delete newScheds[day];
                                                        setSchedules(newScheds);
                                                    } else {
                                                        handleAddBlock(day);
                                                    }
                                                }}
                                                className="w-4 h-4 text-[#0A58CA] rounded border-gray-300 focus:ring-[#0A58CA]"
                                            />
                                            {day} {!isActive && <span className="text-gray-400 font-medium text-sm">(No laborable)</span>}
                                        </label>
                                        <button onClick={() => handleAddBlock(day)} className="text-[#0A58CA] hover:bg-blue-100 p-1 rounded transition-colors" title="Añadir bloque horario">
                                            <Plus size={18} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    {isActive && blocks.map((block, index) => (
                                        <div key={index} className="flex items-center gap-2 mt-2">
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center shadow-sm">
                                                <input
                                                    type="time"
                                                    value={block.start_time}
                                                    onChange={(e) => handleTimeChange(day, index, 'start_time', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none"
                                                />
                                            </div>
                                            <span className="text-gray-400 font-bold">-</span>
                                            <div className="flex-1 bg-white border border-gray-200 rounded-lg flex items-center shadow-sm">
                                                <input
                                                    type="time"
                                                    value={block.end_time}
                                                    onChange={(e) => handleTimeChange(day, index, 'end_time', e.target.value)}
                                                    className="w-full px-3 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none"
                                                />
                                            </div>
                                            <div className="bg-white border border-gray-200 rounded-lg flex items-center shadow-sm px-2 ml-2">
                                                <input
                                                    type="number"
                                                    min="5"
                                                    step="5"
                                                    value={block.session_duration || 30}
                                                    onChange={(e) => handleTimeChange(day, index, 'session_duration', parseInt(e.target.value) || 30)}
                                                    className="w-12 py-1.5 text-sm font-semibold text-gray-700 bg-transparent outline-none text-center"
                                                    title="Duración de sesión en minutos"
                                                />
                                                <span className="text-xs font-bold text-gray-400 mr-1">min</span>
                                            </div>
                                            <button onClick={() => handleRemoveBlock(day, index)} className="text-red-400 hover:text-red-600 p-1">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}

                    </div>

                    {/* Tarifa de Sesión */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-[#0A58CA] font-bold text-lg mb-2">
                            <DollarSign size={20} strokeWidth={2.5} />
                            <h2>Tarifa de Sesión</h2>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Monto de Reserva ($)</label>
                            <input 
                                type="number" 
                                value={sessionFee} 
                                onChange={(e) => setSessionFee(e.target.value)} 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#0A58CA] font-semibold text-gray-800"
                                placeholder="0"
                                min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Este es el monto que se le cobrará al paciente para reservar el turno.</p>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                            <input 
                                type="checkbox" 
                                id="requirePayment"
                                checked={requirePayment} 
                                onChange={(e) => setRequirePayment(e.target.checked)} 
                                className="w-4 h-4 text-[#0A58CA] rounded border-gray-300 focus:ring-[#0A58CA] cursor-pointer"
                            />
                            <label htmlFor="requirePayment" className="text-sm font-semibold text-gray-700 cursor-pointer">
                                Cobro obligatorio para reservar turno
                            </label>
                        </div>

                        {/* MercadoPago Integration */}
                        <div className="flex flex-col gap-3 mt-4 border-t pt-4">
                            <label className="text-sm font-semibold text-gray-700">Integración con MercadoPago</label>
                            
                            {mpAccessToken ? (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
                                    <p className="text-green-700 font-bold flex items-center gap-2">
                                        <CheckCircle size={18} />
                                        Cuenta Vinculada Exitosamente
                                    </p>
                                    <p className="text-sm text-green-600">
                                        Los pacientes podrán pagar directamente por MercadoPago y el dinero ingresará a tu cuenta.
                                    </p>
                                    <button 
                                        onClick={() => setShowDisconnectModal(true)}
                                        className="text-red-500 text-sm font-semibold text-left w-fit mt-2 hover:underline"
                                    >
                                        Desvincular cuenta
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-4">
                                    <p className="text-[#0a47d4] font-semibold text-sm">
                                        Para recibir pagos automáticamente de tus turnos, vincula tu cuenta de MercadoPago.
                                    </p>
                                    
                                    {mpAuthUrl ? (
                                        <>
                                            <div className="bg-white p-3 rounded-xl border shadow-sm">
                                                <QRCodeSVG value={mpAuthUrl} size={150} />
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Escanea este código con tu celular (cámara o app MercadoPago) para iniciar sesión.
                                            </p>
                                            
                                            <span className="text-xs font-bold text-gray-400">O bien</span>
                                            
                                            <a 
                                                href={mpAuthUrl}
                                                className="bg-[#009EE3] text-white px-5 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2 hover:bg-[#0089C9] transition-colors"
                                            >
                                                Conectar desde esta PC <ExternalLink size={16} />
                                            </a>
                                        </>
                                    ) : (
                                        <Loader2 className="animate-spin text-[#0a47d4]" size={24} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isUpdatingProfile}
                        className="w-full bg-[#0A58CA] hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isSaving || isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                {/* Right Column: Information/Preview */}
                <div className="flex-1 flex flex-col gap-6">

                    {/* Botón y Módulo de Días No Disponibles */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <CalendarX size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">
                                    Días No Laborables / Excepciones
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {exceptions.length > 0 
                                        ? `${exceptions.length} ${exceptions.length === 1 ? 'fecha no disponible configurada' : 'fechas no disponibles configuradas'}` 
                                        : 'Determina qué días específicos el profesional no debe aparecer disponible.'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowExceptionsModal(true)}
                            className="bg-[#0A58CA] hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
                        >
                            <CalendarX size={16} /> Configurar Días No Disponibles
                        </button>
                    </div>

                    {/* ¿Cómo funciona? */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                        <h3 className="text-blue-800 font-bold text-lg mb-2">¿Cómo funciona?</h3>
                        <p className="text-blue-600 text-sm mb-4 leading-relaxed">
                            Al guardar tu disponibilidad, los pacientes solo podrán ver y reservar turnos en los bloques horarios que definas aquí. Si un paciente reserva un turno en tu horario laboral, automáticamente ese espacio quedará ocupado y ya no se mostrará como disponible para otros pacientes.
                        </p>
                        <ul className="text-sm text-blue-700 list-disc pl-5 flex flex-col gap-2">
                            <li>Puedes agregar múltiples bloques de horas (ej. mañana y tarde).</li>
                            <li>Ajusta la duración (en minutos) de cada sesión para que los turnos se generen con ese intervalo exacto.</li>
                            <li>Si un día está desmarcado, nadie podrá reservar en ese día.</li>
                        </ul>
                    </div>
                    
                    <WhatsAppSettings />
                </div>

            </div>

            {/* Modal: Configurar Días No Disponibles */}
            {showExceptionsModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                                    <CalendarX size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base text-gray-900">Días No Disponibles</h3>
                                    <p className="text-xs text-gray-500">Selecciona en el calendario uno o varios días para bloquearlos.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowExceptionsModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex flex-col gap-5 overflow-y-auto flex-1">
                            {/* Selector de Fechas con Calendario Interactivo Multi-selección */}
                            <div className="bg-[#F8FAFC] border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                            Seleccionar Días a Bloquear
                                        </h4>
                                        <p className="text-[11px] text-gray-500">
                                            Haz clic directamente en cualquier día para bloquearlo (se marcará en rojo). Haz clic nuevamente para desbloquearlo.
                                        </p>
                                    </div>

                                    {/* Month Navigation */}
                                    <div className="flex items-center gap-1 self-start sm:self-auto bg-white border border-gray-200 rounded-xl p-1 shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                                            className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                                            title="Mes anterior"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-xs font-bold text-gray-800 px-2 min-w-[120px] text-center select-none">
                                            {monthNames[calendarViewDate.getMonth()]} {calendarViewDate.getFullYear()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                                            className="p-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                                            title="Mes siguiente"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Calendar Grid */}
                                <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-col gap-1.5">
                                    {/* Weekdays */}
                                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 mb-1 select-none">
                                        <div>Lu</div>
                                        <div>Ma</div>
                                        <div>Mi</div>
                                        <div>Ju</div>
                                        <div>Vi</div>
                                        <div>Sá</div>
                                        <div className="text-rose-500">Do</div>
                                    </div>

                                    {/* Day Buttons */}
                                    <div className="grid grid-cols-7 gap-1 text-center">
                                        {generateCalendarDays(calendarViewDate).map((day, idx) => {
                                            const isBlocked = exceptions.some(e => e.exception_date === day.dateStr);
                                            const todayStr = new Date().toISOString().slice(0, 10);
                                            const isToday = day.dateStr === todayStr;

                                            let dayStyle = 'bg-white border-gray-200 text-gray-700 hover:bg-rose-50 hover:border-rose-300';
                                            if (isBlocked) {
                                                dayStyle = 'bg-rose-50 border-rose-500 text-rose-700 font-bold hover:bg-rose-100 shadow-xs ring-2 ring-rose-200';
                                            } else if (!day.isCurrentMonth) {
                                                dayStyle = 'bg-gray-50/50 border-transparent text-gray-300 opacity-50 hover:opacity-100 hover:bg-gray-100';
                                            }

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleCalendarDate(day.dateStr)}
                                                    className={`h-9 w-full rounded-lg border text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${dayStyle}`}
                                                    title={isBlocked ? `Bloqueado: ${day.dateStr} (clic para desbloquear)` : `Disponible: ${day.dateStr} (clic para bloquear)`}
                                                >
                                                    {day.dayNumber}
                                                    {isToday && !isBlocked && (
                                                        <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#1D68F2]"></span>
                                                    )}
                                                    {isBlocked && (
                                                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-600"></span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between text-[11px] text-gray-500 font-medium px-1 gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded border border-gray-200 bg-white"></span>
                                            <span>Disponible (clic para bloquear)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-3 rounded bg-rose-50 border border-rose-500 ring-1 ring-rose-200"></span>
                                            <span className="text-rose-700 font-bold">Bloqueado / No disponible (clic para habilitar)</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Motivo y Botón de Aplicar Bloqueo */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1">
                                    <div className="flex-1">
                                        <label className="text-xs font-semibold text-gray-700 mb-1 block">
                                            Motivo del Bloqueo (Opcional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Vacaciones, Feriado, Congreso"
                                            value={newExceptionTitle}
                                            onChange={(e) => setNewExceptionTitle(e.target.value)}
                                            className="w-full px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl bg-white outline-none focus:border-[#0A58CA]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {selectedCalendarDates.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCalendarDates([])}
                                                className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                            >
                                                Limpiar
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleBlockSelectedDates}
                                            disabled={selectedCalendarDates.length === 0}
                                            className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                                        >
                                            <Plus size={16} /> Bloquear {selectedCalendarDates.length > 0 ? `${selectedCalendarDates.length} Día(s)` : 'Días Seleccionados'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Listado de fechas bloqueadas */}
                            <div className="flex flex-col gap-2">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Fechas Bloqueadas ({exceptions.length})
                                </h4>

                                {exceptions.length === 0 ? (
                                    <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center text-xs text-gray-400">
                                        No hay fechas bloqueadas. El profesional atenderá en todos los días habilitados en Horarios Regulares.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto pr-1">
                                        {exceptions.map((exc, index) => (
                                            <div
                                                key={index}
                                                className="border border-gray-200 bg-white rounded-xl p-3 flex items-center justify-between shadow-2xs hover:border-gray-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                                        <CalendarX size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900">
                                                            {exc.exception_date}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 font-medium">
                                                            {exc.exception_title || 'No disponible'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveException(index)}
                                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Eliminar bloqueo"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer del Modal */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowExceptionsModal(false)}
                                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    await handleSave();
                                    setShowExceptionsModal(false);
                                }}
                                disabled={isSaving || isUpdatingProfile}
                                className="px-5 py-2 text-xs font-bold bg-[#0A58CA] hover:bg-blue-700 text-white rounded-xl shadow-xs disabled:opacity-50"
                            >
                                {isSaving ? 'Guardando...' : 'Guardar y Aplicar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Disconnect MercadoPago Confirmation Modal */}
            {showDisconnectModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Desvincular Cuenta</h2>
                        <p className="text-center text-gray-500 mb-6">
                            ¿Seguro que deseas desvincular tu cuenta de MercadoPago? Dejarás de recibir pagos automáticamente a través de la plataforma.
                        </p>
                        
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setShowDisconnectModal(false)}
                                className="flex-1 px-5 py-2.5 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => {
                                    updateProfile({ mp_access_token: null, mp_refresh_token: null, mp_user_id: null })
                                    .unwrap().then(() => {
                                        setMpAccessToken('');
                                        setShowDisconnectModal(false);
                                    });
                                }}
                                className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Sí, desvincular
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvailabilityManager;

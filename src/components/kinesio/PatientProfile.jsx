import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    useGetPatientsQuery, 
    useGetAppointmentsQuery, 
    useGetMedicalHistoryQuery 
} from '../../services/api/kinesioApi.js';
import { 
    ArrowLeft, User, Phone, Mail, Droplet, Activity, 
    Calendar, Clock, FileText, ChevronRight, Stethoscope 
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

dayjs.locale('es');

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clinica');

    const { data: patients, isLoading: isLoadingPatients } = useGetPatientsQuery();
    const { data: allAppointments, isLoading: isLoadingAppointments } = useGetAppointmentsQuery({ patient_id: id });
    const { data: medicalHistory, isLoading: isLoadingHistory } = useGetMedicalHistoryQuery(id);

    const patient = useMemo(() => {
        if (!patients || !id) return null;
        return patients.find(p => p.id === parseInt(id));
    }, [patients, id]);

    const patientAppointments = useMemo(() => {
        if (!allAppointments) return [];
        return [...allAppointments].sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
    }, [allAppointments]);

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        const diff = Date.now() - new Date(dob).getTime();
        return Math.abs(new Date(diff).getUTCFullYear() - 1970);
    };

    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    if (isLoadingPatients) return <div className="p-8 text-center text-gray-500">Cargando perfil del paciente...</div>;
    if (!patient) return <div className="p-8 text-center text-red-500">Paciente no encontrado.</div>;

    return (
        <div className="w-full min-h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 font-sans">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2.5 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#111827]">Perfil del Paciente</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestión completa de información y registros.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left Column: General Info */}
                <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-6 sticky top-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-3xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 mb-4 shadow-sm">
                            {getInitials(patient.nombre)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{patient.nombre}</h2>
                        <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            {patient.status || 'Activo'}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Datos Personales</h3>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><User size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">DNI</p>
                                <p className="font-semibold">{patient.dni || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><Calendar size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Edad y Género</p>
                                <p className="font-semibold">{calculateAge(patient.fecha_nacimiento)} años • {patient.gender || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-400 shrink-0"><Droplet size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Grupo Sanguíneo</p>
                                <p className="font-semibold text-red-600">{patient.blood_type || 'No especificado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contacto</h3>
                        
                        <div className="flex items-center gap-3 text-sm text-gray-700">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><Phone size={16} /></div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Teléfono</p>
                                <p className="font-semibold">{patient.datos_contacto?.phone || 'No registrado'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-700 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0"><Mail size={16} /></div>
                            <div className="truncate">
                                <p className="text-xs text-gray-500 font-medium">Email</p>
                                <p className="font-semibold truncate">{patient.datos_contacto?.email || 'No registrado'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Equipo Médico</h3>
                        
                        {patient.professionals && patient.professionals.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {patient.professionals.map(prof => (
                                    <div key={prof.id} className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs">
                                            {getInitials(prof.name)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{prof.name}</p>
                                            <p className="text-xs text-gray-500">{prof.specialty || 'Kinesiólogo'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No hay profesionales asignados.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Tabs & Content */}
                <div className="w-full lg:w-2/3 flex flex-col gap-4">
                    {/* Tabs Navigation */}
                    <div className="flex bg-white rounded-xl border border-gray-100 p-1.5 shadow-sm w-full md:w-fit">
                        <button 
                            onClick={() => setActiveTab('clinica')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'clinica' ? 'bg-[#0A58CA] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Historia Clínica
                        </button>
                        <button 
                            onClick={() => setActiveTab('turnos')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'turnos' ? 'bg-[#0A58CA] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Historial de Turnos
                        </button>
                    </div>

                    {/* Tab Content: Turnos */}
                    {activeTab === 'turnos' && (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
                            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20} /></div>
                                <h3 className="font-bold text-gray-900 text-lg">Turnos Registrados ({patientAppointments.length})</h3>
                            </div>
                            
                            <div className="flex flex-col divide-y divide-gray-100">
                                {isLoadingAppointments ? (
                                    <div className="p-8 text-center text-gray-500 text-sm font-medium">Cargando turnos...</div>
                                ) : patientAppointments.length === 0 ? (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                                            <Calendar size={32} />
                                        </div>
                                        <p className="text-gray-500 font-medium">Este paciente aún no tiene turnos registrados.</p>
                                    </div>
                                ) : (
                                    patientAppointments.map(appt => {
                                        const date = dayjs(appt.fecha_hora);
                                        const isPast = date.isBefore(dayjs());
                                        return (
                                            <div key={appt.id} className="p-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border shrink-0 ${isPast ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                                                        <span className="text-xs font-bold uppercase">{date.format('MMM')}</span>
                                                        <span className="text-lg font-black leading-none">{date.format('DD')}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-gray-900">{date.format('dddd, DD MMMM YYYY')}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${appt.estado === 'completado' ? 'bg-green-100 text-green-700' : appt.estado === 'cancelado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {appt.estado || 'Pendiente'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                                                                <Clock size={14} /> {date.format('HH:mm')} hs
                                                            </span>
                                                            {appt.motivo && (
                                                                <span className="text-sm text-gray-500 flex items-center gap-1.5 border-l border-gray-200 pl-4">
                                                                    <Stethoscope size={14} /> {appt.motivo}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Historia Clinica */}
                    {activeTab === 'clinica' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col p-8 text-center items-center justify-center min-h-[400px]">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                <FileText size={32} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-xl mb-2">Historia Clínica</h3>
                            <p className="text-gray-500 mb-6 max-w-sm">
                                Aquí podrás visualizar y agregar registros médicos, evoluciones y archivos adjuntos del paciente.
                            </p>
                            <button onClick={() => navigate(`/historial/${patient.id}`)} className="bg-[#0A58CA] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm">
                                Ir al Editor de Historia Clínica
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PatientProfile;

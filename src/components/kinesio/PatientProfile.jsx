import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MedicalHistoryLayout from './MedicalHistoryLayout';
import CompletedCyclesList from './CompletedCyclesList';
import FichaMedicaView from './FichaMedicaView';
import PatientRoadmap from './PatientRoadmap';
import {
    useGetPatientsQuery,
    useGetAppointmentsQuery,
    useGetMedicalHistoryQuery,
    useGetMedicalRecordsQuery,
    useUpdatePatientMutation
} from '../../services/api/kinesioApi.js';
import {
    ArrowLeft, User, Phone, Mail, Droplet, Activity,
    Calendar, Clock, FileText, ChevronRight, Stethoscope,
    CheckCircle2, ShieldPlus as Shield, ClipboardList, Image as ImageIcon,
    Plus, History, Loader2, ChevronDown, ChevronUp, ExternalLink, Pencil, Share2, X
} from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import SharePatientModal from './SharePatientModal.jsx';

dayjs.locale('es');

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('clinica');
    const [showPreviousInProfile, setShowPreviousInProfile] = useState(false);
    const [selectedConsultationId, setSelectedConsultationId] = useState(null);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({});

    const [updatePatient, { isLoading: isUpdatingPatient }] = useUpdatePatientMutation();

    const { data: patients, isLoading: isLoadingPatients } = useGetPatientsQuery();
    const { data: allAppointments, isLoading: isLoadingAppointments } = useGetAppointmentsQuery({ patient_id: id });
    const { data: historyList = [], isLoading: isLoadingHistory } = useGetMedicalHistoryQuery(id, { skip: !id });
    const { data: records = [], isLoading: isLoadingRecords } = useGetMedicalRecordsQuery(id, { skip: !id });

    const patient = useMemo(() => {
        if (!patients || !id) return null;
        return patients.find(p => p.id === parseInt(id));
    }, [patients, id]);

    const patientAppointments = useMemo(() => {
        if (!allAppointments) return [];
        return [...allAppointments].sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora));
    }, [allAppointments]);

    const allConsultations = useMemo(() => {
        const list = [];

        // Process dynamic medical records
        if (records && records.length > 0) {
            records.forEach(r => {
                let templateFields = [];
                try {
                    templateFields = typeof r.template_snapshot === 'string'
                        ? JSON.parse(r.template_snapshot)
                        : (r.template_snapshot || []);
                } catch (e) { }

                let recordData = {};
                try {
                    recordData = typeof r.record_data === 'string'
                        ? JSON.parse(r.record_data)
                        : (r.record_data || {});
                } catch (e) { }

                list.push({
                    id: `dynamic-${r.id}`,
                    date: new Date(r.createdAt || r.updatedAt),
                    type: 'dynamic',
                    raw: r,
                    template_name: r.template_name,
                    professional_name: r.professional_name,
                    status: r.status,
                    signature_timestamp: r.signature_timestamp,
                    fields: templateFields,
                    data: recordData
                });
            });
        }

        // Process static medical history entries
        if (historyList && historyList.length > 0) {
            historyList.forEach(h => {
                list.push({
                    id: `static-${h.id}`,
                    date: new Date(h.createdAt || h.created_at || h.fecha),
                    type: 'static',
                    raw: h,
                    reason_for_visit: h.reason_for_visit,
                    blood_pressure: h.blood_pressure,
                    heart_rate: h.heart_rate,
                    physical_findings: h.physical_findings,
                    diagnostico: h.diagnostico,
                    tratamiento: h.tratamiento,
                    archivos_adjuntos: h.archivos_adjuntos || []
                });
            });
        }

        // Sort descending (newest first)
        list.sort((a, b) => b.date.getTime() - a.date.getTime());
        return list;
    }, [records, historyList]);

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
            <div className="flex items-center justify-between flex-wrap gap-4">
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
                <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-2"
                    title="Compartir o enviar ficha e historial médico a otro profesional"
                >
                    <Share2 size={16} /> Compartir Ficha / Historial
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">

                {/* Left Column: Ficha Médica */}
                <div className="w-full lg:w-1/2 bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-6">
                    <div className="flex justify-between items-center mb-2 border-b border-gray-200 pb-4">
                        <h2 className="text-xl font-serif text-gray-900">Ficha Médica del Paciente</h2>
                        <button className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg bg-gray-50" onClick={() => window.print()}>
                            Imprimir Ficha
                        </button>
                    </div>
                    <FichaMedicaView 
                        patient={patient} 
                        legacyHistory={allConsultations} 
                        onUpdatePatient={(data) => updatePatient({ id: patient.id, ...data })}
                    />
                </div>

                {/* Right Column: Tabs & Content */}
                <div className="w-full lg:w-1/2 flex flex-col gap-4">
                    
                    <PatientRoadmap 
                        currentStage={patient.admissionData?.roadmapStage || 0}
                        roadmapNotes={patient.admissionData?.roadmapNotes || {}}
                        onCompleteStage={(newStage, notesUpdate) => {
                            updatePatient({ 
                                id: patient.id, 
                                admissionData: { 
                                    ...(patient.admissionData || {}), 
                                    roadmapStage: newStage,
                                    roadmapNotes: {
                                        ...(patient.admissionData?.roadmapNotes || {}),
                                        ...notesUpdate
                                    }
                                } 
                            });
                        }}
                        onFinishCycle={() => {
                            const currentNotes = patient.admissionData?.roadmapNotes || {};
                            let startDate = 'Desconocida';
                            let endDate = dayjs().format('DD/MM/YYYY HH:mm');
                            if (currentNotes[0] && currentNotes[0].date) {
                                startDate = dayjs(currentNotes[0].date).format('DD/MM/YYYY');
                            }

                            const newCycle = {
                                id: Date.now(),
                                startDate,
                                endDate,
                                closedAt: dayjs().format(),
                                notes: currentNotes,
                                previousStage: patient.admissionData?.roadmapStage || 0
                            };

                            const existingCycles = patient.admissionData?.completedCycles || [];

                            updatePatient({ 
                                id: patient.id, 
                                admissionData: { 
                                    ...(patient.admissionData || {}), 
                                    roadmapStage: 0,
                                    roadmapNotes: {},
                                    completedCycles: [newCycle, ...existingCycles]
                                } 
                            });
                        }}
                    />

                    <div className="flex bg-white rounded-xl border border-gray-100 p-1.5 shadow-sm w-full md:w-fit overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('clinica')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'clinica' ? 'bg-[#0A58CA] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Inicio y Datos
                        </button>
                        <button
                            onClick={() => setActiveTab('turnos')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'turnos' ? 'bg-[#0A58CA] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Historial de Turnos ({patientAppointments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('ciclos')}
                            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'ciclos' ? 'bg-[#0A58CA] text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                        >
                            Ciclos Terminados ({patient.admissionData?.completedCycles?.length || 0})
                        </button>
                    </div>

                    {/* Tab Content: Turnos */}
                    {activeTab === 'turnos' && (
                        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20} /></div>
                                    <h3 className="font-bold text-gray-900 text-lg">Turnos Registrados ({patientAppointments.length})</h3>
                                </div>
                                <span className="text-xs text-gray-500 font-medium">Selecciona un turno para destacar</span>
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
                                        const isSelected = selectedAppointmentId === appt.id;

                                        return (
                                            <div
                                                key={appt.id}
                                                onClick={() => setSelectedAppointmentId(isSelected ? null : appt.id)}
                                                className={`p-5 transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-blue-50/80 border-l-4 border-l-[#0A58CA]' : 'hover:bg-gray-50/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border shrink-0 ${isSelected ? 'bg-[#0A58CA] text-white border-[#0A58CA]' : isPast ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-blue-50 border-blue-100 text-blue-700'
                                                        }`}>
                                                        <span className="text-xs font-bold uppercase">{date.format('MMM')}</span>
                                                        <span className="text-lg font-black leading-none">{date.format('DD')}</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-gray-900">{date.format('dddd, DD MMMM YYYY')}</h4>
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${appt.estado === 'completado' ? 'bg-green-100 text-green-700' : appt.estado === 'cancelado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                                                }`}>
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
                                                <ChevronRight size={18} className={`transition-transform ${isSelected ? 'text-[#0A58CA] translate-x-1' : 'text-gray-300'}`} />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tab Content: Inicio y Datos (antes Historia Clinica) */}
                    {activeTab === 'clinica' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
                           <MedicalHistoryLayout patient={patient} legacyHistory={allConsultations} />
                        </div>
                    )}

                    {/* Tab Content: Ciclos Terminados */}
                    {activeTab === 'ciclos' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 min-h-[500px]">
                            {patient.admissionData?.completedCycles?.length > 0 ? (
                                <CompletedCyclesList 
                                    cycles={patient.admissionData.completedCycles} 
                                    onUndo={(cycleId) => {
                                        const cycles = patient.admissionData.completedCycles || [];
                                        const cycleToRestore = cycles.find(c => c.id === cycleId);
                                        const remainingCycles = cycles.filter(c => c.id !== cycleId);
                                        if (cycleToRestore) {
                                            updatePatient({
                                                id: patient.id,
                                                admissionData: {
                                                    ...(patient.admissionData || {}),
                                                    roadmapStage: cycleToRestore.previousStage || 12,
                                                    roadmapNotes: cycleToRestore.notes || {},
                                                    completedCycles: remainingCycles
                                                }
                                            });
                                        }
                                    }}
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 bg-green-50 text-green-300 rounded-full flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-check"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="m9 15 2 2 4-4"/></svg>
                                    </div>
                                    <p className="text-gray-500 font-medium text-center max-w-sm">Este paciente aún no ha completado ningún ciclo de tratamiento de 3 meses.</p>
                                </div>
                            )}
                        </div>
                    )}



                </div>
            </div>

            {/* Share Patient Modal */}
            <SharePatientModal
                patient={patient}
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
            />

            {/* Edit Patient Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-900">Editar Información del Paciente</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={editFormData.nombre}
                                        onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">DNI</label>
                                    <input
                                        type="text"
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={editFormData.dni}
                                        onChange={(e) => setEditFormData({ ...editFormData, dni: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Fecha Nacimiento</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={editFormData.fecha_nacimiento}
                                        onChange={(e) => setEditFormData({ ...editFormData, fecha_nacimiento: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Género</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={editFormData.gender}
                                        onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Grupo Sanguíneo</label>
                                    <select
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={editFormData.blood_type}
                                        onChange={(e) => setEditFormData({ ...editFormData, blood_type: e.target.value })}
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="A+">A+</option><option value="A-">A-</option>
                                        <option value="B+">B+</option><option value="B-">B-</option>
                                        <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                        <option value="O+">O+</option><option value="O-">O-</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teléfono</label>
                                    <input
                                        type="tel"
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-5 py-2.5 rounded-lg text-gray-600 font-bold hover:bg-gray-200 transition-colors text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                disabled={isUpdatingPatient || !editFormData.nombre.trim()}
                                onClick={async () => {
                                    try {
                                        await updatePatient({
                                            id: patient.id,
                                            nombre: editFormData.nombre,
                                            dni: editFormData.dni,
                                            fecha_nacimiento: editFormData.fecha_nacimiento || null,
                                            gender: editFormData.gender,
                                            blood_type: editFormData.blood_type,
                                            datos_contacto: {
                                                phone: editFormData.phone,
                                                telefono: editFormData.phone,
                                                email: editFormData.email
                                            }
                                        }).unwrap();
                                        setIsEditModalOpen(false);
                                    } catch (e) {
                                        console.error(e);
                                    }
                                }}
                                className="px-5 py-2.5 rounded-lg bg-[#0A58CA] hover:bg-blue-700 text-white font-bold transition-colors shadow-sm text-sm disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdatingPatient ? <Loader2 size={16} className="animate-spin" /> : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientProfile;

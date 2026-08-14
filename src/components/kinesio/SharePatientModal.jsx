import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetProfessionalsQuery, useSharePatientMutation } from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast.tsx';
import { X, Share2, Send, CheckCircle2, User, Shield, Briefcase, Loader2, Check } from 'lucide-react';

const SharePatientModal = ({ patient, isOpen, onClose }) => {
    const currentUser = useSelector(state => state.authSlice.userInfo);
    const { data: professionalsResponse, isLoading: isLoadingProfs } = useGetProfessionalsQuery(undefined, { skip: !isOpen });
    const [sharePatient, { isLoading: isSharing }] = useSharePatientMutation();
    
    const [selectedProfIds, setSelectedProfIds] = useState([]);
    const [note, setNote] = useState('');

    const professionals = professionalsResponse?.data || [];

    // Pre-populate or reset selected professionals when modal opens or patient changes
    useEffect(() => {
        if (patient && isOpen) {
            setSelectedProfIds([]);
            setNote('');
        }
    }, [patient, isOpen]);

    if (!isOpen || !patient) return null;

    const existingAssignedIds = (patient.professionals || []).map(p => p.id);

    const toggleProfSelection = (profId) => {
        if (existingAssignedIds.includes(profId)) return; // Already assigned
        setSelectedProfIds(prev => 
            prev.includes(profId) ? prev.filter(id => id !== profId) : [...prev, profId]
        );
    };

    const handleShareSubmit = async (e) => {
        e.preventDefault();
        if (selectedProfIds.length === 0) {
            toast({
                title: 'Selección requerida',
                description: 'Por favor, selecciona al menos un profesional con quien compartir.',
                variant: 'error'
            });
            return;
        }

        try {
            await sharePatient({
                id: patient.id,
                targetProfessionalIds: selectedProfIds,
                message: note
            }).unwrap();

            const targetNames = professionals
                .filter(p => selectedProfIds.includes(p.id))
                .map(p => p.name || p.email)
                .join(', ');

            toast({
                title: '¡Ficha Compartida!',
                description: `Se ha enviado la ficha e historial clínico de ${patient.nombre} a: ${targetNames}`,
                variant: 'success'
            });
            onClose();
        } catch (err) {
            console.error(err);
            toast({
                title: 'Error',
                description: err?.data?.error || 'No se pudo compartir la información del paciente.',
                variant: 'error'
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#F8FAFC]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0A58CA] flex items-center justify-center font-bold">
                            <Share2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Compartir Paciente e Historial</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Envía la ficha clínica completa a otro profesional del equipo.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Patient Summary Card */}
                <div className="p-6 pb-2 overflow-y-auto flex flex-col gap-5">
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#0A58CA] text-white flex items-center justify-center font-bold text-lg shrink-0">
                            {patient.nombre ? patient.nombre.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-base">{patient.nombre}</h3>
                            <p className="text-xs text-gray-600 font-medium truncate mt-0.5">
                                DNI: {patient.dni || 'Sin DNI'} • Tel: {patient.datos_contacto?.phone || 'No registrado'}
                            </p>
                            <span className="inline-block text-[11px] font-semibold text-blue-700 mt-1 bg-blue-100/80 px-2 py-0.5 rounded">
                                Incluye datos personales y todo el historial médico
                            </span>
                        </div>
                    </div>

                    {/* Professionals Selector */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            Seleccionar Profesional(es) Destinatario(s)
                        </label>

                        {isLoadingProfs ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="animate-spin text-[#0A58CA]" size={24} />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto border border-gray-200 rounded-xl p-2 bg-gray-50/50">
                                {professionals
                                    .filter(p => p.id !== currentUser?.id) // exclude logged-in user if preferred, or keep all
                                    .map(prof => {
                                        const isAlreadyAssigned = existingAssignedIds.includes(prof.id);
                                        const isSelected = selectedProfIds.includes(prof.id);

                                        return (
                                            <div 
                                                key={prof.id}
                                                onClick={() => toggleProfSelection(prof.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                                                    isAlreadyAssigned 
                                                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-blue-50 border-[#0A58CA] ring-1 ring-[#0A58CA]/20'
                                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        isSelected ? 'bg-[#0A58CA] text-white' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {prof.profile_picture ? (
                                                            <img src={prof.profile_picture} alt={prof.name} className="w-full h-full rounded-full object-cover"/>
                                                        ) : (
                                                            (prof.name || prof.email).charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">{prof.name || 'Sin Nombre'}</p>
                                                        <p className="text-xs text-gray-500 font-medium">
                                                            {prof.email} • {(prof.specialty && prof.specialty.length > 0) ? prof.specialty.join(', ') : 'Kinesiología'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    {isAlreadyAssigned ? (
                                                        <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
                                                            <CheckCircle2 size={12}/> Ya asignado
                                                        </span>
                                                    ) : isSelected ? (
                                                        <div className="w-6 h-6 rounded-full bg-[#0A58CA] text-white flex items-center justify-center">
                                                            <Check size={14} />
                                                        </div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                                {professionals.length <= 1 && (
                                    <p className="p-4 text-center text-xs text-gray-400">
                                        No hay otros profesionales disponibles en el sistema para compartir.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Note / Interconsulta message */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                            Nota o motivo de transferencia (Opcional)
                        </label>
                        <textarea
                            rows="2"
                            placeholder="Ej. Interconsulta por lesión de hombro, te adjunto las últimas evoluciones."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 shrink-0">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button"
                        onClick={handleShareSubmit}
                        disabled={isSharing || selectedProfIds.length === 0}
                        className="flex-1 py-2.5 bg-[#0A58CA] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isSharing ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Send size={16} />
                        )}
                        Compartir Ficha
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePatientModal;

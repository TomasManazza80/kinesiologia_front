import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetPatientsQuery } from '../../services/api/kinesioApi.js';
import { Activity, Stethoscope, Droplet, User, History, Mic, ShieldPlus as Shield, ClipboardList, Save, Plus, ArrowLeft } from 'lucide-react';

const MedicalHistoryEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patients, isLoading } = useGetPatientsQuery();

  const patient = useMemo(() => {
    if (!patients || !id) return null;
    return patients.find(p => p.id === parseInt(id));
  }, [patients, id]);

  const calculateAge = (dob) => {
      if (!dob) return 'N/A';
      const diff = Date.now() - new Date(dob).getTime();
      return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const getInitials = (name) => {
      if (!name) return '??';
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (isLoading) return <div className="p-8 text-gray-500">Cargando paciente...</div>;

  if (id && !patient) return <div className="p-8 text-red-500">Paciente no encontrado.</div>;
  return (
    <div className="w-full h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Historia Clínica</h1>
          <p className="text-gray-500 mt-1">Registra notas clínicas detalladas y resultados de exámenes.</p>
        </div>
      </div>

      {/* Patient Summary Card */}
      {patient ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl bg-[#EDE9FE] text-[#6D28D9]">
                {getInitials(patient.nombre)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{patient.nombre}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1.5"><User size={14} /> {calculateAge(patient.fecha_nacimiento)} años</span>
                <span className="flex items-center gap-1.5"><Droplet size={14} /> {patient.blood_type || 'N/A'}</span>
                <span className="flex items-center gap-1.5"><User size={14} /> {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}</span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <History size={16} /> Registros Previos
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-gray-500 text-sm">
            Seleccione un paciente de la lista de turnos o pacientes para ver y editar su historia clínica.
        </div>
      )}

      {/* Reason for Visit Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-[#0A58CA]">
            <Stethoscope size={20} strokeWidth={2.5} />
            <h3 className="text-lg font-bold text-gray-900">Motivo de la Consulta</h3>
          </div>
          <button className="text-[#0A58CA] hover:bg-blue-50 p-2 rounded-full transition-colors">
            <Mic size={20} />
          </button>
        </div>
        <textarea 
          className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
          placeholder="Ingrese los síntomas principales del paciente y su duración..."
        ></textarea>
      </div>

      {/* Physical Examination Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-[#0A58CA] mb-5">
          <Activity size={20} strokeWidth={2.5} />
          <h3 className="text-lg font-bold text-gray-900">Examen Físico</h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Presión Arterial</label>
            <input 
              type="text" 
              className="w-full bg-[#F1F5F9] border-transparent rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA]"
              placeholder="ej. 120/80 mmHg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 mb-1.5">Frecuencia Cardíaca</label>
            <input 
              type="text" 
              className="w-full bg-[#F1F5F9] border-transparent rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA]"
              placeholder="ej. 72 lpm"
            />
          </div>
        </div>

        <textarea 
          className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
          placeholder="Hallazgos físicos detallados..."
        ></textarea>
      </div>

      {/* Diagnosis & Treatment Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Diagnosis Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#0A58CA] mb-4">
            <Shield size={20} strokeWidth={2.5} />
            <h3 className="text-lg font-bold text-gray-900">Diagnóstico</h3>
          </div>
          <textarea 
            className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
            placeholder="Diagnósticos principales y secundarios..."
          ></textarea>
        </div>

        {/* Treatment Plan Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#0A58CA] mb-4">
            <ClipboardList size={20} strokeWidth={2.5} />
            <h3 className="text-lg font-bold text-gray-900">Plan de Tratamiento</h3>
          </div>
          <textarea 
            className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
            placeholder="Medicamentos, procedimientos y recomendaciones..."
          ></textarea>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-2 pb-8">
        <button className="flex items-center gap-2 text-[#0A58CA] bg-white border-2 border-[#0A58CA] hover:bg-blue-50 px-5 py-2.5 rounded-full font-bold text-sm transition-colors shadow-sm">
          <Plus size={18} strokeWidth={3} /> Agregar Sección
        </button>
        <button className="flex items-center gap-2 bg-[#0A58CA] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-colors shadow-md">
          <Save size={18} strokeWidth={2.5} /> Guardar Registro
        </button>
      </div>

    </div>
  );
};

export default MedicalHistoryEntry;

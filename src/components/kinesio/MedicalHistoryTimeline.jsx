import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    useGetPatientsQuery,
    useGetMedicalHistoryQuery,
    useCreateMedicalHistoryMutation,
    useUploadImageMutation
} from '../../services/api/kinesioApi.js';
import { Activity, Stethoscope, Droplet, User, History, Mic, ShieldPlus as Shield, ClipboardList, Save, Plus, ArrowLeft, Image as ImageIcon, Loader2, X, Camera, Settings, Search } from 'lucide-react';
import { toast } from '../ui/use-toast.tsx';
import moment from 'moment';
import TemplateBuilder from './TemplateBuilder.jsx';
import SpeechToTextButton from '../ui/SpeechToTextButton.jsx';
import PatientEvolutionTimeline from './PatientEvolutionTimeline.jsx';

const MedicalHistoryEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: patients, isLoading: isLoadingPatients } = useGetPatientsQuery();
  const { data: historyList = [], isLoading: isLoadingHistory, refetch } = useGetMedicalHistoryQuery(id, { skip: !id });
  const [createMedicalHistory, { isLoading: isSaving }] = useCreateMedicalHistoryMutation();
  const [uploadImage] = useUploadImageMutation();

  const [formData, setFormData] = useState({
    reason_for_visit: '',
    blood_pressure: '',
    heart_rate: '',
    physical_findings: '',
    diagnostico: '',
    tratamiento: '',
    archivos_adjuntos: []
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [viewMode, setViewMode] = useState('history'); // 'history', 'new', 'template'
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpeechInput = (name, text) => {
      setFormData(prev => ({ ...prev, [name]: prev[name] ? prev[name] + ' ' + text : text }));
  };

  const handleImageUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      setIsUploadingImage(true);
      try {
          const uploadedUrls = [];
          for (let file of files) {
              const data = new FormData();
              data.append('image', file);
              const result = await uploadImage(data).unwrap();
              if (result.success) {
                  uploadedUrls.push(result.url);
              } else {
                  throw new Error(result.message);
              }
          }
          setFormData(prev => ({
              ...prev,
              archivos_adjuntos: [...(prev.archivos_adjuntos || []), ...uploadedUrls]
          }));
          toast({ title: 'Éxito', description: 'Imágenes subidas correctamente.', variant: 'success' });
      } catch (error) {
          console.error(error);
          toast({ title: 'Error', description: 'No se pudieron subir las imágenes.', variant: 'error' });
      } finally {
          setIsUploadingImage(false);
      }
  };

  const removeImage = (indexToRemove) => {
      setFormData(prev => ({
          ...prev,
          archivos_adjuntos: prev.archivos_adjuntos.filter((_, idx) => idx !== indexToRemove)
      }));
  };

  const handleSave = async () => {
      if (!id) return;
      try {
          await createMedicalHistory({
              patient_id: parseInt(id),
              ...formData
          }).unwrap();
          toast({ title: 'Guardado', description: 'Registro guardado correctamente.', variant: 'success' });
          refetch();
          setFormData({
              reason_for_visit: '',
              blood_pressure: '',
              heart_rate: '',
              physical_findings: '',
              diagnostico: '',
              tratamiento: '',
              archivos_adjuntos: []
          });
          setViewMode('history');
      } catch (err) {
          toast({ title: 'Error', description: 'Ocurrió un error al guardar.', variant: 'error' });
      }
  };

  if (isLoadingPatients) return <div className="p-8 text-gray-500 flex justify-center"><Loader2 className="animate-spin text-[#0A58CA]" size={32} /></div>;

  if (id && !patient) return <div className="p-8 text-red-500">Paciente no encontrado.</div>;
  
  return (
    <div className="w-full h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
              <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Historia Clínica</h1>
            <p className="text-gray-500 mt-1">Gestión de historiales, evoluciones y plantillas.</p>
          </div>
        </div>
        <button 
            onClick={() => setViewMode(viewMode === 'template' ? (id ? 'history' : 'search') : 'template')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              viewMode === 'template' 
                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
        >
          <Settings size={18} className={viewMode === 'template' ? "text-purple-600" : "text-gray-500"} /> 
          {viewMode === 'template' ? 'Volver a Historiales' : 'Constructor de Plantillas'}
        </button>
      </div>

      {viewMode === 'template' ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Settings className="text-purple-600" /> Constructor de Plantillas Clínicas
              </h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <TemplateBuilder />
              </div>
          </div>
      ) : (
        <>
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
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setViewMode(viewMode === 'history' ? 'new' : 'history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${viewMode === 'history' ? 'bg-[#0A58CA] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <History size={16} /> {viewMode === 'history' ? 'Nueva Consulta' : 'Registros Previos'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Buscar Paciente</h2>
                    <p className="text-gray-500 mt-2">Busque un paciente por nombre o DNI para acceder a su historial médico.</p>
                </div>
                
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre, apellido o DNI..."
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-12 p-4 transition-all outline-none"
                    />
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {patients && patients.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (p.dni && p.dni.includes(searchTerm))).map(p => (
                        <div 
                            key={p.id}
                            onClick={() => navigate(`/historial/${p.id}`)}
                            className="flex items-center gap-4 p-4 hover:bg-blue-50 rounded-xl cursor-pointer border border-transparent hover:border-blue-100 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                                {getInitials(p.nombre)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 group-hover:text-blue-700">{p.nombre}</h4>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                    <span>DNI: {p.dni || 'No registrado'}</span>
                                    <span>•</span>
                                    <span>{calculateAge(p.fecha_nacimiento)} años</span>
                                </p>
                            </div>
                        </div>
                    ))}
                    {patients && patients.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || (p.dni && p.dni.includes(searchTerm))).length === 0 && (
                        <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                            No se encontraron pacientes que coincidan con su búsqueda.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {patient && viewMode === 'history' ? (
          <div className="flex flex-col gap-6">
              
              {/* New Dynamic Records Timeline */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <History className="text-[#0A58CA]" /> Historial de Evolución
                  </h3>
                  <PatientEvolutionTimeline patientId={patient.id} />
              </div>

              {/* Old Static Records */}
              {isLoadingHistory ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#0A58CA]" size={32} /></div>
              ) : historyList.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center text-gray-500">
                      No hay registros previos para este paciente.
                  </div>
              ) : (
                  historyList.map((entry, index) => (
                      <div key={entry.id || index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                          <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
                              <div>
                                  <h3 className="font-bold text-lg text-gray-900">Consulta {moment(entry.fecha).format('DD/MM/YYYY')}</h3>
                                  <p className="text-sm text-gray-500">Motivo: {entry.reason_for_visit || 'No especificado'}</p>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-1"><Activity size={16} className="text-[#0A58CA]"/> Signos Vitales</h4>
                                  <p className="text-sm text-gray-600">PA: {entry.blood_pressure || '-'} | FC: {entry.heart_rate || '-'}</p>
                              </div>
                              <div>
                                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-1"><Shield size={16} className="text-[#0A58CA]"/> Diagnóstico</h4>
                                  <p className="text-sm text-gray-600">{entry.diagnostico || 'No especificado'}</p>
                              </div>
                          </div>
                          
                          <div className="mb-4">
                              <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-1"><ClipboardList size={16} className="text-[#0A58CA]"/> Plan de Tratamiento</h4>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-100">{entry.tratamiento || 'No especificado'}</p>
                          </div>
                          
                          {entry.archivos_adjuntos && entry.archivos_adjuntos.length > 0 && (
                              <div>
                                  <h4 className="text-sm font-bold text-gray-700 flex items-center gap-1.5 mb-2"><ImageIcon size={16} className="text-[#0A58CA]"/> Archivos Adjuntos</h4>
                                  <div className="flex gap-3 flex-wrap">
                                      {entry.archivos_adjuntos.map((url, i) => (
                                          <a key={i} href={url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-xl border border-gray-200">
                                              <img src={url} alt={`Adjunto ${i}`} className="w-24 h-24 object-cover transition-transform group-hover:scale-110" />
                                          </a>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  ))
              )}
          </div>
      ) : patient && viewMode === 'new' ? (
          <>
              {/* Reason for Visit Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-[#0A58CA]">
                    <Stethoscope size={20} strokeWidth={2.5} />
                    <h3 className="text-lg font-bold text-gray-900">Motivo de la Consulta</h3>
                  </div>
                  <SpeechToTextButton onTranscript={(text) => handleSpeechInput('reason_for_visit', text)} />
                </div>
                <textarea 
                  name="reason_for_visit"
                  value={formData.reason_for_visit}
                  onChange={handleInputChange}
                  className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                  placeholder="Ingrese los síntomas principales del paciente y su duración..."
                ></textarea>
              </div>

              {/* Physical Examination Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2 text-[#0A58CA]">
                    <Activity size={20} strokeWidth={2.5} />
                    <h3 className="text-lg font-bold text-gray-900">Examen Físico</h3>
                  </div>
                  <SpeechToTextButton onTranscript={(text) => handleSpeechInput('physical_findings', text)} />
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Presión Arterial</label>
                    <input 
                      type="text" 
                      name="blood_pressure"
                      value={formData.blood_pressure}
                      onChange={handleInputChange}
                      className="w-full bg-[#F1F5F9] border-transparent rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA]"
                      placeholder="ej. 120/80 mmHg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Frecuencia Cardíaca</label>
                    <input 
                      type="text" 
                      name="heart_rate"
                      value={formData.heart_rate}
                      onChange={handleInputChange}
                      className="w-full bg-[#F1F5F9] border-transparent rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA]"
                      placeholder="ej. 72 lpm"
                    />
                  </div>
                </div>

                <textarea 
                  name="physical_findings"
                  value={formData.physical_findings}
                  onChange={handleInputChange}
                  className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                  placeholder="Hallazgos físicos detallados..."
                ></textarea>
              </div>

              {/* Diagnosis & Treatment Plan Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Diagnosis Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-[#0A58CA]">
                      <Shield size={20} strokeWidth={2.5} />
                      <h3 className="text-lg font-bold text-gray-900">Diagnóstico</h3>
                    </div>
                    <SpeechToTextButton onTranscript={(text) => handleSpeechInput('diagnostico', text)} />
                  </div>
                  <textarea 
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleInputChange}
                    className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                    placeholder="Diagnósticos principales y secundarios..."
                  ></textarea>
                </div>

                {/* Treatment Plan Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-[#0A58CA]">
                      <ClipboardList size={20} strokeWidth={2.5} />
                      <h3 className="text-lg font-bold text-gray-900">Plan de Tratamiento</h3>
                    </div>
                    <SpeechToTextButton onTranscript={(text) => handleSpeechInput('tratamiento', text)} />
                  </div>
                  <textarea 
                    name="tratamiento"
                    value={formData.tratamiento}
                    onChange={handleInputChange}
                    className="w-full bg-[#F1F5F9] border-transparent rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0A58CA] resize-none h-32"
                    placeholder="Medicamentos, procedimientos y recomendaciones..."
                  ></textarea>
                </div>

              </div>
              
              {/* Image Attachments Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-[#0A58CA] mb-4">
                      <ImageIcon size={20} strokeWidth={2.5} />
                      <h3 className="text-lg font-bold text-gray-900">Archivos Adjuntos (Imágenes/Fotos)</h3>
                  </div>
                  <div className="flex flex-wrap gap-4">
                      {formData.archivos_adjuntos.map((url, idx) => (
                          <div key={idx} className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                              <img src={url} alt={`Adjunto ${idx}`} className="w-full h-full object-cover" />
                              <button 
                                  onClick={() => removeImage(idx)}
                                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                              >
                                  <X size={14} strokeWidth={3} />
                              </button>
                          </div>
                      ))}
                      <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-[#0A58CA] transition-colors text-gray-500 hover:text-[#0A58CA]">
                          {isUploadingImage ? <Loader2 className="animate-spin mb-2" size={24} /> : <Camera size={24} className="mb-2" />}
                          <span className="text-xs font-semibold text-center px-2">{isUploadingImage ? 'Subiendo...' : 'Añadir Fotos'}</span>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                      </label>
                  </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end items-center mt-2 pb-8">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#0A58CA] hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm transition-colors shadow-md disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} strokeWidth={2.5} />} 
                  Guardar Registro
                </button>
              </div>
          </>
      ) : null}
      
        </>
      )}

    </div>
  );
};

export default MedicalHistoryEntry;

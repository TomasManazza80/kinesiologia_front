import React, { useState } from 'react';
import { CheckCircle2, ChevronRight, ChevronLeft, Save, Edit3, Printer } from 'lucide-react';
import { toast } from '../ui/use-toast';
import { useUpdatePatientMutation } from '../../services/api/kinesioApi';

const steps = [
  { id: 1, title: 'Demografía y Sociales' },
  { id: 2, title: 'Antecedentes y Terapias' },
  { id: 3, title: 'Síntomas y Examen Físico' },
  { id: 4, title: 'Plan y Derivaciones' },
];

const AdmissionForm = ({ patient }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(patient?.admissionData || {});
  const [isViewMode, setIsViewMode] = useState(!!patient?.admissionData?.consultation_reasons);
  const [updatePatient, { isLoading: isSaving }] = useUpdatePatientMutation();

  React.useEffect(() => {
    if (patient?.admissionData) {
      setFormData(prev => ({ ...prev, ...patient.admissionData }));
    }
  }, [patient?.admissionData]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  
  const handleSave = async () => {
    try {
      await updatePatient({
        id: patient.id,
        admissionData: {
          ...(patient.admissionData || {}),
          ...formData
        }
      }).unwrap();
      
      toast({
        title: "Ingreso Guardado",
        description: "El formulario de ingreso se ha guardado exitosamente.",
        variant: "default",
      });
      setIsViewMode(true);
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "Ocurrió un error al intentar guardar el ingreso.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isViewMode) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8 animate-in fade-in duration-300">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-2xl font-serif text-gray-900">Ficha de Ingreso</h3>
          <div className="flex items-center gap-3 print:hidden">
            <button 
              onClick={() => setIsViewMode(false)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" /> Editar
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors bg-gray-50"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-6 text-sm text-gray-800">
          {/* Section 1 */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs border-b border-gray-100 pb-1">Demografía y Sociales</h4>
            <div><span className="text-gray-500 text-xs uppercase block">Lugar de Nacimiento</span> {formData.birth_place || '-'}</div>
            <div><span className="text-gray-500 text-xs uppercase block">Residencia</span> {formData.residence || '-'}</div>
            <div><span className="text-gray-500 text-xs uppercase block">Ocupación</span> {formData.occupation || '-'}</div>
            <div><span className="text-gray-500 text-xs uppercase block">Canal Captación</span> {formData.acquisition_channel || '-'}</div>
            <div><span className="text-gray-500 text-xs uppercase block">Otras Actividades</span> <p className="bg-gray-50 p-2 rounded mt-1">{formData.other_activities || '-'}</p></div>
          </div>

          {/* Section 2 */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs border-b border-gray-100 pb-1">Antecedentes y Terapias</h4>
            <div><span className="text-gray-500 text-xs uppercase block">Historial Médico</span> <p className="bg-gray-50 p-2 rounded mt-1">{formData.medical_history_notes || '-'}</p></div>
            <div><span className="text-gray-500 text-xs uppercase block">Terapia Psicológica</span> <p className="bg-gray-50 p-2 rounded mt-1">{formData.psychological_therapy || '-'}</p></div>
            <div><span className="text-gray-500 text-xs uppercase block">Medicación Actual</span> <p className="bg-gray-50 p-2 rounded mt-1">{formData.current_medication || '-'}</p></div>
          </div>

          {/* Section 3 */}
          <div className="col-span-2 space-y-4">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs border-b border-gray-100 pb-1">Síntomas y Examen Físico</h4>
            <div><span className="text-gray-500 text-xs uppercase block">Motivo de Consulta</span> <p className="bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">{formData.consultation_reasons || '-'}</p></div>
            <div><span className="text-gray-500 text-xs uppercase block">Problema Mayor Disconfort</span> <p className="bg-gray-50 p-2 rounded mt-1">{formData.main_discomfort || '-'}</p></div>
            <div><span className="text-gray-500 text-xs uppercase block">Examen Físico</span> <p className="bg-gray-50 p-2 rounded mt-1 whitespace-pre-wrap">{formData.physical_exam || '-'}</p></div>
          </div>

          {/* Section 4 */}
          <div className="col-span-2 space-y-4">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs border-b border-gray-100 pb-1">Plan y Derivaciones</h4>
            <div><span className="text-gray-500 text-xs uppercase block">Plan de Abordaje</span> <p className="bg-blue-50/50 border border-blue-100 p-3 rounded mt-1 whitespace-pre-wrap">{formData.step_by_step_plan || '-'}</p></div>
            <div><span className="text-gray-500 text-xs uppercase block">Próxima Derivación</span> <span className="font-medium text-blue-700">{formData.next_referral || '-'}</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[600px] animate-in fade-in duration-300">
      {/* Stepper Header */}
      <div className="bg-gray-50/50 border-b border-gray-100 p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium transition-colors
                    ${currentStep === step.id ? 'bg-blue-600 text-white shadow-md' : 
                      currentStep > step.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                >
                  {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>
                <span className={`text-xs font-medium ${currentStep === step.id ? 'text-blue-700' : 'text-gray-500'}`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 h-px mx-4 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content - Bento UI Style */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Demografía y Sociales</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Lugar de Nacimiento</label>
                  <input type="text" name="birth_place" value={formData.birth_place || ''} onChange={handleInputChange} 
                         className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Lugar de Residencia</label>
                  <input type="text" name="residence" value={formData.residence || ''} onChange={handleInputChange}
                         className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Actividad Laboral Actual</label>
                  <input type="text" name="occupation" value={formData.occupation || ''} onChange={handleInputChange}
                         className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Canal de Captación</label>
                  <select name="acquisition_channel" value={formData.acquisition_channel || ''} onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none text-sm bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="redes">Redes Sociales</option>
                    <option value="radial">Propaganda Radial</option>
                    <option value="recomendacion">Recomendación</option>
                    <option value="derivacion">Derivación Médica</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Otras Actividades (Yoga, Pilates, etc.)</label>
                <textarea name="other_activities" value={formData.other_activities || ''} onChange={handleInputChange} rows={3}
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none text-sm resize-none" />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Antecedentes y Terapias</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Enfermedades / Tratamientos Previos</label>
                  <textarea name="medical_history_notes" value={formData.medical_history_notes || ''} onChange={handleInputChange} rows={2}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Terapia Psicológica (Motivo, tiempo, profesional)</label>
                  <textarea name="psychological_therapy" value={formData.psychological_therapy || ''} onChange={handleInputChange} rows={2}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Medicación Actual / Psicofármacos</label>
                  <textarea name="current_medication" value={formData.current_medication || ''} onChange={handleInputChange} rows={2}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Síntomas y Examen Físico</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Motivo de Consulta (Registro Corto/Mediano/Largo Plazo)</label>
                  <textarea name="consultation_reasons" value={formData.consultation_reasons || ''} onChange={handleInputChange} rows={3} placeholder="Ingrese hasta 4 síntomas..."
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Problema de Salud de Mayor Disconfort</label>
                  <input type="text" name="main_discomfort" value={formData.main_discomfort || ''} onChange={handleInputChange}
                         className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Examen Físico / Otros malestares</label>
                  <textarea name="physical_exam" value={formData.physical_exam || ''} onChange={handleInputChange} rows={3}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Plan y Derivaciones</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Plan de Abordaje Paso a Paso</label>
                  <textarea name="step_by_step_plan" value={formData.step_by_step_plan || ''} onChange={handleInputChange} rows={4}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 outline-none resize-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Derivación al próximo profesional</label>
                  <select name="next_referral" value={formData.next_referral || ''} onChange={handleInputChange}
                          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 outline-none bg-white">
                    <option value="">Seleccionar Profesional...</option>
                    <option value="indiana">Indiana</option>
                    <option value="silvana">Silvana</option>
                    <option value="gimena">Gimena</option>
                    <option value="vero">Vero</option>
                  </select>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex justify-between">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
            ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        {currentStep < steps.length ? (
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
          >
            Siguiente <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Guardando...' : 'Finalizar Ingreso'}
          </button>
        )}
      </div>

    </div>
  );
};

export default AdmissionForm;

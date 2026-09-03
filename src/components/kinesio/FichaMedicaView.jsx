import React, { useState, useEffect, useRef } from 'react';
import dayjs from 'moment';
import { toast } from '../ui/use-toast';
import { Paperclip, Loader2, X, File, Image as ImageIcon } from 'lucide-react';
import { useUploadImageMutation } from '../../services/api/kinesioApi';

const EditableField = ({ value, onSave, isTextArea = false, type = "text" }) => {
  const [currentValue, setCurrentValue] = useState(value || '');
  const [isSaved, setIsSaved] = useState(true);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    // Para type=date, formateamos el valor si existe a YYYY-MM-DD
    if (type === 'date' && value) {
      setCurrentValue(dayjs(value).format('YYYY-MM-DD'));
    } else {
      setCurrentValue(value || '');
    }
  }, [value, type]);

  const handleChange = (e) => {
    setCurrentValue(e.target.value);
    setIsSaved(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onSave(e.target.value);
      setIsSaved(true);
      toast({
        title: "Guardado automático",
        description: "Los cambios han sido guardados.",
        duration: 2000,
      });
    }, 1500);
  };

  const handleBlur = (e) => {
    if (!isSaved) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onSave(e.target.value);
      setIsSaved(true);
      toast({
        title: "Guardado automático",
        description: "Los cambios han sido guardados.",
        duration: 2000,
      });
    }
  };

  const baseStyles = "w-full bg-transparent border-transparent hover:bg-gray-50 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded outline-none p-1 transition-all text-sm";

  if (isTextArea) {
    return (
      <textarea
        className={`${baseStyles} resize-none min-h-[3rem] h-full`}
        value={currentValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Click para añadir..."
      />
    );
  }

  if (type === 'date') {
    return (
      <div className="relative flex items-center w-full">
        <input
          type="date"
          className={`${baseStyles} cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100`}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onClick={(e) => {
            try {
              if (e.target.showPicker) {
                e.target.showPicker();
              }
            } catch (err) {
              // Ignore if not supported
            }
          }}
        />
      </div>
    );
  }

  return (
    <input
      type={type}
      className={baseStyles}
      value={currentValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="Click para añadir..."
    />
  );
};

const FichaMedicaView = ({ patient, legacyHistory, onUpdatePatient }) => {
  const [localData, setLocalData] = useState({
    nombre: patient?.nombre || '',
    fecha_nacimiento: patient?.fecha_nacimiento || '',
    dni: patient?.dni || '',
    phone: patient?.datos_contacto?.phone || patient?.datos_contacto?.telefono || '',
    birth_place: patient?.admissionData?.birth_place || '',
    residence: patient?.admissionData?.residence || '',
    occupation: patient?.admissionData?.occupation || '',
    acquisition_channel: patient?.admissionData?.acquisition_channel || '',
    other_activities: patient?.admissionData?.other_activities || '',
    medical_history_notes: patient?.admissionData?.medical_history_notes || '',
    psychological_therapy: patient?.admissionData?.psychological_therapy || '',
    current_medication: patient?.admissionData?.current_medication || '',
    consultation_reasons: patient?.admissionData?.consultation_reasons || '',
    main_discomfort: patient?.admissionData?.main_discomfort || '',
    physical_exam: patient?.admissionData?.physical_exam || '',
    step_by_step_plan: patient?.admissionData?.step_by_step_plan || '',
    next_referral: patient?.admissionData?.next_referral || ''
  });

  useEffect(() => {
    if (patient) {
      setLocalData({
        nombre: patient.nombre || '',
        fecha_nacimiento: patient.fecha_nacimiento || '',
        dni: patient.dni || '',
        phone: patient.datos_contacto?.phone || patient.datos_contacto?.telefono || '',
        birth_place: patient.admissionData?.birth_place || '',
        residence: patient.admissionData?.residence || '',
        occupation: patient.admissionData?.occupation || '',
        acquisition_channel: patient.admissionData?.acquisition_channel || '',
        other_activities: patient.admissionData?.other_activities || '',
        medical_history_notes: patient.admissionData?.medical_history_notes || '',
        psychological_therapy: patient.admissionData?.psychological_therapy || '',
        current_medication: patient.admissionData?.current_medication || '',
        consultation_reasons: patient.admissionData?.consultation_reasons || '',
        main_discomfort: patient.admissionData?.main_discomfort || '',
        physical_exam: patient.admissionData?.physical_exam || '',
        step_by_step_plan: patient.admissionData?.step_by_step_plan || '',
        next_referral: patient.admissionData?.next_referral || ''
      });
    }
  }, [patient]);

  const updateField = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    
    if (onUpdatePatient) {
      onUpdatePatient({
        ...(field === 'nombre' && { nombre: value }),
        ...(field === 'dni' && { dni: value }),
        ...(field === 'fecha_nacimiento' && { fecha_nacimiento: value }),
        ...(field === 'phone' && { datos_contacto: { ...(patient?.datos_contacto || {}), phone: value, telefono: value } }),
        ...(!['nombre', 'dni', 'fecha_nacimiento', 'phone'].includes(field) && {
          admissionData: {
            ...(patient?.admissionData || {}),
            ...newData,
            nombre: undefined, dni: undefined, fecha_nacimiento: undefined, phone: undefined
          }
        })
      });
    }
  };

  const [uploadFile, { isLoading: isUploading }] = useUploadImageMutation();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'Error', description: 'El archivo supera el límite de 20MB', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadFile(formData).unwrap();
      if (res.success && res.url) {
        const newFile = {
          name: file.name,
          url: res.url,
          fileId: res.fileId,
          type: file.type
        };
        const currentFiles = patient?.admissionData?.archivos_adjuntos || [];
        
        if (onUpdatePatient) {
          onUpdatePatient({
            admissionData: {
              ...(patient?.admissionData || {}),
              archivos_adjuntos: [...currentFiles, newFile]
            }
          });
        }
        
        toast({ title: 'Éxito', description: 'Archivo subido correctamente' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo subir el archivo', variant: 'destructive' });
    }
  };

  const removeFile = (fileIdToRemove) => {
    const currentFiles = patient?.admissionData?.archivos_adjuntos || [];
    const newFiles = currentFiles.filter(f => f.fileId !== fileIdToRemove);
    
    if (onUpdatePatient) {
      onUpdatePatient({
        admissionData: {
          ...(patient?.admissionData || {}),
          archivos_adjuntos: newFiles
        }
      });
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const age = dayjs().diff(dayjs(dob), 'years');
    return isNaN(age) ? '' : `${age} años`;
  };

  return (
    <div className="bg-white max-w-4xl mx-auto p-8 font-sans">
      
      {/* HEADER */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-normal text-gray-700 tracking-wider">HISTORIA CLÍNICA MÉDICA</h1>
        <div className="h-0.5 w-full bg-gradient-to-r from-pink-200 via-pink-400 to-pink-200 mt-2"></div>
        <p className="text-xs font-bold mt-1 text-gray-800">REGISTRO CLÍNICO PAUSES</p>
      </div>

      <div className="flex justify-end mb-2">
        <table className="border-collapse border border-pink-300 text-xs">
          <tbody>
            <tr>
              <td className="border border-pink-300 bg-pink-100 font-bold px-2 py-1">Fecha de Valoración:</td>
              <td className="border border-pink-300 px-4 py-1 bg-white">{dayjs().format('DD/MM/YYYY')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FICHA DE IDENTIFICACIÓN */}
      <table className="w-full border-collapse border border-pink-300 text-xs mb-6">
        <thead>
          <tr>
            <th colSpan="4" className="bg-pink-200 border border-pink-300 py-1 font-bold text-gray-800">FICHA DE IDENTIFICACIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium w-32 align-top">Nombre</td>
            <td colSpan="3" className="border border-pink-300 px-2 py-1 bg-white align-top">
              <EditableField value={localData.nombre} onSave={(val) => updateField('nombre', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Fecha de Nacimiento</td>
            <td className="border border-pink-300 px-2 py-1 bg-white align-top">
              <EditableField type="date" value={localData.fecha_nacimiento} onSave={(val) => updateField('fecha_nacimiento', val)} />
            </td>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium w-24 align-top">Edad</td>
            <td className="border border-pink-300 px-2 py-1 bg-white align-top">{calculateAge(localData.fecha_nacimiento)}</td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Lugar de Nacimiento</td>
            <td className="border border-pink-300 px-2 py-1 bg-white align-top">
              <EditableField value={localData.birth_place} onSave={(val) => updateField('birth_place', val)} />
            </td>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Ocupación</td>
            <td className="border border-pink-300 px-2 py-1 bg-white align-top">
              <EditableField value={localData.occupation} onSave={(val) => updateField('occupation', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Residencia</td>
            <td className="border border-pink-300 px-2 py-1 bg-white align-top">
              <EditableField value={localData.residence} onSave={(val) => updateField('residence', val)} />
            </td>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">DNI</td>
            <td className="border border-pink-300 px-2 py-1 bg-white align-top">
              <EditableField value={localData.dni} onSave={(val) => updateField('dni', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Teléfono</td>
            <td colSpan="3" className="border border-pink-300 px-2 py-1 bg-white align-top">
              <EditableField value={localData.phone} onSave={(val) => updateField('phone', val)} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ANTECEDENTES Y TERAPIAS */}
      <table className="w-full border-collapse border border-pink-300 text-xs mb-6">
        <thead>
          <tr>
            <th colSpan="2" className="bg-pink-200 border border-pink-300 py-1 font-bold text-gray-800">ANTECEDENTES Y TERAPIAS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium w-48 align-top">Enfermedades / Trats. Previos</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap align-top">
              <EditableField isTextArea value={localData.medical_history_notes} onSave={(val) => updateField('medical_history_notes', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Terapia Psicológica</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap align-top">
              <EditableField isTextArea value={localData.psychological_therapy} onSave={(val) => updateField('psychological_therapy', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Medicación Actual</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap align-top">
              <EditableField isTextArea value={localData.current_medication} onSave={(val) => updateField('current_medication', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Otras Actividades (Yoga, etc)</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap align-top">
              <EditableField isTextArea value={localData.other_activities} onSave={(val) => updateField('other_activities', val)} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* SÍNTOMAS Y EXAMEN FÍSICO */}
      <table className="w-full border-collapse border border-pink-300 text-xs mb-6">
        <thead>
          <tr>
            <th colSpan="2" className="bg-pink-200 border border-pink-300 py-1 font-bold text-gray-800">SÍNTOMAS Y EXAMEN FÍSICO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium w-48 align-top">Motivo de Consulta</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap align-top">
              <EditableField isTextArea value={localData.consultation_reasons} onSave={(val) => updateField('consultation_reasons', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Problema Mayor Disconfort</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap align-top">
              <EditableField isTextArea value={localData.main_discomfort} onSave={(val) => updateField('main_discomfort', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Examen Físico</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap h-16 align-top">
              <EditableField isTextArea value={localData.physical_exam} onSave={(val) => updateField('physical_exam', val)} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* PLAN Y DERIVACIONES */}
      <table className="w-full border-collapse border border-pink-300 text-xs mb-6">
        <thead>
          <tr>
            <th colSpan="2" className="bg-pink-200 border border-pink-300 py-1 font-bold text-gray-800">PLAN DE ABORDAJE Y DERIVACIONES</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium w-48 align-top">Plan Paso a Paso</td>
            <td className="border border-pink-300 px-2 py-1 bg-white whitespace-pre-wrap h-16 align-top">
              <EditableField isTextArea value={localData.step_by_step_plan} onSave={(val) => updateField('step_by_step_plan', val)} />
            </td>
          </tr>
          <tr>
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Próxima Derivación</td>
            <td className="border border-pink-300 px-2 py-1 bg-white font-bold align-top">
              <EditableField value={localData.next_referral} onSave={(val) => updateField('next_referral', val)} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ARCHIVOS ADJUNTOS */}
      <div className="w-full border border-pink-300 text-xs mb-6 print:hidden bg-white">
        <div className="bg-pink-200 border-b border-pink-300 py-1 font-bold text-gray-800 text-center">
          ARCHIVOS ADJUNTOS (Radiografías, Estudios, PDF, etc.)
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">Adjunta cualquier archivo relevante para la historia clínica.</span>
            <label className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 font-bold transition-colors">
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
              {isUploading ? 'Subiendo...' : 'Subir Archivo'}
              <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {patient?.admissionData?.archivos_adjuntos?.length > 0 ? (
              patient.admissionData.archivos_adjuntos.map((file, idx) => (
                <div key={file.fileId || idx} className="flex items-center justify-between border border-gray-200 rounded-lg p-3 bg-gray-50 group hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {file.type?.includes('image') ? <ImageIcon size={20} className="text-blue-500 shrink-0" /> : <File size={20} className="text-red-500 shrink-0" />}
                    <a href={file.url} target="_blank" rel="noreferrer" className="text-gray-800 font-medium hover:text-blue-600 truncate underline-offset-2 hover:underline">
                      {file.name || `Archivo Adjunto ${idx + 1}`}
                    </a>
                  </div>
                  <button onClick={() => removeFile(file.fileId)} className="text-gray-400 hover:text-red-500 p-1 shrink-0" title="Eliminar archivo">
                    <X size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6 text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                No hay archivos adjuntos en esta historia clínica.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default FichaMedicaView;

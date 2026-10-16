import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');
import { toast } from '../ui/use-toast';
import { Paperclip, Loader2, X, File, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useUploadImageMutation, useGetProfessionalsQuery } from '../../services/api/kinesioApi';

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
    const handleInput = (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = e.target.scrollHeight + 'px';
      handleChange(e);
    };

    return (
      <textarea
        ref={(el) => {
          if (el) {
            el.style.height = 'auto';
            el.style.height = el.scrollHeight + 'px';
          }
        }}
        className={`${baseStyles} resize-none min-h-[3rem] overflow-hidden`}
        value={currentValue}
        onChange={handleInput}
        onBlur={handleBlur}
        placeholder="Click para añadir..."
      />
    );
  }

  const [isDateFocused, setIsDateFocused] = useState(false);

  if (type === 'date') {
    const displayValue = isDateFocused 
      ? currentValue 
      : (currentValue ? dayjs(currentValue).format('DD/MM/YYYY') : '');

    return (
      <div className="relative flex items-center w-full">
        <input
          type={isDateFocused ? "date" : "text"}
          className={`${baseStyles} cursor-pointer`}
          value={displayValue}
          onChange={handleChange}
          placeholder="DD/MM/AAAA"
          onFocus={(e) => {
            setIsDateFocused(true);
            setTimeout(() => {
              try {
                if (e.target.showPicker) e.target.showPicker();
              } catch (err) {}
            }, 10);
          }}
          onBlur={(e) => {
            setIsDateFocused(false);
            handleBlur(e);
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
  const { data: professionalsResponse } = useGetProfessionalsQuery();
  const currentUser = useSelector((state) => state.authSlice?.userInfo) || {};
  const currentProfessionalName = (currentUser?.nombre || currentUser?.name || currentUser?.username || '').trim();

  // Filtrar estrictamente profesionales activos y disponibles (rol ADMIN o EMPLOYEE, is_active true)
  const professionalOptions = useMemo(() => {
    const map = new Map();

    const isProfActive = (p) =>
      p &&
      (p.role === 'ADMIN' || p.role === 'EMPLOYEE') &&
      p.is_active !== false &&
      p.is_active !== 0 &&
      p.is_active !== 'false' &&
      p.is_active !== null &&
      p.is_active !== undefined;

    (professionalsResponse?.data || []).forEach(p => {
      if (isProfActive(p)) {
        const name = (p.name || '').trim();
        if (name) {
          map.set(name.toLowerCase(), name);
        }
      }
    });

    if (isProfActive(currentUser)) {
      if (currentProfessionalName) {
        map.set(currentProfessionalName.toLowerCase(), currentProfessionalName);
      }
    }

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
  }, [professionalsResponse, currentUser, currentProfessionalName]);

  const [devoluciones, setDevoluciones] = useState(patient?.admissionData?.devoluciones || []);
  const devolucionesTimeoutRef = useRef({});

  useEffect(() => {
    if (patient?.admissionData?.devoluciones) {
      setDevoluciones(patient.admissionData.devoluciones);
    }
  }, [patient?.admissionData?.devoluciones]);

  const updateDevoluciones = (newDevoluciones) => {
    if (onUpdatePatient) {
      onUpdatePatient({
        admissionData: {
          ...(patient?.admissionData || {}),
          devoluciones: newDevoluciones
        }
      });
    }
  };

  const handleAddDevolucion = () => {
    const defaultProf = professionalOptions.includes(currentProfessionalName)
      ? currentProfessionalName
      : (professionalOptions[0] || '');
    const newEntry = {
      id: Date.now(),
      fecha: dayjs().format('YYYY-MM-DD'),
      profesional: defaultProf,
      devolucion: ''
    };
    const updated = [newEntry, ...devoluciones];
    setDevoluciones(updated);
    updateDevoluciones(updated);
    toast({
      title: "Nueva devolución agregada",
      description: "Puede completar la fecha, profesional y contenido.",
      duration: 2500
    });
  };

  const handleDevolucionChange = (id, field, value) => {
    const updated = devoluciones.map(d => d.id === id ? { ...d, [field]: value } : d);
    setDevoluciones(updated);
    updateDevoluciones(updated);
    toast({
      title: "Devolución actualizada",
      duration: 1500
    });
  };

  const handleDevolucionTextChange = (id, text) => {
    const updated = devoluciones.map(d => d.id === id ? { ...d, devolucion: text } : d);
    setDevoluciones(updated);

    if (devolucionesTimeoutRef.current[id]) {
      clearTimeout(devolucionesTimeoutRef.current[id]);
    }

    devolucionesTimeoutRef.current[id] = setTimeout(() => {
      updateDevoluciones(updated);
      toast({
        title: "Guardado automático",
        description: "Devolución guardada.",
        duration: 1500
      });
    }, 1200);
  };

  const handleDevolucionBlur = () => {
    updateDevoluciones(devoluciones);
  };

  const handleDeleteDevolucion = (idToDelete) => {
    const updated = devoluciones.filter(d => d.id !== idToDelete);
    setDevoluciones(updated);
    updateDevoluciones(updated);
    toast({
      title: "Devolución eliminada",
      duration: 2000
    });
  };

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
    next_referral: patient?.admissionData?.next_referral || '',
    fecha_valoracion: patient?.admissionData?.fecha_valoracion || dayjs().format('YYYY-MM-DD')
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
        next_referral: patient.admissionData?.next_referral || '',
        fecha_valoracion: patient.admissionData?.fecha_valoracion || dayjs().format('YYYY-MM-DD')
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
        ...(field === 'is_pauses' && { 
          is_pauses: Boolean(value),
          admissionData: { ...(patient?.admissionData || {}), ...newData, is_pauses: Boolean(value) }
        }),
        ...(!['nombre', 'dni', 'fecha_nacimiento', 'phone', 'is_pauses'].includes(field) && {
          admissionData: {
            ...(patient?.admissionData || {}),
            ...newData,
            devoluciones: devoluciones,
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
    <div className="bg-white w-full p-2 sm:p-4 md:p-6 font-sans">
      
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
              <td className="border border-pink-300 px-4 py-1 bg-white">
                <EditableField type="date" value={localData.fecha_valoracion} onSave={(val) => updateField('fecha_valoracion', val)} />
              </td>
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
            <td className="border border-pink-300 bg-pink-100 px-2 py-1 font-medium align-top">Tipo de Paciente</td>
            <td colSpan="3" className="border border-pink-300 px-2 py-1 bg-white align-top">
              <div className="flex items-center gap-3">
                <select
                  value={(patient?.is_pauses ?? patient?.admissionData?.is_pauses) ? 'pauses' : 'individual'}
                  onChange={(e) => updateField('is_pauses', e.target.value === 'pauses')}
                  className="bg-transparent border border-gray-200 hover:border-pink-400 focus:bg-white focus:border-pink-500 rounded p-1 text-xs outline-none cursor-pointer font-medium"
                >
                  <option value="individual">Paciente individual</option>
                  <option value="pauses">Paciente de pauses</option>
                </select>
                {(patient?.is_pauses ?? patient?.admissionData?.is_pauses) && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <img src="/images/pausesLogo.png" alt="Pauses" className="h-3.5 w-auto object-contain" />
                    Paciente de Pauses
                  </span>
                )}
              </div>
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

      {/* DEVOLUCIONES */}
      <div className="w-full border border-pink-300 text-xs mb-6 bg-white overflow-hidden rounded-xs">
        <div className="bg-pink-200 border-b border-pink-300 py-1.5 px-3 font-bold text-gray-800 flex items-center justify-between">
          <span className="uppercase tracking-wider">DEVOLUCIONES</span>
          <button
            type="button"
            onClick={handleAddDevolucion}
            className="print:hidden bg-white hover:bg-pink-50 text-pink-700 border border-pink-300 px-2.5 py-1 rounded text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} /> Nueva Devolución
          </button>
        </div>

        {devoluciones && devoluciones.length > 0 ? (
          <div className="divide-y divide-pink-200">
            {devoluciones.map((dev, index) => (
              <div key={dev.id || index} className="p-3 bg-white hover:bg-pink-50/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 bg-pink-50/60 p-2 rounded border border-pink-200">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-700">Fecha:</span>
                      <input
                        type="date"
                        value={dev.fecha ? dayjs(dev.fecha).format('YYYY-MM-DD') : ''}
                        onChange={(e) => handleDevolucionChange(dev.id, 'fecha', e.target.value)}
                        className="bg-white border border-pink-300 rounded px-2 py-0.5 text-xs font-medium text-gray-800 outline-none focus:ring-1 focus:ring-pink-400 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-700">Profesional:</span>
                      <select
                        value={dev.profesional || ''}
                        onChange={(e) => handleDevolucionChange(dev.id, 'profesional', e.target.value)}
                        className="bg-white border border-pink-300 rounded px-2 py-0.5 text-xs font-medium text-gray-800 outline-none focus:ring-1 focus:ring-pink-400 cursor-pointer min-w-[170px]"
                      >
                        <option value="">Seleccione profesional</option>
                        {dev.profesional && !professionalOptions.includes(dev.profesional) && (
                          <option value={dev.profesional}>
                            {dev.profesional}
                          </option>
                        )}
                        {professionalOptions.map((profName) => (
                          <option key={profName} value={profName}>
                            {profName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDevolucion(dev.id)}
                    className="print:hidden text-gray-400 hover:text-red-600 p-1 rounded transition-colors self-end sm:self-auto cursor-pointer"
                    title="Eliminar devolución"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div>
                  <textarea
                    rows={3}
                    value={dev.devolucion || ''}
                    onChange={(e) => handleDevolucionTextChange(dev.id, e.target.value)}
                    onBlur={handleDevolucionBlur}
                    placeholder="Escriba aquí la devolución..."
                    className="w-full bg-transparent border border-pink-200 hover:border-pink-300 focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 rounded outline-none p-2 transition-all text-xs resize-y min-h-[4rem]"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500 bg-pink-50/20">
            <p className="text-xs text-gray-500 mb-2">No hay devoluciones registradas aún en esta historia clínica.</p>
            <button
              type="button"
              onClick={handleAddDevolucion}
              className="print:hidden inline-flex items-center gap-1.5 bg-pink-600 hover:bg-pink-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus size={14} /> Registrar Devolución
            </button>
          </div>
        )}
      </div>

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

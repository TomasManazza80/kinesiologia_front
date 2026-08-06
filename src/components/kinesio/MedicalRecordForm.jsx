import React, { useState } from 'react';
import { useCreateMedicalRecordMutation } from '../../services/api/kinesioApi';
import SpeechToTextButton from '../ui/SpeechToTextButton.jsx';

export default function MedicalRecordForm({ template, patientId, onSaveSuccess, onCancel }) {
  const [formData, setFormData] = useState({});
  const [createRecord, { isLoading: isSaving }] = useCreateMedicalRecordMutation();

  // Parse template snapshot
  let fields = [];
  try {
    fields = typeof template.fields === 'string' ? JSON.parse(template.fields) : template.fields || [];
  } catch (e) {
    console.error("Error parsing template fields", e);
  }

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSpeechInput = (fieldId, text) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: prev[fieldId] ? prev[fieldId] + ' ' + text : text
    }));
  };

  const handleCheckboxChange = (fieldId, option, checked) => {
    setFormData(prev => {
      const current = prev[fieldId] || [];
      if (checked) {
        return { ...prev, [fieldId]: [...current, option] };
      } else {
        return { ...prev, [fieldId]: current.filter(item => item !== option) };
      }
    });
  };

  const saveRecord = async (status) => {
    // Basic validation
    const missingRequired = fields.some(f => f.required && !formData[f.id]);
    if (missingRequired && status === 'signed') {
      alert("Por favor, completa todos los campos obligatorios antes de firmar.");
      return;
    }

    try {
      await createRecord({
        patient_id: patientId,
        template_id: template.id,
        record_data: formData,
        status
      }).unwrap();
      alert(status === 'signed' ? 'Registro firmado y guardado.' : 'Borrador guardado.');
      if (onSaveSuccess) onSaveSuccess();
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error al guardar el registro.');
    }
  };

  const renderField = (field) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'short_text':
        return (
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            />
            <SpeechToTextButton onTranscript={(text) => handleSpeechInput(field.id, text)} />
          </div>
        );
      case 'long_text':
        return (
          <div className="flex gap-2">
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            />
            <SpeechToTextButton onTranscript={(text) => handleSpeechInput(field.id, text)} className="self-start mt-1" />
          </div>
        );
      case 'pain_scale':
        return (
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="10"
              className="w-full"
              value={value || 1}
              onChange={(e) => handleChange(field.id, e.target.value)}
            />
            <span className="font-bold text-red-500 w-8 text-center">{value || 1}</span>
          </div>
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              checked={!!value}
              onChange={(e) => handleChange(field.id, e.target.checked)}
            />
            <span className="text-gray-700">Sí</span>
          </label>
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {(field.options || ['Opción 1', 'Opción 2', 'Opción 3']).map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={(formData[field.id] || []).includes(opt)}
                  onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'anatomical_map':
        return (
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400">
            [Mapa Anatómico - Componente de dibujo pendiente]
          </div>
        );
      default:
        return <p className="text-red-500">Tipo de campo no soportado</p>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{template.name}</h2>
          {template.description && <p className="text-sm text-gray-500 mt-1">{template.description}</p>}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {fields.length === 0 ? (
          <p className="text-gray-500">Esta plantilla no tiene campos definidos.</p>
        ) : (
          fields.map(field => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => saveRecord('draft')}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          Guardar Borrador
        </button>
        <button
          onClick={() => saveRecord('signed')}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          Firmar y Guardar
        </button>
      </div>
    </div>
  );
}

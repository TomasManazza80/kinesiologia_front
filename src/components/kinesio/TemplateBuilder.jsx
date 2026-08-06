import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, Settings, FileText, Type, CheckSquare, List, Image as ImageIcon, Activity } from 'lucide-react';
import { useCreateTemplateMutation } from '../../services/api/kinesioApi';

// Sortable Field Component
function SortableFieldItem({ id, field, removeField }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = (type) => {
    switch (type) {
      case 'short_text': return <Type className="w-5 h-5 text-gray-500" />;
      case 'long_text': return <FileText className="w-5 h-5 text-gray-500" />;
      case 'pain_scale': return <Activity className="w-5 h-5 text-red-500" />;
      case 'checkbox': return <CheckSquare className="w-5 h-5 text-blue-500" />;
      case 'multiselect': return <List className="w-5 h-5 text-green-500" />;
      case 'anatomical_map': return <ImageIcon className="w-5 h-5 text-purple-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 mb-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow group">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical className="w-5 h-5" />
      </button>
      
      <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg">
        {getIcon(field.type)}
      </div>
      
      <div className="flex-grow">
        <h4 className="text-sm font-semibold text-gray-800">{field.label || 'Campo Sin Nombre'}</h4>
        <p className="text-xs text-gray-400 capitalize">{field.type.replace('_', ' ')} • {field.required ? 'Obligatorio' : 'Opcional'}</p>
      </div>

      <button 
        onClick={() => removeField(id)}
        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Eliminar campo"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

export default function TemplateBuilder() {
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [fields, setFields] = useState([]);
  
  const [createTemplate, { isLoading: isSaving }] = useCreateTemplateMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: `Nuevo ${type.replace('_', ' ')}`,
      required: false,
      options: type === 'multiselect' ? ['Opción 1', 'Opción 2'] : []
    };
    setFields([...fields, newField]);
  };

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const saveTemplate = async () => {
    if (!templateName) {
      alert("Por favor ingresa un nombre para la plantilla.");
      return;
    }
    if (fields.length === 0) {
      alert("Agrega al menos un campo a la plantilla.");
      return;
    }

    try {
      await createTemplate({
        name: templateName,
        description: templateDesc,
        fields: fields
      }).unwrap();
      alert('Plantilla guardada exitosamente!');
      setTemplateName('');
      setTemplateDesc('');
      setFields([]);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Hubo un error al guardar la plantilla.');
    }
  };

  const fieldTypes = [
    { type: 'short_text', label: 'Texto Corto', icon: Type, color: 'text-gray-600' },
    { type: 'long_text', label: 'Texto Largo', icon: FileText, color: 'text-gray-600' },
    { type: 'pain_scale', label: 'Escala de Dolor (1-10)', icon: Activity, color: 'text-red-500' },
    { type: 'checkbox', label: 'Casilla de Verificación', icon: CheckSquare, color: 'text-blue-500' },
    { type: 'multiselect', label: 'Selección Múltiple', icon: List, color: 'text-green-500' },
    { type: 'anatomical_map', label: 'Mapa Anatómico (Imagen)', icon: ImageIcon, color: 'text-purple-500' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Constructor de Plantillas Clínicas</h1>
        <p className="text-gray-500 mt-2">Diseña formularios estructurados y flexibles para las historias clínicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar: Toolbox */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Plantilla</label>
                <input 
                  type="text" 
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ej: Evaluación Traumatológica"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  value={templateDesc}
                  onChange={(e) => setTemplateDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Propósito de esta plantilla..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Añadir Campos</h3>
            <div className="grid grid-cols-1 gap-3">
              {fieldTypes.map(({ type, label, icon: Icon, color }) => (
                <button
                  key={type}
                  onClick={() => addField(type)}
                  className="flex items-center gap-3 w-full p-3 text-left bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-100 rounded-xl transition-colors group"
                >
                  <div className={`p-2 bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">{label}</span>
                  <Plus className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Area: Builder Canvas */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Estructura del Formulario</h3>
              <button 
                onClick={saveTemplate}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving ? 'Guardando...' : 'Guardar Plantilla'}
              </button>
            </div>

            <div className="flex-grow">
              {fields.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Settings className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-gray-900 font-medium mb-1">Canvas Vacío</h4>
                  <p className="text-sm text-gray-500 max-w-sm">Haz clic en los campos del panel izquierdo para empezar a construir tu plantilla médica.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={fields} strategy={verticalListSortingStrategy}>
                    {fields.map((field) => (
                      <SortableFieldItem key={field.id} id={field.id} field={field} removeField={removeField} />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

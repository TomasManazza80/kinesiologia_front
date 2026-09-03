import React from 'react';
import { ArrowUpRight, Stethoscope, Zap, ShieldCheck, Plus, Trash2, Heart, Activity, Users, Star } from 'lucide-react';
import EditableElement from '../EditableElement';
import { useLiveEditor } from '../LiveEditorProvider';

const ICONS = ['Stethoscope', 'Zap', 'ShieldCheck', 'Heart', 'Activity', 'Users'];

const renderIcon = (iconName, className) => {
  switch (iconName) {
    case 'Zap': return <Zap className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Stethoscope':
    default:
      return <Stethoscope className={className} />;
  }
};

const ServicesSection = () => {
  const { pageData, isEditing, addArrayItem, removeArrayItem, updateField } = useLiveEditor();

  const handleAddService = () => {
    addArrayItem('services.items', {
      id: Date.now(),
      icon: 'Stethoscope',
      title: 'Nueva Especialidad',
      description: 'Descripción del nuevo servicio.',
      footerText: 'Detalle adicional',
      btnText: 'Agendar',
      isHighlighted: false
    });
  };

  const handleIconClick = (index, currentIcon) => {
    if (!isEditing) return;
    const currentIndex = ICONS.indexOf(currentIcon);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ICONS.length;
    updateField(`services.items.${index}.icon`, ICONS[nextIndex]);
  };

  const toggleHighlight = (index, currentHighlight) => {
    if (!isEditing) return;
    updateField(`services.items.${index}.isHighlighted`, !currentHighlight);
  };

  return (
    <section id="pausas" className="py-20 bg-[#f8fafc] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              <EditableElement tag="span" dataPath="services.badge" />
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              <EditableElement tag="span" dataPath="services.title" />
            </h2>
          </div>
          <a href="#profesionales" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <EditableElement tag="span" dataPath="services.linkText" />
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {pageData.services.items.map((item, index) => {
            const isHighlighted = item.isHighlighted;

            if (isHighlighted) {
              return (
                <div key={item.id} className="relative bg-[#0f2b6e] text-white rounded-3xl p-8 border border-blue-900 shadow-2xl flex flex-col justify-between space-y-6 transform lg:-translate-y-2 group transition-all">
                  {isEditing && (
                    <div className="absolute -top-3 -right-3 flex gap-2 z-10">
                      <button onClick={() => toggleHighlight(index, isHighlighted)} className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 transition-colors" title="Quitar Destacado">
                        <Star className="w-4 h-4 fill-white" />
                      </button>
                      <button onClick={() => removeArrayItem('services.items', index)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div 
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold ${isEditing ? 'cursor-pointer hover:bg-blue-500/40' : ''}`}
                      onClick={() => handleIconClick(index, item.icon)}
                      title={isEditing ? "Click para cambiar ícono" : ""}
                    >
                      {renderIcon(item.icon, "w-3.5 h-3.5 text-blue-300")}
                      <EditableElement tag="span" dataPath={`services.items.${index}.badge`} />
                    </div>
                    <EditableElement tag="h3" dataPath={`services.items.${index}.title`} className="text-2xl font-extrabold text-white" />
                    <EditableElement tag="p" dataPath={`services.items.${index}.description`} className="text-sm text-blue-100 leading-relaxed font-normal" />
                  </div>
                  <div className="pt-4 border-t border-blue-800/80 flex items-center justify-between">
                    <EditableElement tag="span" dataPath={`services.items.${index}.footerText`} className="text-xs text-blue-200 font-semibold" />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5">
                      <EditableElement tag="span" dataPath={`services.items.${index}.btnText`} />
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={item.id} className="relative bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between space-y-6">
                {isEditing && (
                  <div className="absolute -top-3 -right-3 flex gap-2 z-10">
                    <button onClick={() => toggleHighlight(index, isHighlighted)} className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center shadow-lg hover:bg-amber-500 hover:text-white transition-colors" title="Hacer Destacado">
                      <Star className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeArrayItem('services.items', index)} className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="space-y-4">
                  <div 
                    className={`w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center ${isEditing ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                    onClick={() => handleIconClick(index, item.icon)}
                    title={isEditing ? "Click para cambiar ícono" : ""}
                  >
                    {renderIcon(item.icon, "w-6 h-6")}
                  </div>
                  <EditableElement tag="h3" dataPath={`services.items.${index}.title`} className="text-xl font-bold text-slate-900" />
                  <EditableElement tag="p" dataPath={`services.items.${index}.description`} className="text-sm text-slate-600 leading-relaxed font-medium" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <EditableElement tag="span" dataPath={`services.items.${index}.footerText`} className="text-xs font-bold text-slate-400" />
                  <button className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-all">
                    <EditableElement tag="span" dataPath={`services.items.${index}.btnText`} />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add New Card Button - Only visible in edit mode */}
          {isEditing && (
            <div 
              onClick={handleAddService}
              className="bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group min-h-[300px]"
            >
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <p className="text-blue-700 font-bold">Agregar Servicio</p>
              <p className="text-blue-500 text-sm mt-1">Haz clic para añadir una nueva tarjeta</p>
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default ServicesSection;

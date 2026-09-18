import React from 'react';
import { CalendarCheck, Activity, Award, Edit3 } from 'lucide-react';
import EditableElement from '../EditableElement';
import { useLiveEditor } from '../LiveEditorProvider';
import ImageUploader from '../../../ui/ImageUploader';

const IconMap = {
  CalendarCheck,
  Activity,
  Award
};

const renderIcon = (iconName, className) => {
  const IconComp = IconMap[iconName] || CalendarCheck;
  return <IconComp className={className} />;
};

const ProcedureSection = () => {
  const { pageData, isEditing, updateField } = useLiveEditor();

  if (!pageData.procedure) return null;

  return (
    <div id="procedure-section" className="mb-24 pt-8 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block py-1.5 px-4 rounded-full bg-[#13263E]/5 text-[#13263E] text-xs font-bold tracking-widest mb-3 border border-[#13263E]/10">
            <EditableElement tag="span" dataPath="procedure.badge" />
          </span>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            <EditableElement tag="span" dataPath="procedure.title" />
          </h3>
          <p className="text-slate-600 text-base mt-4 font-medium">
            <EditableElement tag="span" dataPath="procedure.subtitle" />
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Línea conectora animada (solo desktop) */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-[#13263E] via-[#B59970] to-emerald-600 opacity-40 z-0 animate-pulse"></div>
          
          {pageData.procedure.items && pageData.procedure.items.map((item, index) => {
            let ringColor = '';
            let borderColorHover = '';
            
            if (index === 0) {
                ringColor = 'bg-[#13263E]';
                borderColorHover = 'hover:border-[#13263E]/30';
            } else if (index === 1) {
                ringColor = 'bg-[#B59970]';
                borderColorHover = 'hover:border-[#B59970]/40';
            } else {
                ringColor = 'bg-emerald-600';
                borderColorHover = 'hover:border-emerald-500/40';
            }
            
            const hoverBgColor = index === 0 ? 'group-hover:bg-[#B59970]' : index === 1 ? 'group-hover:bg-[#13263E]' : 'group-hover:bg-[#B59970]';
            
            return (
              <div 
                  key={item.id || index}
                  className={`bg-white rounded-3xl border border-slate-200 shadow-lg hover:shadow-2xl ${borderColorHover} transition-all duration-300 relative z-10 flex flex-col overflow-hidden group hover:-translate-y-2 hover:scale-[1.02]`}
              >
                  <div className="w-full h-52 relative overflow-hidden group/img">
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-2 border border-white/30 text-white shadow-lg">
                          {renderIcon(item.icon, "w-5 h-5")}
                      </div>
                      
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity p-4 z-20">
                            <div className="w-full max-w-[200px] bg-white rounded-xl p-2">
                                <ImageUploader 
                                    buttonText="Cambiar Foto" 
                                    onUploadSuccess={(data) => {
                                        updateField(`procedure.items.${index}.image`, data.url);
                                    }}
                                />
                            </div>
                        </div>
                      )}
                  </div>
                  <div className="p-8 pt-12 flex flex-col items-center text-center relative flex-1">
                      <div className={`absolute -top-10 w-20 h-20 rounded-full ${ringColor} text-white flex items-center justify-center font-extrabold text-2xl shadow-xl border-4 border-white ${hoverBgColor} transition-colors duration-300`}>
                          <EditableElement tag="span" dataPath={`procedure.items.${index}.badge`} />
                      </div>
                      <h4 className="font-bold text-slate-900 text-xl mb-3">
                        <EditableElement tag="span" dataPath={`procedure.items.${index}.title`} />
                      </h4>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        <EditableElement tag="span" dataPath={`procedure.items.${index}.description`} />
                      </p>
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProcedureSection;

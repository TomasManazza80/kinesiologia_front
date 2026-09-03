import React, { useState } from 'react';
import { Check, Clock, ChevronRight, Activity, X, User, RotateCcw } from 'lucide-react';
import { toast } from '../ui/use-toast';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const PatientRoadmap = ({ currentStage, roadmapNotes = {}, onCompleteStage }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [noteText, setNoteText] = useState('');
  
  // Tratar de obtener al profesional logueado
  const userInfo = useSelector((state) => state.authSlice?.userInfo) || {};
  const currentProfessionalName = userInfo?.nombre || userInfo?.name || userInfo?.username || 'Profesional';

  const totalStages = 12;
  const safeCurrentStage = Math.max(0, Math.min(currentStage || 0, totalStages));

  const handleStageClick = (stageIndex) => {
    if (stageIndex <= safeCurrentStage) {
      setSelectedStage(stageIndex);
      const stageData = roadmapNotes[stageIndex];
      setNoteText(typeof stageData === 'object' && stageData !== null ? (stageData.note || '') : (stageData || ''));
    }
  };

  const handleSaveNoteAndComplete = () => {
    const noteData = {
      note: noteText,
      professional: currentProfessionalName,
      date: dayjs().format()
    };

    if (selectedStage === safeCurrentStage) {
      onCompleteStage(safeCurrentStage + 1, { [selectedStage]: noteData });
      toast({
        title: "¡Instancia Completada!",
        description: `Nota guardada por ${currentProfessionalName}.`,
        duration: 3000,
      });
    } else {
      // Guardar nota pero mantener el profesional original si ya existía (opcional, o sobreescribir con el actual)
      const existingData = typeof roadmapNotes[selectedStage] === 'object' ? roadmapNotes[selectedStage] : {};
      onCompleteStage(safeCurrentStage, { 
        [selectedStage]: {
          ...existingData,
          note: noteText,
          professional: currentProfessionalName, // Actualizamos a quien editó
          date: dayjs().format()
        } 
      });
      toast({
        title: "Nota actualizada",
        description: `Guardado por ${currentProfessionalName}.`,
        duration: 2000,
      });
    }
    setSelectedStage(null);
  };

  const handleUnmarkStage = () => {
    if (selectedStage !== null && selectedStage < safeCurrentStage) {
      // Al desmarcar, retrocedemos el currentStage hasta este punto.
      // Las notas posteriores a este punto deberían limpiarse para ser consistentes, o mantenerse como historial.
      // Vamos a simplemente retroceder el currentStage a 'selectedStage'.
      onCompleteStage(selectedStage, {});
      toast({
        title: "Etapa desmarcada",
        description: `El paciente ha regresado a la instancia ${selectedStage + 1}.`,
        duration: 3000,
      });
      setSelectedStage(null);
    }
  };

  const getStageStatus = (index) => {
    if (index < safeCurrentStage) return 'completed';
    if (index === safeCurrentStage) return 'current';
    return 'upcoming';
  };

  const renderStageNode = (index) => {
    const status = getStageStatus(index);
    const isClickable = status === 'current' || status === 'completed';

    let bgClass = '';
    let borderClass = '';
    let textClass = '';
    let icon = null;

    if (status === 'completed') {
      bgClass = 'bg-green-500 hover:bg-green-600';
      borderClass = 'border-green-500';
      textClass = 'text-white';
      icon = <Check size={16} strokeWidth={3} />;
    } else if (status === 'current') {
      bgClass = 'bg-blue-500 hover:bg-blue-600';
      borderClass = 'border-blue-500 ring-4 ring-blue-100';
      textClass = 'text-white';
      icon = <Activity size={16} />;
    } else {
      bgClass = 'bg-white';
      borderClass = 'border-gray-200';
      textClass = 'text-gray-400';
      icon = <span className="text-xs font-bold">{index + 1}</span>;
    }

    const stageData = roadmapNotes[index];
    const hasNotes = !!stageData;
    const authorName = typeof stageData === 'object' && stageData?.professional ? stageData.professional : null;

    return (
      <div className="relative flex flex-col items-center flex-1" key={index}>
        {index < totalStages - 1 && (
          <div className="absolute top-4 left-[50%] w-full h-[2px] -z-10">
            <div className={`h-full w-full ${status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}`}></div>
          </div>
        )}

        <div className="relative group flex flex-col items-center">
            <button
            onClick={() => handleStageClick(index)}
            disabled={!isClickable}
            title={isClickable ? "Ver/Añadir anotaciones" : `Instancia ${index + 1}`}
            className={`
                relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                ${bgClass} ${borderClass} ${textClass}
                ${isClickable ? 'cursor-pointer transform hover:scale-110 shadow-md' : 'cursor-default'}
            `}
            >
            {icon}
            {hasNotes && status === 'completed' && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 border border-white rounded-full"></span>
            )}
            </button>
            
            {/* Tooltip con autor (solo en desktop) */}
            {authorName && status === 'completed' && (
                <div className="absolute top-10 w-max max-w-[120px] bg-gray-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none text-center">
                    Completado por:<br/>{authorName}
                </div>
            )}
        </div>
        
        <div className={`mt-2 text-[10px] font-bold tracking-wide uppercase text-center ${status === 'current' ? 'text-blue-600' : status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
          {status === 'current' ? 'Actual' : `Inst. ${index + 1}`}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full bg-white border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-blue-500" />
              Hoja de Ruta del Tratamiento
            </h2>
            <p className="text-sm text-gray-500 mt-1">Haz clic en la etapa actual para añadir notas y marcarla como completada. Puedes ver/editar etapas previas.</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-blue-600">{Math.round((safeCurrentStage / totalStages) * 100)}%</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Completado</div>
          </div>
        </div>

        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
          <div className="flex flex-col gap-8">
            <div className="relative">
              <div className="absolute -left-2 top-0 h-full w-1 bg-gradient-to-b from-blue-200 to-indigo-200 rounded-full"></div>
              <div className="pl-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Mes 1: Fase de Ingreso y Estabilización</h3>
                <div className="flex justify-between items-start w-full relative">
                  {[0, 1, 2, 3].map(i => renderStageNode(i))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-2 top-0 h-full w-1 bg-gradient-to-b from-indigo-200 to-purple-200 rounded-full"></div>
              <div className="pl-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Mes 2: Desarrollo y Adaptación</h3>
                <div className="flex justify-between items-start w-full relative">
                  {[4, 5, 6, 7].map(i => renderStageNode(i))}
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-2 top-0 h-full w-1 bg-gradient-to-b from-purple-200 to-pink-200 rounded-full"></div>
              <div className="pl-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Mes 3: Consolidación y Alta</h3>
                <div className="flex justify-between items-start w-full relative">
                  {[8, 9, 10, 11].map(i => renderStageNode(i))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {selectedStage !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Instancia {selectedStage + 1}</h3>
              <button onClick={() => setSelectedStage(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 pb-2">
                {selectedStage < safeCurrentStage && (
                    <div className="mb-4 flex items-center gap-2 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                        <User size={14} /> 
                        Completada por: {
                            (typeof roadmapNotes[selectedStage] === 'object' && roadmapNotes[selectedStage]?.professional) 
                            ? roadmapNotes[selectedStage].professional 
                            : 'No registrado'
                        }
                    </div>
                )}
              <label className="block text-sm font-bold text-gray-700 mb-2">Anotaciones del profesional:</label>
              <textarea
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none h-32"
                placeholder="Escribe aquí las observaciones, ejercicios realizados o evolución del paciente..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                autoFocus
              />
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                {/* Botón para Desmarcar, solo visible si es una etapa ya completada (pero NO si es la Actual) */}
                {selectedStage < safeCurrentStage && (
                    <button
                        onClick={handleUnmarkStage}
                        className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-colors text-xs flex items-center gap-1.5"
                    >
                        <RotateCcw size={14} /> Desmarcar Etapa
                    </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                    onClick={() => setSelectedStage(null)}
                    className="px-4 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-200 transition-colors text-sm"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSaveNoteAndComplete}
                    className="px-5 py-2 rounded-lg bg-[#0A58CA] hover:bg-blue-700 text-white font-bold transition-colors shadow-sm text-sm"
                >
                    {selectedStage === safeCurrentStage ? 'Guardar y Completar' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientRoadmap;

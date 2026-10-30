import React, { useState, useEffect } from 'react';
import { Check, Clock, Activity, X, User, RotateCcw, Pencil, Plus } from 'lucide-react';
import { toast } from '../ui/use-toast';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const DEFAULT_STEPS = [
  // Mes 1
  { title: '1. Admisión y Ficha Base', subtitle: 'Ficha y consentimiento registrados' },
  { title: '2. Valoración Inicial', subtitle: 'Consulta inicial para definir el tratamiento y diagnóstico del paciente.' },
  { title: '3. Control Quincenal', subtitle: 'Ajuste de dosis, síntomas y adaptación inicial.' },
  { title: '4. Cierre Mes 1', subtitle: 'Evaluación de evolución mensual y continuidad.' },
  // Mes 2
  { title: '5. Desarrollo del Tratamiento', subtitle: 'Mes 2 • Seguimiento regular y ajustes.' },
  { title: '6. Control Quincenal Mes 2', subtitle: 'Monitoreo de avances y respuesta al tratamiento.' },
  { title: '7. Ajustes Terapéuticos', subtitle: 'Adecuación de pautas y evolución clínica.' },
  { title: '8. Cierre Mes 2', subtitle: 'Balance mensual de objetivos logrados.' },
  // Mes 3
  { title: '9. Consolidación y Avances', subtitle: 'Mes 3 • Etapa de consolidación y estabilidad.' },
  { title: '10. Control Quincenal Mes 3', subtitle: 'Seguimiento de estabilidad y autonomía.' },
  { title: '11. Valoración Pre-Alta', subtitle: 'Evaluación integral previa al cierre médico.' },
  { title: '12. Alta Médica y Cierre', subtitle: 'Mes 3 • Evaluación final y cierre de ciclo.' }
];

const PatientRoadmap = ({ currentStage, roadmapNotes = {}, onCompleteStage, onFinishCycle, onRestoreLastCycle, hasCompletedCycles }) => {
  const [selectedStage, setSelectedStage] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [titleText, setTitleText] = useState('');
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const totalStages = 12;
  const safeCurrentStage = Math.max(0, Math.min(currentStage || 0, totalStages));

  // Mes activo (1, 2 o 3) según el progreso
  const activeMonth = Math.min(3, Math.max(1, Math.floor(safeCurrentStage / 4) + 1));
  const [selectedMonth, setSelectedMonth] = useState(activeMonth);

  useEffect(() => {
    setSelectedMonth(activeMonth);
  }, [activeMonth]);

  // Bloquea el scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (selectedStage !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedStage]);

  const userInfo = useSelector((state) => state.authSlice?.userInfo) || {};
  const currentProfessionalName = userInfo?.nombre || userInfo?.name || userInfo?.username || 'Profesional';

  const handleStageClick = (stageIndex) => {
    setSelectedStage(stageIndex);
    const stageData = roadmapNotes[stageIndex];
    if (typeof stageData === 'object' && stageData !== null) {
      setNoteText(stageData.note || '');
      setTitleText(stageData.title || DEFAULT_STEPS[stageIndex]?.title || '');
    } else {
      setNoteText(typeof stageData === 'string' ? stageData : '');
      setTitleText(DEFAULT_STEPS[stageIndex]?.title || '');
    }
  };

  const handleSaveNoteAndComplete = () => {
    if (selectedStage === null) return;

    const existingData = typeof roadmapNotes[selectedStage] === 'object' && roadmapNotes[selectedStage] !== null ? roadmapNotes[selectedStage] : {};
    const noteData = {
      ...existingData,
      title: titleText.trim() || DEFAULT_STEPS[selectedStage]?.title,
      note: noteText,
      professional: currentProfessionalName,
      date: dayjs().format()
    };

    if (selectedStage >= safeCurrentStage) {
      onCompleteStage(selectedStage + 1, { [selectedStage]: noteData });
      toast({
        title: "¡Instancia Completada!",
        description: `Nota guardada por ${currentProfessionalName}.`,
        duration: 3000,
      });
    } else {
      onCompleteStage(safeCurrentStage, {
        [selectedStage]: noteData
      });
      toast({
        title: "Nota actualizada",
        description: `Guardado por ${currentProfessionalName}.`,
        duration: 2000,
      });
    }
    setSelectedStage(null);
  };

  const handleUndoToStage = (targetStage) => {
    if (targetStage >= 0 && targetStage <= totalStages) {
      onCompleteStage(targetStage, {});
      toast({
        title: "Acción Deshecha",
        description: `El tratamiento ha regresado a la instancia ${targetStage + 1}.`,
        duration: 3000,
      });
      if (selectedStage !== null) setSelectedStage(null);
    }
  };

  const handleUnmarkStage = () => {
    if (selectedStage !== null) {
      const target = selectedStage < safeCurrentStage ? selectedStage : (safeCurrentStage > 0 ? safeCurrentStage - 1 : 0);
      handleUndoToStage(target);
    }
  };

  // Cálculo de progreso para el mes seleccionado (4 instancias por mes)
  const monthStartIdx = (selectedMonth - 1) * 4;
  const stagesInSelectedMonth = [monthStartIdx, monthStartIdx + 1, monthStartIdx + 2, monthStartIdx + 3];
  const completedInMonth = stagesInSelectedMonth.filter(idx => idx < safeCurrentStage).length;
  const monthProgressPercent = Math.round((completedInMonth / 4) * 100);

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-slate-300/80 shadow-md p-6 mb-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-3">
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Hoja de Ruta del Tratamiento</h2>
              <p className="text-xs font-semibold text-slate-500">Paso a paso del tratamiento médico</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {safeCurrentStage > 0 && (
              <button
                type="button"
                onClick={() => handleUndoToStage(safeCurrentStage - 1)}
                className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                title="Deshacer el último paso completado"
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">Deshacer Último Paso</span>
              </button>
            )}
            {safeCurrentStage === 0 && hasCompletedCycles && onRestoreLastCycle && (
              <button
                type="button"
                onClick={onRestoreLastCycle}
                className="px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
                title="Deshacer el cierre de ciclo y restaurar el ciclo anterior"
              >
                <RotateCcw size={13} />
                <span>Deshacer Cierre de Ciclo</span>
              </button>
            )}
            <div className="bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl text-center">
              <span className="block text-xs font-black uppercase text-blue-700 tracking-wide">
                Paso {safeCurrentStage < totalStages ? safeCurrentStage + 1 : totalStages} de {totalStages}
              </span>
              <span className="text-[11px] font-bold text-blue-900">
                {safeCurrentStage >= totalStages ? 'Completado' : 'En Curso'}
              </span>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className="mt-4 p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600">MES DEL TRATAMIENTO:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                Mes {activeMonth} {safeCurrentStage >= totalStages ? 'Completado' : 'Activo'}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">Total: 3 Meses</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((m) => {
              const mStart = (m - 1) * 4;
              const mEnd = mStart + 3;
              const isMonthCompleted = safeCurrentStage > mEnd;
              const isMonthCurrent = safeCurrentStage >= mStart && safeCurrentStage <= mEnd && safeCurrentStage < totalStages;
              const isSelected = selectedMonth === m;

              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonth(m)}
                  className={`py-2 px-2.5 rounded-xl text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-600 border-2 border-blue-600 shadow-sm text-white'
                      : 'bg-white hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      Mes {m}
                    </span>
                    {isMonthCompleted ? (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-emerald-800 bg-emerald-50/70 border border-emerald-300'
                      }`}>
                        ✓ Listo
                      </span>
                    ) : isMonthCurrent ? (
                      <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded shadow-xs ${
                        isSelected
                          ? 'bg-white text-blue-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        EN CURSO
                      </span>
                    ) : (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'text-slate-500 bg-slate-100'
                      }`}>
                        Próximo
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${
                    isSelected
                      ? 'text-blue-100 font-bold'
                      : 'text-slate-400'
                  }`}>
                    {isMonthCompleted ? 'Finalizado • Ver' : isMonthCurrent ? 'Mes Actual' : 'Planificado'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notice */}
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-2.5">
          <span className="text-base leading-tight mt-0.5">💡</span>
          <div className="flex-1 text-xs text-slate-700 font-medium">
            <span>Puede seleccionar un mes anterior para registrar evoluciones o completar pasos pendientes que hayan quedado sin cargar.</span>
          </div>
        </div>

        {/* Patient Progress for selected month */}
        <div className="mt-4 mb-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
            <span>{selectedMonth === activeMonth ? 'Progreso del Mes Actual' : `Progreso del Mes ${selectedMonth}`}</span>
            <span className="text-blue-700 font-black">{monthProgressPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${monthProgressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* 4 Step Cards for selected month */}
        <div className="space-y-3">
          {stagesInSelectedMonth.map((index) => {
            const isCompleted = index < safeCurrentStage;
            const isCurrent = index === safeCurrentStage;

            const stageData = roadmapNotes[index];
            const customTitle = typeof stageData === 'object' && stageData?.title ? stageData.title : null;
            const displayTitle = customTitle || DEFAULT_STEPS[index]?.title || `Instancia ${index + 1}`;
            const defaultSubtitle = DEFAULT_STEPS[index]?.subtitle || '';
            const noteTextVal = typeof stageData === 'object' ? stageData?.note : (typeof stageData === 'string' ? stageData : '');
            const author = typeof stageData === 'object' ? stageData?.professional : null;
            const stageDate = typeof stageData === 'object' && stageData?.date ? stageData.date : null;

            if (isCompleted) {
              return (
                <div key={index} className="p-3.5 bg-emerald-50/70 border border-emerald-300 rounded-xl transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-xs">
                        <Check size={16} strokeWidth={3} />
                      </span>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{displayTitle}</div>
                        <div className="text-xs text-emerald-800 font-medium">
                          {noteTextVal ? (
                            <span className="line-clamp-1 italic">"{noteTextVal}"</span>
                          ) : (
                            defaultSubtitle
                          )}
                        </div>
                        {author && (
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                            <span>Por: <strong className="text-slate-700">{author}</strong></span>
                            {stageDate && <span>• {dayjs(stageDate).format('DD/MM/YYYY HH:mm')} hs</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-white text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md shadow-2xs">
                      Listo
                    </span>
                  </div>
                  <div className="flex justify-end items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleUndoToStage(index)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                      title="Desmarcar este paso y volver el tratamiento a esta instancia"
                    >
                      <RotateCcw size={13} />
                      <span>Deshacer / Revertir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageClick(index)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                    >
                      <Pencil size={13} />
                      <span>Editar / Añadir Nota</span>
                    </button>
                  </div>
                </div>
              );
            }

            if (isCurrent) {
              return (
                <div key={index} className="p-4 bg-blue-50 border-2 border-blue-600 rounded-xl shadow-xs transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black flex-shrink-0 shadow-xs">
                        {index + 1}
                      </span>
                      <span className="text-sm font-black text-slate-900">{displayTitle}</span>
                    </div>
                    <span className="text-xs font-black uppercase text-white bg-blue-600 px-2.5 py-0.5 rounded-md shadow-2xs">
                      En Curso
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium pl-10 mb-3.5">
                    {noteTextVal ? <span className="italic">"{noteTextVal}"</span> : defaultSubtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => handleStageClick(index)}
                      className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 border border-blue-300 text-blue-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
                    >
                      <Pencil size={14} />
                      <span>Editar Registro</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageClick(index)}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
                    >
                      <Check size={16} strokeWidth={2.5} />
                      <span>Marcar como Completado</span>
                    </button>
                    {safeCurrentStage > 0 && (
                      <button
                        type="button"
                        onClick={() => handleUndoToStage(safeCurrentStage - 1)}
                        className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
                        title="Deshacer el último avance y volver al paso anterior"
                      >
                        <RotateCcw size={14} />
                        <span>Deshacer Paso Anterior</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            const isNext = index === safeCurrentStage + 1;
            return (
              <div
                key={index}
                className={`p-3.5 bg-white border border-slate-200 rounded-xl transition-all ${
                  isNext ? 'opacity-90' : 'opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{displayTitle}</div>
                      <div className="text-xs text-slate-500 font-medium">{defaultSubtitle}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                    isNext ? 'text-slate-600 bg-slate-100' : 'text-slate-400 bg-slate-50'
                  }`}>
                    {isNext ? 'Próximo' : 'Pendiente'}
                  </span>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleStageClick(index)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <Plus size={14} className={isNext ? 'text-blue-600' : 'text-slate-500'} />
                    <span>Completar Ahora</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cierre / Finalización de Ciclo */}
        {safeCurrentStage === totalStages ? (
          <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between shadow-xs">
            <div>
              <h3 className="text-green-800 font-bold text-base flex items-center gap-2">
                <Check size={18} className="text-green-600" />
                ¡Ciclo Completado!
              </h3>
              <p className="text-green-700 text-xs mt-1">El paciente ha finalizado las 12 instancias del tratamiento.</p>
            </div>
            {showConfirmClose ? (
              <div className="flex flex-col items-end gap-2">
                <p className="text-green-800 text-xs font-bold">¿Confirmar cierre de ciclo?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmClose(false)}
                    className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg shadow-xs text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => { setShowConfirmClose(false); onFinishCycle && onFinishCycle(); }}
                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-xs text-xs"
                  >
                    Sí, cerrar y reiniciar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClose(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-xs text-xs"
              >
                Finalizar Ciclo y Reiniciar
              </button>
            )}
          </div>
        ) : safeCurrentStage > 0 ? (
          <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs">
            <div>
              <h3 className="text-slate-700 font-bold text-xs">Ciclo en curso</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">Puedes cerrar el ciclo anticipadamente si el tratamiento ha concluido.</p>
            </div>
            {showConfirmClose ? (
              <div className="flex flex-col items-end gap-1.5">
                <p className="text-slate-700 text-xs font-bold">¿Cerrar ciclo anticipadamente?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmClose(false)}
                    className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-lg shadow-xs text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => { setShowConfirmClose(false); onFinishCycle && onFinishCycle(); }}
                    className="px-3 py-1 bg-[#0A58CA] hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs text-xs"
                  >
                    Sí, cerrar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmClose(true)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-lg shadow-2xs text-xs"
              >
                Cerrar Ciclo Ahora
              </button>
            )}
          </div>
        ) : null}
      </div>

      {/* Note & Customization Modal */}
      {selectedStage !== null && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[60] p-4 overscroll-contain"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden overscroll-contain animate-in fade-in zoom-in-95 duration-200"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="font-bold text-base text-gray-900">
                Instancia {selectedStage + 1} • Mes {Math.floor(selectedStage / 4) + 1}
              </h3>
              <button onClick={() => setSelectedStage(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div
              className="p-5 pb-2 overflow-y-auto flex-1 space-y-4 overscroll-contain"
              onWheel={(e) => e.stopPropagation()}
            >
              {selectedStage < safeCurrentStage && (
                <div className="flex items-center justify-between p-2.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>
                      Completada por:{' '}
                      {(typeof roadmapNotes[selectedStage] === 'object' && roadmapNotes[selectedStage]?.professional)
                        ? roadmapNotes[selectedStage].professional
                        : 'No registrado'}
                    </span>
                  </div>
                  {typeof roadmapNotes[selectedStage] === 'object' && roadmapNotes[selectedStage]?.date && (
                    <div className="flex items-center gap-1.5 text-blue-600/80 bg-blue-100/50 px-2 py-1 rounded" title="Fecha de registro">
                      <Clock size={12} />
                      <span>{dayjs(roadmapNotes[selectedStage].date).format('DD/MM/YYYY HH:mm')} hs</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre / Título de la Instancia:
                </label>
                <input
                  type="text"
                  value={titleText}
                  onChange={(e) => setTitleText(e.target.value)}
                  placeholder="Ej: Admisión, Valoración Inicial, Control Quincenal..."
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Anotaciones del profesional / Evolución:
                </label>
                <textarea
                  data-lenis-prevent
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-y min-h-[130px] max-h-[260px] overscroll-contain"
                  placeholder="Escribe aquí las observaciones, ejercicios realizados o evolución del paciente..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onWheel={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <div>
                {(selectedStage < safeCurrentStage || safeCurrentStage > 0) && (
                  <button
                    onClick={handleUnmarkStage}
                    className="px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold transition-colors text-xs flex items-center gap-1.5"
                    title="Deshacer y volver el paciente al paso anterior"
                  >
                    <RotateCcw size={14} /> Deshacer / Volver a Pendiente
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
                  {selectedStage >= safeCurrentStage ? 'Guardar y Completar' : 'Guardar Cambios'}
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

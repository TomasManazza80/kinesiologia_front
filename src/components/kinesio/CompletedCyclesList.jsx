import React, { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, FileCheck } from 'lucide-react';
import dayjs from 'dayjs';

const CompletedCyclesList = ({ cycles = [], onUndo }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (!cycles || cycles.length === 0) {
    return null; // Don't show anything if there are no completed cycles
  }

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="space-y-6 mt-12 mb-10">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
        <FileCheck className="w-6 h-6 text-green-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Ciclos Completados</h2>
      </div>

      <div className="space-y-4">
        {cycles.map((cycle, index) => {
          const isExpanded = expandedId === cycle.id;
          
          return (
            <div key={cycle.id || index} className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div 
                className="p-5 flex justify-between items-center cursor-pointer hover:bg-green-50/50 transition-colors"
                onClick={() => handleToggle(cycle.id)}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-green-600">#{cycles.length - index}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      Ciclo de Tratamiento Completado
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CalendarDays className="w-4 h-4" /> {cycle.startDate} - {cycle.endDate}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {onUndo && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUndo(cycle.id); }}
                      className="text-xs font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      title="Devolver este ciclo a la Hoja de Ruta"
                    >
                      Deshacer Cierre
                    </button>
                  )}
                  <button className="text-gray-400 p-2">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-green-100 bg-gray-50/50">
                  <h5 className="font-bold text-sm text-gray-700 mb-4 mt-2">Anotaciones del Ciclo:</h5>
                  <div className="space-y-4">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const noteObj = cycle.notes ? cycle.notes[i] : null;
                      if (!noteObj) return null;

                      let noteText = '';
                      let profName = 'Profesional';
                      let dateText = 'Fecha no registrada';

                      if (typeof noteObj === 'object') {
                        noteText = noteObj.note || noteObj.text || '';
                        profName = noteObj.professional || 'Profesional';
                        if (noteObj.date) {
                            dateText = dayjs(noteObj.date).format('DD/MM/YYYY HH:mm');
                        }
                      } else {
                        noteText = noteObj;
                      }

                      return (
                        <div key={i} className="flex gap-3 items-start border-l-2 border-green-200 pl-4 ml-2">
                           <div className="flex flex-col gap-1 w-28 shrink-0 mt-1">
                              <span className="text-xs font-bold text-gray-700">Instancia {i + 1}</span>
                              <span className="text-[11px] text-gray-500">{dateText} hs</span>
                           </div>
                           <div className="bg-white p-3 rounded-lg border border-gray-100 flex-1 shadow-sm">
                              <div className="text-xs font-semibold text-blue-600 mb-1">{profName}</div>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">{noteText}</p>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CompletedCyclesList;

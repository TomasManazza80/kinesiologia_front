import React from 'react';
import { Layers, CalendarDays, Activity, UserCircle2, FileText, Printer, CheckCircle2, Award } from 'lucide-react';
import AdmissionForm from './AdmissionForm';
import ContactSessionList from './ContactSessionList';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const MedicalHistoryLayout = ({ patient, legacyHistory }) => {
  const roadmapNotes = patient?.admissionData?.roadmapNotes || {};
  const completedCycles = patient?.admissionData?.completedCycles || [];
  const currentStage = Number(patient?.admissionData?.roadmapStage || 0);
  const isCurrentCycleFinished = currentStage >= 12;
  const totalCompletedCycles = completedCycles.length + (isCurrentCycleFinished ? 1 : 0);

  return (
    <div className="bg-gray-50/50 min-h-[600px] border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Main Content Area - Continuous Scroll */}
      <div className="flex-1 p-8 overflow-y-auto space-y-12">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Phase 2: Seguimientos Mensuales */}
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <CalendarDays className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Seguimientos Mensuales</h2>
              </div>

              <div className="flex items-center gap-2">
                <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border shadow-xs transition-colors ${
                  totalCompletedCycles > 0 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <CheckCircle2 className={`w-5 h-5 ${totalCompletedCycles > 0 ? 'text-emerald-600' : 'text-blue-500'}`} />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Ciclos Realizados:
                    </span>
                    <span className="text-lg font-black text-gray-900">
                      {totalCompletedCycles}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      ({totalCompletedCycles === 1 ? '1 tratamiento de 3 meses completado' : `${totalCompletedCycles} tratamientos de 3 meses completados`})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner resumen de ciclo */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  #{completedCycles.length + 1}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {isCurrentCycleFinished ? 'Ciclo actual completado (12 de 12 instancias)' : `Ciclo en curso (Tratamiento de 3 meses)`}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {totalCompletedCycles > 0 
                      ? `El paciente ha realizado exitosamente ${totalCompletedCycles} ${totalCompletedCycles === 1 ? 'ciclo completo' : 'ciclos completos'} de 3 meses en total.`
                      : 'El paciente se encuentra realizando su primer ciclo de 3 meses.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-blue-700 border border-blue-200 shadow-2xs">
                  {currentStage}/12 Instancias
                </span>
              </div>
            </div>
            
            <ContactSessionList month="1" roadmapNotes={roadmapNotes} />
            <ContactSessionList month="2" roadmapNotes={roadmapNotes} />
            <ContactSessionList month="3" roadmapNotes={roadmapNotes} />
          </section>



        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryLayout;

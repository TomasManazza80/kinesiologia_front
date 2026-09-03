import React from 'react';
import { Layers, CalendarDays, Activity, UserCircle2, FileText, Printer } from 'lucide-react';
import AdmissionForm from './AdmissionForm';
import ContactSessionList from './ContactSessionList';
import dayjs from 'moment';

const MedicalHistoryLayout = ({ patient, legacyHistory }) => {
  return (
    <div className="bg-gray-50/50 min-h-[600px] border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Main Content Area - Continuous Scroll */}
      <div className="flex-1 p-8 overflow-y-auto space-y-12">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Phase 1: Ingreso */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <UserCircle2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Ingreso</h2>
            </div>
            <AdmissionForm patient={patient} />
          </section>

          {/* Phase 2: Seguimientos Mensuales */}
          <section className="space-y-10">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Seguimientos Mensuales</h2>
            </div>
            
            <ContactSessionList month="1" patient={patient} />
            <ContactSessionList month="2" patient={patient} />
            <ContactSessionList month="3" patient={patient} />
          </section>

          {/* Phase 3: Legacy History */}
          <section>
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-serif text-gray-900 flex items-center gap-2">
                  <FileText className="text-gray-400" />
                  Archivo Clínico (Lectura)
                </h2>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg bg-gray-50" onClick={() => window.print()}>
                  <Printer className="w-4 h-4" /> Imprimir Ficha
                </button>
              </div>

              {(!legacyHistory || legacyHistory.length === 0) ? (
                <p className="text-gray-500 text-sm italic">No hay registros antiguos para este paciente.</p>
              ) : (
                <div className="space-y-8 print:space-y-6 text-gray-800">
                  {legacyHistory.map((consult, index) => (
                    <div key={consult.id} className="border-b border-gray-200 pb-6 print:pb-4 print:border-gray-400">
                      <div className="flex justify-between items-baseline mb-4">
                        <h3 className="text-lg font-bold">Consulta #{legacyHistory.length - index}</h3>
                        <span className="text-sm font-medium text-gray-600">{dayjs(consult.date).format('DD/MM/YYYY')}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm print:text-xs">
                        {consult.professional_name && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px]">Profesional a cargo: </span>
                            <span className="font-medium">{consult.professional_name}</span>
                          </div>
                        )}
                        
                        {consult.reason_for_visit && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Motivo de Consulta:</span>
                            <p className="bg-gray-50 print:bg-transparent p-3 print:p-0 rounded-lg">{consult.reason_for_visit}</p>
                          </div>
                        )}

                        {consult.diagnostico && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Diagnóstico:</span>
                            <p className="bg-gray-50 print:bg-transparent p-3 print:p-0 rounded-lg">{consult.diagnostico}</p>
                          </div>
                        )}

                        {consult.physical_findings && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Examen Físico:</span>
                            <p className="bg-gray-50 print:bg-transparent p-3 print:p-0 rounded-lg whitespace-pre-wrap">{consult.physical_findings}</p>
                          </div>
                        )}

                        {consult.tratamiento && (
                          <div className="col-span-2">
                            <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Tratamiento:</span>
                            <p className="bg-gray-50 print:bg-transparent p-3 print:p-0 rounded-lg whitespace-pre-wrap">{consult.tratamiento}</p>
                          </div>
                        )}
                        
                        {consult.type === 'dynamic' && consult.fields?.length > 0 && (
                          <div className="col-span-2 space-y-4">
                            {consult.fields.map(field => (
                              consult.data?.[field.id] && (
                                <div key={field.id}>
                                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">{field.label}:</span>
                                  <p className="bg-gray-50 print:bg-transparent p-3 print:p-0 rounded-lg whitespace-pre-wrap">
                                    {Array.isArray(consult.data[field.id]) ? consult.data[field.id].join(', ') : 
                                      typeof consult.data[field.id] === 'boolean' ? (consult.data[field.id] ? 'Sí' : 'No') : consult.data[field.id]}
                                  </p>
                                </div>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default MedicalHistoryLayout;

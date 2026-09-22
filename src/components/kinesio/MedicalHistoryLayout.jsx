import React from 'react';
import { Layers, CalendarDays, Activity, UserCircle2, FileText, Printer } from 'lucide-react';
import AdmissionForm from './AdmissionForm';
import ContactSessionList from './ContactSessionList';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

const MedicalHistoryLayout = ({ patient, legacyHistory }) => {
  const roadmapNotes = patient?.admissionData?.roadmapNotes || {};

  return (
    <div className="bg-gray-50/50 min-h-[600px] border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {/* Main Content Area - Continuous Scroll */}
      <div className="flex-1 p-8 overflow-y-auto space-y-12">
        <div className="max-w-4xl mx-auto space-y-16">
          
          {/* Phase 2: Seguimientos Mensuales */}
          <section className="space-y-10">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-800">Seguimientos Mensuales</h2>
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

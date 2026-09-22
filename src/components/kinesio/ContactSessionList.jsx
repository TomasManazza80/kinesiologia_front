import React, { useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp } from 'lucide-react';
import dayjs from 'dayjs';

const ContactSessionList = ({ month, roadmapNotes = {} }) => {
  const [expandedId, setExpandedId] = useState(null);

  // Calculate which instances belong to this month (1, 2, or 3)
  const monthIndex = parseInt(month, 10) - 1;
  const startInstance = monthIndex * 4;
  const endInstance = startInstance + 3;

  // Filter existing notes for this month
  const sessions = [];
  for (let i = startInstance; i <= endInstance; i++) {
    if (roadmapNotes[i]) {
      // Manejar estructura de la nota (puede ser string u objeto dependiendo de cuándo se guardó)
      let noteText = '';
      let profName = 'Profesional';
      let dateText = 'Fecha no registrada';

      if (typeof roadmapNotes[i] === 'object') {
        noteText = roadmapNotes[i].note || roadmapNotes[i].text || '';
        profName = roadmapNotes[i].professional || 'Profesional';
        if (roadmapNotes[i].date) {
            dateText = dayjs(roadmapNotes[i].date).format('DD/MM/YYYY HH:mm');
        }
      } else {
        noteText = roadmapNotes[i];
      }

      sessions.push({
        id: i,
        contactNumber: i + 1,
        prof: profName,
        date: dateText,
        notes: noteText,
      });
    }
  }

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Contactos - Mes {month}
        </h2>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
              className="p-5 flex justify-between items-start cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleToggle(session.id)}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-blue-600">{session.contactNumber}</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    Contacto con {session.prof}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {session.date} hs</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-400 p-2">
                {expandedId === session.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            
            {expandedId === session.id && (
              <div className="px-5 pb-5 pt-2 border-t border-gray-100 bg-gray-50/50">
                <div className="mt-2 space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Seguimiento / Notas</span>
                    <p className="text-sm text-gray-800 mt-1 whitespace-pre-wrap">{session.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {sessions.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No hay contactos registrados aún para este mes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSessionList;

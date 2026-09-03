import React, { useState } from 'react';
import { CalendarDays, FileText, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import { toast } from '../ui/use-toast';

const ContactSessionList = ({ month, patient }) => {
  const [sessions, setSessions] = useState([
    { id: 1, contactNumber: 1, prof: 'Indiana', date: '10/05/2026', notes: 'Paciente con evolución favorable...', alert: false },
    { id: 2, contactNumber: 2, prof: 'Silvana', date: '17/05/2026', notes: 'Se realiza abordaje osteopático...', alert: false },
  ]);

  const [expandedId, setExpandedId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newSession, setNewSession] = useState({});

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleSaveSession = () => {
    const sessionToSave = {
      id: Date.now(),
      contactNumber: sessions.length + 1,
      prof: newSession.prof || 'Profesional',
      date: new Date().toLocaleDateString('es-ES'),
      notes: newSession.notes || '',
      alert: false
    };
    setSessions([...sessions, sessionToSave]);
    setIsAdding(false);
    setNewSession({});
    toast({
      title: "Contacto Registrado",
      description: "La sesión de contacto ha sido guardada.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Contactos - Mes {month}
        </h2>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">
            + Nuevo Contacto
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-sm mb-6 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Registrar Nuevo Contacto</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium">Profesional</label>
              <select 
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                onChange={e => setNewSession({...newSession, prof: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                <option value="Indiana">Indiana</option>
                <option value="Silvana">Silvana</option>
                <option value="Gimena">Gimena</option>
                <option value="Vero">Vero</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-700 font-medium">Estudios Aportados</label>
              <input type="text" placeholder="Ej: Resonancia magnética" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <label className="text-sm text-gray-700 font-medium">Seguimiento y Notas</label>
            <textarea 
              rows={3} 
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
              onChange={e => setNewSession({...newSession, notes: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1">
              <X className="w-4 h-4" /> Cancelar
            </button>
            <button 
              onClick={handleSaveSession}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Save className="w-4 h-4" /> Guardar Contacto
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div 
              className="p-5 flex justify-between items-start cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleToggle(session.id)}
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-gray-400">{session.contactNumber}</span>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    Contacto con {session.prof}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4" /> {session.date}</span>
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> {session.id === 1 ? '2 Estudios' : '0 Estudios'}</span>
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
                    <span className="text-xs font-semibold text-gray-500 uppercase">Seguimiento</span>
                    <p className="text-sm text-gray-800 mt-1">{session.notes}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200/60">
                     <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Sugerencias a paciente</span>
                        <p className="text-sm text-gray-600 mt-1">Mantener reposo relativo, aplicar calor.</p>
                     </div>
                     <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">Derivación</span>
                        <p className="text-sm text-gray-600 mt-1">Próximo contacto con Vero.</p>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {sessions.length === 0 && !isAdding && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No hay contactos registrados para este mes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSessionList;

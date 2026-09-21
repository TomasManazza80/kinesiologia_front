import React, { useState, useEffect } from 'react';
import AppointmentCalendar from './AppointmentCalendar';
import { useGetUnreadAppointmentsQuery, useMarkAppointmentsAsReadMutation } from '../../services/api/kinesioApi';
import { Bell, X, Calendar as CalendarIcon, User as UserIcon, CheckCircle2, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

const Dashboard = () => {
  const { data: unreadAppointments, isLoading } = useGetUnreadAppointmentsQuery();
  const [markAsRead, { isLoading: isMarking }] = useMarkAppointmentsAsReadMutation();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (unreadAppointments && unreadAppointments.length > 0) {
      setShowModal(true);
    }
  }, [unreadAppointments]);

  const handleDismiss = async () => {
    if (unreadAppointments && unreadAppointments.length > 0) {
      const ids = unreadAppointments.map(appt => appt.id);
      try {
        await markAsRead(ids).unwrap();
        setShowModal(false);
      } catch (error) {
        console.error("Failed to mark appointments as read", error);
        setShowModal(false); // Hide anyway to not block user
      }
    } else {
      setShowModal(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      <AppointmentCalendar />
      
      {/* Unread Appointments Modal */}
      {showModal && unreadAppointments && unreadAppointments.length > 0 && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bell size={24} className="text-white animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">¡Tienes Nuevos Turnos!</h2>
                  <p className="text-blue-100 text-sm">Pacientes han agendado turnos contigo</p>
                </div>
              </div>
              <button 
                onClick={handleDismiss} 
                className="text-white/70 hover:text-white p-1 rounded-lg transition-colors hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-0 max-h-[50vh] overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {unreadAppointments.map(appt => (
                  <div key={appt.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <UserIcon size={16} className="text-blue-500" />
                        {appt.patient?.nombre || 'Paciente Desconocido'}
                      </div>
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">
                        NUEVO
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarIcon size={14} className="text-gray-400" />
                        <span className="font-medium">{dayjs(appt.fecha_hora).format('DD/MM/YYYY HH:mm')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="truncate">{appt.motivo || 'Consulta General'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={handleDismiss}
                disabled={isMarking}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isMarking ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                Entendido, marcar como vistos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

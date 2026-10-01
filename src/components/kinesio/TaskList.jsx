import React, { useState } from 'react';
import { Calendar, CalendarClock, CheckCircle2, Circle, Clock, PlusCircle, Check, AlertCircle, Trash2, Edit2, X } from 'lucide-react';
import { 
  useGetTasksQuery, 
  useCreateTaskMutation, 
  useUpdateTaskMutation, 
  useDeleteTaskMutation 
} from '../../services/api/kinesioApi';

const TaskList = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const { data: tasks = [], isLoading } = useGetTasksQuery();
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await createTask({ title: newTaskTitle, status: 'pending', due_date: 'Hoy' }).unwrap();
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const handleToggleStatus = async (task) => {
    try {
      await updateTask({ 
        id: task.id, 
        status: task.status === 'completed' ? 'pending' : 'completed' 
      }).unwrap();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id).unwrap();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleUpdateTitle = async () => {
    if (!editingTitle.trim()) return;
    try {
      await updateTask({ id: editingTaskId, title: editingTitle }).unwrap();
      setEditingTaskId(null);
      setEditingTitle('');
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingTitle('');
  };

  if (isLoading) {
    return <div className="p-8">Cargando tareas...</div>;
  }

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  
  // For simplicity, we can just treat all pending as "Hoy" if due_date is "Hoy" or not set, 
  // and "Próximas" otherwise.
  const todayTasks = pendingTasks.filter(t => !t.due_date || t.due_date.toLowerCase() === 'hoy');
  const upcomingTasks = pendingTasks.filter(t => t.due_date && t.due_date.toLowerCase() !== 'hoy');

  const totalTasks = tasks.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks.length / totalTasks) * 100);

  const renderTask = (task, isCompleted) => {
    const isEditing = editingTaskId === task.id;

    return (
      <div key={task.id} className="flex items-start gap-4 group">
        <div 
          className={`mt-0.5 cursor-pointer ${isCompleted ? 'text-[#10B981]' : 'text-gray-300 hover:text-[#0A58CA]'}`}
          onClick={() => handleToggleStatus(task)}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <div className="w-5 h-5 rounded border-2 border-current flex items-center justify-center"></div>}
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdateTitle();
                  if (e.key === 'Escape') cancelEditing();
                }}
                autoFocus
                className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A58CA]"
              />
              <button onClick={handleUpdateTitle} className="text-green-600 hover:text-green-700">
                <Check size={16} />
              </button>
              <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <p 
                className={`text-sm font-medium ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                onDoubleClick={() => !isCompleted && startEditing(task)}
              >
                {task.title}
              </p>
              <div className="flex items-center gap-2">
                {!isCompleted && (
                  <button 
                    className="text-gray-800 hover:text-blue-600 transition-colors"
                    onClick={() => startEditing(task)}
                    title="Editar tarea"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
                <button 
                  className="text-gray-800 hover:text-red-600 transition-colors"
                  onClick={() => handleDeleteTask(task.id)}
                  title="Eliminar tarea"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
          
          {!isCompleted && !isEditing && task.is_high_priority && (
            <div className="flex items-center gap-1.5 mt-1 text-[#EF4444]">
              <AlertCircle size={14} />
              <span className="text-xs font-bold">Alta Prioridad</span>
            </div>
          )}
          {!isCompleted && !isEditing && task.due_time && (
            <div className="flex items-center gap-1.5 mt-1 text-gray-500">
              <Clock size={14} />
              <span className="text-xs font-semibold">{task.due_time}</span>
            </div>
          )}
          {!isCompleted && !isEditing && task.due_date && task.due_date.toLowerCase() !== 'hoy' && (
            <p className="text-xs font-semibold text-gray-500 mt-1">{task.due_date}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 font-sans overflow-y-auto">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Tareas</h1>
          <p className="text-gray-500 mt-1">Gestiona tus prioridades diarias.</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full md:w-64">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progreso Diario</span>
            <span className="text-sm font-bold text-[#0A58CA]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#0A58CA] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Add Task Input Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-3">
        <div className="text-gray-400 pl-2">
          <PlusCircle size={22} />
        </div>
        <input 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Agregar nueva tarea..."
          className="flex-1 bg-transparent border-none text-gray-700 focus:outline-none focus:ring-0 text-base"
        />
        <button 
          onClick={handleAddTask}
          className="bg-[#0A58CA] hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold shadow-sm transition-colors text-sm"
        >
          Agregar
        </button>
      </div>

      {/* Today Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#4F46E5]">
            <Calendar size={22} strokeWidth={2.5} />
            <h2 className="text-xl font-bold text-gray-900">Hoy</h2>
          </div>
          <span className="bg-[#EDE9FE] text-[#6D28D9] w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold">
            {todayTasks.length}
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {todayTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No hay tareas para hoy.</p>
          ) : (
            todayTasks.map(task => renderTask(task, false))
          )}
        </div>
      </div>

      {/* Grid for Upcoming and Completed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upcoming Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-[#059669] mb-6">
            <CalendarClock size={22} strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-gray-900">Próximas</h2>
          </div>
          
          <div className="flex flex-col gap-5">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No hay tareas próximas.</p>
            ) : (
              upcomingTasks.map(task => renderTask(task, false))
            )}
          </div>
        </div>

        {/* Completed Section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-6">
            <CheckCircle2 size={22} strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-gray-900">Completadas</h2>
          </div>
          
          <div className="flex flex-col gap-5">
            {completedTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No hay tareas completadas.</p>
            ) : (
              completedTasks.map(task => renderTask(task, true))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default TaskList;

import React, { useState } from 'react';
import { Select, Divider, Input, Button } from 'antd';
import { 
    useGetProfessionalsQuery, 
    useCreateProfessionalMutation, 
    useUpdateProfessionalMutation, 
    useDeleteProfessionalMutation,
    useUploadImageMutation,
    useGetSpecialtiesQuery,
    useCreateSpecialtyMutation,
    useUpdateSpecialtyMutation,
    useDeleteSpecialtyMutation,
    useGetUsersQuery,
    useUpdateUserRoleMutation
} from '../../services/api/kinesioApi.js';
import { toast } from '../ui/use-toast.tsx';
import { Plus, User, Mail, Shield, ShieldAlert, Loader2, X, Briefcase, Search, Filter, Camera, Check, Users, Edit2, Trash2, Calendar, RotateCcw, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import dayjs from 'dayjs';


const ProfessionalList = () => {
    const { data, isLoading, error } = useGetProfessionalsQuery();
    const { data: usersData, isLoading: isLoadingUsers, error: usersError } = useGetUsersQuery();
    const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();
    const [createProfessional, { isLoading: isCreating }] = useCreateProfessionalMutation();
    const [updateProfessional, { isLoading: isUpdating }] = useUpdateProfessionalMutation();
    const [deleteProfessional, { isLoading: isDeleting }] = useDeleteProfessionalMutation();
    const [uploadImage] = useUploadImageMutation();

    const handleDeleteProfessional = (id, name) => {
        setProfessionalToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProfessional = async () => {
        try {
            await deleteProfessional({ id: professionalToDelete.id }).unwrap();
            toast({
                title: 'Éxito',
                description: 'Profesional marcado como inactivo.',
                variant: 'success'
            });
            setIsDeleteModalOpen(false);
            if (selectedProfessional?.id === professionalToDelete.id) {
                setSelectedProfessional(null);
            }
            setProfessionalToDelete(null);
        } catch (err) {
            toast({
                title: 'Error',
                description: err?.data?.message || 'Error al eliminar el profesional.',
                variant: 'error'
            });
        }
    };

    const { data: specData, isLoading: isLoadingSpecs } = useGetSpecialtiesQuery();
    const [createSpecialtyMutation] = useCreateSpecialtyMutation();
    const [updateSpecialtyMutation] = useUpdateSpecialtyMutation();
    const [deleteSpecialtyMutation] = useDeleteSpecialtyMutation();
    const specialties = specData?.data || [];
    
    const [isManageSpecialtiesModalOpen, setIsManageSpecialtiesModalOpen] = useState(false);
    const [editingSpecialtyId, setEditingSpecialtyId] = useState(null);
    const [editingSpecialtyName, setEditingSpecialtyName] = useState('');
    
    const [newSpecialtyName, setNewSpecialtyName] = useState('');
    const inputRef = React.useRef(null);

    const handleAddSpecialty = async (e) => {
        e.preventDefault();
        if (!newSpecialtyName) return;
        try {
            await createSpecialtyMutation({ name: newSpecialtyName }).unwrap();
            setNewSpecialtyName('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        } catch (err) {
            toast({ title: 'Error', description: err?.data?.message || 'Error al agregar', variant: 'error' });
        }
    };

    const handleUpdateSpecialty = async (id) => {
        if (!editingSpecialtyName) return;
        try {
            await updateSpecialtyMutation({ id, name: editingSpecialtyName }).unwrap();
            setEditingSpecialtyId(null);
            setEditingSpecialtyName('');
            toast({ title: 'Éxito', description: 'Especialidad actualizada', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: err?.data?.message || 'Error al actualizar', variant: 'error' });
        }
    };

    const handleDeleteSpecialty = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar esta especialidad? Se quitará también de los profesionales asignados.')) return;
        try {
            await deleteSpecialtyMutation(id).unwrap();
            toast({ title: 'Éxito', description: 'Especialidad eliminada', variant: 'success' });
        } catch (err) {
            toast({ title: 'Error', description: err?.data?.message || 'Error al eliminar', variant: 'error' });
        }
    };
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [professionalToDelete, setProfessionalToDelete] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        specialty: [],
        role: 'ADMIN' // Always creating an ADMIN for now
    });
    const [activeView, setActiveView] = useState('professionals'); // 'professionals' | 'users'
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userStatusFilter, setUserStatusFilter] = useState('ALL');
    const [selectedProfessional, setSelectedProfessional] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [showDeletedProfessionals, setShowDeletedProfessionals] = useState(false);
    const [showDeletedUsers, setShowDeletedUsers] = useState(false);

    // Listado Principal: SOLO profesionales con rol ADMIN
    const allProfessionals = (data?.data || []).filter(prof => prof.role === 'ADMIN');
    
    const filteredProfessionals = allProfessionals.filter(prof => {
        const matchesSearch = (prof.name || prof.email).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || 
            (statusFilter === 'ACTIVE' && prof.is_active !== false) || 
            (statusFilter === 'INACTIVE' && prof.is_active === false);
        return matchesSearch && matchesStatus;
    });

    const activeProfessionals = filteredProfessionals.filter(p => p.is_active !== false);
    const inactiveProfessionals = filteredProfessionals.filter(p => p.is_active === false);
    const totalDeletedProfessionals = allProfessionals.filter(p => p.is_active === false).length;

    // Listado de Usuarios: SOLO usuarios normales con rol USER
    const allUsers = usersData?.data || [];
    const normalUsers = allUsers.filter(u => u.role === 'USER');

    const filteredNormalUsers = normalUsers.filter(u => {
        const matchesSearch = (u.name || u.email).toLowerCase().includes(userSearchTerm.toLowerCase());
        const matchesStatus = userStatusFilter === 'ALL' || 
            (userStatusFilter === 'ACTIVE' && u.is_active !== false) || 
            (userStatusFilter === 'INACTIVE' && u.is_active === false);
        return matchesSearch && matchesStatus;
    });

    const activeNormalUsers = filteredNormalUsers.filter(u => u.is_active !== false);
    const inactiveNormalUsers = filteredNormalUsers.filter(u => u.is_active === false);
    const totalDeletedUsers = normalUsers.filter(u => u.is_active === false).length;

    const handlePromoteToAdmin = async (user) => {
        if (!window.confirm(`¿Estás seguro de que deseas promover a "${user.name || user.email}" al rol ADMIN?\n\nEste usuario pasará a formar parte del Listado Principal de Profesionales y tendrá acceso administrativo.`)) {
            return;
        }
        try {
            await updateUserRole({ id: user.id, role: 'ADMIN' }).unwrap();
            toast({
                title: '¡Usuario promovido con éxito!',
                description: `${user.name || user.email} ahora es Profesional (ADMIN).`,
                variant: 'success'
            });
        } catch (err) {
            toast({
                title: 'Error al promover usuario',
                description: err?.data?.message || 'No se pudo actualizar el rol.',
                variant: 'error'
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProfessional(formData).unwrap();
            toast({
                title: 'Éxito',
                description: 'Profesional creado correctamente.',
                variant: 'success'
            });
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', specialty: [], role: 'ADMIN' });
        } catch (err) {
            toast({
                title: 'Error',
                description: err?.data?.message || 'Error al crear profesional',
                variant: 'error'
            });
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfessional({ id: selectedProfessional.id, ...editFormData }).unwrap();
            toast({
                title: 'Éxito',
                description: 'Profesional actualizado correctamente.',
                variant: 'success'
            });
            setIsEditing(false);
            setSelectedProfessional({ ...selectedProfessional, ...editFormData });
        } catch (err) {
            toast({
                title: 'Error',
                description: err?.data?.message || 'Error al actualizar',
                variant: 'error'
            });
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploadingImage(true);
        try {
            const result = await uploadImage(formData).unwrap();
            if (result.success) {
                setEditFormData(prev => ({ ...prev, profile_picture: result.url }));
                toast({ title: 'Imagen subida', description: 'La imagen se subió correctamente', variant: 'success' });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'No se pudo subir la imagen', variant: 'error' });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const specialtyOptionRender = (option) => {
        const spec = specialties.find(s => s.name === option.value);
        if (!spec) return <span>{option.label}</span>;
        
        if (editingSpecialtyId === spec.id) {
            return (
                <div className="flex items-center gap-2 w-full" onClick={e => e.stopPropagation()}>
                    <input 
                        type="text" 
                        value={editingSpecialtyName}
                        onChange={(e) => setEditingSpecialtyName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') handleUpdateSpecialty(spec.id);
                        }}
                    />
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateSpecialty(spec.id); }} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors"><Check size={14}/></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingSpecialtyId(null); }} className="text-gray-400 hover:bg-gray-200 p-1 rounded transition-colors"><X size={14}/></button>
                </div>
            );
        }

        return (
            <div className="flex justify-between items-center w-full">
                <span className="text-sm">{option.label}</span>
                <div className="flex gap-1">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingSpecialtyId(spec.id);
                            setEditingSpecialtyName(spec.name);
                        }}
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded transition-colors"
                        title="Editar"
                    >
                        <Edit2 size={14} />
                    </button>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSpecialty(spec.id);
                        }}
                        className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                        title="Eliminar"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-[#F8FAFC] p-4 md:p-8 flex flex-col gap-6 overflow-y-auto">
            {/* Header */}
            {activeView === 'professionals' ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Personal / Profesionales</h1>
                        <p className="text-gray-500 mt-1">Gestiona el personal, profesionales y usuarios administradores del sistema.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => setActiveView('users')}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl border border-gray-200 transition-all shadow-sm flex items-center justify-center gap-2 hover:border-gray-300 hover:text-gray-900 active:scale-95"
                            title="Ver listado de usuarios normales del sistema"
                        >
                            <Users size={18} className="text-[#0A58CA]" />
                            <span>Listado de Usuarios</span>
                            {normalUsers.length > 0 && (
                                <span className="bg-blue-50 text-[#0A58CA] border border-blue-200 text-xs px-2 py-0.5 rounded-full font-bold ml-1">
                                    {normalUsers.length}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setShowDeletedProfessionals(prev => !prev)}
                            className={`font-bold py-2.5 px-4 rounded-xl border transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 ${
                                showDeletedProfessionals 
                                    ? 'bg-red-50 border-red-300 text-red-700' 
                                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                            }`}
                            title={showDeletedProfessionals ? "Ocultar personal eliminado" : "Ver personal eliminado"}
                        >
                            <Trash2 size={18} className={showDeletedProfessionals ? "text-red-600" : "text-gray-400"} />
                            <span>Personal Eliminado</span>
                            {totalDeletedProfessionals > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                                    showDeletedProfessionals ? 'bg-red-200 text-red-800' : 'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                    {totalDeletedProfessionals}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#0A58CA] hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Plus size={20} />
                            Añadir Profesional
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setActiveView('professionals')}
                                className="p-2 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors shadow-xs"
                                title="Volver al Listado Principal de Profesionales"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-bold tracking-tight text-[#111827]">Listado de Usuarios</h1>
                        </div>
                        <p className="text-gray-500 mt-1 ml-11">Usuarios registrados en el sistema con rol estándar (USER). Puedes gestionarlos o promoverlos a profesionales.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => setActiveView('professionals')}
                            className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-2.5 px-4 rounded-xl border border-gray-200 transition-all shadow-sm flex items-center justify-center gap-2 hover:border-gray-300 hover:text-gray-900 active:scale-95"
                        >
                            <Shield size={18} className="text-purple-600" />
                            <span>Volver a Profesionales (Admin)</span>
                        </button>
                        <button 
                            onClick={() => setShowDeletedUsers(prev => !prev)}
                            className={`font-bold py-2.5 px-4 rounded-xl border transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 ${
                                showDeletedUsers 
                                    ? 'bg-red-50 border-red-300 text-red-700' 
                                    : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
                            }`}
                            title={showDeletedUsers ? "Ocultar usuarios eliminados" : "Ver usuarios eliminados"}
                        >
                            <Trash2 size={18} className={showDeletedUsers ? "text-red-600" : "text-gray-400"} />
                            <span>Usuarios Eliminados</span>
                            {totalDeletedUsers > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ml-1 ${
                                    showDeletedUsers ? 'bg-red-200 text-red-800' : 'bg-red-50 text-red-600 border border-red-200'
                                }`}>
                                    {totalDeletedUsers}
                                </span>
                            )}
                        </button>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#0A58CA] hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Plus size={20} />
                            Añadir Profesional
                        </button>
                    </div>
                </div>
            )}

            {/* View: Profesionales (Listado Principal) */}
            {activeView === 'professionals' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar profesional por nombre o email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]"
                            />
                        </div>
                        <div className="sm:w-64 relative flex items-center">
                            <Filter className="absolute left-3 text-gray-400" size={18} />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0A58CA] appearance-none bg-white cursor-pointer"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="ACTIVE">Solo Activos</option>
                                <option value="INACTIVE">Solo Inactivos</option>
                            </select>
                        </div>
                    </div>

                    {/* List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="animate-spin text-[#0A58CA]" size={32} />
                        </div>
                    ) : error ? (
                        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
                            <ShieldAlert size={32} className="mb-2" />
                            <p className="font-semibold">Error al cargar los profesionales.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500">
                                    <thead className="bg-[#F8FAFC] text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Profesional</th>
                                            <th className="px-6 py-4">Contacto</th>
                                            <th className="px-6 py-4">Rol</th>
                                            <th className="px-6 py-4">Registrado El</th>
                                            <th className="px-6 py-4 text-center">Público (Web)</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {activeProfessionals.length > 0 ? (
                                            activeProfessionals.map((prof) => (
                                                <tr key={prof.id} className={`hover:bg-gray-50/50 transition-colors ${prof.is_active === false ? 'opacity-60 bg-gray-50' : ''}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {prof.profile_picture ? (
                                                                <img src={prof.profile_picture} alt={prof.name} className={`w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm ${prof.is_active === false ? 'grayscale' : ''}`} />
                                                            ) : (
                                                                <div className={`w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 ${prof.is_active === false ? 'grayscale bg-gray-200 text-gray-500' : ''}`}>
                                                                    {(prof.name || prof.email).charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                                                    {prof.name || '-'}
                                                                    {prof.is_active === false && (
                                                                        <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-gray-300">Inactivo</span>
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-0.5">{(prof.specialty && prof.specialty.length > 0) ? prof.specialty.join(', ') : 'Kinesiología'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Mail size={16} className="text-gray-400" />
                                                            {prof.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max bg-purple-100 text-purple-700">
                                                            <Shield size={12} />
                                                            {prof.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            {prof.createdAt ? dayjs(prof.createdAt).format('DD/MM/YYYY') : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input 
                                                                type="checkbox" 
                                                                className="sr-only peer"
                                                                checked={prof.is_public || false}
                                                                onChange={async (e) => {
                                                                    try {
                                                                        await updateProfessional({ id: prof.id, is_public: e.target.checked }).unwrap();
                                                                        toast({ title: 'Actualizado', description: 'Visibilidad actualizada.', variant: 'success' });
                                                                    } catch(err) {
                                                                        toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'error' });
                                                                    }
                                                                }}
                                                            />
                                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                        </label>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                         <div className="flex items-center justify-end gap-3">
                                                             <button 
                                                                 onClick={() => {
                                                                     setSelectedProfessional(prof);
                                                                     setEditFormData(prof);
                                                                     setIsEditing(false);
                                                                 }}
                                                                 className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                                                             >
                                                                 Ver Detalle
                                                             </button>
                                                             {prof.is_active === false ? (
                                                                 <button 
                                                                     onClick={async () => {
                                                                         try {
                                                                             await updateProfessional({ id: prof.id, is_active: true }).unwrap();
                                                                             toast({ title: 'Restaurado', description: 'Profesional restaurado correctamente.', variant: 'success' });
                                                                         } catch (err) {
                                                                             toast({ title: 'Error', description: 'Error al restaurar profesional.', variant: 'error' });
                                                                         }
                                                                     }}
                                                                     className="text-green-500 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                                                                     title="Restaurar profesional"
                                                                 >
                                                                     <RotateCcw size={15} />
                                                                     Restaurar
                                                                 </button>
                                                             ) : (
                                                                 <button 
                                                                     onClick={() => handleDeleteProfessional(prof.id, prof.name)}
                                                                     className="text-red-500 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                                                                     title="Eliminar profesional"
                                                                 >
                                                                     <Trash2 size={15} />
                                                                     Eliminar
                                                                 </button>
                                                             )}
                                                         </div>
                                                     </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                    No hay profesionales registrados con rol ADMIN.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showDeletedProfessionals && (
                        <div className="mt-8 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Trash2 size={20} className="text-red-500" />
                                    Personal Eliminado
                                    <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold ml-1">
                                        {inactiveProfessionals.length}
                                    </span>
                                </h3>
                                <button 
                                    onClick={() => setShowDeletedProfessionals(false)}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                    title="Ocultar sección de personal eliminado"
                                >
                                    <X size={14} />
                                    Ocultar
                                </button>
                            </div>
                            {inactiveProfessionals.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-90">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-500">
                                            <thead className="bg-[#F8FAFC] text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4">Profesional</th>
                                                    <th className="px-6 py-4">Contacto</th>
                                                    <th className="px-6 py-4">Rol</th>
                                                    <th className="px-6 py-4">Registrado El</th>
                                                    <th className="px-6 py-4 text-center">Público (Web)</th>
                                                    <th className="px-6 py-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {inactiveProfessionals.map((prof) => (
                                                    <tr key={prof.id} className="hover:bg-gray-50/50 transition-colors opacity-60 bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {prof.profile_picture ? (
                                                                    <img src={prof.profile_picture} alt={prof.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm grayscale" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold shrink-0 grayscale">
                                                                        {(prof.name || prof.email).charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                                                        {prof.name || '-'}
                                                                        <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-gray-300">Inactivo</span>
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-0.5">{(prof.specialty && prof.specialty.length > 0) ? prof.specialty.join(', ') : 'Kinesiología'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Mail size={16} className="text-gray-400" />
                                                                {prof.email}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max bg-purple-100 text-purple-700">
                                                                <Shield size={12} />
                                                                {prof.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                                <Calendar size={14} className="text-gray-400" />
                                                                {prof.createdAt ? dayjs(prof.createdAt).format('DD/MM/YYYY') : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <label className="relative inline-flex items-center cursor-pointer">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="sr-only peer"
                                                                    checked={prof.is_public || false}
                                                                    onChange={async (e) => {
                                                                        try {
                                                                            await updateProfessional({ id: prof.id, is_public: e.target.checked }).unwrap();
                                                                            toast({ title: 'Actualizado', description: 'Visibilidad actualizada.', variant: 'success' });
                                                                        } catch(err) {
                                                                            toast({ title: 'Error', description: 'No se pudo actualizar.', variant: 'error' });
                                                                        }
                                                                    }}
                                                                />
                                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                                            </label>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                             <div className="flex items-center justify-end gap-3">
                                                                 <button 
                                                                     onClick={() => {
                                                                         setSelectedProfessional(prof);
                                                                         setEditFormData(prof);
                                                                         setIsEditing(false);
                                                                     }}
                                                                     className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                                                                 >
                                                                     Ver Detalle
                                                                 </button>
                                                                 <button 
                                                                     onClick={async () => {
                                                                         try {
                                                                             await updateProfessional({ id: prof.id, is_active: true }).unwrap();
                                                                             toast({ title: 'Restaurado', description: 'Profesional restaurado correctamente.', variant: 'success' });
                                                                         } catch (err) {
                                                                             toast({ title: 'Error', description: 'Error al restaurar profesional.', variant: 'error' });
                                                                         }
                                                                     }}
                                                                     className="text-green-500 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                                                                     title="Restaurar profesional"
                                                                 >
                                                                     <RotateCcw size={15} />
                                                                     Restaurar
                                                                 </button>
                                                             </div>
                                                         </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm shadow-sm">
                                    No hay personal eliminado ni inactivo.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* View: Usuarios (Listado Oculto que se muestra con el botón) */}
            {activeView === 'users' && (
                <>
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar usuario por nombre o email..." 
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]"
                            />
                        </div>
                        <div className="sm:w-64 relative flex items-center">
                            <Filter className="absolute left-3 text-gray-400" size={18} />
                            <select
                                value={userStatusFilter}
                                onChange={(e) => setUserStatusFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-[#0A58CA] appearance-none bg-white cursor-pointer"
                            >
                                <option value="ALL">Todos los estados</option>
                                <option value="ACTIVE">Solo Activos</option>
                                <option value="INACTIVE">Solo Inactivos</option>
                            </select>
                        </div>
                    </div>

                    {/* List */}
                    {isLoadingUsers ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="animate-spin text-[#0A58CA]" size={32} />
                        </div>
                    ) : usersError ? (
                        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex flex-col items-center justify-center text-center">
                            <ShieldAlert size={32} className="mb-2" />
                            <p className="font-semibold">Error al cargar el listado de usuarios.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-gray-500">
                                    <thead className="bg-[#F8FAFC] text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Usuario</th>
                                            <th className="px-6 py-4">Contacto</th>
                                            <th className="px-6 py-4">Rol</th>
                                            <th className="px-6 py-4">Registrado El</th>
                                            <th className="px-6 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {activeNormalUsers.length > 0 ? (
                                            activeNormalUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {user.profile_picture ? (
                                                                <img src={user.profile_picture} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                                                                    {(user.name || user.email).charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                                                    {user.name || '-'}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-0.5">Usuario Estándar</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Mail size={16} className="text-gray-400" />
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max bg-emerald-100 text-emerald-700">
                                                            <User size={12} />
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                            <Calendar size={14} className="text-gray-400" />
                                                            {user.createdAt ? dayjs(user.createdAt).format('DD/MM/YYYY') : '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                         <div className="flex items-center justify-end gap-2.5">
                                                             <button 
                                                                 onClick={() => handlePromoteToAdmin(user)}
                                                                 disabled={isUpdatingRole}
                                                                 className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                                                                 title="Promover a Profesional (ADMIN)"
                                                             >
                                                                 <ShieldCheck size={14} className="text-purple-600" />
                                                                 <span>Hacer Admin</span>
                                                             </button>
                                                             <button 
                                                                 onClick={() => {
                                                                     setSelectedProfessional(user);
                                                                     setEditFormData(user);
                                                                     setIsEditing(false);
                                                                 }}
                                                                 className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                                                             >
                                                                 Ver Detalle
                                                             </button>
                                                             <button 
                                                                 onClick={() => handleDeleteProfessional(user.id, user.name)}
                                                                 className="text-red-500 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                                                                 title="Eliminar usuario"
                                                             >
                                                                 <Trash2 size={15} />
                                                                 Eliminar
                                                             </button>
                                                         </div>
                                                     </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No hay usuarios registrados con rol USER.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showDeletedUsers && (
                        <div className="mt-8 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Trash2 size={20} className="text-red-500" />
                                    Usuarios Eliminados
                                    <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold ml-1">
                                        {inactiveNormalUsers.length}
                                    </span>
                                </h3>
                                <button 
                                    onClick={() => setShowDeletedUsers(false)}
                                    className="text-xs font-semibold text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                    title="Ocultar sección de usuarios eliminados"
                                >
                                    <X size={14} />
                                    Ocultar
                                </button>
                            </div>
                            {inactiveNormalUsers.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-90">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-gray-500">
                                            <thead className="bg-[#F8FAFC] text-xs uppercase text-gray-700 font-bold border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-4">Usuario</th>
                                                    <th className="px-6 py-4">Contacto</th>
                                                    <th className="px-6 py-4">Rol</th>
                                                    <th className="px-6 py-4">Registrado El</th>
                                                    <th className="px-6 py-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {inactiveNormalUsers.map((user) => (
                                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors opacity-60 bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                {user.profile_picture ? (
                                                                    <img src={user.profile_picture} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm grayscale" />
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold shrink-0 grayscale">
                                                                        {(user.name || user.email).charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                                                        {user.name || '-'}
                                                                        <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-gray-300">Inactivo</span>
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-0.5">Usuario Estándar</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Mail size={16} className="text-gray-400" />
                                                                {user.email}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-max bg-emerald-100 text-emerald-700">
                                                                <User size={12} />
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                                <Calendar size={14} className="text-gray-400" />
                                                                {user.createdAt ? dayjs(user.createdAt).format('DD/MM/YYYY') : '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                             <div className="flex items-center justify-end gap-3">
                                                                 <button 
                                                                     onClick={() => {
                                                                         setSelectedProfessional(user);
                                                                         setEditFormData(user);
                                                                         setIsEditing(false);
                                                                     }}
                                                                     className="text-blue-500 hover:text-blue-700 font-semibold text-sm"
                                                                 >
                                                                     Ver Detalle
                                                                 </button>
                                                                 <button 
                                                                     onClick={async () => {
                                                                         try {
                                                                             await updateProfessional({ id: user.id, is_active: true }).unwrap();
                                                                             toast({ title: 'Restaurado', description: 'Usuario restaurado correctamente.', variant: 'success' });
                                                                         } catch (err) {
                                                                             toast({ title: 'Error', description: 'Error al restaurar usuario.', variant: 'error' });
                                                                         }
                                                                     }}
                                                                     className="text-green-500 hover:text-green-700 font-semibold text-sm flex items-center gap-1"
                                                                     title="Restaurar usuario"
                                                                 >
                                                                     <RotateCcw size={15} />
                                                                     Restaurar
                                                                 </button>
                                                             </div>
                                                         </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm shadow-sm">
                                    No hay usuarios eliminados ni inactivos.
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}


            {/* Modal de Creación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Añadir Profesional</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="profForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><User size={16}/> Nombre Completo</label>
                                    <input 
                                        type="text" name="name" required
                                        value={formData.name} onChange={handleInputChange}
                                        placeholder="Ej. Dr. Juan Pérez"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Briefcase size={16}/> Especialidad</label>
                                    <Select 
                                        mode="multiple"
                                        style={{ width: '100%', minHeight: '46px' }}
                                        placeholder="Seleccione especialidades"
                                        value={formData.specialty || []} 
                                        onChange={(val) => setFormData(prev => ({ ...prev, specialty: val }))}
                                        options={specialties.map(s => ({ value: s.name, label: s.name }))}
                                        loading={isLoadingSpecs}
                                        optionRender={specialtyOptionRender}
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <div className="flex px-2 pb-2 gap-2">
                                                    <Input
                                                        placeholder="Nueva especialidad"
                                                        ref={inputRef}
                                                        value={newSpecialtyName}
                                                        onChange={(e) => setNewSpecialtyName(e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                    <Button type="text" icon={<Plus size={16} />} onClick={handleAddSpecialty} className="flex items-center text-blue-600 hover:text-blue-800">
                                                        Añadir
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Mail size={16}/> Email (Usuario)</label>
                                    <input 
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleInputChange}
                                        placeholder="correo@ejemplo.com"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2"><Shield size={16}/> Contraseña de Acceso</label>
                                    <input 
                                        type="password" name="password" required minLength="6"
                                        value={formData.password} onChange={handleInputChange}
                                        placeholder="Mínimo 6 caracteres"
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 outline-none focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA]" 
                                    />
                                </div>
                                <div className="mt-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2">
                                    <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                                    <p>Este usuario se creará con el rol <strong>ADMIN</strong>, lo que le dará acceso al panel de administración para gestionar su propia agenda y pacientes.</p>
                                </div>
                            </form>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 mt-auto">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                form="profForm"
                                type="submit"
                                disabled={isCreating}
                                className="flex-1 py-2.5 bg-[#0A58CA] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isCreating && <Loader2 className="animate-spin" size={18} />}
                                Guardar Profesional
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Detalle */}
            {selectedProfessional && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-[#F8FAFC]">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedProfessional?.role === 'ADMIN' 
                                    ? (isEditing ? 'Editar Profesional' : 'Detalles del Profesional') 
                                    : (isEditing ? 'Editar Usuario' : 'Detalles del Usuario')}
                            </h2>
                            <button onClick={() => setSelectedProfessional(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors hover:bg-gray-200">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative group">
                                    {isEditing && editFormData.profile_picture ? (
                                        <img src={editFormData.profile_picture} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-inner border border-gray-200" />
                                    ) : !isEditing && selectedProfessional.profile_picture ? (
                                        <img src={selectedProfessional.profile_picture} alt="Profile" className="w-20 h-20 rounded-full object-cover shadow-inner border border-gray-200" />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl shadow-inner shrink-0 border border-blue-200">
                                            {(selectedProfessional.name || selectedProfessional.email).charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    
                                    {isEditing && (
                                        <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            {isUploadingImage ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />}
                                            <span className="text-[10px] mt-1 font-semibold">Subir</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                                        </label>
                                    )}
                                </div>
                                {isEditing ? (
                                    <div className="w-full">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            value={editFormData.name || ''} 
                                            onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A58CA] text-sm font-semibold"
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{selectedProfessional.name || 'Sin Nombre'}</h3>
                                        <p className="text-blue-600 font-medium text-sm flex items-center gap-1 mt-1">
                                            <Briefcase size={14} />
                                            {(selectedProfessional.specialty && selectedProfessional.specialty.length > 0) 
                                                ? selectedProfessional.specialty.join(', ') 
                                                : (selectedProfessional.role === 'ADMIN' ? 'Kinesiología' : 'Usuario Estándar')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Especialidad</p>
                                    {isEditing ? (
                                        <Select 
                                            mode="multiple"
                                            style={{ width: '100%' }}
                                            placeholder="Seleccione especialidades"
                                            value={editFormData.specialty || []} 
                                            onChange={(val) => setEditFormData({...editFormData, specialty: val})}
                                            options={specialties.map(s => ({ value: s.name, label: s.name }))}
                                            loading={isLoadingSpecs}
                                            optionRender={specialtyOptionRender}
                                            dropdownRender={(menu) => (
                                                <>
                                                    {menu}
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <div className="flex px-2 pb-2 gap-2">
                                                        <Input
                                                            placeholder="Nueva especialidad"
                                                            ref={inputRef}
                                                            value={newSpecialtyName}
                                                            onChange={(e) => setNewSpecialtyName(e.target.value)}
                                                            onKeyDown={(e) => e.stopPropagation()}
                                                        />
                                                        <Button type="text" icon={<Plus size={16} />} onClick={handleAddSpecialty} className="flex items-center text-blue-600 hover:text-blue-800">
                                                            Añadir
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2">
                                            <Briefcase size={16} className="text-gray-400" />
                                            {(selectedProfessional.specialty && selectedProfessional.specialty.length > 0) ? selectedProfessional.specialty.join(', ') : 'No especificada'}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contacto / Usuario</p>
                                    {isEditing ? (
                                        <input 
                                            type="email" 
                                            value={editFormData.email || ''} 
                                            onChange={e => setEditFormData({...editFormData, email: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A58CA] text-sm"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" />
                                            {selectedProfessional.email}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rol de Usuario</p>
                                    {isEditing ? (
                                        <select 
                                            value={editFormData.role || 'ADMIN'} 
                                            onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 outline-none focus:border-[#0A58CA] text-sm bg-white"
                                        >
                                            <option value="ADMIN">ADMIN (Acceso Total)</option>
                                            <option value="USER">USER (Acceso Limitado)</option>
                                            <option value="EMPLOYEE">EMPLOYEE (Staff)</option>
                                        </select>
                                    ) : (
                                        <span className={`px-2.5 py-1 rounded-md text-sm font-semibold flex items-center gap-1.5 w-max ${
                                            selectedProfessional.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                            <Shield size={14} />
                                            {selectedProfessional.role}
                                        </span>
                                    )}
                                </div>
                                
                                {isEditing && (
                                    <div className="pt-2 border-t border-gray-200 mt-2 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Mostrar en web pública</p>
                                            <p className="text-xs text-gray-500">Permite que los pacientes agenden turnos con este profesional</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={editFormData.is_public || false}
                                                onChange={e => setEditFormData({...editFormData, is_public: e.target.checked})}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                        </label>
                                    </div>
                                )}
                                
                                {!isEditing && (
                                    <div className="pt-2 border-t border-gray-200 mt-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <Users size={14} />
                                            Pacientes Asignados ({selectedProfessional.patients?.length || 0})
                                        </p>
                                        {selectedProfessional.patients && selectedProfessional.patients.length > 0 ? (
                                            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                {selectedProfessional.patients.map(patient => (
                                                    <li key={patient.id} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 shadow-sm text-sm">
                                                        <span className="font-semibold text-gray-800">{patient.nombre}</span>
                                                        <span className="text-gray-500 text-xs truncate max-w-[150px]">
                                                            {patient.datos_contacto?.email || patient.datos_contacto?.phone || 'Sin contacto'}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No hay pacientes asignados a este profesional.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 mt-auto">
                            {isEditing ? (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditFormData(selectedProfessional);
                                        }}
                                        className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={handleUpdate}
                                        disabled={isUpdating}
                                        className="flex-1 py-2.5 bg-[#0A58CA] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        {isUpdating && <Loader2 className="animate-spin" size={16} />}
                                        Guardar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedProfessional(null)}
                                        className="py-2.5 px-4 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => handleDeleteProfessional(selectedProfessional.id, selectedProfessional.name)}
                                        disabled={isDeleting}
                                        className="py-2.5 px-4 bg-red-50 text-red-600 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                                        title="Eliminar profesional del equipo"
                                    >
                                        <Trash2 size={16} />
                                        Eliminar
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditing(true)}
                                        className="flex-1 py-2.5 bg-[#0A58CA] text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        Editar Datos
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de Confirmación de Eliminación */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 text-red-600">
                                <ShieldAlert size={24} />
                                Confirmar Eliminación
                            </h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                ¿Estás seguro de que deseas marcar a <strong>{professionalToDelete?.name || 'este registro'}</strong> como inactivo? Dejará de ser visible en el sistema pero podrás restaurarlo en cualquier momento.
                            </p>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50 mt-auto">
                            <button 
                                type="button" 
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 py-2.5 bg-white text-gray-700 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="button"
                                onClick={confirmDeleteProfessional}
                                disabled={isDeleting}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDeleting && <Loader2 className="animate-spin" size={18} />}
                                Eliminar Definitivamente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfessionalList;

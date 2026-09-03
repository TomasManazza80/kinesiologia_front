import React, { useState } from 'react';
import { useLiveEditor } from './LiveEditorProvider';
import { Save, X, Edit3, Eye, Loader2 } from 'lucide-react';

const LiveEditorToolbar = () => {
  const { isEditing, toggleEdit, saveChanges, discardChanges } = useLiveEditor();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await saveChanges();
    setIsSaving(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-3 bg-white/80 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl shadow-black/5">
      <button
        onClick={toggleEdit}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
          isEditing
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isEditing ? (
          <>
            <Eye className="w-4 h-4" />
            <span>Modo Vista</span>
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4" />
            <span>Modo Edición</span>
          </>
        )}
      </button>

      {isEditing && (
        <>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            onClick={discardChanges}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-transparent hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>Descartar</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 rounded-xl transition-all disabled:opacity-70"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Guardar Cambios</span>
          </button>
        </>
      )}
    </div>
  );
};

export default LiveEditorToolbar;

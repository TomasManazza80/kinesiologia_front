import React, { createContext, useContext, useState, useCallback } from 'react';

const LiveEditorContext = createContext();

const initialPageData = {
  hero: {
    badge: 'CENTRO ESPECIALIZADO EN MENOPAUSIA',
    title1: 'Cuidado Integral',
    title2: 'Climaterio & Plenitud',
    subtitle: 'Acompañamos a mujeres y hombres en su etapa de transición hormonal. Especialistas en endocrinología, suelo pélvico y bienestar emocional para una vida plena.',
    ctaPrimary: 'Reservar Turno',
    ctaSecondary: 'Conocer Profesionales',
    stats: [
      { value: '15+', label: 'Años de Experiencia' },
      { value: '10k+', label: 'Pacientes Atendidos' },
      { value: '100%', label: 'Atención Personalizada' }
    ],
    imageBadge: {
      title: 'Atención Integral',
      subtitle: 'Endocrinología y Rehabilitación'
    }
  },
  statement: {
    badge: 'CUIDADO MULTIDISCIPLINARIO',
    title1: 'Integramos',
    title2: 'múltiples especialidades',
    title3: 'para brindar un acompañamiento completo, restaurando el',
    title4: 'equilibrio, vitalidad y salud pélvica',
    cta: 'Solicitar Evaluación'
  },
  services: {
    badge: 'Especialidades',
    title: 'Abordaje Integral y Personalizado',
    linkText: 'Ver profesionales disponibles',
    items: [
      { 
        id: 1, 
        icon: 'Stethoscope',
        title: 'Endocrinología Especializada', 
        description: 'Control hormonal y metabólico enfocado en el climaterio, menopausia y andropausia para un óptimo bienestar.',
        footerText: 'Atención en consultorio',
        btnText: 'Agendar'
      },
      { 
        id: 2, 
        icon: 'Zap',
        isHighlighted: true,
        badge: 'SERVICIO DESTACADO',
        title: 'Rehabilitación Suelo Pélvico', 
        description: 'Tratamiento kinésico especializado para incontinencia, disfunciones sexuales y fortalecimiento del piso pélvico en mujeres y hombres.',
        footerText: 'Individual o Empresas',
        btnText: 'Reservar Ahora'
      },
      { 
        id: 3, 
        icon: 'ShieldCheck',
        title: 'Acompañamiento Psicológico', 
        description: 'Espacio terapéutico para abordar los cambios emocionales, estrés y ansiedad durante la transición hormonal.',
        footerText: 'Diagnóstico kinésico',
        btnText: 'Agendar'
      }
    ]
  },
  contact: {
    title: 'Contacto',
    email: 'contacto@centrokinesiologico.com',
    phone: '+54 11 1234-5678'
  }
};

export const LiveEditorProvider = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [pageData, setPageData] = useState(initialPageData);
  const [originalData, setOriginalData] = useState(initialPageData); // To discard changes

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const updateField = useCallback((path, value) => {
    setPageData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        
        // If the next key is a number, we should make sure we're accessing an array properly
        // In JS, arrays are objects so current[keys[i]] will work if it's an array
        // However, cloning nested arrays requires care to not mutate the original state
        if (Array.isArray(current[keys[i]])) {
           current[keys[i]] = [...current[keys[i]]];
        } else if (typeof current[keys[i]] === 'object') {
           current[keys[i]] = { ...current[keys[i]] };
        }
        
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  const addArrayItem = useCallback((path, newItem) => {
    setPageData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        if (Array.isArray(current[keys[i]])) {
           current[keys[i]] = [...current[keys[i]]];
        } else if (typeof current[keys[i]] === 'object') {
           current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      const targetArrayKey = keys[keys.length - 1];
      if (Array.isArray(current[targetArrayKey])) {
          current[targetArrayKey] = [...current[targetArrayKey], newItem];
      }
      return newData;
    });
  }, []);

  const removeArrayItem = useCallback((path, indexToRemove) => {
    setPageData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        if (Array.isArray(current[keys[i]])) {
           current[keys[i]] = [...current[keys[i]]];
        } else if (typeof current[keys[i]] === 'object') {
           current[keys[i]] = { ...current[keys[i]] };
        }
        current = current[keys[i]];
      }
      
      const targetArrayKey = keys[keys.length - 1];
      if (Array.isArray(current[targetArrayKey])) {
          current[targetArrayKey] = current[targetArrayKey].filter((_, index) => index !== indexToRemove);
      }
      return newData;
    });
  }, []);

  const saveChanges = async () => {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => {
        setOriginalData(pageData); // Update original to new saved state
        setIsEditing(false);
        resolve(true);
      }, 1000);
    });
  };

  const discardChanges = () => {
    setPageData(originalData);
    setIsEditing(false);
  };

  return (
    <LiveEditorContext.Provider
      value={{
        isEditing,
        pageData,
        toggleEdit,
        updateField,
        addArrayItem,
        removeArrayItem,
        saveChanges,
        discardChanges
      }}
    >
      {children}
    </LiveEditorContext.Provider>
  );
};

export const useLiveEditor = () => useContext(LiveEditorContext);

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const LiveEditorContext = createContext();

const initialPageData = {
  hero: {
    slides: [
      {
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
        },
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800'
      }
    ]
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
  },
  procedure: {
    badge: 'TU CAMINO AL BIENESTAR',
    title: 'Programa Integral de 3 Meses',
    subtitle: 'Un recorrido estructurado donde serás acompañado paso a paso por nuestro equipo interdisciplinario.',
    items: [
      {
        id: 1,
        title: 'Evaluación Inicial',
        description: 'Consulta exhaustiva con endocrinología, clínica médica y evaluación kinesiológica para definir tu plan personalizado.',
        badge: 'M1',
        icon: 'CalendarCheck',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600&h=400',
        color: 'bg-[#13263E]',
        textColor: 'text-white'
      },
      {
        id: 2,
        title: 'Intervención Activa',
        description: 'Sesiones semanales focalizadas con especialistas asignados: suelo pélvico, apoyo psicológico y nutrición.',
        badge: 'M2',
        icon: 'Activity',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600&h=400',
        color: 'bg-[#B59970]',
        textColor: 'text-white'
      },
      {
        id: 3,
        title: 'Reevaluación y Alta',
        description: 'Análisis de resultados, ajustes metabólicos finales y entrega de pautas de mantenimiento a largo plazo.',
        badge: 'M3',
        icon: 'Award',
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127d09e?auto=format&fit=crop&q=80&w=600&h=400',
        color: 'bg-emerald-600',
        textColor: 'text-white'
      }
    ]
  }
};

export const LiveEditorProvider = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [pageData, setPageData] = useState(initialPageData);
  const [originalData, setOriginalData] = useState(initialPageData); // To discard changes
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from the backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings/content`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            let fetchedData = result.data;
            // Migrate old hero data to new slides structure if necessary
            if (fetchedData.hero && !fetchedData.hero.slides) {
              fetchedData.hero = { slides: [ { ...fetchedData.hero } ] };
            }
            // Ensure procedure exists (migration for existing data)
            if (!fetchedData.procedure) {
              fetchedData.procedure = initialPageData.procedure;
            }
            setPageData(fetchedData);
            setOriginalData(fetchedData);
          }
        }
      } catch (error) {
        console.error("Error loading page content:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

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
      if (!current[targetArrayKey]) {
          current[targetArrayKey] = [newItem];
      } else if (Array.isArray(current[targetArrayKey])) {
          current[targetArrayKey] = [...current[targetArrayKey], newItem];
      } else if (typeof current[targetArrayKey] === 'object') {
          // It was saved as an object instead of an array
          current[targetArrayKey] = [...Object.values(current[targetArrayKey]), newItem];
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
      } else if (typeof current[targetArrayKey] === 'object' && current[targetArrayKey] !== null) {
          // Convert to array and then filter
          current[targetArrayKey] = Object.values(current[targetArrayKey]).filter((_, index) => index !== indexToRemove);
      }
      return newData;
    });
  }, []);

  const saveChanges = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/settings/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ pageData })
      });
      
      if (response.ok) {
        setOriginalData(pageData); // Update original to new saved state
        setIsEditing(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error saving page content:", error);
      return false;
    }
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

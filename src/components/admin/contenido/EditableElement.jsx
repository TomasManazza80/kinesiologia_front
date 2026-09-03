import React, { useRef, useEffect } from 'react';
import { useLiveEditor } from './LiveEditorProvider';

const EditableElement = ({ 
  tag = 'span', 
  dataPath, 
  className = '', 
  children 
}) => {
  const { isEditing, pageData, updateField } = useLiveEditor();
  const TagName = tag;
  const contentRef = useRef(null);

  // Retrieve value from dataPath (e.g. 'hero.title')
  const getValueFromPath = (path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], pageData) || children;
  };

  const value = getValueFromPath(dataPath);

  useEffect(() => {
    // We only want to update the DOM element directly if we are not actively typing in it
    // to prevent losing cursor position, but since it's an uncontrolled approach inside contentEditable,
    // we just make sure initial value is set correctly or when we discard changes.
    if (contentRef.current && contentRef.current.innerText !== value) {
        contentRef.current.innerText = value;
    }
  }, [value, isEditing]);

  const handleBlur = (e) => {
    const newValue = e.target.innerText;
    if (newValue !== value) {
      updateField(dataPath, newValue);
    }
  };

  // Prevent newlines in things like h1, span, etc if it's not meant to be multiline
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      contentRef.current.blur();
    }
  };

  return (
    <TagName
      ref={contentRef}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`
        ${className}
        ${isEditing ? 'outline-none cursor-text hover:ring-2 hover:ring-blue-500/50 hover:bg-blue-50/10 rounded-md transition-all px-1 -mx-1 empty:before:content-["Texto_vacío..."] empty:before:text-gray-400' : ''}
      `}
    >
      {value}
    </TagName>
  );
};

export default EditableElement;

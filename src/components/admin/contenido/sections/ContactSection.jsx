import React from 'react';
import EditableElement from '../EditableElement';

const ContactSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <EditableElement 
          tag="h2" 
          dataPath="contact.title" 
          className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-8"
        />
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 bg-white p-10 rounded-3xl shadow-md border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <EditableElement 
              tag="p" 
              dataPath="contact.email" 
              className="text-lg font-medium text-gray-900"
            />
            <p className="text-sm text-gray-500 mt-1">Escríbenos</p>
          </div>
          
          <div className="hidden sm:block w-px h-24 bg-gray-200"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <EditableElement 
              tag="p" 
              dataPath="contact.phone" 
              className="text-lg font-medium text-gray-900"
            />
            <p className="text-sm text-gray-500 mt-1">Llámanos</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

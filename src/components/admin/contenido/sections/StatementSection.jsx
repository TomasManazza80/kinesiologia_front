import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import EditableElement from '../EditableElement';

const StatementSection = () => {
  return (
    <section className="py-16 bg-blue-50/50 border-y border-blue-100/80">
      <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
        <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100/80 px-3.5 py-1.5 rounded-full inline-block">
          <EditableElement tag="span" dataPath="statement.badge" />
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-relaxed max-w-3xl mx-auto">
          <EditableElement tag="span" dataPath="statement.title1" className="inline-block" />{' '}
          <EditableElement tag="span" dataPath="statement.title2" className="text-blue-600 italic font-serif inline-block" />{' '}
          <EditableElement tag="span" dataPath="statement.title3" className="inline-block" />{' '}
          <EditableElement tag="span" dataPath="statement.title4" className="text-blue-600 italic font-serif inline-block" />.
        </h2>
        <div>
          <button className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold text-xs px-5 py-2.5 rounded-full transition-colors">
            <EditableElement tag="span" dataPath="statement.cta" />
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default StatementSection;

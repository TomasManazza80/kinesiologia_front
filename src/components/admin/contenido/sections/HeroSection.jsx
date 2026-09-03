import React from 'react';
import { Sparkles, ArrowUpRight, ChevronDown, Award } from 'lucide-react';
import EditableElement from '../EditableElement';

const HeroSection = () => {
  return (
    <section id="inicio" className="relative pt-8 pb-20 md:pt-16 md:pb-28 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 text-blue-700 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <EditableElement tag="span" dataPath="hero.badge" className="inline-block" />
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              <EditableElement tag="span" dataPath="hero.title1" className="inline-block" /> <br />
              <EditableElement tag="span" dataPath="hero.title2" className="text-blue-600 italic font-serif inline-block" />
            </h1>

            <EditableElement 
              tag="p" 
              dataPath="hero.subtitle" 
              className="text-base sm:text-lg text-slate-600 max-w-xl font-medium leading-relaxed" 
            />

            {/* Hero Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base px-8 py-4 rounded-full shadow-xl shadow-blue-600/30 transition-all">
                <EditableElement tag="span" dataPath="hero.ctaPrimary" className="inline-block" />
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </button>
              <button className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold text-base px-7 py-4 rounded-full border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
                <EditableElement tag="span" dataPath="hero.ctaSecondary" className="inline-block" />
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 max-w-lg">
              <div>
                <EditableElement tag="div" dataPath="hero.stats.0.value" className="text-2xl sm:text-3xl font-extrabold text-slate-900" />
                <EditableElement tag="div" dataPath="hero.stats.0.label" className="text-xs text-slate-500 font-semibold mt-0.5" />
              </div>
              <div>
                <EditableElement tag="div" dataPath="hero.stats.1.value" className="text-2xl sm:text-3xl font-extrabold text-slate-900" />
                <EditableElement tag="div" dataPath="hero.stats.1.label" className="text-xs text-slate-500 font-semibold mt-0.5" />
              </div>
              <div>
                <EditableElement tag="div" dataPath="hero.stats.2.value" className="text-2xl sm:text-3xl font-extrabold text-slate-900" />
                <EditableElement tag="div" dataPath="hero.stats.2.label" className="text-xs text-slate-500 font-semibold mt-0.5" />
              </div>
            </div>
          </div>

          {/* Right Column Image & Floating Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-white group">
              <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800" 
                alt="Kinesiología y Pausas"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

              {/* Floating Overlay Badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <EditableElement tag="h4" dataPath="hero.imageBadge.title" className="font-bold text-slate-900 text-sm" />
                    <EditableElement tag="p" dataPath="hero.imageBadge.subtitle" className="text-xs text-slate-500 font-medium" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

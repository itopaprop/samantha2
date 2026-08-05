import React from 'react';
import { useApp } from '../context/AppContext';
import { INITIAL_FACILITIES } from '../data/initialData';
import { CheckCircle2 } from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const { selectedFacilityId, setIsApplyModalOpen } = useApp();

  return (
    <div className="space-y-16 pb-16">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16 text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-900/80 text-sky-300 border border-sky-700/60">
            Our Home Architecture & Suites
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Explore Our World-Class Facilities
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            From peaceful residential suites and memory lounges to soft-padded childcare suites and botanical garden courtyards.
          </p>
        </div>
      </section>

      {/* Facilities Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {INITIAL_FACILITIES.map((fac) => {
            const isSelected = selectedFacilityId === fac.id;
            return (
              <div
                key={fac.id}
                id={`facility-${fac.id}`}
                className={`bg-white rounded-3xl overflow-hidden border transition-all ${
                  isSelected 
                    ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xl' 
                    : 'border-slate-200/90 shadow-xs hover:shadow-md'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-0">
                  <div className="sm:col-span-5 relative h-64 sm:h-auto min-h-[220px]">
                    <img
                      src={fac.image}
                      alt={fac.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = 'true';
                          target.src = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80';
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 text-[10px] font-bold bg-slate-900/80 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                      {fac.category}
                    </span>
                  </div>

                  <div className="sm:col-span-7 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">{fac.name}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {fac.description}
                      </p>

                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Amenities:</div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {fac.features.map((feat, fidx) => (
                            <div key={fidx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Daily Maintenance & Cleaning</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

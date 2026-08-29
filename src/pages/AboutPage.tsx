import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ShieldCheck, Award, Users, Target, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { OrganizationChart } from '../components/organogram/OrganizationChart';

export const AboutPage: React.FC = () => {
  const { setIsApplyModalOpen } = useApp();

  const coreValues = [
    { title: 'Compassion First', desc: 'Every interaction is guided by warmth, empathy, and active listening to ensure residents and children feel cherished.' },
    { title: 'Dignity & Respect', desc: 'We preserve independence, honor individual personal histories, and champion dignity in every aspect of personal care.' },
    { title: 'Safety & Safeguarding', desc: 'Rigorous 24/7 monitoring, security clearance standards, and medical oversight create an uncompromised sanctuary.' },
    { title: 'Clinical Excellence', desc: 'Continuous medical training, evidence-based dementia protocols, and early childhood education standards.' },
    { title: 'Family Partnership', desc: 'Open, transparent communications and direct portal updates keep family members continuously connected.' },
    { title: 'Community Warmth', desc: 'Creating a vibrant, intergenerational home where residents and children share smiles and joyful memories.' },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-900/80 text-sky-300 border border-sky-700/60">
            About Samanthasappy Home
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Our Story, Values & Care Philosophy
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Dedicated to setting the highest benchmark in elderly residential care, specialized dementia support, and early childhood daycare development.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Our Journey
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Founded on Love, Integrity, and Genuine Compassion
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Samanthasappy Home was established with a clear vision: to create a home environment where elderly residents receive the highest clinical care without losing the warmth and comfort of home, while young children learn and grow in a secure, loving community.
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Over the years, our organization has grown into a trusted sanctuary for families seeking reliable residential eldercare, memory therapy, domiciliary home visits, and early childhood daycare. We combine cutting-edge healthcare management software with deep human compassion.
            </p>

            <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900">Intergenerational Joy:</strong> We actively facilitate safe intergenerational activities where seniors and children share storytime and music, proven to enhance emotional cognitive well-being.
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white group">
              <img
                src="https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X=s1600"
                alt="Folasade Sanyaolu, LLB, QaAA"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('uc?export=view')) {
                    target.src = 'https://drive.google.com/uc?export=view&id=1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X';
                  }
                }}
                className="w-full h-96 object-cover"
              />
              {/* Lower Overlay Badge */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent p-5 text-white flex flex-col items-center justify-end text-center">
                <div className="font-extrabold text-xl sm:text-2xl text-white tracking-tight drop-shadow-md">
                  Folasade Sanyaolu
                </div>
                <div className="text-xs sm:text-sm font-semibold text-sky-300 tracking-wider uppercase drop-shadow-xs mt-0.5">
                  LLB, QaAA
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Mission</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To enrich the lives of elderly individuals and young children by delivering compassionate, personalized, high-quality care services. We empower residents to maintain their independence, dignity, and joy while offering families complete confidence and clear communication.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Our Vision</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                To remain the premier benchmark for holistic caregiving management across the region, where state-of-the-art health monitoring, intergenerational connection, and compassionate staff set the gold standard for care homes worldwide.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            Guiding Principles
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Our Core Care Values
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreValues.map((val, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xs">
                0{idx + 1}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{val.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Organizational Chart (Organogram) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrganizationChart />
      </section>

      {/* Consultation Call */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-slate-200">
          <h2 className="text-3xl font-extrabold text-slate-900">Experience Samanthasappy Home First-Hand</h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm">
            We invite you and your family to visit our suites, tour our memory lounges, and meet our senior clinical nurses.
          </p>
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm cursor-pointer"
          >
            Apply Now / Request Admission
          </button>
        </div>
      </section>

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home as HomeIcon, 
  Brain, 
  Baby, 
  Activity, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Pill, 
  Utensils, 
  Smile, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { setIsApplyModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'elderly' | 'child' | 'additional'>('all');

  const servicesList = [
    // Elderly Care
    {
      category: 'elderly',
      title: 'Residential Elderly Care',
      desc: 'Full residential suite living with 24/7 caregiving oversight, daily personal care, house-keeping, customized nutrition, and vibrant social activities.',
      features: ['24/7 Caregiving Supervision', 'Personal Hygiene & Bathing Assistance', 'Daily Housekeeping & Laundry', 'Nutritious Chef-Prepared Meals', 'Emergency Call System']
    },
    {
      category: 'elderly',
      title: 'Assisted Living',
      desc: 'Designed for seniors who value independence while receiving gentle assistance with daily tasks, medication reminders, and mobility support.',
      features: ['Independent Suite Options', 'Medication Management', 'Mobility & Transfer Support', 'Social Dining & Club Access', 'Scheduled Transportation']
    },
    {
      category: 'elderly',
      title: 'Specialized Dementia & Memory Support',
      desc: 'Evidence-based sensory therapy, Snoezelen light relaxation, validation communication, and memory stimulation in secure, soothing environments.',
      features: ['Certified Dementia Practitioners', 'Snoezelen Multi-Sensory Lounge', 'Memory Reminiscence Wall', 'De-escalation & Calming Protocols', 'Encrypted Family Portal Logs']
    },
    {
      category: 'elderly',
      title: 'Respite Care (Short-Term Stays)',
      desc: 'Temporary short-term residential stays providing relief for family caregivers during holidays or medical recoveries.',
      features: ['Flexible Duration (1 week to 3 months)', 'Full Suite Access', 'Complete Medical Vitals Tracking', 'Physical Therapy Access', 'Seamless Transition Back Home']
    },
    {
      category: 'elderly',
      title: 'End-of-Life & Palliative Support',
      desc: 'Compassionate, dignified comfort care focusing on pain relief, spiritual warmth, emotional support, and peaceful family presence.',
      features: ['Dedicated Palliative Caregivers', 'Pain & Symptom Management', 'Private Family Overnight Parlor', 'Spiritual & Emotional Counseling', '24/7 Family Access']
    },

    // Child Care
    {
      category: 'child',
      title: 'Sunshine Day Care Center',
      desc: 'Full-day and half-day early childhood care for toddlers and young children in a safe, soft-padded learning environment.',
      features: ['Montessori Learning Tools', 'Soft Impact Safeguarded Playroom', 'CCTV Monitored Entrances', 'Organic Snack & Lunch Menu', 'Pediatric First Aid Trained Staff']
    },
    {
      category: 'child',
      title: 'Early Learning & Cognitive Activities',
      desc: 'Structured early education focusing on language acquisition, motor skills, interactive storytime, numbers, and creative arts.',
      features: ['Montessori Educator Guided', 'Fine & Gross Motor Play', 'Music & Rhythmic Circle', 'Guided Clay & Watercolor Art', 'Progress Tracking Cards']
    },
    {
      category: 'child',
      title: 'Supervised Outdoor & Sensory Play',
      desc: 'Enclosed garden play park equipped with sandboxes, sensory water bays, and mini botanical gardening boxes.',
      features: ['Fenced Enclosed Play Park', 'Sensory Texture Station', 'Botanical Planting Box', 'Sun Safety Compliance', 'Constant Educator Ratios']
    },

    // Additional Services
    {
      category: 'additional',
      title: 'Domiciliary Care (Home Visit Visits)',
      desc: 'Professional caregivers visit clients in their own private homes to assist with morning routines, meal prep, and medication administration.',
      features: ['Morning & Evening Visits', 'Meal Preparation', 'Medication Reminders', 'Companionship Strolls']
    },
    {
      category: 'additional',
      title: 'Vulnerable Adult Support',
      desc: 'Tailored daily living assistance for adults with physical disabilities or sensory impairments seeking structured autonomy.',
      features: ['Individualized Care Plan', 'Sensory Accommodation', 'Life Skills & Mobility Coaching', 'Community Activity Outings', 'Safeguarded Advocacy']
    },
    {
      category: 'additional',
      title: 'Health Monitoring & Vital Analytics',
      desc: 'Routine daily check of blood pressure, heart rate, blood glucose, temperature, and weight recorded in encrypted EHR logs.',
      features: ['Daily Caregiver Health Checks', 'GP / Hospital Coordination', 'Emergency Tele-health Portal', 'Encrypted Relative Dashboard Access', 'Automated Health Alerts']
    },
    {
      category: 'additional',
      title: 'Dietitian Meal Planning & Hydration',
      desc: 'Chef-prepared fresh meals tailored to diabetic, low-sodium, dysphagia (pureed), halal, and vegetarian preferences.',
      features: ['Clinical Dietitian Review', 'Hydration Goal Tracking', 'Texture Modified Options', 'Fresh Farm-to-Table Ingredients', 'Special Family Dining Events']
    }
  ];

  const filteredServices = activeTab === 'all' 
    ? servicesList 
    : servicesList.filter(s => s.category === activeTab);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16 text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-900/80 text-sky-300 border border-sky-700/60">
            Care & Support Catalog
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Tailored Elderly Care, Child Daycare & Domiciliary Services
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            Every care plan at Samanthasappy Home is tailored to individual health, cognitive needs, and family preferences.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Services ({servicesList.length})
          </button>
          <button
            onClick={() => setActiveTab('elderly')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'elderly'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Elderly Residential & Memory Care
          </button>
          <button
            onClick={() => setActiveTab('child')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'child'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Child Care & Daycare Hub
          </button>
          <button
            onClick={() => setActiveTab('additional')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'additional'
                ? 'bg-sky-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Domiciliary & Health Monitoring
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.desc}
                </p>
                
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Includes:</div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {service.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full bg-slate-50 hover:bg-sky-50 text-sky-700 hover:text-sky-800 border border-slate-200 hover:border-sky-200 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Request Service Assessment <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

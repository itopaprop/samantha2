import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  Filter, 
  Ruler, 
  Award,
  Layers
} from 'lucide-react';

interface RoofingWorkItem {
  id: string;
  title: string;
  category: 'stone-coated' | 'aluminium' | 'commercial' | 'renovation';
  categoryLabel: string;
  location: string;
  material: string;
  scope: string;
  year: string;
  imageUrl: string;
  description: string;
}

export const RoofingGalleryPage: React.FC = () => {
  const { setCurrentPage, setIsApplyModalOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImageModal, setActiveImageModal] = useState<RoofingWorkItem | null>(null);

  const worksList: RoofingWorkItem[] = [
    {
      id: 'work-1',
      title: '5-Bedroom Luxury Villa - Milano Stone-Coated Tiles',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Lekki Phase 1, Lagos',
      material: 'Imported Milano Stone-Coated Steel (0.45mm)',
      scope: 'New Timber Truss Fabrication & Complete Roofing',
      year: '2025',
      imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      description: 'Custom engineered roof trusses and high-grade stone-coated tiles installed with zero leakage guarantee. Features integrated copper water gutters and acoustic sound-dampening underlayment.'
    },
    {
      id: 'work-2',
      title: 'Contemporary Duplex - Step Tile Aluminium Installation',
      category: 'aluminium',
      categoryLabel: 'Aluminium Step Tiles',
      location: 'Maitama, Abuja (FCT)',
      material: '0.55mm Premium Aluminium Step Tiles (Navy Blue)',
      scope: 'Structural Steel Framing & Sheet Roofing',
      year: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      description: 'Precision step tile alignment over a heavy-duty steel framework. Includes custom flashings, ridge caps, and anti-corrosive fasteners designed for maximum longevity.'
    },
    {
      id: 'work-3',
      title: 'Commercial Shopping Complex & Office Block',
      category: 'commercial',
      categoryLabel: 'Commercial & Industrial',
      location: 'GRA Phase 2, Port Harcourt',
      material: 'Industrial Decking & Long Span Aluminium (0.55mm)',
      scope: 'Heavy Industrial Truss System & Weatherproofing',
      year: '2025',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      description: 'Over 2,400 sq. meters of commercial roof area constructed with structural steel trusses and heavy gauge long-span aluminium sheets to withstand high humidity and tropical rains.'
    },
    {
      id: 'work-4',
      title: 'Residential Estate Re-roofing & Replacement',
      category: 'renovation',
      categoryLabel: 'Re-roofing & Repairs',
      location: 'Bodija Estate, Ibadan, Oyo State',
      material: 'Bond Stone-Coated Tiles (Terracotta Red)',
      scope: 'Old Asbestos Sheet Removal & Modern Re-Roofing',
      year: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80',
      description: 'Complete strip-down of damaged legacy roofing, timber truss structural reinforcement, and installation of stone-coated bond tiles for a modern aesthetic transform.'
    },
    {
      id: 'work-5',
      title: 'Private Mansion - Shingle Stone-Coated Design',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Banana Island, Ikoyi, Lagos',
      material: 'Architectural Shingle Stone Tiles (Charcoal Grey)',
      scope: 'Complex Multi-Gable Roof Construction',
      year: '2025',
      imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      description: 'High-pitch multi-gable roof design featuring architectural shingle tiles with premium UV protection and storm-resistant interlocking locking clips.'
    },
    {
      id: 'work-6',
      title: 'Warehouse & Logistics Facility Roofing',
      category: 'commercial',
      categoryLabel: 'Commercial & Industrial',
      location: 'Ikeja Industrial Zone, Lagos',
      material: 'Industrial Metcopo Aluminium & Thermal Insulation',
      scope: 'Large Span Warehouse Roof Installation',
      year: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      description: 'Large scale warehouse roofing fitted with double-sided thermal insulation foil to significantly lower internal factory temperatures and reduce HVAC energy demands.'
    },
    {
      id: 'work-7',
      title: 'Modern Terrace Houses Development',
      category: 'aluminium',
      categoryLabel: 'Aluminium Long Span',
      location: 'Alagbaka, Akure, Ondo State',
      material: 'Aluminium Metcopo Sheets (0.50mm Forest Green)',
      scope: 'Multi-Unit Housing Scheme Roof Installation',
      year: '2025',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
      description: 'Uniform roof line installation across 8 terrace housing units. Precision cutting and gutter channel engineering ensure zero rainwater overflow during torrential rainstorms.'
    },
    {
      id: 'work-8',
      title: 'Storm Damage Restoration & Roof Reconstruction',
      category: 'renovation',
      categoryLabel: 'Re-roofing & Repairs',
      location: 'Asokoro, Abuja (FCT)',
      material: 'Roman Stone-Coated Roof Tiles',
      scope: 'Emergency Structural Repairs & Total Tile Overlay',
      year: '2024',
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      description: 'Rapid emergency restoration following severe windstorm damage. Timber beams reinforced with steel plates and topped with stone-coated Roman profile tiles.'
    }
  ];

  const filteredWorks = selectedCategory === 'all' 
    ? worksList 
    : worksList.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-bold py-2.5 px-4 text-center tracking-wide shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>SAMANTHASAPPY ROOFING GALLERY — Verified Past Projects Across Nigeria</span>
          <span className="hidden sm:inline-block bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ml-2">
            250+ Successful Installations
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 bg-radial from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4 text-amber-400" />
            Master Craftsmanship Portfolio
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Samanthasappy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Roofing Works</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Explore our showcase of completed roofing projects across Lagos, Abuja, Port Harcourt, Ibadan, Akure, and nationwide in Nigeria.
          </p>

          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">250+</div>
              <div className="text-xs text-slate-400 font-medium">Completed Roofs</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
              <div className="text-xs text-slate-400 font-medium">Zero-Leak Guarantee</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">36</div>
              <div className="text-xs text-slate-400 font-medium">States Nationwide</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">15+ Yrs</div>
              <div className="text-xs text-slate-400 font-medium">Master Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-10">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-400" /> Filter:
          </span>
          
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            All Works ({worksList.length})
          </button>

          <button
            onClick={() => setSelectedCategory('stone-coated')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'stone-coated'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Stone-Coated Tiles
          </button>

          <button
            onClick={() => setSelectedCategory('aluminium')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'aluminium'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Aluminium Long Span & Step
          </button>

          <button
            onClick={() => setSelectedCategory('commercial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'commercial'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Commercial & Industrial
          </button>

          <button
            onClick={() => setSelectedCategory('renovation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'renovation'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Re-roofing & Repairs
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWorks.map((work) => (
            <div 
              key={work.id}
              onClick={() => setActiveImageModal(work)}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col shadow-xl"
            >
              {/* Image Box */}
              <div className="relative h-60 overflow-hidden bg-slate-950">
                <img
                  src={work.imageUrl}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-500/30 uppercase tracking-wider">
                  {work.categoryLabel}
                </div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-semibold">
                  {work.year}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors leading-snug">
                    {work.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-amber-300 mt-2 font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>{work.location}</span>
                  </div>

                  <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {work.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]">
                    <span className="text-slate-500">Material:</span> {work.material}
                  </span>
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* CTA Banner Section */}
        <div className="mt-16 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-8 sm:p-12 text-slate-950 text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-3xl mx-auto space-y-4 relative z-10">
            <span className="inline-block bg-slate-950 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              Ready to Roof Your Building?
            </span>
            
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">
              Get Your Free Site Inspection & BOQ Cost Estimate Today!
            </h2>

            <p className="text-slate-900 text-sm sm:text-base font-medium max-w-xl mx-auto">
              Our mobile roofing engineering teams travel directly to your building site anywhere in Nigeria.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => {
                  setCurrentPage('roofing-contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-slate-950 hover:bg-slate-900 text-amber-300 font-black px-8 py-4 rounded-xl text-sm transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Request Free Quote & Contact Us</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="tel:+2347069332193"
                className="w-full sm:w-auto bg-white/30 hover:bg-white/40 text-slate-950 font-extrabold px-6 py-4 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call +234 706 933 2193
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* Detail Lightbox Modal */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="relative h-72 sm:h-96">
              <img
                src={activeImageModal.imageUrl}
                alt={activeImageModal.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveImageModal(null)}
                className="absolute top-4 right-4 bg-slate-950/80 text-white hover:text-amber-400 p-2 rounded-full cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  {activeImageModal.categoryLabel}
                </span>
                <span className="text-xs text-slate-400">Completed in {activeImageModal.year}</span>
              </div>

              <h2 className="text-xl font-extrabold text-white">{activeImageModal.title}</h2>
              
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{activeImageModal.location}</span>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {activeImageModal.description}
              </p>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-400"><strong className="text-slate-200">Materials Used:</strong> {activeImageModal.material}</div>
                <div className="text-slate-400"><strong className="text-slate-200">Scope of Work:</strong> {activeImageModal.scope}</div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setActiveImageModal(null);
                    setCurrentPage('roofing-contact');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Request Similar Roofing Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

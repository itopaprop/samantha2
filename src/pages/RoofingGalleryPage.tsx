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
  driveId: string;
  title: string;
  category: 'stone-coated' | 'aluminium' | 'commercial' | 'renovation';
  categoryLabel: string;
  location: string;
  material: string;
  scope: string;
  year: string;
  description: string;
}

export const RoofingGalleryPage: React.FC = () => {
  const { setCurrentPage } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeImageModal, setActiveImageModal] = useState<RoofingWorkItem | null>(null);

  const worksList: RoofingWorkItem[] = [
    {
      id: 'work-1',
      driveId: '1VSn9hpU38T2ork4Fw6lCHLqW7ENQC-7L',
      title: 'Luxury Villa Milano Stone-Coated Roofing',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Lekki Phase 1, Lagos',
      material: 'Imported Milano Stone-Coated Steel (0.45mm)',
      scope: 'New Timber Truss Fabrication & Complete Roofing',
      year: '2025',
      description: 'Custom engineered roof trusses and high-grade stone-coated tiles installed with zero leakage guarantee. Features integrated copper water gutters and acoustic sound-dampening underlayment.'
    },
    {
      id: 'work-2',
      driveId: '1FI1zsbBW6h6VFKuTk43nqg7Ftz_FqJjS',
      title: 'Modern Executive Duplex Step-Tile Installation',
      category: 'aluminium',
      categoryLabel: 'Aluminium Step Tiles',
      location: 'Maitama, Abuja (FCT)',
      material: '0.55mm Premium Aluminium Step Tiles (Navy Blue)',
      scope: 'Structural Steel Framing & Sheet Roofing',
      year: '2025',
      description: 'Precision step tile alignment over a heavy-duty steel framework. Includes custom flashings, ridge caps, and anti-corrosive fasteners designed for maximum longevity.'
    },
    {
      id: 'work-3',
      driveId: '1m6GVt6xTUhLqThoFSd75ETMsyorwF35a',
      title: 'Commercial Plaza & Office Complex Roofing',
      category: 'commercial',
      categoryLabel: 'Commercial & Industrial',
      location: 'GRA Phase 2, Port Harcourt',
      material: 'Industrial Decking & Long Span Aluminium (0.55mm)',
      scope: 'Heavy Industrial Truss System & Weatherproofing',
      year: '2025',
      description: 'Over 2,400 sq. meters of commercial roof area constructed with structural steel trusses and heavy gauge long-span aluminium sheets to withstand high humidity and tropical rains.'
    },
    {
      id: 'work-4',
      driveId: '1LZLjvA0w8qxoPCaafeRurpuHAxUK8SVv',
      title: 'Residential Mansion Bond Tile Transformation',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Banana Island, Ikoyi, Lagos',
      material: 'Bond Stone-Coated Tiles (Terracotta Red)',
      scope: 'Custom Multi-Gable Roof Construction',
      year: '2024',
      description: 'High-pitch multi-gable roof design featuring architectural stone tiles with premium UV protection and storm-resistant interlocking clips.'
    },
    {
      id: 'work-5',
      driveId: '1k4hPVvPC9HE9BV0KVc_Usq9tgAaeXxGf',
      title: 'Estate Development Re-Roofing & Upgrade',
      category: 'renovation',
      categoryLabel: 'Re-roofing & Repairs',
      location: 'Bodija Estate, Ibadan, Oyo State',
      material: 'Roman Stone-Coated Tiles (Charcoal Black)',
      scope: 'Asbestos Strip-down & Modern Timber Reinforcement',
      year: '2024',
      description: 'Complete strip-down of damaged legacy roofing, timber truss structural reinforcement, and installation of stone-coated bond tiles for a modern aesthetic transform.'
    },
    {
      id: 'work-6',
      driveId: '1-0r264Gcd43gD9wwSPL5Ubc17q5ETnM4',
      title: 'Industrial Logistics Warehouse Roof Installation',
      category: 'commercial',
      categoryLabel: 'Commercial & Industrial',
      location: 'Ikeja Industrial Zone, Lagos',
      material: 'Industrial Metcopo Aluminium & Thermal Insulation',
      scope: 'Large Span Steel Truss Construction',
      year: '2025',
      description: 'Large scale warehouse roofing fitted with double-sided thermal insulation foil to significantly lower internal factory temperatures and reduce HVAC energy demands.'
    },
    {
      id: 'work-7',
      driveId: '10ND5d-59o2ZEBzNUAgE3D03LJyECMAFc',
      title: 'Terrace House Multi-Unit Longspan Roofing',
      category: 'aluminium',
      categoryLabel: 'Aluminium Long Span',
      location: 'Alagbaka, Akure, Ondo State',
      material: 'Aluminium Metcopo Sheets (0.50mm Forest Green)',
      scope: 'Multi-Unit Housing Scheme Roof Structure',
      year: '2025',
      description: 'Uniform roof line installation across 8 terrace housing units. Precision cutting and gutter channel engineering ensure zero rainwater overflow during torrential rainstorms.'
    },
    {
      id: 'work-8',
      driveId: '1KzN0BsODaNNFDvSw3tSri6ItpV7uZDUw',
      title: 'Custom Curved Architectural Roof Engineering',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Asokoro, Abuja (FCT)',
      material: 'Shingle Stone-Coated Steel (0.45mm)',
      scope: 'Curved Dome & Hip Roof Fabrication',
      year: '2024',
      description: 'Rapid emergency restoration following severe windstorm damage. Timber beams reinforced with steel plates and topped with stone-coated Roman profile tiles.'
    },
    {
      id: 'work-9',
      driveId: '13SRIlLkkBiyjg-cULyxcPDwY4SOVAb6Y',
      title: 'Private Residence Roof Restoration & Leak Sealing',
      category: 'renovation',
      categoryLabel: 'Re-roofing & Repairs',
      location: 'Victoria Island, Lagos',
      material: 'High-Density Ridge Caps & Waterproof Membranes',
      scope: 'Leak Detection & Complete Ridge Restoration',
      year: '2025',
      description: 'Comprehensive leak isolation and ridge sealing on a multi-wing private residence with high-tensile waterproof sealant and new flashings.'
    },
    {
      id: 'work-10',
      driveId: '1BSSdyrNYBgk2ER52Vnqdf_ZtSsGkK1D_',
      title: 'High-Pitch Duplex Stone-Coated Shingle Roofing',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Enugu Urban, Enugu State',
      material: 'Classic Shingle Stone Tiles (Burgundy)',
      scope: 'High-Pitch Timber Truss Work & Valley Gutter Installation',
      year: '2024',
      description: 'Crafted with high-angle timber rafters and fireproof stone tiles to give the estate duplex an elegant European architectural profile.'
    },
    {
      id: 'work-11',
      driveId: '14NaPm-g0j3feVrm_69t7RKeIGceyhRHL',
      title: 'Institutional Center & School Assembly Roof',
      category: 'commercial',
      categoryLabel: 'Commercial & Industrial',
      location: 'Epe, Lagos State',
      material: '0.55mm Heavy Duty Aluminium Long Span',
      scope: 'Auditorium Steel Truss & Sheet Laying',
      year: '2025',
      description: 'Span steel frame roofing project engineered for structural safety and storm deflection across an 1,800 sq. meter institutional multi-purpose facility.'
    },
    {
      id: 'work-12',
      driveId: '1q-lnP8FyU9H_nCBV1G_O-nodOeeh2Xs-',
      title: 'Luxury Contemporary Villa Wood Truss Construction',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Chevron Drive, Lekki, Lagos',
      material: 'Milano Stone Tiles & Treated Hardwood Trusses',
      scope: 'Precision Angle Wood Truss Framing & Tiling',
      year: '2025',
      description: 'Engineered treated hardwood trussing covered with anti-rust Milano stone tiles, complete with recessed rain gutters and snow/hail barrier guards.'
    },
    {
      id: 'work-13',
      driveId: '1BFpEaa_S-4BtfR1JI95-MfoKH57whTO3',
      title: 'Aluminium Metcopo Residential Roofing Project',
      category: 'aluminium',
      categoryLabel: 'Aluminium Step Tiles',
      location: 'Jabi, Abuja (FCT)',
      material: '0.50mm Metcopo Aluminium (Wine Red)',
      scope: 'Residential Metcopo Roofing & Flashing',
      year: '2024',
      description: 'Vibrant wine-red metcopo aluminium sheets fitted on treated wood rafters with heavy duty rubber washer anti-corrosive screws.'
    },
    {
      id: 'work-14',
      driveId: '1pFEez5FIT4Mt3tnU8661AeT6aEV23x5p',
      title: 'Multi-Level Penthouse Stone-Coated Roof',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Gwarinpa Estate, Abuja',
      material: 'Bond Stone-Coated Steel (0.45mm)',
      scope: 'Penthouse Roof Overhaul & Copper Gutters',
      year: '2025',
      description: 'Sophisticated penthouse roof installation delivering complete thermal comfort, acoustic dampening, and storm protection.'
    },
    {
      id: 'work-15',
      driveId: '1SinDXH81Z3dDJu0ZhWZBxK-YY1xgSQE_',
      title: 'Factory Plant & Industrial Sheeting Project',
      category: 'commercial',
      categoryLabel: 'Commercial & Industrial',
      location: 'Agbara Industrial Estate, Ogun State',
      material: 'Corrugated Steel Sheeting & Heat Barrier',
      scope: 'Industrial Factory Sheeting & Ventilation Cap',
      year: '2024',
      description: 'Heavy duty industrial roof sheeting over structural steel trusses built for high durability, weather resistance, and thermal control.'
    },
    {
      id: 'work-16',
      driveId: '13oG3DRDtvVzgOojen-F2zk7ykLZHa-N-',
      title: 'Heritage Building Roof Overhaul & Modernization',
      category: 'renovation',
      categoryLabel: 'Re-roofing & Repairs',
      location: 'Calabar, Cross River State',
      material: 'Milano Stone-Coated Tiles (Bronze Brown)',
      scope: 'Historical Structure Roof Replacement',
      year: '2024',
      description: 'Precision roof replacement preserving the structural character of the building while replacing aged roof materials with lifetime stone tiles.'
    },
    {
      id: 'work-17',
      driveId: '1OatcIfeCIO07Jd5oZBPIuo3OE0P35NZg',
      title: 'Suburban Residential Detached House Roofing',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Ibeju-Lekki, Lagos',
      material: 'Roman Stone Tiles (Slate Grey)',
      scope: 'Complete Residential Wood Truss & Tile Laying',
      year: '2025',
      description: 'Clean slate grey stone-coated roof installation with reinforced eaves and seamless water flow channels.'
    },
    {
      id: 'work-18',
      driveId: '1nh1mqDPWFY4YPoA23tkupM_bHHOL9_pO',
      title: 'Modern Step Tile Aluminium Duplex Roofing',
      category: 'aluminium',
      categoryLabel: 'Aluminium Step Tiles',
      location: 'Warri, Delta State',
      material: '0.55mm Step Tile Aluminium Sheets (Chocolate)',
      scope: 'Duplex Roof Framing & Gutters',
      year: '2024',
      description: 'Chocolate brown aluminium step tiles mounted on high gauge steel framework for maximum wind resistance and modern aesthetics.'
    },
    {
      id: 'work-19',
      driveId: '1lpKttbP2xvN1XhIo4KPT9Nj3h_MtaJ44',
      title: 'Event Hall Roof Construction & Waterproofing',
      category: 'commercial',
      categoryLabel: 'Commercial & Industrial',
      location: 'Ikeja, Lagos',
      material: 'Industrial Metcopo Aluminium & Sound-Dampening Foil',
      scope: 'Clear-Span Steel Truss & Acoustic Insulation',
      year: '2025',
      description: 'Large clear-span steel truss roof structure engineered for high acoustic insulation and zero water retention during rainstorms.'
    },
    {
      id: 'work-20',
      driveId: '13dlMxWy1wGgwcWjlUQxMF-3uRNkDRrDh',
      title: 'Storm-Proof Coastal Mansion Roofing',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Oniru Estate, Victoria Island, Lagos',
      material: 'Heavy Duty Milano Stone Tiles with Anti-Wind Clips',
      scope: 'Coastal High-Wind Resistant Roof Installation',
      year: '2025',
      description: 'Engineered specifically for coastal atmospheric exposure with corrosion-proof fasteners and interlocking stone tiles.'
    },
    {
      id: 'work-21',
      driveId: '1INhmG73adCLN7k5Lt2wFiW3OddxrSCSG',
      title: 'Estate Entry Gatehouse & Security Post Roof',
      category: 'aluminium',
      categoryLabel: 'Aluminium Long Span',
      location: 'Katampe Extension, Abuja',
      material: '0.50mm Long Span Aluminium (Royal Blue)',
      scope: 'Gatehouse Architectural Roof Structure',
      year: '2024',
      description: 'Architectural entry roof canopy designed with precision pitch and royal blue aluminium sheets for an impressive estate landmark.'
    },
    {
      id: 'work-22',
      driveId: '1D4QwNDKpOAq1gLDt_jr8v--HprFonSe7',
      title: 'Residential Bungalow Roof Re-decking & Tiling',
      category: 'renovation',
      categoryLabel: 'Re-roofing & Repairs',
      location: 'Abeokuta, Ogun State',
      material: 'Bond Stone Tiles & Treated Wood Purlins',
      scope: 'Re-decking, Truss Reinforcement & Re-tiling',
      year: '2025',
      description: 'Comprehensive re-decking and structural upgrade replacing rotten wooden purlins with anti-termite treated timber and new bond stone tiles.'
    },
    {
      id: 'work-23',
      driveId: '16debYQ8RAvyuuRMpbLTGMfZZZoFLySIr',
      title: 'Contemporary Master Piece Mansion Roofing',
      category: 'stone-coated',
      categoryLabel: 'Stone-Coated Tiles',
      location: 'Guzape, Abuja (FCT)',
      material: 'Shingle Stone-Coated Steel (0.45mm Black)',
      scope: 'Multi-Level Architectural Roof Construction',
      year: '2025',
      description: 'Stunning multi-tiered mansion roof featuring charcoal black stone shingle tiles, hidden internal drain pipes, and premium fascia board finishing.'
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
                  src={`https://lh3.googleusercontent.com/d/${work.driveId}=s1600`}
                  alt={work.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('uc?export=view')) {
                      target.src = `https://drive.google.com/uc?export=view&id=${work.driveId}`;
                    }
                  }}
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
            <div className="relative h-72 sm:h-96 bg-slate-950">
              <img
                src={`https://lh3.googleusercontent.com/d/${activeImageModal.driveId}=s1600`}
                alt={activeImageModal.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('uc?export=view')) {
                    target.src = `https://drive.google.com/uc?export=view&id=${activeImageModal.driveId}`;
                  }
                }}
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

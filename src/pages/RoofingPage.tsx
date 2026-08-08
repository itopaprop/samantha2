import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Home, 
  Building2, 
  Wrench, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Award, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Ruler, 
  FileText, 
  Send,
  MessageCircle
} from 'lucide-react';

export const RoofingPage: React.FC = () => {
  const { showToast, setIsApplyModalOpen, setCurrentPage } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    stateLocation: 'Lagos',
    roofType: 'Stone-Coated Roof Tiles',
    projectScope: 'New Building Roofing',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      showToast('Please provide your name and phone number for a free quote.');
      return;
    }
    setSubmitted(true);
    showToast('Quote request submitted! A Samanthasappy Roofing specialist will contact you shortly.');
  };

  const services = [
    {
      id: 'residential',
      icon: Home,
      title: 'Residential Roofing',
      desc: 'Premium stone-coated shingles, aluminium long-span, step tiles, and metcopo designs crafted for elegant, durable home protection.',
      features: ['Stone-Coated Roof Tiles', 'Aluminium Long Span & Step Tiles', 'Architectural Shingles', 'Custom Gutters & Accessories']
    },
    {
      id: 'commercial',
      icon: Building2,
      title: 'Commercial & Industrial Roofing',
      desc: 'Heavy-duty structural roofing solutions for warehouses, shopping complexes, office towers, and institutional facilities.',
      features: ['Industrial Decking & Sheeting', 'Truss Fabrication & Installation', 'Large Scale Weatherproofing', 'Thermal & Acoustic Insulation']
    },
    {
      id: 'repair',
      icon: Wrench,
      title: 'Roof Repair & Maintenance',
      desc: 'Expert leak diagnosis, damaged tile replacement, re-roofing, rust prevention, and structural reinforcement.',
      features: ['Leak Detection & Waterproofing', 'Tile & Sheet Replacement', 'Wood Truss Repair', 'Gutter Cleaning & Flushing']
    },
    {
      id: 'inspection',
      icon: Search,
      title: 'Roof Inspection & Structural Audits',
      desc: 'Comprehensive engineering assessments to detect hidden structural defects, water seepage risks, and longevity estimates.',
      features: ['Pre-Purchase Inspections', 'Post-Storm Damage Assessment', 'Structural Integrity Reports', 'Maintenance Planning']
    },
    {
      id: 'emergency',
      icon: AlertTriangle,
      title: 'Emergency Roof Services',
      desc: '24/7 rapid response team for sudden storm damage, fallen tree impacts, severe leaks, or structural failures.',
      features: ['Rapid On-Site Tarping', 'Emergency Leak Sealing', 'Hazard Mitigation', 'Fast-Track Restoration']
    }
  ];

  const valuePillars = [
    {
      icon: ShieldCheck,
      title: 'Premium Materials',
      desc: 'Imported high-grade stone-coated tiles, heavy-gauge aluminium, and corrosion-resistant fasteners.'
    },
    {
      icon: Award,
      title: 'Expert Craftsmen',
      desc: 'Certified roof engineers and master installers with over 15 years of proven hands-on mastery.'
    },
    {
      icon: Clock,
      title: 'On-Time Delivery',
      desc: 'Strict project timelines backed by efficient logistics so your build stays on schedule.'
    },
    {
      icon: CheckCircle2,
      title: 'Quality Guaranteed',
      desc: 'Comprehensive structural warranties ensuring long-term peace of mind for decades.'
    }
  ];

  const galleryImages = [
    {
      driveId: '1VSn9hpU38T2ork4Fw6lCHLqW7ENQC-7L',
      title: 'Luxury Villa Milano Roofing',
      type: 'Stone-Coated Bond Tiles'
    },
    {
      driveId: '1FI1zsbBW6h6VFKuTk43nqg7Ftz_FqJjS',
      title: 'Modern Executive Duplex',
      type: 'Aluminium Step Tiles'
    },
    {
      driveId: '1m6GVt6xTUhLqThoFSd75ETMsyorwF35a',
      title: 'Commercial Plaza Roofing',
      type: 'Industrial Long Span'
    },
    {
      driveId: '1LZLjvA0w8qxoPCaafeRurpuHAxUK8SVv',
      title: 'Mansion Roof Renovation',
      type: 'Milano Stone-Coated'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-bold py-2.5 px-4 text-center tracking-wide shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>SAMANTHASAPPY ROOFING — Service Available Nationwide across Nigeria!</span>
          <span className="hidden sm:inline-block bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ml-2">
            Free Quote & Site Inspection
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-radial from-slate-800 via-slate-900 to-slate-950">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Nigeria&apos;s Trusted Roofing Specialists
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Samanthasappy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Roofing</span>
              </h1>

              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight">
                PREMIUM ROOFING SOLUTIONS BUILT TO LAST!
              </p>

              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Protecting your home and investments with world-class roofing materials, master craftsmanship, and lifetime durability. From residential stone-coated tiles to massive commercial structures.
              </p>

              {/* 4 Quick Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                {valuePillars.map((pillar, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-center flex flex-col items-center">
                    <pillar.icon className="w-6 h-6 text-amber-400 mb-1.5" />
                    <span className="text-xs font-bold text-white leading-snug">{pillar.title}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <a
                  href="#quote-section"
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black px-8 py-4 rounded-xl text-base shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Get Free Quote
                  <ArrowRight className="w-5 h-5" />
                </a>

                <a
                  href="tel:+2347069332193"
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold px-6 py-4 rounded-xl text-base border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-5 h-5 text-emerald-400" />
                  Call: +234 706 933 2193
                </a>
              </div>

              {/* Nationwide Tag */}
              <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 text-sm text-slate-400">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                <span>Service Available Nationwide across all 36 States in Nigeria</span>
              </div>
            </div>

            {/* Right Side: Official Banner Presentation */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-md w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-3xl blur-md opacity-50 group-hover:opacity-80 transition duration-500"></div>
                <div className="relative bg-slate-950 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-2xl">
                  <img
                    src="https://lh3.googleusercontent.com/d/1vQgWPSed5zT4OPOOWJ1WpIwvrcS7wY_-=s1600"
                    alt="Samanthasappy Roofing Official Banner"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('uc?export=view')) {
                        target.src = 'https://drive.google.com/uc?export=view&id=1vQgWPSed5zT4OPOOWJ1WpIwvrcS7wY_-';
                      }
                    }}
                    className="w-full h-auto object-contain rounded-xl"
                  />
                  <div className="p-4 bg-slate-900 border-t border-slate-800 text-center">
                    <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase">
                      STRONG ROOFS. SAFE HOMES. BETTER FUTURES.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Services List Section */}
      <section className="py-20 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Our Expertise
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Comprehensive Roofing Solutions
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Whether you are building a new residential home, managing an industrial site, or restoring an aged roof, Samanthasappy Roofing delivers unmatched quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-lg"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <service.icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {service.desc}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {service.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#quote-section"
                  className="w-full py-2.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 font-bold text-xs rounded-xl text-center transition-colors flex items-center justify-center gap-2"
                >
                  Request Quote for {service.title.split(' ')[0]}
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}

            {/* Banner Service Card Highlight */}
            <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-900/30 border-2 border-amber-500/50 rounded-2xl p-6 flex flex-col justify-between text-white shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-5 font-black text-lg">
                  100%
                </div>
                <h3 className="text-xl font-bold text-amber-300 mb-2">
                  Nationwide Coverage Across Nigeria
                </h3>
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  Our mobile roofing engineering teams travel directly to your construction site anywhere in Lagos, Abuja, Port Harcourt, Ibadan, Kano, or any state nationwide.
                </p>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-amber-500/30 mb-4">
                  <div className="text-xs font-semibold text-amber-400 mb-1">Guaranteed Service Standard:</div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>• Zero leak lifetime craftsmanship guarantee</p>
                    <p>• Fast quotation within 2 hours</p>
                    <p>• On-site measurement and sample presentation</p>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/2347069332193?text=Hello%20Samanthasappy%20Home%2C%20I%20would%20like%20to%20chat%20with%20a%20roof%20engineer."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl text-center transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                Chat with roof engineer now
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* Materials & Quality Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Premium Grade Materials
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Engineered to withstand harsh weather, intense heat & heavy rains
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                At Samanthasappy Roofing, we never compromise on quality. We source certified stone-coated steel roof tiles, anti-corrosive aluminium sheets, and high-tensile trusses designed specifically for tropical climates.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Noise & Heat Reduction Technology</h4>
                    <p className="text-xs text-slate-400">Our stone-coated and insulated tile designs reduce tropical rain noise and keep interior home temperatures cool.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Precision Truss & Wood Structure Engineering</h4>
                    <p className="text-xs text-slate-400">Accurate pitch angle design preventing water pooling and ensuring structural resilience against strong storm winds.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Transparent Pricing & Free Site Audits</h4>
                    <p className="text-xs text-slate-400">No hidden charges. Detailed Bill of Quantities (BOQ) with precise square-meter measurements before work starts.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Featured Completed Projects</h3>
                <button
                  onClick={() => {
                    setCurrentPage('roofing-gallery');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center gap-1 cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-colors"
                >
                  <span>View Full Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden group shadow-md border border-slate-800 cursor-pointer" onClick={() => { setCurrentPage('roofing-gallery'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <img
                      src={`https://lh3.googleusercontent.com/d/${img.driveId}=s1600`}
                      alt={img.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('uc?export=view')) {
                          target.src = `https://drive.google.com/uc?export=view&id=${img.driveId}`;
                        }
                      }}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90 p-3 flex flex-col justify-end">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{img.type}</span>
                      <span className="text-xs font-semibold text-white leading-tight">{img.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Free Quote Form Section */}
      <section id="quote-section" className="py-20 bg-slate-950 relative border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest">
                Fast Response Guaranteed
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Request a Free Roofing Quote
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Fill out the form below or call us directly. Our engineers will calculate your project cost and contact you with sample materials.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-white">Thank You for Reaching Out!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Your quote request has been received by our senior roofing engineer. We will review your requirements and call you at <span className="text-amber-400 font-bold">{formData.phone}</span> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Submit Another Quote Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Chief Ogunlesi"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Phone Number (WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      State / Location in Nigeria
                    </label>
                    <select
                      value={formData.stateLocation}
                      onChange={(e) => setFormData({ ...formData, stateLocation: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Lagos">Lagos State</option>
                      <option value="Abuja">Abuja (FCT)</option>
                      <option value="Ogun">Ogun State</option>
                      <option value="Oyo">Oyo State (Ibadan)</option>
                      <option value="Rivers">Rivers State (Port Harcourt)</option>
                      <option value="Edo">Edo State</option>
                      <option value="Kano">Kano State</option>
                      <option value="Other">Other State Nationwide</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Preferred Roof Material
                    </label>
                    <select
                      value={formData.roofType}
                      onChange={(e) => setFormData({ ...formData, roofType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Stone-Coated Roof Tiles">Stone-Coated Roof Tiles (Bond / Milano / Shingle)</option>
                      <option value="Aluminium Long Span">Aluminium Long Span (0.45mm / 0.55mm)</option>
                      <option value="Aluminium Step Tiles">Aluminium Step Tiles / Metcopo</option>
                      <option value="Architectural Shingles">Architectural Shingles</option>
                      <option value="Roof Repair & Leak Sealing">Roof Repair & Leak Sealing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Project Scope
                    </label>
                    <select
                      value={formData.projectScope}
                      onChange={(e) => setFormData({ ...formData, projectScope: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="New Building Roofing">New Building Construction</option>
                      <option value="Re-roofing / Replacement">Re-roofing / Total Replacement</option>
                      <option value="Commercial Complex">Commercial / Estate Complex</option>
                      <option value="Emergency Repair">Emergency Roof Leak Repair</option>
                    </select>
                  </div>

                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Project Details / Estimated Roof Size (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your building stage, estimated square meters, or specific questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black py-4 rounded-xl text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Submit Free Quote Request
                </button>
              </form>
            )}

            {/* Direct Contact Bar */}
            <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Phone className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-xs text-slate-400">Direct Hotline</span>
                <span className="text-sm font-bold text-white">+234 706 933 2193</span>
              </div>
              <div className="flex flex-col items-center">
                <Mail className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-xs text-slate-400">Email Enquiries</span>
                <span className="text-sm font-bold text-white">roofing@samanthasappyhome.com</span>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="w-5 h-5 text-amber-400 mb-1" />
                <span className="text-xs text-slate-400">Headquarters</span>
                <span className="text-sm font-bold text-white">Lagos & Nationwide Nigeria</span>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

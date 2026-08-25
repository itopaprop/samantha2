import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle,
  Award
} from 'lucide-react';

export const RoofingContactPage: React.FC = () => {
  const { showToast } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    stateLocation: 'Lagos',
    roofType: 'Stone-Coated Roof Tiles',
    projectScope: 'New Building Roofing',
    estimatedSize: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      showToast('Please enter your full name and phone number.');
      return;
    }
    setSubmitted(true);
    showToast('Quote request sent! Our Senior Roof Engineer will call you shortly.');
  };

  const faqs = [
    {
      q: 'How quickly can I get a cost estimate for my roof?',
      a: 'Once you submit your project dimensions or roof plan drawings, our engineers calculate a complete Bill of Quantities (BOQ) within 2 hours.'
    },
    {
      q: 'Do you travel to site for measurements outside Lagos & Abuja?',
      a: 'Yes! Samanthasappy Roofing engineering teams operate nationwide across all 36 states in Nigeria for site measurement, roof inspection, and tile delivery.'
    },
    {
      q: 'What warranty comes with your stone-coated roof tiles?',
      a: 'Our premium stone-coated steel tiles carry a structural lifetime warranty against rust, severe wind damage, and tile color fading.'
    },
    {
      q: 'Do you fabricate and install timber and steel roof trusses?',
      a: 'Yes, we handle complete turnkey roofing: structural truss design, wood/steel fabrication, fascia board fitting, guttering, and tile installation.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs sm:text-sm font-bold py-2.5 px-4 text-center tracking-wide shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>CONTACT SAMANTHASAPPY ROOFING — Free Quotes & Immediate Site Visits Nationwide</span>
          <span className="hidden sm:inline-block bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ml-2">
            Hotline: +234 706 933 2193
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative pt-12 pb-16 bg-radial from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            24/7 Roofing Engineering Desk
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Contact Samanthasappy <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Roofing Team</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Have questions about roof materials, square-meter estimates, or site inspections? Get in touch with our master roof engineers today.
          </p>
        </div>
      </section>

      {/* Contact Cards & Form Container */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Direct Contact Info & Coverage */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Engineering Support Hotlines
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Direct Call / WhatsApp Hotline</div>
                    <a href="tel:+2347069332193" className="font-bold text-white hover:text-amber-400 text-base">
                      +234 706 933 2193
                    </a>
                    <div className="text-[11px] text-slate-400 mt-0.5">+234 708 969 9883 | +234 814 047 7119 | 08126679055</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Official Roofing Email</div>
                    <a href="mailto:roofing@samanthasappyhome.com" className="font-bold text-white hover:text-amber-400 text-sm">
                      roofing@samanthasappyhome.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Regional Engineering Bases</div>
                    <div className="font-bold text-white text-sm">Lagos, Abuja, Port Harcourt, Akure</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Serving all 36 States Nationwide in Nigeria</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Working Hours</div>
                    <div className="font-bold text-white text-sm">Mon - Sat: 08:00 - 18:00</div>
                    <div className="text-[11px] text-emerald-400 mt-0.5">24/7 Emergency Storm Damage & Leak Sealing Response</div>
                  </div>
                </div>
              </div>

            </div>

            {/* Nationwide Coverage Badges */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                Nationwide Deployment Coverage
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We deliver roofing materials and deploy expert installation teams directly to your construction site anywhere in Nigeria:
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['Lagos', 'Abuja (FCT)', 'Port Harcourt', 'Ibadan', 'Akure', 'Edo', 'Kano', 'Enugu', 'Calabar', 'Delta', 'Nationwide 36 States'].map((st, i) => (
                  <span key={i} className="text-[11px] bg-slate-950 text-slate-200 border border-slate-700/80 px-2.5 py-1 rounded-lg font-medium">
                    ✓ {st}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Quote Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="space-y-2 mb-8">
              <span className="text-amber-400 font-bold text-xs uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Fast Quote Request
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Request a Free Roofing Estimate
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Fill in your project details below and our roof engineer will contact you with a transparent pricing sheet and material samples.
              </p>
            </div>

            {submitted ? (
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-white">Quote Request Received!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you <span className="text-amber-400 font-bold">{formData.fullName}</span>. Our senior roofing engineer will review your project in <span className="text-amber-400 font-bold">{formData.stateLocation}</span> and call you at <span className="text-amber-400 font-bold">{formData.phone}</span> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Engineer Adebayo"
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
                      Project State Location
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
                      <option value="Ondo">Ondo State (Akure)</option>
                      <option value="Other">Other State Nationwide</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Preferred Material
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
                      Estimated Roof Area (sqm)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 350 sqm or Don't Know"
                      value={formData.estimatedSize}
                      onChange={(e) => setFormData({ ...formData, estimatedSize: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Project Description / Special Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional info about your building structure, lintel stage, or site location..."
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
                  Send Quote Request to Roof Specialist
                </button>
              </form>
            )}

          </div>

        </div>

        {/* FAQs Section */}
        <div className="mt-20 border-t border-slate-800 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Roofing Consultation FAQs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
                <h3 className="font-bold text-white text-base flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
};

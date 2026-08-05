import React from 'react';
import { useApp, PageView } from '../../context/AppContext';
import { Heart, MapPin, Phone, Mail, ShieldCheck, Award, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentPage, setIsApplyModalOpen } = useApp();

  const handleNav = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
              </div>
              <span className="font-bold text-white text-xl tracking-tight">Samanthasappy Home</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              Providing compassionate, dignified, and professional elderly care and early child care services. Dedicated to enriching lives in a loving, secure, family-centered residential and community environment.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-sky-400 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" /> Care Quality Regulated
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-teal-400 border border-slate-700">
                <Award className="w-3.5 h-3.5" /> Certified Excellence
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Care Services</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handleNav('services')} className="hover:text-sky-400 transition-colors">Residential Elderly Care</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-sky-400 transition-colors">Dementia Support</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-sky-400 transition-colors">Child Care & Daycare</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-sky-400 transition-colors">Domiciliary Home Care</button></li>
              <li><button onClick={() => handleNav('services')} className="hover:text-sky-400 transition-colors">Vulnerable Adult Support</button></li>
            </ul>
          </div>

          {/* Organization */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Explore Home</h3>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => handleNav('about')} className="hover:text-sky-400 transition-colors">Our Story & Vision</button></li>
              <li><button onClick={() => handleNav('facilities')} className="hover:text-sky-400 transition-colors">Facility Tour & Suites</button></li>
              <li><button onClick={() => handleNav('gallery')} className="hover:text-sky-400 transition-colors">Photo Gallery</button></li>
              <li><button onClick={() => handleNav('careers')} className="hover:text-sky-400 transition-colors">Careers & Training</button></li>
              <li><button onClick={() => handleNav('login')} className="hover:text-sky-400 transition-colors font-medium text-amber-400">Portal Login</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Get In Touch</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>No5 Ilemo Street, Ijapo Estate, Akure 340110, Ondo, Nigeria</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">+2347069332193, +2347089699883, +2348140477119</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>care@samanthasappy.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>24/7 Nursing Staff On Duty</span>
              </li>
            </ul>

            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="mt-2 w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              Apply Now
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Samanthasappy Home Care Management Ltd. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">GDPR Privacy Architecture</span>
            <span className="hover:text-slate-400 cursor-pointer">Accessibility Statement</span>
            <span className="hover:text-slate-400 cursor-pointer">Safeguarding Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

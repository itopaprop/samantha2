import React, { useState } from 'react';
import { useApp, PageView } from '../../context/AppContext';
import { 
  Heart, 
  Phone, 
  User as UserIcon, 
  Menu, 
  X, 
  ShieldCheck, 
  LogOut, 
  LayoutDashboard,
  Clock,
  ChevronDown,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    currentUser, 
    switchDemoRole, 
    logout, 
    setIsApplyModalOpen
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState('https://lh3.googleusercontent.com/d/1sUJpAFMzsPRgNuvKDSyRU01sgnLK41Fg');

  const isRoofingPage = currentPage === 'roofing' || currentPage === 'roofing-gallery' || currentPage === 'roofing-contact';

  // Standard navbar links for Caregiver site (Roofing Solutions removed as requested)
  const navLinks: { label: string; page: PageView }[] = [
    { label: 'Home', page: 'home' },
    { label: 'About Us', page: 'about' },
    { label: 'Services', page: 'services' },
    { label: 'Facilities', page: 'facilities' },
    { label: 'Events', page: 'events' },
    { label: 'Gallery', page: 'gallery' },
    { label: 'Careers & Training', page: 'careers' },
    { label: 'Contact', page: 'contact' },
  ];

  const handleNav = (page: PageView) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100">
      {/* Top Banner Notice with Social Medias & Role Switcher */}
      <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-sky-400 font-medium">
              <Phone className="w-3.5 h-3.5" /> 24/7 Line: +2347069332193
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5" /> Working Hours: 08:00 - 18:00 Daily
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Social Media Links */}
            <div className="flex items-center gap-2.5 text-slate-400">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-sky-400 transition-colors p-0.5" 
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-sky-400 transition-colors p-0.5" 
                title="X / Twitter"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://www.instagram.com/samanthasappy_wcl" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-pink-400 transition-colors p-0.5" 
                title="Instagram (@samanthasappy_wcl)"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-sky-400 transition-colors p-0.5" 
                title="LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-rose-400 transition-colors p-0.5" 
                title="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo with Google Drive image */}
          <div 
            onClick={() => handleNav(isRoofingPage ? 'roofing' : 'home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-all duration-300 ring-4 ring-sky-500/10 overflow-hidden shrink-0">
              <img
                src={logoSrc}
                alt="Samantha Sappy Logo"
                referrerPolicy="no-referrer"
                onError={() => {
                  if (logoSrc.includes('lh3.googleusercontent.com')) {
                    setLogoSrc('https://drive.google.com/uc?export=view&id=1sUJpAFMzsPRgNuvKDSyRU01sgnLK41Fg');
                  } else if (logoSrc.includes('uc?export=view')) {
                    setLogoSrc('https://drive.google.com/thumbnail?id=1sUJpAFMzsPRgNuvKDSyRU01sgnLK41Fg&sz=w1000');
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight leading-none group-hover:text-sky-700 transition-colors">
                Samanthasappy <span className="text-sky-600 font-semibold">{isRoofingPage ? 'Roofing' : 'Home'}</span>
              </div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 mt-0.5 tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                {isRoofingPage ? 'Professional Roofing Solutions' : 'Live when you can leave'}
              </div>
            </div>
          </div>

          {/* Roofing Page Navigation: Only show Back to Homepage, Gallery, Contact */}
          {isRoofingPage ? (
            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={() => handleNav('home')}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-700 via-teal-700 to-sky-800 hover:from-sky-800 hover:to-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Samantha Sappy Caregiver Homepage</span>
              </button>

              <button
                onClick={() => handleNav('roofing-gallery')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  currentPage === 'roofing-gallery'
                    ? 'text-amber-600 bg-amber-50 font-extrabold border border-amber-200'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                Gallery
              </button>

              <button
                onClick={() => handleNav('roofing-contact')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  currentPage === 'roofing-contact'
                    ? 'text-amber-600 bg-amber-50 font-extrabold border border-amber-200'
                    : 'text-slate-700 hover:text-amber-600 hover:bg-slate-50'
                }`}
              >
                Contact
              </button>
            </div>
          ) : (
            /* Standard Caregiver Navigation Links */
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    currentPage === link.page
                      ? 'text-sky-700 bg-sky-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}

          {/* Standard Page Action CTA & Portal Buttons (Hidden on Roofing Page) */}
          {!isRoofingPage && (
            <div className="hidden lg:flex items-center gap-3">
              {currentUser ? (
                <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
                  <button
                    onClick={() => handleNav('dashboard')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      currentPage === 'dashboard'
                        ? 'bg-sky-700 text-white shadow-sm'
                        : 'bg-sky-100/70 text-sky-800 hover:bg-sky-200/80'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </button>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleNav('login')}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  Portal Login
                </button>
              )}

              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-sky-700 via-teal-700 to-sky-800 hover:from-sky-800 hover:to-teal-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <Heart className="w-4 h-4 text-rose-300" />
                Apply Now
              </button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            {isRoofingPage ? (
              <button
                onClick={() => handleNav('home')}
                className="bg-sky-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Caregiver Home</span>
              </button>
            ) : (
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-sky-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Heart className="w-3.5 h-3.5 text-rose-200" />
                <span>Apply Now</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {isRoofingPage ? (
            <div className="grid grid-cols-1 gap-2 py-2">
              <button
                onClick={() => handleNav('home')}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-bold bg-sky-50 text-sky-800 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Samantha Sappy Caregiver Homepage
              </button>
              <button
                onClick={() => handleNav('roofing-gallery')}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold ${
                  currentPage === 'roofing-gallery' ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Gallery
              </button>
              <button
                onClick={() => handleNav('roofing-contact')}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-bold ${
                  currentPage === 'roofing-contact' ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Contact
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-1 py-2">
                {navLinks.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      currentPage === link.page
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{currentUser.name}</div>
                        <div className="text-xs text-sky-700 font-medium">Role: {currentUser.role}</div>
                      </div>
                      <button 
                        onClick={logout}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>
                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full bg-sky-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      Go to {currentUser.role} Portal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNav('login')}
                    className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                  >
                    <UserIcon className="w-5 h-5" />
                    Portal Login
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};


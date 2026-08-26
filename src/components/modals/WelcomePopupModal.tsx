import React, { useState, useEffect } from 'react';
import { X, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomePopupModal: React.FC = () => {
  const { setIsApplyModalOpen } = useApp();
  const [isOpen, setIsOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [imgSrc, setImgSrc] = useState('https://lh3.googleusercontent.com/d/189NX343YzFHjtrIGZg4zzPmUdkaOBgDs');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsOpen(false);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleApplyClick = () => {
    setIsOpen(false);
    setIsApplyModalOpen(true);
  };

  // Progress percentage (30s countdown)
  const progressPercent = (timeLeft / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-sky-900 via-teal-900 to-slate-900 px-4 py-3 text-white flex items-center justify-between shrink-0 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-wide">Samantha Sappy Home & Care Services</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-full text-[11px] font-semibold text-sky-200 border border-white/10">
              <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Closing in {timeLeft}s</span>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="Close Welcome Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 shrink-0">
          <div
            className="bg-gradient-to-r from-amber-400 via-teal-400 to-sky-400 h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Body Image Content - Full size Google Drive flyer image */}
        <div 
          onClick={handleApplyClick}
          className="p-2 sm:p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950 cursor-pointer group"
          title="Click to Apply Now"
        >
          <div className="w-full relative overflow-hidden flex justify-center items-center bg-slate-950 rounded-xl">
            <img
              src={imgSrc}
              alt="Samantha Sappy Welcome Announcement"
              referrerPolicy="no-referrer"
              onError={() => {
                if (imgSrc.includes('lh3.googleusercontent.com')) {
                  setImgSrc('https://drive.google.com/uc?export=view&id=189NX343YzFHjtrIGZg4zzPmUdkaOBgDs');
                } else if (imgSrc.includes('uc?export=view')) {
                  setImgSrc('https://drive.google.com/thumbnail?id=189NX343YzFHjtrIGZg4zzPmUdkaOBgDs&sz=w2000');
                }
              }}
              className="w-full h-auto max-h-[80vh] sm:max-h-[85vh] object-contain mx-auto rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

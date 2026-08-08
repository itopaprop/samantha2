import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  image: {
    title?: string;
    imageUrl: string;
    videoUrl?: string;
    mediaType?: 'image' | 'video';
    description?: string;
    category?: string;
    date?: string;
  } | null;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalImages?: number;
}

export const LightboxModal: React.FC<Props> = ({
  isOpen,
  onClose,
  image,
  onPrev,
  onNext,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        if (onPrev) onPrev();
      } else if (e.key === 'ArrowRight') {
        if (onNext) onNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrev, onNext, onClose]);

  if (!isOpen || !image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-3 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all shadow-2xl border border-slate-700/60 cursor-pointer"
        aria-label="Close viewer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Image Container */}
      <div
        className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow */}
        {onPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous image"
            className="absolute -left-2 sm:left-2 md:-left-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-slate-900/80 text-white hover:bg-sky-600 hover:scale-110 active:scale-95 transition-all shadow-2xl border border-slate-700/60 cursor-pointer"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Image / Video */}
        {image.mediaType === 'video' || image.videoUrl ? (
          image.videoUrl?.includes('youtube.com') || image.videoUrl?.includes('youtu.be') ? (
            <iframe
              src={image.videoUrl.replace('watch?v=', 'embed/')}
              title={image.title || 'Video Player'}
              className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl border border-slate-800"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={image.videoUrl || image.imageUrl}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full w-auto h-auto rounded-xl shadow-2xl border border-slate-800"
            />
          )
        ) : (
          <img
            src={image.imageUrl}
            alt={image.title || 'Gallery Image'}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.triedDrive) {
                target.dataset.triedDrive = 'true';
                const match = image.imageUrl.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                  target.src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                  return;
                }
              }
              if (!target.dataset.fallback) {
                target.dataset.fallback = 'true';
                target.src = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80';
              }
            }}
            className="max-h-[85vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-2xl border border-slate-800"
          />
        )}

        {/* Right Arrow */}
        {onNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next image"
            className="absolute -right-2 sm:right-2 md:-right-6 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-slate-900/80 text-white hover:bg-sky-600 hover:scale-110 active:scale-95 transition-all shadow-2xl border border-slate-700/60 cursor-pointer"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        )}
      </div>
    </div>
  );
};



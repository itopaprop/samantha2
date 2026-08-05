import React from 'react';
import { X, Calendar, Tag } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  image: {
    title: string;
    imageUrl: string;
    description: string;
    category?: string;
    date?: string;
  } | null;
}

export const LightboxModal: React.FC<Props> = ({ isOpen, onClose, image }) => {
  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col md:flex-row max-h-[90vh]">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Display */}
        <div className="md:w-2/3 bg-black flex items-center justify-center p-2 min-h-[300px]">
          <img
            src={image.imageUrl}
            alt={image.title}
            referrerPolicy="no-referrer"
            className="max-h-[75vh] w-auto object-contain rounded-lg"
          />
        </div>

        {/* Info Column */}
        <div className="md:w-1/3 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {image.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-900/80 text-sky-300 border border-sky-700/50">
                <Tag className="w-3.5 h-3.5" /> {image.category}
              </span>
            )}
            <h3 className="text-xl font-bold text-white tracking-tight">{image.title}</h3>
            {image.date && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-sky-400" /> {image.date}
              </div>
            )}
            <p className="text-sm text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
              {image.description}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            Samanthasappy Home Photo Archives
          </div>
        </div>

      </div>
    </div>
  );
};

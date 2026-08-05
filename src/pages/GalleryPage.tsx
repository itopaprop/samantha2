import React, { useState } from 'react';
import { INITIAL_GALLERY } from '../data/initialData';
import { GalleryItem } from '../types';
import { LightboxModal } from '../components/modals/LightboxModal';
import { Maximize2, Tag, Calendar } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const categories = [
    'All',
    'Elderly Care Activities',
    "Children's Activities",
    'Training Sessions',
    'Events',
    'Facility Photos',
    'Family Visitations'
  ];

  const filteredItems = activeCategory === 'All'
    ? INITIAL_GALLERY
    : INITIAL_GALLERY.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Header Banner */}
      <section className="bg-slate-900 text-white py-16 text-center space-y-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-900/80 text-sky-300 border border-sky-700/60">
            Life at Samanthasappy Home
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Moments of Joy, Care & Connection
          </h1>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            A visual glimpse into our daily senior activities, Montessori learning, caregiver training sessions, and family reunions.
          </p>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-3 rounded-full bg-white/20 backdrop-blur-md text-white">
                    <Maximize2 className="w-6 h-6" />
                  </span>
                </div>
                <span className="absolute top-3 left-3 text-[10px] font-bold bg-slate-900/80 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {item.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>{item.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal Component */}
      <LightboxModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage}
      />

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LightboxModal } from '../components/modals/LightboxModal';
import { Maximize2, Play, Image as ImageIcon, Video as VideoIcon, Filter } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { galleryItems } = useApp();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');

  const filteredItems = galleryItems.filter(item => {
    if (filterType === 'image') return item.mediaType !== 'video';
    if (filterType === 'video') return item.mediaType === 'video';
    return true;
  });

  const selectedItem = selectedIndex !== null && filteredItems[selectedIndex]
    ? filteredItems[selectedIndex]
    : null;

  const handlePrev = () => {
    if (selectedIndex !== null && filteredItems.length > 0) {
      setSelectedIndex((selectedIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && filteredItems.length > 0) {
      setSelectedIndex((selectedIndex + 1) % filteredItems.length);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
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

      {/* Filter Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => { setFilterType('all'); setSelectedIndex(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            All Gallery ({galleryItems.length})
          </button>
          <button
            onClick={() => { setFilterType('image'); setSelectedIndex(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'image'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos ({galleryItems.filter(i => i.mediaType !== 'video').length})
          </button>
          <button
            onClick={() => { setFilterType('video'); setSelectedIndex(null); }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filterType === 'video'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5" />
            Videos ({galleryItems.filter(i => i.mediaType === 'video').length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredItems.length}</span> gallery entries
        </div>
      </section>

      {/* Media Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">No media items found for this category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => setSelectedIndex(index)}
                className="group bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl transition-all cursor-pointer relative aspect-[4/3]"
              >
                {item.mediaType === 'video' && item.videoUrl ? (
                  <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400">
                        <VideoIcon className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
                      <Play className="w-3 h-3 fill-current" /> Video
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallback) {
                        target.dataset.fallback = 'true';
                        target.src = 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80';
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}

                {/* Subtle Hover Action Icon */}
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white shadow-lg">
                    {item.mediaType === 'video' ? <Play className="w-6 h-6 fill-current" /> : <Maximize2 className="w-6 h-6" />}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal Component */}
      <LightboxModal
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        image={selectedItem}
        onPrev={handlePrev}
        onNext={handleNext}
      />

    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Tag, 
  Search, 
  Filter, 
  Sparkles, 
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';

export const EventsPage: React.FC = () => {
  const { events, setIsConsultationModalOpen, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [rsvpEventId, setRsvpEventId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'Community Celebration', label: 'Celebrations' },
    { id: 'Health & Wellness', label: 'Health & Wellness' },
    { id: 'Family & Resident Gathering', label: 'Family Gatherings' },
    { id: 'Educational & Workshop', label: 'Workshops' },
    { id: 'Cultural & Arts', label: 'Cultural & Arts' }
  ];

  const filteredEvents = events.filter(evt => {
    const matchesSearch = 
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || evt.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRsvp = (eventTitle: string) => {
    showToast(`RSVP submitted for "${eventTitle}". Our community team will reserve your spot!`);
    setRsvpEventId(null);
  };

  return (
    <div className="space-y-12 pb-16 bg-slate-50/50">
      
      {/* Header Hero Banner */}
      <section className="bg-slate-900 text-white py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-extrabold uppercase tracking-widest border border-amber-500/20">
            <Calendar className="w-4 h-4" /> Community Calendar & Activities
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Upcoming Events & Gatherings
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed">
            Discover our rich calendar of resident wellness workshops, family socials, medical seminars, and seasonal celebrations.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events by title, topic, or location..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
              />
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setSelectedStatus('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedStatus('Upcoming')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === 'Upcoming' ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setSelectedStatus('Completed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    selectedStatus === 'Completed' ? 'bg-slate-700 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-700">No events found matching your search</h3>
            <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(evt => (
              <div 
                key={evt.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Image */}
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img 
                      src={evt.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'} 
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-md">
                        {evt.category}
                      </span>
                      {evt.status === 'Completed' && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                          Past Event
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-extrabold text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                      {evt.title}
                    </h3>
                    
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {evt.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center gap-2 font-semibold text-slate-800">
                        <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>{evt.date}</span>
                        {evt.time && <span className="text-slate-400 font-normal">({evt.time})</span>}
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>

                      {evt.organizer && (
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Host: {evt.organizer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleRsvp(evt.title)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HeartHandshake className="w-4 h-4 text-amber-400" />
                    <span>RSVP / Register Interest</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bottom CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase tracking-widest border border-sky-500/30">
            <Sparkles className="w-4 h-4" /> Want to host or suggest a community event?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Have Questions About Resident Gatherings?</h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Our care coordination team is happy to assist families and sponsors with attendance, transportation, and special accessibility requirements.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsConsultationModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs py-3 px-6 rounded-xl shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Contact Care Team</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

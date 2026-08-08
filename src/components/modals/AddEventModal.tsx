import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Upload, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEventModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addEvent } = useApp();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-08-25');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<'Upcoming' | 'Ongoing' | 'Completed'>('Upcoming');
  const [organizer, setOrganizer] = useState('Samanthasappy Events Committee');

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    addEvent({
      title: title.trim(),
      date,
      time: '14:00 - 17:00',
      location: 'Main Campus',
      category: 'Community Celebration',
      description: description.trim() || 'Join us for this community gathering.',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
      status,
      organizer: organizer.trim() || 'Samanthasappy Care Team',
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Post New Community Event</h2>
              <p className="text-xs text-slate-400">Publish upcoming activities, workshops, or celebrations</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grandparents Summer Tea & Music Social"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Event Status *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Organizer / Host
            </label>
            <input
              type="text"
              placeholder="e.g. Clinical Nursing Unit"
              value={organizer}
              onChange={e => setOrganizer(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Banner Image
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Paste Image URL or Upload File below..."
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-dashed border-slate-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="event-image-upload"
                />
                <label
                  htmlFor="event-image-upload"
                  className="cursor-pointer flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </label>
                {imageUrl ? (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img src={imageUrl} alt="Preview" className="w-8 h-8 rounded-md object-cover border border-slate-200" />
                    <span className="text-[11px] text-emerald-600 font-bold">Banner ready</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500">Supports PNG, JPG, WebP</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Event Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe event highlights, special guests, family guidelines, or activities..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium leading-relaxed"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Post Event Now</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
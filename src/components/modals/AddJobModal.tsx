import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Briefcase, MapPin, Plus, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddJobModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addJob } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract'>('Full-time');
  const [department, setDepartment] = useState('Residential Elderly Care');
  const [location, setLocation] = useState('Samanthasappy Home, Main Campus');
  const [description, setDescription] = useState('');
  const [requirementsText, setRequirementsText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim() || !description.trim()) return;

    const requirements = requirementsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    addJob({
      title: title.trim(),
      type,
      department: department.trim(),
      location: location.trim() || 'Samanthasappy Home, Main Campus',
      description: description.trim(),
      requirements: requirements.length > 0 ? requirements : ['Relevant healthcare qualification', 'Compassionate approach to elderly care'],
    });

    setTitle('');
    setDescription('');
    setRequirementsText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">Post New Job Vacancy</h2>
              <p className="text-xs text-slate-400">Publish open positions for nurses, care assistants & staff</p>
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
              Job Title / Position *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Registered General Nurse / Domiciliary Caregiver"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Employment Type *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department / Care Sector *
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium"
              >
                <option value="Residential Elderly Care">Residential Elderly Care</option>
                <option value="Dementia Support">Dementia Support</option>
                <option value="Child Care Services">Child Care Services</option>
                <option value="Community Care Services">Community Care Services</option>
                <option value="Medical Services">Medical Services</option>
                <option value="Administration & Logistics">Administration & Logistics</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Location *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Samanthasappy Home, Main Campus or Client Homes"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe daily duties, key responsibilities, shift patterns, and working culture..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Key Candidate Requirements (One per line)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. NVQ Level 3 in Health & Social Care&#10;Minimum 2 years experience&#10;Valid First Aid & Safeguarding Certification"
              value={requirementsText}
              onChange={e => setRequirementsText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none font-medium leading-relaxed"
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
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish Vacancy</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
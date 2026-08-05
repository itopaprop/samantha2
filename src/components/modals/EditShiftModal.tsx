import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Shift } from '../../types';
import { X, Edit3, Calendar, Clock, MapPin } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
}

export const EditShiftModal: React.FC<Props> = ({ isOpen, onClose, shift }) => {
  const { updateShift, staff } = useApp();

  const [staffName, setStaffName] = useState('');
  const [shiftDate, setShiftDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [shiftType, setShiftType] = useState<'Morning' | 'Afternoon' | 'Night' | '24-Hour Coverage'>('Morning');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (shift) {
      setStaffName(shift.staffName || '');
      setShiftDate(shift.shiftDate || '');
      setStartTime(shift.startTime || '');
      setEndTime(shift.endTime || '');
      setShiftType(shift.shiftType || 'Morning');
      setLocation(shift.location || '');
      setNotes(shift.notes || '');
    }
  }, [shift]);

  if (!isOpen || !shift) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateShift(shift.id, {
      staffName,
      shiftDate,
      startTime,
      endTime,
      shiftType,
      location,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-2xl border border-slate-200">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Edit Scheduled Shift</h3>
              <p className="text-xs text-slate-500">Modify staff roster assignment and timing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Staff Member</label>
            <select
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
            >
              {staff.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.position})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Shift Date
              </label>
              <input
                type="date"
                required
                value={shiftDate}
                onChange={e => setShiftDate(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Shift Type</label>
              <select
                value={shiftType}
                onChange={e => setShiftType(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
              >
                <option value="Morning">Morning Shift</option>
                <option value="Afternoon">Afternoon Shift</option>
                <option value="Night">Night Shift</option>
                <option value="24-Hour Coverage">24-Hour Coverage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Start Time
              </label>
              <input
                type="text"
                required
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
                placeholder="07:00 AM"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> End Time
              </label>
              <input
                type="text"
                required
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
                placeholder="03:00 PM"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location / Wing
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
              placeholder="e.g. Main Residential Suite / Floor 2"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Shift Notes & Handover Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500"
              placeholder="Optional notes or instructions..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-all cursor-pointer"
            >
              Save Shift Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

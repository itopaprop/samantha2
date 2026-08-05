import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddShiftModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addShift, staff } = useApp();

  const [staffId, setStaffId] = useState(staff[0]?.id || '');
  const [shiftDate, setShiftDate] = useState('2026-08-03');
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('15:30');
  const [shiftType, setShiftType] = useState<'Morning' | 'Afternoon' | 'Night' | '24-Hour Coverage'>('Morning');
  const [location, setLocation] = useState('Willow Wing');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStaff = staff.find(s => s.id === staffId);
    if (!selectedStaff) return;

    addShift({
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      shiftDate,
      startTime,
      endTime,
      shiftType,
      location,
      notes: notes || 'Standard shift duties.',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Schedule Staff Shift</h2>
              <p className="text-xs text-slate-400">Assign duty roster and wing location</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Staff Member *</label>
            <select
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            >
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name} - {s.position}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Date *</label>
              <input
                type="date"
                required
                value={shiftDate}
                onChange={e => setShiftDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Pattern *</label>
              <select
                value={shiftType}
                onChange={e => setShiftType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Morning">Morning Shift</option>
                <option value="Afternoon">Afternoon Shift</option>
                <option value="Night">Night Shift</option>
                <option value="24-Hour Coverage">24-Hour Duty</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Duty Location / Wing *</label>
            <input
              type="text"
              required
              placeholder="e.g. Willow Wing & Medical Station"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Notes / Focus Tasks</label>
            <textarea
              rows={2}
              placeholder="Medication rounds, family visitations, physio supervision..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-sm"
            >
              Create Shift Entry
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

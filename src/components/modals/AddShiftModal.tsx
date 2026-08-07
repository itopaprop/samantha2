import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddShiftModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addShift, staff } = useApp();

  const [staffId, setStaffId] = useState(staff[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-08-03');
  const [endDate, setEndDate] = useState('2026-08-03');
  const [dutyType, setDutyType] = useState<'Morning' | 'Afternoon' | 'Custom'>('Morning');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');
  const [location, setLocation] = useState('Willow Wing & Medical Station');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleDutySelect = (type: 'Morning' | 'Afternoon' | 'Custom') => {
    setDutyType(type);
    if (type === 'Morning') {
      setStartTime('08:00');
      setEndTime('16:00');
    } else if (type === 'Afternoon') {
      setStartTime('16:00');
      setEndTime('00:00');
    }
  };

  const getDatesInRange = (start: string, end: string): string[] => {
    const dates: string[] = [];
    if (!start) return dates;
    if (!end || end < start) return [start];

    const current = new Date(start);
    const last = new Date(end);

    let count = 0;
    while (current <= last && count < 30) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
      count++;
    }
    return dates;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedStaff = staff.find(s => s.id === staffId) || staff[0];
    if (!selectedStaff) return;

    const shiftDates = getDatesInRange(startDate, endDate);

    let shiftCategory: 'Morning' | 'Afternoon' | 'Night' | '24-Hour Coverage' = 'Morning';
    if (dutyType === 'Afternoon') {
      shiftCategory = 'Afternoon';
    } else if (dutyType === 'Custom') {
      shiftCategory = '24-Hour Coverage';
    }

    shiftDates.forEach(dDate => {
      addShift({
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        shiftDate: dDate,
        startTime,
        endTime,
        shiftType: shiftCategory,
        location,
        notes: notes || `Duty shift assigned for period ${startDate} - ${endDate}`,
      });
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="p-6 pb-2 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assign Work Shifts</h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Schedule shifts by specifying starting/ending period and time duty.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-5">
          
          {/* Select Staff Member */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              SELECT STAFF MEMBER
            </label>
            <select
              value={staffId}
              onChange={e => setStaffId(e.target.value)}
              className="w-full px-4 py-3 text-sm font-semibold text-slate-800 bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="admin">User (admin)</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.position})
                </option>
              ))}
            </select>
          </div>

          {/* Shift Days Duration */}
          <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              SHIFT DAYS DURATION (STARTING & ENDING PERIOD)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  START DATE
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value);
                    if (!endDate || e.target.value > endDate) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  END DATE
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
              Specify the starting and ending period for this shift. The day of the week is automatically derived from the start date.
            </p>
          </div>

          {/* Time Duty */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              TIME DUTY
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDutySelect('Morning')}
                className={`p-3 sm:py-3.5 sm:px-4 rounded-xl border text-center transition-all cursor-pointer ${
                  dutyType === 'Morning'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-600 font-bold ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <div className="text-sm sm:text-base font-bold">Morning</div>
                <div className={`text-[11px] sm:text-xs mt-0.5 ${dutyType === 'Morning' ? 'text-blue-500 font-medium' : 'text-slate-400'}`}>
                  08:00 – 16:00
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDutySelect('Afternoon')}
                className={`p-3 sm:py-3.5 sm:px-4 rounded-xl border text-center transition-all cursor-pointer ${
                  dutyType === 'Afternoon'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-600 font-bold ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <div className="text-sm sm:text-base font-bold">Afternoon</div>
                <div className={`text-[11px] sm:text-xs mt-0.5 ${dutyType === 'Afternoon' ? 'text-blue-500 font-medium' : 'text-slate-400'}`}>
                  16:00 – 00:00
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDutySelect('Custom')}
                className={`p-3 sm:py-3.5 sm:px-4 rounded-xl border text-center transition-all cursor-pointer ${
                  dutyType === 'Custom'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-600 font-bold ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium'
                }`}
              >
                <div className="text-sm sm:text-base font-bold">Custom</div>
                <div className={`text-[11px] sm:text-xs mt-0.5 ${dutyType === 'Custom' ? 'text-blue-500 font-medium' : 'text-slate-400'}`}>
                  Custom times
                </div>
              </button>
            </div>

            {/* If Custom selected, show custom time controls */}
            {dutyType === 'Custom' && (
              <div className="mt-3 p-3 bg-blue-50/40 border border-blue-100 rounded-xl grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Custom Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Custom End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Location & Optional Notes */}
          <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                ASSIGNED WING / LOCATION
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Willow Wing"
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                SPECIAL INSTRUCTIONS (OPTIONAL)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Medication rounds..."
                className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 px-4 rounded-xl font-bold text-sm bg-slate-500 hover:bg-slate-600 active:bg-slate-700 text-white shadow-xs transition-colors cursor-pointer text-center"
            >
              Assign & Notify
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};


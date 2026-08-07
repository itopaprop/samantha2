import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, CheckCircle2, Search, Edit2, Trash2 } from 'lucide-react';
import { Shift } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEditShift?: (shift: Shift) => void;
}

export const ViewShiftsModal: React.FC<Props> = ({ isOpen, onClose, onEditShift }) => {
  const { shifts, staff, deleteShift } = useApp();
  const [activeTab, setActiveTab] = useState<'ongoing' | 'upcoming' | 'completed'>('ongoing');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Calculate status of shifts based on current date & time
  const now = new Date();
  // Standardize YYYY-MM-DD
  const todayStr = now.toISOString().split('T')[0];
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMins = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMins}`;

  const categorizeShift = (shift: Shift): 'ongoing' | 'upcoming' | 'completed' => {
    if (shift.shiftDate > todayStr) {
      return 'upcoming';
    } else if (shift.shiftDate < todayStr) {
      return 'completed';
    } else {
      // Same day
      const start = shift.startTime || '00:00';
      const end = shift.endTime || '23:59';
      
      if (currentTimeStr >= start && currentTimeStr <= end) {
        return 'ongoing';
      } else if (currentTimeStr < start) {
        return 'upcoming';
      } else {
        return 'completed';
      }
    }
  };

  const ongoingShifts = shifts.filter(s => categorizeShift(s) === 'ongoing');
  const upcomingShifts = shifts.filter(s => categorizeShift(s) === 'upcoming');
  const completedShifts = shifts.filter(s => categorizeShift(s) === 'completed');

  const currentCategoryList = 
    activeTab === 'ongoing' ? ongoingShifts :
    activeTab === 'upcoming' ? upcomingShifts : completedShifts;

  // Filter by search query
  const filteredShifts = currentCategoryList.filter(s => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const staffMember = staff.find(st => st.id === s.staffId || st.name === s.staffName);
    return (
      s.staffName.toLowerCase().includes(query) ||
      s.shiftDate.toLowerCase().includes(query) ||
      s.shiftType.toLowerCase().includes(query) ||
      s.location.toLowerCase().includes(query) ||
      (staffMember && staffMember.position.toLowerCase().includes(query))
    );
  });

  const emptyTextMap = {
    ongoing: {
      title: 'No staff currently on duty',
      subtitle: 'There are currently no active shifts matching the current system date and time.',
    },
    upcoming: {
      title: 'No upcoming shifts scheduled',
      subtitle: 'There are currently no future shifts scheduled in the system roster.',
    },
    completed: {
      title: 'No completed shifts recorded',
      subtitle: 'There are currently no past completed shifts recorded.',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 sm:p-8 pb-4 flex items-start justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Staff Duty Shifts</h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Real-time schedule monitoring dynamically updated by system date & time.
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('ongoing')}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ongoing'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'ongoing' ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}></span>
              Current / Ongoing ({ongoingShifts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <Clock className="w-4 h-4" />
              Upcoming Shifts ({upcomingShifts.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'completed'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Past / Completed ({completedShifts.length})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by staff name, day, or date..."
              className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
            />
          </div>

          {/* Table Container */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
            {/* Table Header */}
            <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-3">STAFF MEMBER</div>
              <div className="col-span-2">ROLE</div>
              <div className="col-span-2">DURATION / PERIOD</div>
              <div className="col-span-2">DUTY TYPE</div>
              <div className="col-span-1">TIMES</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-1 text-right">ACTIONS</div>
            </div>

            {/* Table Body / Empty State */}
            {filteredShifts.length === 0 ? (
              <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {emptyTextMap[activeTab].title}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
                  {emptyTextMap[activeTab].subtitle}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredShifts.map(s => {
                  const staffMember = staff.find(st => st.id === s.staffId || st.name === s.staffName);
                  const roleText = staffMember ? staffMember.position : 'Care Specialist';

                  return (
                    <div key={s.id} className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center text-xs text-slate-700 hover:bg-slate-50/50 transition-colors">
                      {/* Staff Member */}
                      <div className="col-span-3 flex items-center gap-2.5 font-bold text-slate-900 truncate">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {s.staffName.charAt(0)}
                        </div>
                        <span className="truncate">{s.staffName}</span>
                      </div>

                      {/* Role */}
                      <div className="col-span-2 text-slate-500 font-medium truncate">
                        {roleText}
                      </div>

                      {/* Duration / Period */}
                      <div className="col-span-2 font-semibold text-slate-800">
                        {s.shiftDate}
                      </div>

                      {/* Duty Type */}
                      <div className="col-span-2 font-medium">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {s.shiftType}
                        </span>
                      </div>

                      {/* Times */}
                      <div className="col-span-1 font-mono text-[11px] font-semibold text-slate-600">
                        {s.startTime || '08:00'} - {s.endTime || '16:00'}
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        {activeTab === 'ongoing' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active
                          </span>
                        )}
                        {activeTab === 'upcoming' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Scheduled
                          </span>
                        )}
                        {activeTab === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Completed
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-1">
                        {onEditShift && (
                          <button
                            type="button"
                            onClick={() => onEditShift(s)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit shift"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteShift(s.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComposeMessageModal } from '../../components/modals/ComposeMessageModal';
import { 
  UserCheck, 
  Users, 
  Calendar, 
  Mail, 
  User, 
  LogOut, 
  Activity, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Send, 
  Heart,
  FileText
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { 
    currentUser, 
    residents, 
    shifts, 
    messages, 
    updateResident,
    markMessageAsRead,
    showToast,
    logout 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'residents' | 'shifts' | 'messages' | 'profile'>('residents');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [careLogNote, setCareLogNote] = useState('');
  const [selectedResidentForLog, setSelectedResidentForLog] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filter residents assigned to this staff member
  const assignedResidents = residents.filter(r => r.assignedStaffId === currentUser.id || r.assignedStaffName === currentUser.name);
  const totalAssignedCount = assignedResidents.length;

  // Filter shifts for this staff member
  const staffShifts = shifts.filter(s => s.staffId === currentUser.id || s.staffName === currentUser.name);

  // Filter messages for this staff member
  const staffMessages = messages.filter(m => m.receiverId === currentUser.id || m.senderId === currentUser.id);

  const handleLogCareAction = (residentId: string) => {
    if (!careLogNote) return;
    updateResident(residentId, {
      lastActivityUpdate: `${careLogNote} (Logged by ${currentUser.name})`,
    });
    setCareLogNote('');
    setSelectedResidentForLog(null);
    showToast('Care action recorded in resident journal.');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-8">
          
          {/* Staff User Header Badge */}
          <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1594824813566-7885a397738c?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-md shrink-0"
            />
            <div className="overflow-hidden">
              <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
              <div className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
                Role: Staff
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Care Management
              </div>
              <button
                onClick={() => setActiveTab('residents')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'residents'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4" />
                  <span>Assigned Resident List</span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                  {totalAssignedCount}
                </span>
              </button>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Shift Management
              </div>
              <button
                onClick={() => setActiveTab('shifts')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'shifts'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                View Shift Roster
              </button>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Communication
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Mail className="w-4 h-4" />
                Messaging & Messages
              </button>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Profile
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                My Profile
              </button>
            </div>
          </div>

        </div>

        {/* Footer Logout */}
        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout of Staff Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        
        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {currentUser.name}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            Role: Staff
          </div>
        </div>


        {/* Assigned Residents Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Assigned Residents</h2>
              {/* Mandatory Prompt Requirement Line */}
              <div className="text-sm font-extrabold text-sky-700 mt-1">
                Total Assigned Resident(s): {totalAssignedCount}
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
              Active Duty Assignments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedResidents.map((r) => (
              <div key={r.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{r.fullName}</h3>
                    <div className="text-xs text-slate-500 font-medium">Room: {r.roomNumber}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    r.healthStatus === 'Stable' || r.healthStatus === 'Excellent'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    Care Status: {r.healthStatus}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-700">
                  <div><strong>Care Category:</strong> {r.careCategory}</div>
                  <div><strong>Medical Notes:</strong> {r.medicalNotes}</div>
                  {r.vitals && (
                    <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-600">
                      <span className="bg-white px-2 py-1 rounded-md border border-slate-200">BP: {r.vitals.bloodPressure}</span>
                      <span className="bg-white px-2 py-1 rounded-md border border-slate-200">HR: {r.vitals.heartRate}</span>
                      <span className="bg-white px-2 py-1 rounded-md border border-slate-200">Temp: {r.vitals.temperature}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-slate-500 italic pt-2">
                    Latest Activity Log: "{r.lastActivityUpdate}"
                  </div>
                </div>

                {/* Log Care Action Quick Form */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  {selectedResidentForLog === r.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        placeholder="Write quick care observation, vitals check, or meal note..."
                        value={careLogNote}
                        onChange={e => setCareLogNote(e.target.value)}
                        className="w-full p-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-sky-500"
                      ></textarea>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedResidentForLog(null)}
                          className="px-3 py-1 text-xs text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleLogCareAction(r.id)}
                          className="px-3 py-1 text-xs bg-sky-700 text-white font-bold rounded-lg shadow-xs"
                        >
                          Save Log
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedResidentForLog(r.id)}
                      className="w-full py-2 bg-white hover:bg-sky-50 text-sky-700 border border-slate-200 hover:border-sky-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" /> Log Daily Care Action
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>


        {/* Upcoming Shift Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Upcoming Shift Card</h2>
            <span className="text-xs text-teal-700 font-bold bg-teal-50 px-3 py-1 rounded-full">
              Duty Schedule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffShifts.map((sh) => (
              <div key={sh.id} className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl space-y-3 shadow-md">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-sky-300 bg-sky-950 border border-sky-800 px-2.5 py-0.5 rounded-md">
                    {sh.shiftType} Shift
                  </span>
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Shift Date</div>
                  <div className="font-extrabold text-white text-base">{sh.shiftDate}</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700">
                  <div>
                    <span className="text-slate-400">Time:</span>
                    <div className="font-semibold text-slate-200">{sh.startTime} - {sh.endTime}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Location:</span>
                    <div className="font-semibold text-slate-200">{sh.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>


        {/* Recent Messages Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Recent Messages Card</h2>
            <button
              onClick={() => setIsComposeOpen(true)}
              className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Compose Message
            </button>
          </div>

          <div className="space-y-3">
            {staffMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => markMessageAsRead(msg.id)}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 cursor-pointer hover:border-sky-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 text-sm">{msg.subject}</span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>
                <div className="text-xs text-slate-500">
                  From: {msg.senderName} ({msg.senderRole})
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </div>

      </main>

      <ComposeMessageModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />

    </div>
  );
};

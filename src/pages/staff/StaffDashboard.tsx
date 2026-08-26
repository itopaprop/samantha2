import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComposeMessageModal } from '../../components/modals/ComposeMessageModal';
import { EditProfilePhotoModal } from '../../components/modals/EditProfilePhotoModal';
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
  FileText,
  Paperclip,
  Download,
  Camera,
  Edit3
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { 
    currentUser, 
    staff,
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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [careLogNote, setCareLogNote] = useState('');
  const [selectedResidentForLog, setSelectedResidentForLog] = useState<string | null>(null);

  if (!currentUser) return null;

  // Fetch full staff profile & avatar matching currentUser
  const staffProfile = staff.find(s => s.id === currentUser.id || s.name === currentUser.name || s.email === currentUser.email);
  const staffAvatar = currentUser.avatar || staffProfile?.avatar || 'https://images.unsplash.com/photo-1594824813566-7885a397738c?auto=format&fit=crop&w=300&q=80';
  const staffPosition = staffProfile?.position || 'Care Specialist';
  const staffQualification = staffProfile?.qualification || 'Certified Healthcare Professional';

  // Filter residents assigned to this staff member
  const assignedResidents = residents.filter(r => r.assignedStaffId === currentUser.id || r.assignedStaffName === currentUser.name);
  const totalAssignedCount = assignedResidents.length;

  // Filter shifts for this staff member
  const staffShifts = shifts.filter(s => s.staffId === currentUser.id || s.staffName === currentUser.name);

  // Filter messages for this staff member
  const staffMessages = messages.filter(m => m.receiverId === currentUser.id || m.senderId === currentUser.id);
  const unreadStaffMessagesCount = staffMessages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;

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
            <div 
              className="relative group cursor-pointer shrink-0" 
              onClick={() => setIsEditProfileOpen(true)} 
              title="Click to edit profile photo"
            >
              <img
                src={staffAvatar}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-md shrink-0 group-hover:opacity-80 transition-opacity"
              />
              <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                  title="Edit Profile Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4" />
                  <span>Messaging & Messages</span>
                </div>
                {unreadStaffMessagesCount > 0 && (
                  <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                    {unreadStaffMessagesCount}
                  </span>
                )}
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
        
        {/* Welcome Header & Clickable Top Inbox Badge */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={staffAvatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-md shrink-0 ring-4 ring-emerald-50"
            />
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome, {currentUser.name}
              </h1>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                Role: Staff ({staffPosition})
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('messages')}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl font-bold text-xs shadow-2xs transition-all cursor-pointer group shrink-0"
              title="Click to open Staff Inbox Messages"
            >
              <Mail className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span>Staff Inbox</span>
              {unreadStaffMessagesCount > 0 ? (
                <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                  {unreadStaffMessagesCount} unread
                </span>
              ) : (
                <span className="bg-emerald-200/60 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  0 unread
                </span>
              )}
            </button>

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-0.5">
              <div><strong className="text-slate-800">Qualification:</strong> {staffQualification}</div>
              <div><strong className="text-slate-800">Email:</strong> {currentUser.email}</div>
            </div>
          </div>
        </div>


        {/* TAB 1: Assigned Resident List */}
        {activeTab === 'residents' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Assigned Resident List</h2>
                <div className="text-sm font-extrabold text-sky-700 mt-1">
                  Total Assigned Resident(s): {totalAssignedCount}
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                Active Care Assignments
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedResidents.map((r) => (
                <div key={r.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={r.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'}
                        alt={r.fullName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-xs shrink-0 ring-2 ring-slate-100"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{r.fullName}</h3>
                        <div className="text-xs text-slate-500 font-medium">Room: {r.roomNumber}</div>
                      </div>
                    </div>
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shrink-0 shadow-xs ${
                      r.healthStatus === 'Stable' || r.healthStatus === 'Excellent'
                        ? 'bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]'
                        : r.healthStatus === 'Requires Monitoring'
                        ? 'bg-amber-100 text-amber-900 border border-amber-200'
                        : 'bg-rose-100 text-rose-900 border border-rose-200'
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
        )}


        {/* TAB 2: View Shift Roster */}
        {activeTab === 'shifts' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Staff Shift Roster & Schedule</h2>
                <p className="text-xs text-slate-500 mt-0.5">Detailed roster schedule and wing assignments for duty specialists</p>
              </div>
              <span className="text-xs text-teal-700 font-bold bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Live Duty Roster
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {staffShifts.map((sh) => (
                <div key={sh.id} className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl space-y-4 shadow-md border border-slate-700 relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-sky-300 bg-sky-950/80 border border-sky-800 px-3 py-1 rounded-lg">
                      {sh.shiftType} Shift
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Scheduled
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 font-medium">Assigned Shift Date</div>
                    <div className="font-extrabold text-white text-xl tracking-tight">{sh.shiftDate}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-700/80">
                    <div>
                      <span className="text-slate-400">Shift Hours:</span>
                      <div className="font-bold text-slate-100 mt-0.5">{sh.startTime} - {sh.endTime}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Location / Wing:</span>
                      <div className="font-bold text-slate-100 mt-0.5">{sh.location}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                    <strong className="text-sky-300">Staff On Duty:</strong> {sh.staffName} ({staffPosition})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB 3: Messaging & Messages */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Staff Messaging & Inbox</h2>
                <p className="text-xs text-slate-500 mt-0.5">Communicate directly with facility directors, shift leads, or resident relatives</p>
              </div>
              <button
                onClick={() => setIsComposeOpen(true)}
                className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" /> Compose New Message
              </button>
            </div>

            <div className="space-y-3">
              {staffMessages.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  No messages found in your inbox.
                </div>
              ) : (
                staffMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => markMessageAsRead(msg.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      msg.receiverId === currentUser.id && !msg.isRead
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{msg.subject}</span>
                        {msg.receiverId === currentUser.id && !msg.isRead && (
                          <span className="text-[9px] bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded-md">UNREAD</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {msg.senderId === currentUser.id ? `To: ${msg.receiverName} (${msg.receiverRole})` : `From: ${msg.senderName} (${msg.senderRole})`}
                    </div>
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {msg.content}
                    </p>

                    {(msg.attachmentName || msg.attachmentUrl) && (
                      <div 
                        className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 min-w-0">
                          <Paperclip className="w-4 h-4 text-sky-700 shrink-0" />
                          <span className="truncate">{msg.attachmentName || 'Attached Document'}</span>
                        </div>
                        <a
                          href={msg.attachmentUrl || `data:text/plain;charset=utf-8,${encodeURIComponent(msg.content)}`}
                          download={msg.attachmentName || 'attachment.txt'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Attachment</span>
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}


        {/* TAB 4: My Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Staff Profile & Credentials</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage your personal details and editable profile photo.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" /> Change Profile Photo
                </button>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Verified Health Care Specialist
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div 
                className="relative group cursor-pointer shrink-0"
                onClick={() => setIsEditProfileOpen(true)}
                title="Click to change your photo"
              >
                <img
                  src={staffAvatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg shrink-0 group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Edit Photo</span>
                </div>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900">{currentUser.name}</h3>
                    <p className="text-sm font-bold text-sky-700">{staffPosition}</p>
                  </div>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Info
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-3 border-t border-slate-200">
                  <div><strong>Email Address:</strong> {currentUser.email}</div>
                  <div><strong>Phone Number:</strong> {currentUser.phone || staffProfile?.phone || '+44 20 7946 0884'}</div>
                  <div><strong>Professional Certification:</strong> {staffQualification}</div>
                  <div><strong>Assigned Duty Shift:</strong> {staffProfile?.shift || 'Morning Shift'}</div>
                  <div><strong>Total Resident Duty Count:</strong> {totalAssignedCount} Residents</div>
                  <div><strong>System Access Permission:</strong> Full Care Specialist Portal</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      <ComposeMessageModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />

      <EditProfilePhotoModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        targetUser={currentUser}
      />

    </div>
  );
};

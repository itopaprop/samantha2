import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AddResidentModal } from '../../components/modals/AddResidentModal';
import { AddStaffModal } from '../../components/modals/AddStaffModal';
import { AddShiftModal } from '../../components/modals/AddShiftModal';
import { ComposeMessageModal } from '../../components/modals/ComposeMessageModal';
import { CareCategory, UserRole, StaffMember } from '../../types';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Calendar, 
  Mail, 
  Settings, 
  LogOut, 
  Activity, 
  ShieldCheck, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Home as HomeIcon,
  Brain,
  GraduationCap,
  Sparkles,
  Send,
  Inbox,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    residents, 
    staff, 
    shifts, 
    messages, 
    activityLogs, 
    deleteResident, 
    deleteStaff, 
    deleteShift, 
    markMessageAsRead,
    logout 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'residents' | 'staff' | 'shifts' | 'messages' | 'settings'>('overview');
  const [messagingTab, setMessagingTab] = useState<'inbox' | 'sent'>('inbox');
  
  // Modals state
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [residentCategoryPreset, setResidentCategoryPreset] = useState<CareCategory | undefined>();
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isComposeMessageOpen, setIsComposeMessageOpen] = useState(false);
  const [selectedResidentModal, setSelectedResidentModal] = useState<any>(null);
  const [selectedStaffModal, setSelectedStaffModal] = useState<StaffMember | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  if (!currentUser) return null;

  // Stat Calculations
  const totalResidents = residents.length;
  const totalStaff = staff.length;
  const studentCaregivers = residents.filter(r => r.careCategory === 'Student Caregiver').length;
  const domiciliaryClients = residents.filter(r => r.careCategory === 'Domiciliary Care').length;
  const dailyCareClients = residents.filter(r => r.careCategory === 'Daily Living Assistance' || r.careCategory === 'Residential Elderly Care').length;
  const vulnerableClients = residents.filter(r => r.careCategory === 'Vulnerable Adult Support').length;
  const activeShiftsCount = shifts.length;
  const unreadMessagesCount = messages.filter(m => m.receiverId === currentUser.id && !m.isRead).length;

  // Quick Action Helper
  const triggerAddResidentWithCategory = (cat: CareCategory) => {
    setResidentCategoryPreset(cat);
    setIsAddResidentOpen(true);
  };

  const filteredResidents = residents.filter(r => {
    const matchesCategory = categoryFilter === 'All' || r.careCategory === categoryFilter;
    const matchesSearch = r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inboxMessages = messages.filter(m => m.receiverId === currentUser.id);
  const sentMessages = messages.filter(m => m.senderId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-8">
          
          {/* Admin User Header Badge */}
          <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border-2 border-sky-500 shadow-md shrink-0"
            />
            <div className="overflow-hidden">
              <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
              <div className="text-[11px] font-semibold text-purple-400 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
                Role: {currentUser.role}
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Main Dashboard
              </div>
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Activity className="w-4 h-4" />
                Overview Stats
              </button>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Management
              </div>
              <div className="space-y-1">
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
                    <span>Residents List</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full border border-slate-700 font-extrabold">
                    {totalResidents}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('staff')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'staff'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4" />
                    <span>Staff List</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-teal-400 px-2 py-0.5 rounded-full border border-slate-700 font-extrabold">
                    {totalStaff}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Shift & Communications
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('shifts')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'shifts'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Shift Management
                </button>

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
                    <span>Internal Messages</span>
                  </div>
                  {unreadMessagesCount > 0 && (
                    <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                      {unreadMessagesCount}
                    </span>
                  )}
                </button>
              </div>
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
            Sign Out of Admin Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        
        {/* Top Greeting Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {currentUser.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                Role: {currentUser.role}
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                • Samanthasappy Home Executive Dashboard
              </span>
            </div>
          </div>

          {/* Quick Action Trigger Bar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsAddResidentOpen(true)}
              className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Resident
            </button>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" /> Add Staff
            </button>
            <button
              onClick={() => setIsAddShiftOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" /> Add Shift
            </button>
          </div>
        </div>


        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Quick Category Addition Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Quick Category Registration Actions
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Staff Member
                </button>
                <button
                  onClick={() => triggerAddResidentWithCategory('Residential Elderly Care')}
                  className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Resident
                </button>
                <button
                  onClick={() => triggerAddResidentWithCategory('Student Caregiver')}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" /> Add Student Caregiver
                </button>
                <button
                  onClick={() => triggerAddResidentWithCategory('Domiciliary Care')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <HomeIcon className="w-3.5 h-3.5" /> Add Domiciliary Client
                </button>
                <button
                  onClick={() => triggerAddResidentWithCategory('Daily Living Assistance')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" /> Add Daily Care Client
                </button>
                <button
                  onClick={() => triggerAddResidentWithCategory('Vulnerable Adult Support')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5" /> Add Vulnerable Client
                </button>
              </div>
            </div>

            {/* Statistics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Residents</div>
                <div className="text-3xl font-extrabold text-sky-700">{totalResidents}</div>
                <div className="text-[11px] text-slate-400 font-medium">In Residential & Care Suites</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Staff</div>
                <div className="text-3xl font-extrabold text-teal-700">{totalStaff}</div>
                <div className="text-[11px] text-slate-400 font-medium">Nurses & Care Specialists</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-purple-700 uppercase tracking-wider">Student Caregivers</div>
                <div className="text-3xl font-extrabold text-purple-700">{studentCaregivers}</div>
                <div className="text-[11px] text-slate-400 font-medium">Training Trainees</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-amber-700 uppercase tracking-wider">Domiciliary Clients</div>
                <div className="text-3xl font-extrabold text-amber-600">{domiciliaryClients}</div>
                <div className="text-[11px] text-slate-400 font-medium">Community Home Visits</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Daily Care Clients</div>
                <div className="text-3xl font-extrabold text-emerald-600">{dailyCareClients}</div>
                <div className="text-[11px] text-slate-400 font-medium">Full Living Assistance</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-rose-700 uppercase tracking-wider">Vulnerable Clients</div>
                <div className="text-3xl font-extrabold text-rose-600">{vulnerableClients}</div>
                <div className="text-[11px] text-slate-400 font-medium">Special Sensory Support</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Shifts</div>
                <div className="text-3xl font-extrabold text-slate-800">{activeShiftsCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">Scheduled Shift Roster</div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">Unread Messages</div>
                <div className="text-3xl font-extrabold text-sky-800">{unreadMessagesCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">Family & Staff Inbox</div>
              </div>
            </div>

            {/* Combined Residents & Staff Overview Card & Recent Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Combined Card */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">Residents & Staff Overview</h3>
                  <span className="text-xs font-semibold text-slate-500">Live Database Summary</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-1">
                    <div className="text-xs text-sky-800 font-bold uppercase tracking-wider">Total Residents</div>
                    <div className="text-3xl font-extrabold text-sky-900">{totalResidents}</div>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 space-y-1">
                    <div className="text-xs text-teal-800 font-bold uppercase tracking-wider">Total Staff Members</div>
                    <div className="text-3xl font-extrabold text-teal-900">{totalStaff}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Admissions</div>
                  <div className="space-y-2">
                    {residents.slice(0, 3).map((r) => (
                      <div key={r.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{r.fullName}</div>
                          <div className="text-slate-500">{r.careCategory} • {r.roomNumber}</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          {r.healthStatus}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">New Staff Members</div>
                  <div className="space-y-2">
                    {staff.slice(0, 2).map((s) => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <div className="font-bold text-slate-900">{s.name}</div>
                            <div className="text-slate-500">{s.position}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                          Joined {s.joinDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900">Recent Activities Feed</h3>
                  <span className="text-xs text-sky-700 font-bold">Real-time Logs</span>
                </div>

                <div className="space-y-4">
                  {activityLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900">{log.title}</div>
                        <div className="text-slate-600">{log.description}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {log.timestamp} • By {log.performer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}


        {/* TAB 2: RESIDENTS MANAGEMENT */}
        {activeTab === 'residents' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Residents Management List</h2>
                <p className="text-xs text-slate-500">View and update care profiles for all registered residents</p>
              </div>
              <button
                onClick={() => setIsAddResidentOpen(true)}
                className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Add New Resident
              </button>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by resident name or room number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">All Care Categories</option>
                <option value="Residential Elderly Care">Residential Elderly Care</option>
                <option value="Dementia Support">Dementia Support</option>
                <option value="Child Care Services">Child Care Services</option>
                <option value="Daily Living Assistance">Daily Living Assistance</option>
                <option value="Domiciliary Care">Domiciliary Care</option>
                <option value="Student Caregiver">Student Caregiver</option>
                <option value="Vulnerable Adult Support">Vulnerable Adult Support</option>
              </select>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Resident Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Room / Unit</th>
                    <th className="p-3">Assigned Staff</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredResidents.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {r.fullName}
                        <div className="text-[10px] text-slate-400 font-normal">DOB: {r.dateOfBirth} ({r.gender})</div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        <span className="bg-sky-50 text-sky-800 border border-sky-100 px-2 py-0.5 rounded-md text-[10px] font-bold">
                          {r.careCategory}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium">{r.roomNumber}</td>
                      <td className="p-3 text-slate-700 font-medium">{r.assignedStaffName || 'Unassigned'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          r.healthStatus === 'Excellent' || r.healthStatus === 'Stable'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.healthStatus}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <button
                          onClick={() => setSelectedResidentModal(r)}
                          className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteResident(r.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove Resident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* TAB 3: STAFF MANAGEMENT */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Staff Management</h2>
                <p className="text-xs text-slate-500">Registered nurses, care leads, and educators</p>
              </div>
              <button
                onClick={() => setIsAddStaffOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" /> Add Staff Member
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">Position</th>
                    <th className="p-3">Shift Pattern</th>
                    <th className="p-3">Assigned Residents</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStaff.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2.5">
                        <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                        <span>{s.name}</span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{s.position}</td>
                      <td className="p-3 text-slate-600">{s.shift}</td>
                      <td className="p-3 font-bold text-sky-700">{s.assignedResidentsCount} Resident(s)</td>
                      <td className="p-3 text-slate-500">{s.email}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStaffModal(s)}
                            className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="View Staff Details & Assigned Residents"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteStaff(s.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Staff Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* TAB 4: SHIFT MANAGEMENT */}
        {activeTab === 'shifts' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Shift Roster Management</h2>
                <p className="text-xs text-slate-500">Scheduled shifts for nurses, care leads, and support staff</p>
              </div>
              <button
                onClick={() => setIsAddShiftOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Add New Shift
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((sh) => (
                <div key={sh.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                  <button
                    onClick={() => deleteShift(sh.id)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                      {sh.shiftType} Shift
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{sh.staffName}</h4>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>📅 Date: <strong className="text-slate-800">{sh.shiftDate}</strong></div>
                    <div>⏰ Time: <strong className="text-slate-800">{sh.startTime} - {sh.endTime}</strong></div>
                    <div>📍 Location: <strong className="text-slate-800">{sh.location}</strong></div>
                  </div>
                  {sh.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-200">
                      "{sh.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB 5: INTERNAL MESSAGING */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Internal Communication Hub</h2>
                <p className="text-xs text-slate-500">Secure messaging between Admin, Staff, and Resident Relatives</p>
              </div>
              <button
                onClick={() => setIsComposeMessageOpen(true)}
                className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Compose Message
              </button>
            </div>

            <div className="flex gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setMessagingTab('inbox')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  messagingTab === 'inbox'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" /> Inbox ({inboxMessages.length})
              </button>
              <button
                onClick={() => setMessagingTab('sent')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  messagingTab === 'sent'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> Sent Items ({sentMessages.length})
              </button>
            </div>

            <div className="space-y-3">
              {(messagingTab === 'inbox' ? inboxMessages : sentMessages).map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => markMessageAsRead(msg.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    !msg.isRead && messagingTab === 'inbox'
                      ? 'bg-sky-50/80 border-sky-300 font-semibold shadow-2xs'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-slate-900 text-sm">{msg.subject}</div>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {messagingTab === 'inbox' ? `From: ${msg.senderName} (${msg.senderRole})` : `To: ${msg.receiverName} (${msg.receiverRole})`}
                  </div>
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <AddResidentModal
        isOpen={isAddResidentOpen}
        onClose={() => setIsAddResidentOpen(false)}
        defaultCategory={residentCategoryPreset}
      />
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
      />
      <AddShiftModal
        isOpen={isAddShiftOpen}
        onClose={() => setIsAddShiftOpen(false)}
      />
      <ComposeMessageModal
        isOpen={isComposeMessageOpen}
        onClose={() => setIsComposeMessageOpen(false)}
      />

      {/* View Resident Modal */}
      {selectedResidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900">{selectedResidentModal.fullName} Details</h3>
            <div className="text-xs space-y-2 text-slate-700">
              <div><strong>Category:</strong> {selectedResidentModal.careCategory}</div>
              <div><strong>Room:</strong> {selectedResidentModal.roomNumber}</div>
              <div><strong>Assigned Staff:</strong> {selectedResidentModal.assignedStaffName}</div>
              <div><strong>Health Status:</strong> {selectedResidentModal.healthStatus}</div>
              <div><strong>Medical Notes:</strong> {selectedResidentModal.medicalNotes}</div>
              <div><strong>Emergency Contact:</strong> {selectedResidentModal.emergencyContact.name} ({selectedResidentModal.emergencyContact.relationship}) - {selectedResidentModal.emergencyContact.phone}</div>
            </div>
            <button
              onClick={() => setSelectedResidentModal(null)}
              className="w-full bg-slate-900 text-white text-xs font-bold py-2 rounded-xl"
            >
              Close Record View
            </button>
          </div>
        </div>
      )}

      {/* View Staff Details & Assigned Residents Modal */}
      {selectedStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedStaffModal.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedStaffModal.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow-sm"
                />
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedStaffModal.name}</h3>
                  <div className="text-xs font-bold text-teal-700">{selectedStaffModal.position}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Joined: {selectedStaffModal.joinDate || 'N/A'}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Staff Contact & Work Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Email Contact</div>
                <div className="font-semibold text-slate-800 truncate">{selectedStaffModal.email}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Phone Number</div>
                <div className="font-semibold text-slate-800">{selectedStaffModal.phone || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Shift Pattern</div>
                <div className="font-semibold text-slate-800">{selectedStaffModal.shift}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Qualification</div>
                <div className="font-semibold text-slate-800">{selectedStaffModal.qualification || 'Certified Care Specialist'}</div>
              </div>
            </div>

            {/* Assigned Residents List Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Assigned Residents ({
                    residents.filter(r => r.assignedStaffId === selectedStaffModal.id || r.assignedStaffName?.toLowerCase() === selectedStaffModal.name.toLowerCase()).length
                  })</span>
                </h4>
              </div>

              {(() => {
                const assignedList = residents.filter(
                  r => r.assignedStaffId === selectedStaffModal.id || r.assignedStaffName?.toLowerCase() === selectedStaffModal.name.toLowerCase()
                );

                if (assignedList.length === 0) {
                  return (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 italic">
                      No residents currently assigned to this staff member.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {assignedList.map((r) => (
                      <div key={r.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={r.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={r.fullName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900">{r.fullName}</div>
                            <div className="text-[11px] text-slate-500">Room: {r.roomNumber} • {r.careCategory}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          r.healthStatus === 'Stable' || r.healthStatus === 'Excellent' 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {r.healthStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setSelectedStaffModal(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              Close Staff Record
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

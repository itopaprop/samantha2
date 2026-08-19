import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AddResidentModal } from '../../components/modals/AddResidentModal';
import { AddStaffModal } from '../../components/modals/AddStaffModal';
import { AddShiftModal } from '../../components/modals/AddShiftModal';
import { AddEventModal } from '../../components/modals/AddEventModal';
import { AddJobModal } from '../../components/modals/AddJobModal';
import { AddGalleryMediaModal } from '../../components/modals/AddGalleryMediaModal';
import { CredentialsCreatedModal, CredentialsData } from '../../components/modals/CredentialsCreatedModal';
import { EditResidentModal } from '../../components/modals/EditResidentModal';
import { EditStaffModal } from '../../components/modals/EditStaffModal';
import { EditShiftModal } from '../../components/modals/EditShiftModal';
import { ViewShiftsModal } from '../../components/modals/ViewShiftsModal';
import { ComposeMessageModal } from '../../components/modals/ComposeMessageModal';
import { ShareEventModal } from '../../components/modals/ShareEventModal';
import { CareCategory, UserRole, StaffMember, Resident, Shift, CommunityEvent } from '../../types';
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
  Paperclip,
  Download,
  Briefcase,
  Image as ImageIcon,
  Video as VideoIcon,
  Film,
  CalendarDays,
  MapPin,
  Play,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    currentUser, 
    residents, 
    staff, 
    shifts, 
    messages,
    deleteMessage,
    applications,
    deleteApplication,
    activityLogs, 
    events,
    deleteEvent,
    jobs,
    deleteJob,
    galleryItems,
    deleteGalleryItem,
    deleteResident, 
    deleteStaff, 
    deleteShift, 
    markMessageAsRead,
    showToast,
    logout 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'residents' | 'staff' | 'shifts' | 'messages' | 'events' | 'jobs' | 'gallery' | 'settings'>('overview');
  const [messagingTab, setMessagingTab] = useState<'inbox' | 'sent' | 'applications'>('inbox');
  const [deletingItem, setDeletingItem] = useState<{ type: 'message' | 'application'; id: string; title: string } | null>(null);
  
  // Modals state
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const [residentCategoryPreset, setResidentCategoryPreset] = useState<CareCategory | undefined>();
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isViewShiftsOpen, setIsViewShiftsOpen] = useState(false);
  const [isComposeMessageOpen, setIsComposeMessageOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddJobOpen, setIsAddJobOpen] = useState(false);
  const [isAddGalleryMediaOpen, setIsAddGalleryMediaOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CredentialsData | null>(null);
  const [selectedResidentModal, setSelectedResidentModal] = useState<any>(null);
  const [selectedStaffModal, setSelectedStaffModal] = useState<StaffMember | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CommunityEvent | null>(null);
  const [adminZoomScale, setAdminZoomScale] = useState<number>(1);
  const [sharingAdminEvent, setSharingAdminEvent] = useState<CommunityEvent | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Edit modal states
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const handlePrintResident = (res: Resident) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resident Profile - ${res.fullName}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 32px; color: #0f172a; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
            .brand { font-size: 20px; font-weight: 800; color: #0f172a; }
            .subtitle { font-size: 11px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 1px; }
            .profile-card { display: flex; gap: 20px; align-items: center; background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px; }
            .avatar { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #d97706; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
            .info-box { background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
            .label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .value { font-size: 13px; font-weight: 700; color: #0f172a; }
            .notes-box { background: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 12px; margin-bottom: 28px; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
            .sig-line { width: 220px; border-top: 1px solid #94a3b8; padding-top: 8px; text-align: center; font-size: 11px; color: #64748b; font-weight: 600; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">Samanthasappy Healthcare & Residential Care</div>
              <div class="subtitle">Official Resident Medical Profile</div>
            </div>
            <div style="font-size: 12px; color: #64748b; font-weight: 600;">
              Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div class="profile-card">
            <img src="${res.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}" class="avatar" />
            <div>
              <h2 style="margin: 0; font-size: 22px; font-weight: 800;">${res.fullName}</h2>
              <div style="font-size: 13px; font-weight: 700; color: #b45309; margin-top: 4px;">Care Category: ${res.careCategory}</div>
              <div style="font-size: 12px; color: #64748b; font-weight: 600; margin-top: 4px;">Suite / Room: ${res.roomNumber} &bull; Admission Date: ${res.admissionDate || 'N/A'}</div>
            </div>
          </div>

          <div class="grid">
            <div class="info-box"><div class="label">Assigned Care Specialist</div><div class="value">${res.assignedStaffName || 'Unassigned'}</div></div>
            <div class="info-box"><div class="label">Health Status</div><div class="value">${res.healthStatus}</div></div>
            <div class="info-box"><div class="label">Date of Birth</div><div class="value">${res.dateOfBirth || 'N/A'}</div></div>
            <div class="info-box"><div class="label">Gender</div><div class="value">${res.gender || 'N/A'}</div></div>
          </div>

          <div class="info-box" style="margin-bottom: 20px;">
            <div class="label">Emergency Contact</div>
            <div class="value">${res.emergencyContact?.name || 'N/A'} (${res.emergencyContact?.relationship || 'N/A'})</div>
            <div style="font-size: 12px; color: #475569; font-weight: 500; margin-top: 2px;">Phone: ${res.emergencyContact?.phone || 'N/A'}</div>
          </div>

          <div class="notes-box">
            <div class="label" style="color: #92400e;">Medical Notes & Care Protocols</div>
            <div style="font-size: 13px; color: #1e293b; margin-top: 6px; font-weight: 500;">${res.medicalNotes || 'No specific medical notes recorded.'}</div>
          </div>

          <div class="signatures">
            <div class="sig-line">Care Specialist Signature</div>
            <div class="sig-line">Medical Supervisor Approval</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!currentUser) return null;

  // Admin profile avatar
  const adminAvatar = currentUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';

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
              src={adminAvatar}
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

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Content & Public Media
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('events')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'events'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-amber-400" />
                    <span>Events Manager</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded-full border border-slate-700 font-extrabold">
                    {events.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'jobs'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-4 h-4 text-sky-400" />
                    <span>Job Vacancies</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full border border-slate-700 font-extrabold">
                    {jobs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'gallery'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Film className="w-4 h-4 text-teal-400" />
                    <span>Gallery (Image/Video)</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-teal-400 px-2 py-0.5 rounded-full border border-slate-700 font-extrabold">
                    {galleryItems.length}
                  </span>
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
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src={adminAvatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-500/40 shadow-md shrink-0 ring-4 ring-purple-50"
            />
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
          </div>

          {/* Quick Action Trigger Bar & Clickable Inbox Notification */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('messages')}
              className="relative flex items-center gap-2 px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/90 rounded-xl font-bold text-xs shadow-2xs transition-all cursor-pointer group"
              title="Click to open Inbox Messages"
            >
              <Mail className="w-4 h-4 text-sky-700 group-hover:scale-110 transition-transform" />
              <span>Inbox</span>
              {unreadMessagesCount > 0 ? (
                <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                  {unreadMessagesCount} unread
                </span>
              ) : (
                <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  0 unread
                </span>
              )}
            </button>
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
              onClick={() => setIsViewShiftsOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" /> View Shifts
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

              <div 
                onClick={() => setIsViewShiftsOpen(true)}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Shifts</div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">View All →</span>
                </div>
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
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedResidentModal(r)}
                            className="p-1.5 text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingResident(r)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Resident"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteResident(r.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove Resident"
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
                            onClick={() => setEditingStaff(s)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Staff Member"
                          >
                            <Edit3 className="w-4 h-4" />
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsViewShiftsOpen(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-4 h-4" /> View Duty Shifts
                </button>
                <button
                  onClick={() => setIsAddShiftOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" /> Add New Shift
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map((sh) => (
                <div key={sh.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
                  <div className="absolute top-4 right-4 flex items-center gap-1">
                    <button
                      onClick={() => setEditingShift(sh)}
                      className="text-slate-400 hover:text-amber-600 transition-colors p-1 cursor-pointer"
                      title="Edit Shift"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteShift(sh.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                      title="Delete Shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setMessagingTab('inbox')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  messagingTab === 'inbox'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Inbox className="w-3.5 h-3.5" /> Inbox ({inboxMessages.length})
              </button>
              <button
                onClick={() => setMessagingTab('sent')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  messagingTab === 'sent'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> Sent Items ({sentMessages.length})
              </button>
              <button
                onClick={() => setMessagingTab('applications')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  messagingTab === 'applications'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Care Applications ({applications.length})
              </button>
            </div>

            {/* MESSAGES VIEW (INBOX / SENT) */}
            {(messagingTab === 'inbox' || messagingTab === 'sent') && (
              <div className="space-y-3">
                {(messagingTab === 'inbox' ? inboxMessages : sentMessages).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No {messagingTab} messages found.
                  </div>
                ) : (
                  (messagingTab === 'inbox' ? inboxMessages : sentMessages).map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => markMessageAsRead(msg.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                        !msg.isRead && messagingTab === 'inbox'
                          ? 'bg-sky-50/80 border-sky-300 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="font-bold text-slate-900 text-sm">{msg.subject}</div>
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                          <button
                            type="button"
                            onClick={() => setDeletingItem({ type: 'message', id: msg.id, title: msg.subject })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-200 flex items-center gap-1 text-xs font-bold"
                            title="Delete or Retain Message"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span className="hidden sm:inline text-rose-600 text-[11px]">Delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {messagingTab === 'inbox' ? `From: ${msg.senderName} (${msg.senderRole})` : `To: ${msg.receiverName} (${msg.receiverRole})`}
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

                      {/* References & Applicant Photos Panel */}
                      {((msg.references && msg.references.length > 0) || msg.applicantPhotoUrl) && (
                        <div 
                          className="mt-3 pt-3 border-t border-slate-200/80 space-y-3 bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <Paperclip className="w-4 h-4 text-sky-700" />
                            <span>Submitted Applicant & Reference Image Documents</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Applicant Photo */}
                            {msg.applicantPhotoUrl && (
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                                  <span>Applicant Photo / ID</span>
                                  <span className="text-[10px] px-2 py-0.5 bg-sky-100 text-sky-800 font-bold rounded-md">Primary</span>
                                </div>
                                <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-900 h-32">
                                  <img 
                                    src={msg.applicantPhotoUrl} 
                                    alt="Applicant Photo" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                                    onClick={() => setPreviewImage({ url: msg.applicantPhotoUrl!, title: `${msg.subject} - Applicant Photo` })}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage({ url: msg.applicantPhotoUrl!, title: `${msg.subject} - Applicant Photo` })}
                                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 text-amber-300" /> View Photo
                                  </button>
                                </div>
                                <a
                                  href={msg.applicantPhotoUrl}
                                  download="Applicant_Photo.jpg"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Download className="w-3 h-3" /> Download Photo
                                </a>
                              </div>
                            )}

                            {/* Reference Images */}
                            {msg.references && msg.references.map((ref, idx) => (
                              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                                <div>
                                  <div className="text-xs font-extrabold text-slate-900">{ref.name || `Reference ${idx + 1}`}</div>
                                  <div className="text-[11px] text-sky-700 font-bold">{ref.relationship || 'Guarantor / Reference'}</div>
                                  <div className="text-[11px] text-slate-600">📞 {ref.phone || 'N/A'} {ref.email ? `| ✉️ ${ref.email}` : ''}</div>
                                </div>

                                {ref.photoUrl ? (
                                  <div className="space-y-1.5 pt-1">
                                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Reference Photo Document</div>
                                    <div className="relative group overflow-hidden rounded-xl border border-slate-200 bg-slate-900 h-32">
                                      <img 
                                        src={ref.photoUrl} 
                                        alt={ref.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                                        onClick={() => setPreviewImage({ url: ref.photoUrl!, title: `Reference Document: ${ref.name} (${ref.relationship})` })}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setPreviewImage({ url: ref.photoUrl!, title: `Reference Document: ${ref.name} (${ref.relationship})` })}
                                        className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                                      >
                                        <Eye className="w-4 h-4 text-amber-300" /> View Full Image
                                      </button>
                                    </div>
                                    <a
                                      href={ref.photoUrl}
                                      download={`${(ref.name || 'Reference').replace(/\s+/g, '_')}_Doc.jpg`}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                                    >
                                      <Download className="w-3 h-3" /> Download Document
                                    </a>
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 italic bg-white p-2 rounded-lg border border-slate-100">
                                    No photo image attached for this reference
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* CARE APPLICATIONS SUBMISSIONS VIEW */}
            {messagingTab === 'applications' && (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <div className="font-bold text-slate-600">No care applications logged in database.</div>
                    <div>When job seekers or clients submit care applications, they will appear here with full details and image attachments.</div>
                  </div>
                ) : (
                  applications.map((app) => (
                    <div key={app.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                              app.type === 'caregiver' ? 'bg-teal-100 text-teal-800' : 'bg-sky-100 text-sky-800'
                            }`}>
                              {app.type === 'caregiver' ? 'Caregiver Staff Application' : 'Resident Care Admission Application'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">Submitted: {app.createdAt}</span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-900 mt-1">{app.fullName}</h3>
                        </div>

                        {/* Action Buttons: Retain or Delete Application */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Retained in Database
                          </span>
                          <button
                            type="button"
                            onClick={() => setDeletingItem({ type: 'application', id: app.id, title: `Application for ${app.fullName}` })}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Delete Application Submission"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Info</span>
                          <div className="font-bold text-slate-800">✉️ {app.email}</div>
                          <div className="text-slate-600 font-medium">📞 {app.phone}</div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category / Role</span>
                          <div className="font-bold text-slate-800">{app.positionOrCategory}</div>
                          {app.sponsorName && <div className="text-slate-600">Sponsor: {app.sponsorName}</div>}
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medical / Qualifications Note</span>
                          <div className="text-slate-700 line-clamp-2">{app.notesOrStatement || 'N/A'}</div>
                        </div>
                      </div>

                      {/* Attached Images preview */}
                      {((app.references && app.references.length > 0) || app.photoUrl) && (
                        <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-3">
                          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                            <Paperclip className="w-4 h-4 text-sky-700" />
                            <span>Attached Applicant Photo & Reference Images</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {app.photoUrl && (
                              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                                <img
                                  src={app.photoUrl}
                                  alt="Applicant Photo"
                                  className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-90 shrink-0 border border-slate-200"
                                  onClick={() => setPreviewImage({ url: app.photoUrl!, title: `Application Photo: ${app.fullName}` })}
                                />
                                <div>
                                  <div className="text-xs font-bold text-slate-900">Applicant Photo Document</div>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewImage({ url: app.photoUrl!, title: `Application Photo: ${app.fullName}` })}
                                    className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                                  >
                                    <Eye className="w-3 h-3 text-amber-600" /> View Photo
                                  </button>
                                </div>
                              </div>
                            )}
                            {app.references && app.references.map((ref, idx) => (
                              <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                                {ref.photoUrl ? (
                                  <img
                                    src={ref.photoUrl}
                                    alt={ref.name}
                                    className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-90 shrink-0 border border-slate-200"
                                    onClick={() => setPreviewImage({ url: ref.photoUrl!, title: `Reference Document: ${ref.name} (${ref.relationship})` })}
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 text-[10px] shrink-0 font-bold">No Doc</div>
                                )}
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-900 truncate">{ref.name} ({ref.relationship})</div>
                                  <div className="text-[11px] text-slate-500">📞 {ref.phone}</div>
                                  {ref.photoUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewImage({ url: ref.photoUrl!, title: `Reference Document: ${ref.name}` })}
                                      className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer flex items-center gap-1 mt-0.5"
                                    >
                                      <Eye className="w-3 h-3 text-amber-600" /> View Document
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}


        {/* TAB 6: EVENTS MANAGER */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Community & Institutional Events</h2>
                <p className="text-xs text-slate-500">Manage public celebrations, medical workshops, and gatherings</p>
              </div>
              <button
                onClick={() => setIsAddEventOpen(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Post New Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <div key={evt.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all group">
                  <div>
                    {/* Flyer Poster Preview Header */}
                    <div 
                      onClick={() => setViewingEvent(evt)}
                      className="relative h-48 bg-slate-900 overflow-hidden cursor-pointer group/img"
                    >
                      <img 
                        src={evt.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'} 
                        alt={evt.title} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedDrive) {
                            target.dataset.triedDrive = 'true';
                            const match = (evt.imageUrl || '').match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
                            if (match && match[1]) {
                              target.src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                              return;
                            }
                          }
                          if (!target.dataset.fallback) {
                            target.dataset.fallback = 'true';
                            target.src = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80';
                          }
                        }}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500 opacity-90" 
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(evt.id);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer z-10"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded shadow-xs z-10">
                        {evt.category}
                      </span>

                      {/* Hover Sheen Overlay */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-slate-900/90 text-white rounded-full text-xs font-bold border border-white/20 shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover/img:translate-y-0 transition-all">
                          <Eye className="w-3.5 h-3.5 text-amber-400" /> View Poster
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 
                        onClick={() => setViewingEvent(evt)}
                        className="font-bold text-slate-900 text-sm leading-tight hover:text-amber-600 transition-colors cursor-pointer"
                      >
                        {evt.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>
                      <div className="text-[11px] text-slate-500 space-y-1 pt-2 border-t border-slate-200/80">
                        <div>📅 <strong>{evt.date}</strong> ({evt.time || 'All day'})</div>
                        <div>📍 {evt.location}</div>
                        <div>👤 Host: {evt.organizer || 'Care Team'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => setViewingEvent(evt)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white transition-all flex items-center justify-center gap-2 cursor-pointer group/btn shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400 group-hover/btn:text-slate-950 transition-colors" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB 7: JOB VACANCIES */}
        {activeTab === 'jobs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Career & Vacancy Management</h2>
                <p className="text-xs text-slate-500">Post open positions for nurses, caregivers, educators, and staff</p>
              </div>
              <button
                onClick={() => setIsAddJobOpen(true)}
                className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Post New Vacancy
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between shadow-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {job.department}
                      </span>
                      <button
                        onClick={() => deleteJob(job.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                        title="Delete Vacancy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                      <span>💼 {job.type}</span>
                      <span>📍 {job.location}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{job.description}</p>
                  </div>

                  {job.requirements && job.requirements.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/80">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Key Requirements</div>
                      <ul className="text-xs text-slate-600 space-y-0.5 list-disc list-inside">
                        {job.requirements.map((req, i) => (
                          <li key={i} className="truncate">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB 8: GALLERY MEDIA */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Photo & Video Gallery Management</h2>
                <p className="text-xs text-slate-500">Upload photos and video clips showing daily life, care, and facilities</p>
              </div>
              <button
                onClick={() => setIsAddGalleryMediaOpen(true)}
                className="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Upload Gallery Media
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs relative aspect-[4/3] group">
                  {item.mediaType === 'video' && item.videoUrl ? (
                    <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.dataset.triedDrive) {
                            target.dataset.triedDrive = 'true';
                            const match = item.imageUrl.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
                            if (match && match[1]) {
                              target.src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                            }
                          }
                        }}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-3 left-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1 shadow-md">
                        <Play className="w-3 h-3 fill-current" /> Video
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.triedDrive) {
                          target.dataset.triedDrive = 'true';
                          const match = item.imageUrl.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            target.src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                          }
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <button
                    onClick={() => deleteGalleryItem(item.id)}
                    className="absolute top-3 right-3 p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-colors z-10 cursor-pointer shadow-md"
                    title="Delete Media"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
        onSuccessCredentials={(creds) => setCreatedCredentials(creds)}
      />
      <AddStaffModal
        isOpen={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onSuccessCredentials={(creds) => setCreatedCredentials(creds)}
      />
      <CredentialsCreatedModal
        isOpen={!!createdCredentials}
        onClose={() => setCreatedCredentials(null)}
        credentials={createdCredentials}
      />
      <AddShiftModal
        isOpen={isAddShiftOpen}
        onClose={() => setIsAddShiftOpen(false)}
      />
      <ViewShiftsModal
        isOpen={isViewShiftsOpen}
        onClose={() => setIsViewShiftsOpen(false)}
        onEditShift={(s) => {
          setIsViewShiftsOpen(false);
          setEditingShift(s);
        }}
      />
      <ComposeMessageModal
        isOpen={isComposeMessageOpen}
        onClose={() => setIsComposeMessageOpen(false)}
      />
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
      />
      <AddJobModal
        isOpen={isAddJobOpen}
        onClose={() => setIsAddJobOpen(false)}
      />
      <AddGalleryMediaModal
        isOpen={isAddGalleryMediaOpen}
        onClose={() => setIsAddGalleryMediaOpen(false)}
      />

      {/* Edit Modals */}
      <EditResidentModal
        isOpen={!!editingResident}
        onClose={() => setEditingResident(null)}
        resident={editingResident}
      />
      <EditStaffModal
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        staffMember={editingStaff}
      />
      <EditShiftModal
        isOpen={!!editingShift}
        onClose={() => setEditingShift(null)}
        shift={editingShift}
      />

      {/* View Resident Modal */}
      {selectedResidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header with Resident Image */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedResidentModal.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                  alt={selectedResidentModal.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0 ring-2 ring-amber-100"
                />
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedResidentModal.fullName}</h3>
                  <div className="text-xs font-bold text-amber-700">{selectedResidentModal.careCategory}</div>
                  <div className="text-[11px] text-slate-500 font-medium">Room / Suite: {selectedResidentModal.roomNumber} • Admitted: {selectedResidentModal.admissionDate || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintResident(selectedResidentModal)}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200"
                  title="Print Resident Profile"
                >
                  <Printer className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Print Record</span>
                </button>
                <button
                  onClick={() => setSelectedResidentModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resident Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Assigned Care Specialist</div>
                <div className="font-semibold text-slate-800">{selectedResidentModal.assignedStaffName || 'Unassigned'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Health Status</div>
                <div className="font-semibold text-slate-800">{selectedResidentModal.healthStatus}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Date of Birth</div>
                <div className="font-semibold text-slate-800">{selectedResidentModal.dateOfBirth || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="font-bold text-slate-500 text-[10px] uppercase">Gender</div>
                <div className="font-semibold text-slate-800">{selectedResidentModal.gender || 'N/A'}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
              <div className="font-bold text-slate-500 text-[10px] uppercase mb-1">Emergency Contact</div>
              <div className="font-semibold text-slate-800">
                {selectedResidentModal.emergencyContact?.name} ({selectedResidentModal.emergencyContact?.relationship})
              </div>
              <div className="text-slate-600 font-medium">{selectedResidentModal.emergencyContact?.phone}</div>
            </div>

            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/70 text-xs">
              <div className="font-bold text-amber-900 text-[10px] uppercase mb-1">Medical Notes & Care Guidelines</div>
              <div className="text-slate-700 leading-relaxed font-medium">{selectedResidentModal.medicalNotes || 'No specific medical notes recorded.'}</div>
            </div>

            {/* Attached References & Images Section */}
            {selectedResidentModal.references && selectedResidentModal.references.length > 0 && (
              <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100 space-y-3 text-xs">
                <div className="font-bold text-sky-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-700" />
                  <span>Attached References & Guarantor Documents ({selectedResidentModal.references.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedResidentModal.references.map((ref: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                      <div className="font-bold text-slate-900">{ref.name}</div>
                      <div className="text-[11px] text-sky-700 font-bold">{ref.relationship}</div>
                      <div className="text-[11px] text-slate-600">📞 {ref.phone} {ref.email ? `| ✉️ ${ref.email}` : ''}</div>
                      {ref.photoUrl ? (
                        <div className="pt-1 space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Reference Image</div>
                          <div className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-900 h-28">
                            <img 
                              src={ref.photoUrl} 
                              alt={ref.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => setPreviewImage({ url: ref.photoUrl, title: `Resident Reference: ${ref.name} (${ref.relationship})` })}
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: ref.photoUrl, title: `Resident Reference: ${ref.name} (${ref.relationship})` })}
                              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" /> View Photo
                            </button>
                          </div>
                          <a
                            href={ref.photoUrl}
                            download={`${(ref.name || 'Reference').replace(/\s+/g, '_')}_Ref_Doc.jpg`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            <Download className="w-3 h-3" /> Download Image
                          </a>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic bg-slate-50 p-1.5 rounded-lg">No document photo attached</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => handlePrintResident(selectedResidentModal)}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Profile</span>
              </button>
              <button
                onClick={() => {
                  const resToEdit = selectedResidentModal;
                  setSelectedResidentModal(null);
                  setEditingResident(resToEdit);
                }}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Resident Information</span>
              </button>
              <button
                onClick={() => setSelectedResidentModal(null)}
                className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Record
              </button>
            </div>

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

            {/* Attached Staff References & Images Section */}
            {selectedStaffModal.references && selectedStaffModal.references.length > 0 && (
              <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-100 space-y-3 text-xs">
                <div className="font-bold text-teal-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>Submitted Staff References & Guarantor Documents ({selectedStaffModal.references.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedStaffModal.references.map((ref: any, idx: number) => (
                    <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                      <div className="font-bold text-slate-900">{ref.name}</div>
                      <div className="text-[11px] text-teal-700 font-bold">{ref.relationship}</div>
                      <div className="text-[11px] text-slate-600">📞 {ref.phone} {ref.email ? `| ✉️ ${ref.email}` : ''}</div>
                      {ref.photoUrl ? (
                        <div className="pt-1 space-y-1">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Reference Image</div>
                          <div className="relative group overflow-hidden rounded-lg border border-slate-200 bg-slate-900 h-28">
                            <img 
                              src={ref.photoUrl} 
                              alt={ref.name} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                              onClick={() => setPreviewImage({ url: ref.photoUrl, title: `Staff Reference: ${ref.name} (${ref.relationship})` })}
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewImage({ url: ref.photoUrl, title: `Staff Reference: ${ref.name} (${ref.relationship})` })}
                              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" /> View Photo
                            </button>
                          </div>
                          <a
                            href={ref.photoUrl}
                            download={`${(ref.name || 'Reference').replace(/\s+/g, '_')}_Ref_Doc.jpg`}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            <Download className="w-3 h-3" /> Download Image
                          </a>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic bg-slate-50 p-1.5 rounded-lg">No document photo attached</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

      {/* Event Details / Full Flyer Lightbox Modal */}
      {viewingEvent && (() => {
        const handleAdminShare = (e: React.MouseEvent) => {
          e.stopPropagation();
          setSharingAdminEvent(viewingEvent);
        };

        const toggleAdminZoom = () => {
          setAdminZoomScale(prev => (prev === 1 ? 1.8 : prev >= 2.5 ? 1 : prev + 0.5));
        };

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/92 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
            onClick={() => {
              setAdminZoomScale(1);
              setViewingEvent(null);
            }}
          >
            {/* Floating Top Close Button */}
            <button
              onClick={() => {
                setAdminZoomScale(1);
                setViewingEvent(null);
              }}
              className="fixed top-4 right-4 md:top-6 md:right-6 z-50 p-3 rounded-full bg-slate-900/90 text-white hover:bg-rose-600 hover:scale-105 active:scale-95 transition-all shadow-2xl border border-slate-700/80 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Box */}
            <div
              className="relative max-w-4xl w-full my-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row text-white max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Poster Image View */}
              <div className="w-full lg:w-3/5 bg-slate-950 flex flex-col relative min-h-[300px] lg:min-h-[460px]">
                {/* Floating Top Header Badges & Share Icon */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                  <span className="pointer-events-auto text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg shadow-md">
                    {viewingEvent.category}
                  </span>

                  <button
                    onClick={handleAdminShare}
                    className="pointer-events-auto p-2 rounded-xl bg-slate-900/90 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all shadow-xl border border-slate-700/80 cursor-pointer flex items-center gap-1.5 text-xs font-bold px-3"
                    title="Share Event Flyer"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>

                {/* Canvas Area with Image Zoom */}
                <div className="w-full h-full flex-1 flex items-center justify-center p-4 pt-16 pb-16 overflow-auto scrollbar-thin">
                  <div className="relative flex items-center justify-center transition-all duration-300">
                    <img
                      src={viewingEvent.imageUrl || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80'}
                      alt={viewingEvent.title}
                      referrerPolicy="no-referrer"
                      onClick={toggleAdminZoom}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.triedDrive) {
                          target.dataset.triedDrive = 'true';
                          const match = (viewingEvent.imageUrl || '').match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
                          if (match && match[1]) {
                            target.src = `https://drive.google.com/uc?export=view&id=${match[1]}`;
                            return;
                          }
                        }
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = 'true';
                          target.src = 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80';
                        }
                      }}
                      style={{
                        transform: `scale(${adminZoomScale})`,
                        transformOrigin: 'center center',
                        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                      className={`max-h-[70vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800 transition-transform ${adminZoomScale > 1 ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                      title="Click poster to zoom in/out"
                    />
                  </div>
                </div>

                {/* Bottom Zoom Controls Toolbar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs font-bold text-slate-200">
                  <button
                    onClick={() => setAdminZoomScale(prev => Math.max(1, +(prev - 0.3).toFixed(1)))}
                    disabled={adminZoomScale <= 1}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-[11px] font-mono text-amber-400 select-none min-w-[45px] text-center">
                    {Math.round(adminZoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setAdminZoomScale(prev => Math.min(2.5, +(prev + 0.3).toFixed(1)))}
                    disabled={adminZoomScale >= 2.5}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 disabled:opacity-40 hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  {adminZoomScale > 1 && (
                    <button
                      onClick={() => setAdminZoomScale(1)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer ml-1"
                      title="Reset Zoom"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Event Details Content Panel */}
              <div className="w-full lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6 max-h-[50vh] lg:max-h-[85vh] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                    <Sparkles className="w-3.5 h-3.5" /> Full Event Poster
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug">
                    {viewingEvent.title}
                  </h2>

                  <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2.5 text-slate-200 font-semibold">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{viewingEvent.date}</span>
                      {viewingEvent.time && <span className="text-slate-400 font-normal">({viewingEvent.time})</span>}
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-300">
                      <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>{viewingEvent.location}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-400 text-[11px]">
                      <Users className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>Host: <strong className="text-slate-200">{viewingEvent.organizer || 'Care Team'}</strong></span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {viewingEvent.description}
                    </p>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAdminShare}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Share flyer link"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button
                    onClick={() => {
                      deleteEvent(viewingEvent.id);
                      setAdminZoomScale(1);
                      setViewingEvent(null);
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                  <button
                    onClick={() => {
                      setAdminZoomScale(1);
                      setViewingEvent(null);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Share Admin Event Modal */}
      <ShareEventModal
        isOpen={!!sharingAdminEvent}
        onClose={() => setSharingAdminEvent(null)}
        event={sharingAdminEvent}
      />

      {/* Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl p-6 text-white space-y-4 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white truncate pr-4">{previewImage.title}</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 p-2 rounded-2xl border border-slate-800 min-h-[300px]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-xl"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={previewImage.url}
                download="Document_Image.jpg"
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" /> Download Full Quality
              </a>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete or Retain Confirmation Modal */}
      {deletingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setDeletingItem(null)}
        >
          <div
            className="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">Manage Received Item</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  You selected <strong className="text-slate-900">"{deletingItem.title}"</strong>.
                  Do you want to retain this in the admin portal or permanently delete it?
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1.5">
              <div className="font-bold text-slate-800">Choose Option:</div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Retain Item</strong>: Keep this message or application saved in records.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span><strong>Delete Item</strong>: Permanently remove from system storage.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingItem(null);
                  showToast('Item retained in portal records.');
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Retain Item
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deletingItem.type === 'message') {
                    deleteMessage(deletingItem.id);
                  } else if (deletingItem.type === 'application') {
                    deleteApplication(deletingItem.id);
                  }
                  setDeletingItem(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

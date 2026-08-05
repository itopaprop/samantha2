import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComposeMessageModal } from '../../components/modals/ComposeMessageModal';
import { 
  Heart, 
  Users, 
  Mail, 
  User, 
  LogOut, 
  Activity, 
  Clock, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  MessageCircle,
  Pill,
  Sparkles
} from 'lucide-react';

export const RelativeDashboard: React.FC = () => {
  const { 
    currentUser, 
    residents, 
    messages, 
    markMessageAsRead, 
    logout 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'resident' | 'messages' | 'profile'>('resident');
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  if (!currentUser) return null;

  // Find linked resident(s) for this relative
  const linkedResidents = residents.filter(r => 
    r.id === currentUser.residentLinkedId || 
    currentUser.relationship?.toLowerCase().includes(r.fullName.toLowerCase().split(' ')[1]?.toLowerCase() || 'xyz')
  );

  const relativeMessages = messages.filter(m => m.receiverId === currentUser.id || m.senderId === currentUser.id);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-72 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-8">
          
          {/* Relative User Header Badge */}
          <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700/80 flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0"
            />
            <div className="overflow-hidden">
              <div className="font-bold text-white text-sm truncate">{currentUser.name}</div>
              <div className="text-[11px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-md inline-block mt-0.5">
                Role: Resident Relative
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">
                Loved One's Care
              </div>
              <button
                onClick={() => setActiveTab('resident')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'resident'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Heart className="w-4 h-4 text-amber-400" />
                <span>Resident Overview</span>
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
                  <span>Care Team Messaging</span>
                </div>
                {relativeMessages.filter(m => m.receiverId === currentUser.id && !m.isRead).length > 0 && (
                  <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                    New
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
                <span>My Profile</span>
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
            Logout of Family Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        
        {/* Welcome Area */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {currentUser.name}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-600/30" />
            Role: Resident Relative
          </div>
        </div>


        {/* Resident Overview Card */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Resident Overview Card</h2>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Live Encrypted Health Sync
            </span>
          </div>

          {linkedResidents.map((res) => (
            <div key={res.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{res.fullName}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {currentUser.relationship || 'Family Relative'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-sky-50 text-sky-800 border border-sky-100 rounded-xl text-xs font-bold">
                    Room: {res.roomNumber}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-bold">
                    Status: {res.healthStatus}
                  </span>
                </div>
              </div>

              {/* Grid info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Care Category</div>
                  <div className="font-bold text-slate-900 text-sm">{res.careCategory}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Caregiver</div>
                  <div className="font-bold text-slate-900 text-sm">{res.assignedStaffName || 'Nurse Sarah Jenkins'}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission Date</div>
                  <div className="font-bold text-slate-900 text-sm">{res.admissionDate}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emergency Contact</div>
                  <div className="font-bold text-slate-900 text-sm">{res.emergencyContact.phone}</div>
                </div>
              </div>

              {/* Health Vitals Panel */}
              {res.vitals && (
                <div className="p-5 bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wider">
                    <Activity className="w-4 h-4" /> Recorded Vitals & Health Metrics
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-slate-400 text-[10px]">Blood Pressure</div>
                      <div className="font-extrabold text-white text-base">{res.vitals.bloodPressure}</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-slate-400 text-[10px]">Heart Rate</div>
                      <div className="font-extrabold text-white text-base">{res.vitals.heartRate}</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-slate-400 text-[10px]">Body Temperature</div>
                      <div className="font-extrabold text-white text-base">{res.vitals.temperature}</div>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <div className="text-slate-400 text-[10px]">Body Weight</div>
                      <div className="font-extrabold text-white text-base">{res.vitals.weight}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Last Activity Update */}
              <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" /> Last Daily Activity & Care Journal Update
                  </span>
                  <span className="text-[10px] text-amber-700 font-normal">Updated Today</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{res.lastActivityUpdate}"
                </p>
              </div>

            </div>
          ))}
        </div>


        {/* Messaging Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Family Communication & Updates</h2>
              <p className="text-xs text-slate-500">Send direct messages to assigned nurses or administrative directors</p>
            </div>
            <button
              onClick={() => setIsComposeOpen(true)}
              className="bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Message Assigned Nurse
            </button>
          </div>

          <div className="space-y-3">
            {relativeMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => markMessageAsRead(msg.id)}
                className={`p-4 rounded-2xl border transition-all ${
                  msg.receiverId === currentUser.id && !msg.isRead
                    ? 'bg-amber-50/90 border-amber-300 font-semibold shadow-xs'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900 text-sm">{msg.subject}</span>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {msg.senderId === currentUser.id ? `To: ${msg.receiverName} (${msg.receiverRole})` : `From: ${msg.senderName} (${msg.senderRole})`}
                </div>
                <p className="text-xs text-slate-700 mt-2 leading-relaxed">
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

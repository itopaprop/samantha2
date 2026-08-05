import React from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { StaffDashboard } from './staff/StaffDashboard';
import { RelativeDashboard } from './relative/RelativeDashboard';
import { ShieldCheck, UserCheck, Heart, LogIn } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser, setCurrentPage, switchDemoRole } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-md w-full text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto font-bold">
            <LogIn className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Portal Access Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please sign in to access your role-based dashboard for Samanthasappy Home.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => setCurrentPage('login')}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-3 rounded-xl shadow-md text-xs cursor-pointer"
            >
              Go to Portal Login Page
            </button>

            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Or Instant Demo Access
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => switchDemoRole('Admin')}
                className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between px-4 transition-colors"
              >
                <span>Enter Admin Portal (Samantha)</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </button>
              <button
                onClick={() => switchDemoRole('Staff')}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between px-4 transition-colors"
              >
                <span>Enter Staff Portal (Nurse Sarah)</span>
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </button>
              <button
                onClick={() => switchDemoRole('Resident Relative')}
                className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between px-4 transition-colors"
              >
                <span>Enter Family Portal (David Miller)</span>
                <Heart className="w-4 h-4 text-amber-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'Admin') {
    return <AdminDashboard />;
  }

  if (currentUser.role === 'Staff') {
    return <StaffDashboard />;
  }

  if (currentUser.role === 'Resident Relative') {
    return <RelativeDashboard />;
  }

  return null;
};

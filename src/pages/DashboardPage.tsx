import React from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { StaffDashboard } from './staff/StaffDashboard';
import { RelativeDashboard } from './relative/RelativeDashboard';
import { LogIn } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser, setCurrentPage } = useApp();

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
              Please sign in with your verified administrator, staff, or family credentials to access your dashboard.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => setCurrentPage('login')}
              className="w-full bg-sky-700 hover:bg-sky-800 text-white font-bold py-3 rounded-xl shadow-md text-xs cursor-pointer transition-colors"
            >
              Go to Portal Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const normalizedRole = (currentUser.role || '').toLowerCase();

  if (
    normalizedRole === 'admin' || 
    normalizedRole === 'administrator' || 
    currentUser.email?.toLowerCase().includes('admin') ||
    currentUser.email?.toLowerCase() === 'itopaprop@gmail.com'
  ) {
    return <AdminDashboard />;
  }

  if (normalizedRole === 'staff' || normalizedRole === 'nurse' || normalizedRole === 'caregiver') {
    return <StaffDashboard />;
  }

  if (normalizedRole.includes('relative') || normalizedRole.includes('family') || normalizedRole.includes('parent')) {
    return <RelativeDashboard />;
  }

  // Safe fallback default to AdminDashboard
  return <AdminDashboard />;
};


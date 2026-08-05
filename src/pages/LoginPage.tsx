import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Lock, 
  Mail, 
  ShieldCheck, 
  User as UserIcon, 
  KeyRound, 
  Heart, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser, switchDemoRole } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [email, setEmail] = useState('admin@samanthasappyhome.com');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'Admin') setEmail('admin@samanthasappyhome.com');
    if (role === 'Staff') setEmail('s.jenkins@samanthasappyhome.com');
    if (role === 'Resident Relative') setEmail('david.miller@example.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email, selectedRole);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-white mx-auto shadow-md">
            <Heart className="w-6 h-6 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Samanthasappy Home
          </h1>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Care Management Portal Login
          </p>
        </div>

        {/* Login Container */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6">
          
          {/* Role Tabs Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Select Your Portal Role
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {(['Admin', 'Staff', 'Resident Relative'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleChange(role)}
                  className={`py-2 px-1 text-[11px] font-bold rounded-lg transition-all ${
                    selectedRole === role
                      ? 'bg-white text-sky-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role === 'Resident Relative' ? 'Relative' : role}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username / Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Password *</label>
                <button
                  type="button"
                  onClick={() => setForgotModal(true)}
                  className="text-xs text-sky-700 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span>Remember Me</span>
              </label>
              <span className="text-slate-400">Encrypted SSL Connection</span>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Sign In to {selectedRole} Portal
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Quick 1-Click Demo Accounts
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => switchDemoRole('Admin')}
                className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Folashade Sonyaolu</span>
                </div>
                <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-md">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoRole('Staff')}
                className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span>Sarah Jenkins, RN</span>
                </div>
                <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md">Staff</span>
              </button>

              <button
                type="button"
                onClick={() => switchDemoRole('Resident Relative')}
                className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-amber-600" />
                  <span>David Miller</span>
                </div>
                <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-md">Resident Relative</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Reset Account Password</h3>
            {forgotSent ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs text-slate-600">Password reset link sent to your email!</p>
                <button
                  onClick={() => { setForgotModal(false); setForgotSent(false); }}
                  className="mt-2 text-xs font-bold text-sky-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">Enter your registered email address to receive password instructions.</p>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setForgotSent(true)}
                    className="px-4 py-1.5 text-xs bg-sky-700 text-white font-bold rounded-xl"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

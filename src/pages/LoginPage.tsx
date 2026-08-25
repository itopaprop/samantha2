import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Heart, 
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser, loginWithGoogle, resetPassword } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [logoSrc, setLogoSrc] = useState('https://lh3.googleusercontent.com/d/1sUJpAFMzsPRgNuvKDSyRU01sgnLK41Fg');

  const [authError, setAuthError] = useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setAuthError(null);
    setEmail('');
    setPassword('');
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(selectedRole);
    } catch (err: any) {
      if (err?.message) {
        setAuthError(err.message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const success = await loginUser(email, selectedRole, password);
      if (!success) {
        setAuthError(`Access Denied: Invalid credentials or account type mismatch.`);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white mx-auto shadow-lg border-2 border-sky-500/20 overflow-hidden shrink-0">
            <img
              src={logoSrc}
              alt="Samanthasappy Home Logo"
              referrerPolicy="no-referrer"
              onError={() => {
                if (logoSrc.includes('lh3.googleusercontent.com')) {
                  setLogoSrc('https://drive.google.com/uc?export=view&id=1sUJpAFMzsPRgNuvKDSyRU01sgnLK41Fg');
                } else if (logoSrc.includes('uc?export=view')) {
                  setLogoSrc('https://drive.google.com/thumbnail?id=1sUJpAFMzsPRgNuvKDSyRU01sgnLK41Fg&sz=w1000');
                }
              }}
              className="w-full h-full object-cover"
            />
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

          {/* Auth Error Banner */}
          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-semibold space-y-1 animate-in fade-in">
              <span className="font-extrabold text-rose-950 block">🔒 Authentication Denied</span>
              <p className="text-[11px] text-rose-800 leading-relaxed">{authError}</p>
            </div>
          )}



          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
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
                  placeholder="Enter your email address"
                  autoComplete="off"
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
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 z-10 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-20 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer select-none"
                  title={showPassword ? 'Hide password' : 'View password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{showPassword ? 'Hide' : 'View'}</span>
                </button>
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
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              {isSubmitting ? 'Authenticating...' : `Sign In to ${selectedRole} Portal`}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              or continue with
            </span>
          </div>

          {/* Demo Quick Access */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Instant Demo Access ({selectedRole})</span>
          </button>


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
                <p className="text-xs text-slate-600">Password reset instructions sent to your email!</p>
                <button
                  onClick={() => { setForgotModal(false); setForgotSent(false); setForgotEmail(''); }}
                  className="mt-2 text-xs font-bold text-sky-700 hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!forgotEmail) return;
                  setIsResetting(true);
                  if (resetPassword) {
                    await resetPassword(forgotEmail);
                  }
                  setIsResetting(false);
                  setForgotSent(true);
                }} 
                className="space-y-3"
              >
                <p className="text-xs text-slate-600">Enter your registered email address to receive password reset instructions.</p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModal(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="px-4 py-1.5 text-xs bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isResetting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Key, Copy, Check, X, Mail, ShieldCheck, UserCheck, Eye, EyeOff } from 'lucide-react';

export interface CredentialsData {
  type: 'Staff' | 'Resident Relative';
  accountName: string;
  email: string;
  tempPassword: string;
  extraInfo?: string; // e.g. "Senior Care Lead" or "Linked Resident: Margaret Evans"
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  credentials: CredentialsData | null;
}

export const CredentialsCreatedModal: React.FC<Props> = ({ isOpen, onClose, credentials }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showPass, setShowPass] = useState(true);

  if (!isOpen || !credentials) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(credentials.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPass = () => {
    navigator.clipboard.writeText(credentials.tempPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleCopyAll = () => {
    const text = `Samanthasappy Home Portal Credentials:\nAccount Type: ${credentials.type}\nName: ${credentials.accountName}\nUsername (Login Email): ${credentials.email}\nTemporary Password: ${credentials.tempPassword}\n${credentials.extraInfo ? `${credentials.extraInfo}\n` : ''}Login Portal: https://samanthasappyhome.com/login`;
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
        
        {/* Header Banner */}
        <div className="bg-emerald-900 text-white px-6 py-5 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center shrink-0 text-emerald-300 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 mb-1">
                  Registration Successful
                </span>
                <h2 className="text-lg font-bold text-white">Temporary Credentials Generated</h2>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-emerald-300 hover:text-white p-1 rounded-lg hover:bg-emerald-800/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Welcome Email Alert Notice */}
          <div className="p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200/90 text-xs text-emerald-950 flex items-start gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-emerald-950 block">Welcome Notification Dispatched!</span>
              <p className="text-emerald-800 text-[11px] leading-relaxed">
                An automated email containing these login credentials and portal access instructions has been sent to{' '}
                <strong className="text-emerald-950 font-bold">{credentials.email}</strong>.
              </p>
            </div>
          </div>

          {/* User & Credentials Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3.5">
            {/* Account Info */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Holder</span>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  {credentials.accountName}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role Access</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {credentials.type}
                </span>
              </div>
            </div>

            {credentials.extraInfo && (
              <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/70 font-medium">
                {credentials.extraInfo}
              </div>
            )}

            {/* Username / Login Email Box */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">
                Username / Login Email (Registered Email)
              </label>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <code className="text-xs font-bold font-mono text-slate-900 flex-1 truncate">
                  {credentials.email}
                </code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Temporary Password Box */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" />
                  Generated Temporary Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPass ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="flex items-center gap-2 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                <code className="text-sm font-bold font-mono text-amber-950 flex-1 tracking-wider">
                  {showPass ? credentials.tempPassword : '••••••••••••'}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPass}
                  className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-2xs"
                  title="Copy password"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedAll ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'All Credentials Copied!' : 'Copy All Credentials'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Done & Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

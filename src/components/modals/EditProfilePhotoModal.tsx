import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  X, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  User as UserIcon, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

interface EditProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser?: User | null;
}

const PRESET_AVATARS: Record<UserRole, string[]> = {
  Admin: [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  ],
  Staff: [
    'https://images.unsplash.com/photo-1594824813566-7885a397738c?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&q=80',
  ],
  'Resident Relative': [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  ],
};

export const EditProfilePhotoModal: React.FC<EditProfilePhotoModalProps> = ({
  isOpen,
  onClose,
  targetUser: propUser,
}) => {
  const { currentUser, updateUserProfile, showToast } = useApp();
  const activeUser = propUser || currentUser;

  const [avatarUrl, setAvatarUrl] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeUser) {
      setAvatarUrl(activeUser.avatar || '');
      setUserName(activeUser.name || '');
      setUserPhone(activeUser.phone || '');
    }
  }, [activeUser, isOpen]);

  if (!isOpen || !activeUser) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size must be less than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;

    setIsSaving(true);
    try {
      const updates: Partial<User> = {
        avatar: avatarUrl.trim() || activeUser.avatar,
        name: userName.trim() || activeUser.name,
        phone: userPhone.trim() || activeUser.phone,
      };

      await updateUserProfile(activeUser.id, updates);
      showToast('Profile photo updated successfully!');
      onClose();
    } catch (err: any) {
      showToast(`Error updating profile: ${err?.message || 'Please try again'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const userRole: UserRole = activeUser.role || 'Admin';
  const presets = PRESET_AVATARS[userRole] || PRESET_AVATARS['Admin'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-lg w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Update Profile Photo</h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeUser.name} &bull; <span className="font-semibold text-sky-700">{activeUser.role} Dashboard</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current & New Avatar Preview */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="relative group">
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={activeUser.name}
              referrerPolicy="no-referrer"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-sky-500/30 shadow-xl ring-4 ring-sky-50 transition-transform group-hover:scale-105"
            />
            <div className="absolute -bottom-2 -right-2 bg-sky-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
              <Camera className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tab Navigation (Upload vs URL vs Preset) */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Image Link
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Presets
          </button>
        </div>

        {/* Tab 1: Upload from Device */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
                : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-slate-50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto mb-3 font-bold">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-800">
              Click to browse or drag & drop photo
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Supports JPG, PNG, WEBP, GIF (Max 10MB)
            </p>
          </div>
        )}

        {/* Tab 2: Image URL Input */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paste Direct Image or Photo URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or Google Drive URL"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-100 outline-none transition-all"
              />
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-500">
              You can paste links from Google Drive, Unsplash, or any public image source.
            </p>
          </div>
        )}

        {/* Tab 3: Curated Presets */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Choose Curated Profile Avatar
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(preset)}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all cursor-pointer group ${
                    avatarUrl === preset
                      ? 'border-sky-600 ring-2 ring-sky-300 scale-105'
                      : 'border-slate-200 hover:border-sky-400'
                  }`}
                >
                  <img
                    src={preset}
                    alt={`Preset ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  {avatarUrl === preset && (
                    <div className="absolute inset-0 bg-sky-900/40 flex items-center justify-center text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional Name & Phone Update fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-sky-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="+234 706 933 2193"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-sky-600 outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving to Cloud...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Profile Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

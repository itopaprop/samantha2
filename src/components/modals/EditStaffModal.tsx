import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffMember } from '../../types';
import { X, Edit3, UserCheck, Shield, Mail, Phone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  staffMember: StaffMember | null;
}

export const EditStaffModal: React.FC<Props> = ({ isOpen, onClose, staffMember }) => {
  const { updateStaff } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [shift, setShift] = useState('');
  const [qualification, setQualification] = useState('');
  const [role, setRole] = useState<'Staff' | 'Admin'>('Staff');

  useEffect(() => {
    if (staffMember) {
      setName(staffMember.name || '');
      setEmail(staffMember.email || '');
      setPhone(staffMember.phone || '');
      setPosition(staffMember.position || '');
      setShift(staffMember.shift || '');
      setQualification(staffMember.qualification || '');
      setRole(staffMember.role || 'Staff');
    }
  }, [staffMember]);

  if (!isOpen || !staffMember) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateStaff(staffMember.id, {
      name,
      email,
      phone,
      position,
      shift,
      qualification,
      role,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-2xl border border-teal-200/80">
              <Edit3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Edit Staff Profile</h3>
              <p className="text-xs text-slate-500">Update staff details, qualifications, and shift pattern</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Staff Member Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Position / Job Title</label>
              <input
                type="text"
                required
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Shift Pattern</label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              >
                <option value="Morning Shift (07:00 - 15:00)">Morning Shift (07:00 - 15:00)</option>
                <option value="Afternoon Shift (14:30 - 22:30)">Afternoon Shift (14:30 - 22:30)</option>
                <option value="Night Shift (22:00 - 07:30)">Night Shift (22:00 - 07:30)</option>
                <option value="Flexible Shift Rotation">Flexible Shift Rotation</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={e => setQualification(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                placeholder="e.g. BSc Nursing, NVQ Level 4 Care"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">System Access Level</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xs transition-all cursor-pointer"
            >
              Save Staff Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

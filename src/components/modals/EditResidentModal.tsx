import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Resident, CareCategory } from '../../types';
import { X, Edit3, UserCheck, Heart, Stethoscope, Phone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident | null;
}

export const EditResidentModal: React.FC<Props> = ({ isOpen, onClose, resident }) => {
  const { updateResident, staff } = useApp();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [roomNumber, setRoomNumber] = useState('');
  const [careCategory, setCareCategory] = useState<CareCategory>('Residential Elderly Care');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [healthStatus, setHealthStatus] = useState<'Excellent' | 'Stable' | 'Requires Monitoring' | 'Critical Attention'>('Stable');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  useEffect(() => {
    if (resident) {
      setFullName(resident.fullName || '');
      setDateOfBirth(resident.dateOfBirth || '');
      setGender(resident.gender || 'Female');
      setRoomNumber(resident.roomNumber || '');
      setCareCategory(resident.careCategory || 'Residential Elderly Care');
      setAssignedStaffId(resident.assignedStaffId || (staff[0]?.id || ''));
      setHealthStatus(resident.healthStatus || 'Stable');
      setMedicalNotes(resident.medicalNotes || '');
      setEmergencyName(resident.emergencyContact?.name || '');
      setEmergencyRelationship(resident.emergencyContact?.relationship || '');
      setEmergencyPhone(resident.emergencyContact?.phone || '');
    }
  }, [resident, staff]);

  if (!isOpen || !resident) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedStaffMember = staff.find(s => s.id === assignedStaffId);

    updateResident(resident.id, {
      fullName,
      dateOfBirth,
      gender,
      roomNumber,
      careCategory,
      assignedStaffId,
      assignedStaffName: assignedStaffMember ? assignedStaffMember.name : resident.assignedStaffName || 'Unassigned',
      healthStatus,
      medicalNotes,
      emergencyContact: {
        name: emergencyName || 'Family Contact',
        relationship: emergencyRelationship || 'Next of Kin',
        phone: emergencyPhone || '+44 7700 900000',
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3.5">
            <img
              src={resident.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
              alt={resident.fullName}
              className="w-14 h-14 rounded-full object-cover border-2 border-amber-500 shadow-md shrink-0 ring-2 ring-amber-100"
            />
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Edit Resident Information</h3>
              <p className="text-xs font-medium text-slate-500">
                Updating profile & care records for <span className="font-bold text-slate-800">{fullName || resident.fullName}</span>
              </p>
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
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Room / Suite</label>
              <input
                type="text"
                required
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Health Status</label>
              <select
                value={healthStatus}
                onChange={e => setHealthStatus(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Stable">Stable</option>
                <option value="Requires Monitoring">Requires Monitoring</option>
                <option value="Critical Attention">Critical Attention</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Care Category</label>
              <select
                value={careCategory}
                onChange={e => setCareCategory(e.target.value as CareCategory)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Residential Elderly Care">Residential Elderly Care</option>
                <option value="Dementia Support">Dementia Support</option>
                <option value="Child Care Services">Child Care Services</option>
                <option value="Daily Living Assistance">Daily Living Assistance</option>
                <option value="Domiciliary Care">Domiciliary Care</option>
                <option value="Student Caregiver">Student Caregiver</option>
                <option value="Vulnerable Adult Support">Vulnerable Adult Support</option>
                <option value="Medication Support">Medication Support</option>
                <option value="Recreational Activities">Recreational Activities</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assigned Care Staff</label>
              <select
                value={assignedStaffId}
                onChange={e => setAssignedStaffId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="">-- Unassigned --</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.position})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-600" />
              <span>Emergency Contact Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelationship}
                  onChange={e => setEmergencyRelationship(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-rose-500" /> Medical & Care Assessment Notes
            </label>
            <textarea
              rows={3}
              value={medicalNotes}
              onChange={e => setMedicalNotes(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              placeholder="Enter special care instructions or updates..."
            />
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
              className="px-5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold shadow-xs transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

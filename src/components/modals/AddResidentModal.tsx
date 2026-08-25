import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CareCategory } from '../../types';
import { X, UserPlus, Upload, Image as ImageIcon, Trash2, Users, ShieldAlert } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';
import { CredentialsData } from './CredentialsCreatedModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: CareCategory;
  onSuccessCredentials?: (creds: CredentialsData) => void;
}

export const AddResidentModal: React.FC<Props> = ({ isOpen, onClose, defaultCategory, onSuccessCredentials }) => {
  const { addResident, staff } = useApp();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1945-06-20');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [roomNumber, setRoomNumber] = useState('Suite 105 - Rosewood');
  const [careCategory, setCareCategory] = useState<CareCategory>(defaultCategory || 'Residential Elderly Care');
  const [assignedStaffId, setAssignedStaffId] = useState(staff[0]?.id || '');
  const [healthStatus, setHealthStatus] = useState<'Excellent' | 'Stable' | 'Requires Monitoring' | 'Critical Attention'>('Stable');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 2 References State
  const [ref1, setRef1] = useState<{ name: string; relationship: string; phone: string; email: string; photoUrl: string | null }>({ name: '', relationship: 'Primary Family Contact / Next of Kin', phone: '', email: '', photoUrl: null });
  const [ref2, setRef2] = useState<{ name: string; relationship: string; phone: string; email: string; photoUrl: string | null }>({ name: '', relationship: 'Secondary Contact / Medical Referee', phone: '', email: '', photoUrl: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file);
      setImagePreview(compressed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const assignedStaffMember = staff.find(s => s.id === assignedStaffId);
    
    try {
      const result = await addResident({
        fullName: fullName.trim(),
        dateOfBirth,
        gender,
        roomNumber,
        careCategory,
        assignedStaffId,
        assignedStaffName: assignedStaffMember ? assignedStaffMember.name : 'Unassigned',
        healthStatus,
        medicalNotes: medicalNotes || 'Initial baseline assessment completed.',
        avatar: imagePreview || undefined,
        emergencyContact: {
          name: ref1.name || 'Family Contact',
          relationship: ref1.relationship || 'Next of Kin',
          phone: ref1.phone || '+234 706 933 2193',
        },
        references: [ref1, ref2]
          .filter(r => r.name.trim() !== '')
          .map(r => ({ ...r, photoUrl: r.photoUrl || undefined })),
        lastActivityUpdate: 'Newly registered into care management portal.',
        vitals: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '36.6 °C',
          weight: '68 kg',
        }
      });

      setFullName('');
      setMedicalNotes('');
      setImagePreview(null);
      setRef1({ name: '', relationship: 'Primary Family Contact / Next of Kin', phone: '', email: '', photoUrl: null });
      setRef2({ name: '', relationship: 'Secondary Contact / Medical Referee', phone: '', email: '', photoUrl: null });
      onClose();

      if (onSuccessCredentials && result?.relativeUser) {
        onSuccessCredentials({
          type: 'Resident Relative',
          accountName: result.relativeUser.name || 'Relative of ' + (result.resident?.fullName || fullName),
          email: result.relativeUser.email,
          setupPasswordUrl: result.setupPasswordUrl,
          emailDispatched: result.emailDispatched,
          extraInfo: `Linked Resident: ${result.resident?.fullName || fullName} (${careCategory})`,
        });
      }
    } catch (err) {
      console.error('Error registering resident:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Register New Resident / Client</h2>
              <p className="text-xs text-slate-400">Add profile to Samanthasappy Home records</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Resident Photo / Image Holder */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2">Resident / Client Photo *</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Resident preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      title="Remove photo"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                    <span className="text-[10px]">No Photo</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload resident photograph or profile picture for medical records (PNG, JPG). Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Margaret Evans"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Care Category *</label>
              <select
                value={careCategory}
                onChange={e => setCareCategory(e.target.value as CareCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Residential Elderly Care">Residential Elderly Care</option>
                <option value="Dementia Support">Dementia Support</option>
                <option value="Child Care Services">Child Care Services</option>
                <option value="Daily Living Assistance">Daily Living Assistance</option>
                <option value="Domiciliary Care">Domiciliary Care</option>
                <option value="Vulnerable Adult Support">Vulnerable Adult Support</option>
                <option value="weekend/short stay care">weekend/short stay care</option>
                <option value="Home assistance">Home assistance</option>
                <option value="Maids">Maids</option>
                <option value="Hospital care">Hospital care</option>
                <option value="Children short stay & dancing club">Children short stay & dancing club</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Room / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Suite 105"
                value={roomNumber}
                onChange={e => setRoomNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Care Staff</label>
              <select
                value={assignedStaffId}
                onChange={e => setAssignedStaffId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                {staff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.position})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Health Status</label>
              <select
                value={healthStatus}
                onChange={e => setHealthStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Stable">Stable</option>
                <option value="Requires Monitoring">Requires Monitoring</option>
                <option value="Critical Attention">Critical Attention</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medical Notes & Special Care Plan</label>
            <textarea
              rows={2}
              placeholder="Allergies, dietary requirements, mobility assistance, medication routines..."
              value={medicalNotes}
              onChange={e => setMedicalNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>

          {/* 2 References / Emergency Contacts */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-sky-800">
              <Users className="w-4 h-4 text-sky-600" /> Family & Medical References (2 Required)
            </h4>

            {/* Reference 1 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-sky-700 block">Reference 1 (Primary Contact / Next of Kin)</span>
              
              {/* Reference 1 Image Holder */}
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {ref1.photoUrl ? (
                    <>
                      <img src={ref1.photoUrl} alt="Ref 1" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setRef1({ ...ref1, photoUrl: null })}
                        className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md border border-sky-200 transition-colors">
                      <Upload className="w-3 h-3 text-sky-600" />
                      <span>{ref1.photoUrl ? 'Change Photo/Doc' : 'Attach Ref Photo / Document'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setRef1(r => ({ ...r, photoUrl: reader.result as string }));
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {ref1.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setRef1({ ...ref1, photoUrl: null })}
                        className="text-[10px] text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Attach referee ID photo, passport, or authorization document image</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Contact Name *"
                  value={ref1.name}
                  onChange={e => setRef1({ ...ref1, name: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Relationship (e.g. Son / Legal Guardian) *"
                  value={ref1.relationship}
                  onChange={e => setRef1({ ...ref1, relationship: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Phone Number *"
                  value={ref1.phone}
                  onChange={e => setRef1({ ...ref1, phone: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={ref1.email}
                  onChange={e => setRef1({ ...ref1, email: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Reference 2 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-sky-700 block">Reference 2 (Secondary Family / Medical Referee)</span>
              
              {/* Reference 2 Image Holder */}
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
                  {ref2.photoUrl ? (
                    <>
                      <img src={ref2.photoUrl} alt="Ref 2" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setRef2({ ...ref2, photoUrl: null })}
                        className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md border border-sky-200 transition-colors">
                      <Upload className="w-3 h-3 text-sky-600" />
                      <span>{ref2.photoUrl ? 'Change Photo/Doc' : 'Attach Ref Photo / Document'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setRef2(r => ({ ...r, photoUrl: reader.result as string }));
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {ref2.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setRef2({ ...ref2, photoUrl: null })}
                        className="text-[10px] text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Attach referee ID photo, passport, or authorization document image</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Referee Name *"
                  value={ref2.name}
                  onChange={e => setRef2({ ...ref2, name: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  required
                  placeholder="Relationship (e.g. Daughter / Social Worker / GP) *"
                  value={ref2.relationship}
                  onChange={e => setRef2({ ...ref2, relationship: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Phone Number *"
                  value={ref2.phone}
                  onChange={e => setRef2({ ...ref2, phone: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={ref2.email}
                  onChange={e => setRef2({ ...ref2, email: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-sm cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving Record...</span>
                </>
              ) : (
                <span>Save Resident Record</span>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

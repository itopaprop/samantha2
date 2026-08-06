import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserCheck, Upload, Image as ImageIcon, Trash2, Users } from 'lucide-react';
import { compressImageFile } from '../../utils/imageCompressor';
import { CredentialsData } from './CredentialsCreatedModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCredentials?: (creds: CredentialsData) => void;
}

export const AddStaffModal: React.FC<Props> = ({ isOpen, onClose, onSuccessCredentials }) => {
  const { addStaff } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('Site Administrator');
  const [shift, setShift] = useState('Morning (07:00 - 15:30)');
  const [qualification, setQualification] = useState('NVQ Level 3 Health & Social Care');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // References state
  const [ref1, setRef1] = useState<{ name: string; relationship: string; phone: string; email: string; photoUrl: string | null }>({ name: '', relationship: '', phone: '', email: '', photoUrl: null });
  const [ref2, setRef2] = useState<{ name: string; relationship: string; phone: string; email: string; photoUrl: string | null }>({ name: '', relationship: '', phone: '', email: '', photoUrl: null });

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressed = await compressImageFile(file);
      setImagePreview(compressed);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedEmail = email.trim() || `${name.toLowerCase().trim().replace(/\s+/g, '.')}@samanthasappy.com`;

    const result = addStaff({
      name: name.trim(),
      email: formattedEmail,
      phone: phone.trim() || '+234 706 933 2193',
      position,
      shift,
      qualification,
      role: 'Staff',
      avatar: imagePreview || undefined,
      references: [ref1, ref2]
        .filter(r => r.name.trim() !== '')
        .map(r => ({ ...r, photoUrl: r.photoUrl || undefined })),
    });

    // Reset and close modal
    setName('');
    setEmail('');
    setPhone('');
    setImagePreview(null);
    setRef1({ name: '', relationship: '', phone: '', email: '', photoUrl: null });
    setRef2({ name: '', relationship: '', phone: '', email: '', photoUrl: null });
    onClose();

    if (onSuccessCredentials && result) {
      onSuccessCredentials({
        type: 'Staff',
        accountName: result.user.name,
        email: result.user.email,
        tempPassword: result.tempPassword,
        extraInfo: `Position: ${position} | Qualification: ${qualification}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
        
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">Register New Staff Member</h2>
              <p className="text-xs text-slate-400">Add caregiver or nurse to organizational roster</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Staff Photo / Image Holder */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2">Staff Profile Photo / Passport ID *</label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Staff preview" className="w-full h-full object-cover" />
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
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
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
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Upload staff passport photograph or badge image (PNG, JPG). Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Hannah Thorne, RN"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="hannah.t@samanthasappyhome.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+44 20 7946 0888"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Position / Title *</label>
              <select
                value={position}
                onChange={e => setPosition(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Site Administrator">Site Administrator</option>
                <option value="Senior Nurse & Care Lead">Senior Nurse & Care Lead</option>
                <option value="Dementia Care Specialist">Dementia Care Specialist</option>
                <option value="Senior Care Assistant">Senior Care Assistant</option>
                <option value="Child Development Educator">Child Development Educator</option>
                <option value="Domiciliary Care Assistant">Domiciliary Care Assistant</option>
                <option value="Healthcare Administrator">Healthcare Administrator</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Default Shift Pattern</label>
              <select
                value={shift}
                onChange={e => setShift(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
              >
                <option value="Morning (07:00 - 15:30)">Morning (07:00 - 15:30)</option>
                <option value="Afternoon (14:30 - 22:30)">Afternoon (14:30 - 22:30)</option>
                <option value="Night (22:00 - 07:30)">Night (22:00 - 07:30)</option>
                <option value="Flexible Visits">Flexible Visits</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifications & Certifications</label>
            <input
              type="text"
              placeholder="BSc Nursing, Care Certificate, First Aid Certified..."
              value={qualification}
              onChange={e => setQualification(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* References Section - 2 References Required */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-teal-800">
              <Users className="w-4 h-4 text-teal-600" /> References (2 Required)
            </h4>

            {/* Reference 1 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-teal-700 block">Reference 1 (Primary Professional / Character Referee)</span>
              
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
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md border border-teal-200 transition-colors">
                      <Upload className="w-3 h-3 text-teal-600" />
                      <span>{ref1.photoUrl ? 'Change Photo/Doc' : 'Attach Ref Photo / Letter ID'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const compressed = await compressImageFile(file);
                            setRef1(r => ({ ...r, photoUrl: compressed }));
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
                  <p className="text-[10px] text-slate-400 mt-0.5">Attach referee passport photo, ID or reference letter image</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Referee Full Name (Optional)"
                  value={ref1.name}
                  onChange={e => setRef1({ ...ref1, name: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="Relationship / Role (e.g. Line Manager)"
                  value={ref1.relationship}
                  onChange={e => setRef1({ ...ref1, relationship: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={ref1.phone}
                  onChange={e => setRef1({ ...ref1, phone: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={ref1.email}
                  onChange={e => setRef1({ ...ref1, email: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Reference 2 */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-bold text-teal-700 block">Reference 2 (Secondary Referee - Optional)</span>
              
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
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-md border border-teal-200 transition-colors">
                      <Upload className="w-3 h-3 text-teal-600" />
                      <span>{ref2.photoUrl ? 'Change Photo/Doc' : 'Attach Ref Photo / Letter ID'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const compressed = await compressImageFile(file);
                            setRef2(r => ({ ...r, photoUrl: compressed }));
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
                  <p className="text-[10px] text-slate-400 mt-0.5">Attach referee passport photo, ID or reference letter image</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Referee Full Name (Optional)"
                  value={ref2.name}
                  onChange={e => setRef2({ ...ref2, name: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="text"
                  placeholder="Relationship / Role (e.g. Academic Supervisor)"
                  value={ref2.relationship}
                  onChange={e => setRef2({ ...ref2, relationship: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={ref2.phone}
                  onChange={e => setRef2({ ...ref2, phone: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={ref2.email}
                  onChange={e => setRef2({ ...ref2, email: e.target.value })}
                  className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
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
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm cursor-pointer"
            >
              Add Staff Member
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

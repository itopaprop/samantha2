import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Send, 
  UserCheck, 
  Heart, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Users, 
  CheckCircle2, 
  FileText,
  Stethoscope,
  HeartHandshake
} from 'lucide-react';

export const ApplyNowModal: React.FC = () => {
  const { isApplyModalOpen, setIsApplyModalOpen, showToast, addStaff, addResident } = useApp();
  const [appType, setAppType] = useState<'caregiver' | 'resident'>('caregiver');
  const [submitted, setSubmitted] = useState(false);

  // Applicant Photo State
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Common & Caregiver Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Caregiver Specific
  const [position, setPosition] = useState('Senior Care Assistant');
  const [experience, setExperience] = useState('3+ Years');
  const [statement, setStatement] = useState('');

  // Resident Specific
  const [sponsorName, setSponsorName] = useState('');
  const [careCategory, setCareCategory] = useState<'Elderly Residential' | 'Dementia Care' | 'Respite Care' | 'Nursing Care'>('Dementia Care');
  const [medicalNotes, setMedicalNotes] = useState('');

  // 2 References State
  const [ref1, setRef1] = useState<{ name: string; relationship: string; phone: string; email: string; photoUrl: string | null }>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    photoUrl: null
  });

  const [ref2, setRef2] = useState<{ name: string; relationship: string; phone: string; email: string; photoUrl: string | null }>({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    photoUrl: null
  });

  if (!isApplyModalOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefPhotoUpload = (refNum: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        if (refNum === 1) setRef1(prev => ({ ...prev, photoUrl: url }));
        else setRef2(prev => ({ ...prev, photoUrl: url }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPosition('Senior Care Assistant');
    setExperience('3+ Years');
    setStatement('');
    setSponsorName('');
    setCareCategory('Dementia Care');
    setMedicalNotes('');
    setPhotoPreview(null);
    setRef1({ name: '', relationship: '', phone: '', email: '', photoUrl: null });
    setRef2({ name: '', relationship: '', phone: '', email: '', photoUrl: null });
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedRefs = [ref1, ref2]
      .filter(r => r.name.trim() !== '')
      .map(r => ({
        name: r.name,
        relationship: r.relationship,
        phone: r.phone,
        email: r.email,
        photoUrl: r.photoUrl || undefined,
      }));

    if (appType === 'caregiver') {
      addStaff({
        name: fullName || 'Caregiver Applicant',
        role: position,
        qualification: `${experience} • NVQ Level 3 Care`,
        phone: phone || '+44 7700 900111',
        email: email || 'applicant@samanthasappy.co.uk',
        shiftPreference: 'Day Shift',
        status: 'Active',
        assignedResidentsCount: 0,
        avatar: photoPreview || undefined,
        references: formattedRefs,
      });
      showToast(`Caregiver application for ${fullName} submitted successfully!`);
    } else {
      addResident({
        name: fullName || 'Resident Applicant',
        age: 78,
        roomNumber: 'Room Pending',
        category: careCategory,
        healthStatus: 'Stable',
        medicalNotes: medicalNotes || 'Resident admission application received via online portal.',
        assignedStaffName: 'Admissions Coordinator',
        avatar: photoPreview || undefined,
        emergencyContact: {
          name: ref1.name || sponsorName || 'Next of Kin',
          relationship: ref1.relationship || 'Sponsor',
          phone: ref1.phone || phone || '+44 7700 900222',
        },
        references: formattedRefs,
        lastActivityUpdate: 'Admission application submitted and undergoing review.',
        vitals: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '36.6 °C',
          oxygenLevel: '98%',
        },
      });
      showToast(`Resident admission application for ${fullName} submitted successfully!`);
    }

    setSubmitted(true);
    setTimeout(() => {
      setIsApplyModalOpen(false);
      resetForm();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-sky-800 via-teal-800 to-sky-900 px-5 sm:px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
              <UserCheck className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Care Portal Application</h2>
              <p className="text-xs text-sky-100/90 font-medium">Apply as a Caregiver or Request Resident Admission</p>
            </div>
          </div>
          <button 
            onClick={() => { setIsApplyModalOpen(false); resetForm(); }}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold text-slate-900">Application Submitted!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-slate-900">{fullName}</span>. Your {appType === 'caregiver' ? 'caregiver job application' : 'resident care admission request'} has been safely logged with attached references.
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
                  Ref Code: #{Math.floor(100000 + Math.random() * 900000)}
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Toggle Category */}
              <div className="p-1.5 bg-slate-100/90 rounded-2xl flex items-center gap-2 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setAppType('caregiver')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    appType === 'caregiver'
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Caregiver / Staff Job Application</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppType('resident')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    appType === 'resident'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Resident Care Admission</span>
                </button>
              </div>

              {/* Photo Upload Section */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {appType === 'caregiver' ? 'Caregiver Applicant Photo *' : 'Resident Photograph / ID *'}
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden shrink-0 relative group">
                    {photoPreview ? (
                      <>
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
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
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Attach Photograph</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {photoPreview && (
                        <button
                          type="button"
                          onClick={() => setPhotoPreview(null)}
                          className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Upload recent passport photograph or ID photo (PNG, JPG). Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields: Caregiver vs Resident */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {appType === 'caregiver' ? 'Full Name *' : 'Resident Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={appType === 'caregiver' ? 'e.g. Sarah Jenkins' : 'e.g. Margaret Thompson'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {appType === 'caregiver' ? 'Email Address *' : 'Sponsor / Contact Email *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contact@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+44 7700 900123"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                {appType === 'caregiver' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Position Applied For *</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="Senior Care Assistant">Senior Care Assistant</option>
                      <option value="Registered General Nurse (RGN)">Registered General Nurse (RGN)</option>
                      <option value="Night Care Specialist">Night Care Specialist</option>
                      <option value="Dementia Care Specialist">Dementia Care Specialist</option>
                      <option value="Activities & Wellbeing Lead">Activities & Wellbeing Lead</option>
                      <option value="Healthcare Support Worker">Healthcare Support Worker</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Next of Kin / Sponsor Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Robert Thompson (Son)"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                )}
              </div>

              {appType === 'caregiver' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience & Qualifications Summary</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly state your relevant care experience, certifications (NVQ, DBS, First Aid) and availability..."
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                  ></textarea>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Care Category *</label>
                    <select
                      value={careCategory}
                      onChange={(e) => setCareCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 bg-white"
                    >
                      <option value="Dementia Care">Dementia & Memory Care</option>
                      <option value="Elderly Residential">Elderly Residential Care</option>
                      <option value="Nursing Care">24/7 Nursing & Rehabilitation</option>
                      <option value="Respite Care">Respite & Short-Stay Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Medical / Mobility Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Wheelchair assistance, dietary requirements..."
                      value={medicalNotes}
                      onChange={(e) => setMedicalNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* 2 Required References Section with Photo/Document Holders */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-sky-800">
                  <Users className="w-4 h-4 text-sky-600" /> 2 Required References & Attached Documents
                </h4>

                {/* Reference 1 */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-sky-700 block">
                    {appType === 'caregiver' ? 'Reference 1 (Primary Line Manager / Employer)' : 'Reference 1 (Primary Next of Kin / Medical Referee)'}
                  </span>

                  {/* Ref 1 Image Holder */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {ref1.photoUrl ? (
                        <>
                          <img src={ref1.photoUrl} alt="Ref 1" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setRef1({ ...ref1, photoUrl: null })}
                            className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Remove document"
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
                            onChange={(e) => handleRefPhotoUpload(1, e)}
                            className="hidden"
                          />
                        </label>
                        {ref1.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setRef1({ ...ref1, photoUrl: null })}
                            className="text-[10px] text-red-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Attach referee ID photo, passport, or reference document image</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Referee Name *"
                      value={ref1.name}
                      onChange={e => setRef1({ ...ref1, name: e.target.value })}
                      className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-sky-500"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Relationship / Role *"
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
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-[11px] font-bold text-sky-700 block">
                    {appType === 'caregiver' ? 'Reference 2 (Secondary Employer / Academic Referee)' : 'Reference 2 (Secondary Family / GP Referee)'}
                  </span>

                  {/* Ref 2 Image Holder */}
                  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200/80">
                    <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
                      {ref2.photoUrl ? (
                        <>
                          <img src={ref2.photoUrl} alt="Ref 2" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setRef2({ ...ref2, photoUrl: null })}
                            className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Remove document"
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
                            onChange={(e) => handleRefPhotoUpload(2, e)}
                            className="hidden"
                          />
                        </label>
                        {ref2.photoUrl && (
                          <button
                            type="button"
                            onClick={() => setRef2({ ...ref2, photoUrl: null })}
                            className="text-[10px] text-red-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Attach referee ID photo, passport, or reference document image</p>
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
                      placeholder="Relationship / Role *"
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

              {/* Submit Controls */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsApplyModalOpen(false); resetForm(); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-sky-700 hover:bg-sky-800 text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{appType === 'caregiver' ? 'Submit Caregiver Application' : 'Submit Resident Care Application'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};

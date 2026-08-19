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
  HeartHandshake,
  Building2,
  Copy,
  Check,
  MessageCircle
} from 'lucide-react';

export const ApplyNowModal: React.FC = () => {
  const { isApplyModalOpen, setIsApplyModalOpen, showToast, submitApplication } = useApp();
  const [appType, setAppType] = useState<'caregiver' | 'resident'>('caregiver');
  const [submitted, setSubmitted] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState<number | null>(null);

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

  const handleCopyAccount = (accNum: string, accIdx: number) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAcc(accIdx);
    showToast(`Account number ${accNum} copied to clipboard!`);
    setTimeout(() => setCopiedAcc(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    await submitApplication({
      type: appType,
      fullName: fullName || (appType === 'caregiver' ? 'Caregiver Applicant' : 'Resident Applicant'),
      email: email || 'applicant@samanthasappy.com',
      phone: phone || '+234 706 933 2193',
      photoUrl: photoPreview || undefined,
      positionOrCategory: appType === 'caregiver' ? position : careCategory,
      notesOrStatement: appType === 'caregiver' ? `${experience} • ${statement}` : medicalNotes,
      sponsorName: appType === 'resident' ? sponsorName : undefined,
      references: formattedRefs,
    });

    setSubmitted(true);
    if (appType === 'caregiver') {
      setTimeout(() => {
        setIsApplyModalOpen(false);
        resetForm();
      }, 3000);
    }
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
              <h2 className="text-base sm:text-lg font-bold text-white">
                {submitted && appType === 'resident' ? 'Resident Care Payment Details' : 'Care Portal Application'}
              </h2>
              <p className="text-xs text-sky-100/90 font-medium">
                {submitted && appType === 'resident' ? 'Official Samanthasappy Bank Accounts' : 'Apply as a Caregiver or Request Resident Admission'}
              </p>
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
            <div className="py-4 space-y-5">
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-extrabold text-slate-900">
                  {appType === 'resident' ? 'Resident Care Application Submitted Successfully!' : 'Caregiver Application Submitted!'}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, <span className="font-semibold text-slate-900">{fullName}</span>. Your {appType === 'caregiver' ? 'caregiver job application' : 'resident care admission request'} has been safely logged with our admin team.
                </p>
              </div>

              {/* Samanthasappy Account Details Popup Card */}
              {appType === 'resident' && (
                <div className="bg-gradient-to-br from-slate-50 to-sky-50/50 rounded-2xl p-5 border border-sky-100 space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-sky-200/60">
                    <div className="w-8 h-8 rounded-lg bg-sky-700 text-white flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Samanthasappy Bank Account Details</h4>
                      <p className="text-[11px] text-slate-500">Official accounts for resident care registration & admission fees</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Account 1 */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 relative hover:border-sky-300 transition-colors">
                      <div className="text-xs font-extrabold text-sky-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Stanbic IBTC</span>
                        <span className="text-[10px] px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full font-bold">Account 1</span>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium">Account Name</div>
                        <div className="text-xs font-bold text-slate-900">SAMANTHASAPP WORLD CONCEPT</div>
                      </div>
                      <div className="pt-1 flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Account No</div>
                          <div className="text-base font-extrabold text-slate-900 tracking-wider font-mono">0005392596</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('0005392596', 1)}
                          className="px-2.5 py-1 text-xs bg-sky-700 hover:bg-sky-800 text-white rounded-lg flex items-center gap-1 font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          {copiedAcc === 1 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAcc === 1 ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Account 2 */}
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 relative hover:border-teal-300 transition-colors">
                      <div className="text-xs font-extrabold text-teal-800 uppercase tracking-wider flex items-center justify-between">
                        <span>WEMA BANK</span>
                        <span className="text-[10px] px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-bold">Account 2</span>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium">Account Name</div>
                        <div className="text-xs font-bold text-slate-900">SAMANTHASAPP WORLD CONCEPT</div>
                      </div>
                      <div className="pt-1 flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">Account No</div>
                          <div className="text-base font-extrabold text-slate-900 tracking-wider font-mono">0229796137</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyAccount('0229796137', 2)}
                          className="px-2.5 py-1 text-xs bg-teal-700 hover:bg-teal-800 text-white rounded-lg flex items-center gap-1 font-bold transition-all cursor-pointer shadow-2xs"
                        >
                          {copiedAcc === 2 ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAcc === 2 ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Written below account details */}
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <p className="text-xs font-bold text-emerald-900 capitalize tracking-tight">
                        send reciept via whatsapp after payment
                      </p>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Send proof of payment directly to our lead care administrator via WhatsApp for instant payment verification (+234 706 933 2193)
                      </p>
                    </div>

                    <a
                      href="https://wa.me/2347069332193?text=Hello%20Samanthasappy%20Care%20Home,%20I%20have%20submitted%20a%20Resident%20Care%20Application%20and%20completed%20the%20payment.%20Here%20is%20my%20payment%20receipt."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Receipt via WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsApplyModalOpen(false); resetForm(); }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Done & Close
                </button>
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

import React from 'react';
import {
  User,
  GraduationCap,
  Briefcase,
  FolderUp,
  Users,
  Upload,
  Paperclip,
  Image as ImageIcon,
  Trash2,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import { ApplicationDocument } from '../../types';

export interface CareerRefFormState {
  name: string;
  relationship: string;
  organisation: string;
  phone: string;
  email: string;
  photoUrl: string | null;
}

export interface CareerFormState {
  position: string;
  // SECTION 1 – Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  residentialAddress: string;
  cityState: string;
  nationality: string;
  // SECTION 2 – Educational Background
  highestQualification: string;
  institutionName: string;
  courseOfStudy: string;
  graduationYear: string;
  professionalQualifications: string;
  relevantCertifications: string;
  // SECTION 3 – Work Experience
  hasPreviousCareExperience: 'Yes' | 'No';
  previousEmployer: string;
  previousJobTitle: string;
  yearsOfExperience: string;
  previousResponsibilities: string;
  reasonForLeaving: string;
  coverLetter: string;
  // SECTION 4 – Document Uploads
  passportPhoto: ApplicationDocument | null;
  cv: ApplicationDocument | null;
  educationalCertificates: ApplicationDocument | null;
  professionalCertificates: ApplicationDocument | null;
  trainingCertificates: ApplicationDocument | null;
  validId: ApplicationDocument | null;
  // SECTION 5 – References
  ref1: CareerRefFormState;
  ref2: CareerRefFormState;
}

export const createInitialCareerFormState = (defaultPosition = 'Senior Care Assistant'): CareerFormState => ({
  position: defaultPosition,
  fullName: '',
  dateOfBirth: '',
  gender: '',
  phone: '',
  whatsappNumber: '',
  email: '',
  residentialAddress: '',
  cityState: '',
  nationality: '',
  highestQualification: '',
  institutionName: '',
  courseOfStudy: '',
  graduationYear: '',
  professionalQualifications: '',
  relevantCertifications: '',
  hasPreviousCareExperience: 'Yes',
  previousEmployer: '',
  previousJobTitle: '',
  yearsOfExperience: '',
  previousResponsibilities: '',
  reasonForLeaving: '',
  coverLetter: '',
  passportPhoto: null,
  cv: null,
  educationalCertificates: null,
  professionalCertificates: null,
  trainingCertificates: null,
  validId: null,
  ref1: { name: '', relationship: '', organisation: '', phone: '', email: '', photoUrl: null },
  ref2: { name: '', relationship: '', organisation: '', phone: '', email: '', photoUrl: null },
});

interface CareerApplicationFieldsProps {
  form: CareerFormState;
  setForm: React.Dispatch<React.SetStateAction<CareerFormState>>;
  positionOptions: string[];
  compact?: boolean;
  onFileError?: (msg: string) => void;
}

export const CareerApplicationFields: React.FC<CareerApplicationFieldsProps> = ({
  form,
  setForm,
  positionOptions,
  compact = false,
  onFileError,
}) => {
  const inputCls =
    'w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500';
  const labelCls = 'block text-xs font-semibold text-slate-700 mb-1';
  const cardCls = compact
    ? 'p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3.5'
    : 'p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-4';

  const handleDocUpload = (
    field:
      | 'passportPhoto'
      | 'cv'
      | 'educationalCertificates'
      | 'professionalCertificates'
      | 'trainingCertificates'
      | 'validId',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      onFileError?.(`"${file.name}" exceeds the 10MB limit. Please choose a smaller file.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const docObj: ApplicationDocument = {
        name: file.name,
        url: reader.result as string,
        mimeType: file.type,
        size: file.size,
      };
      setForm(prev => ({ ...prev, [field]: docObj }));
    };
    reader.readAsDataURL(file);
  };

  const handleRefImageUpload = (
    refKey: 'ref1' | 'ref2',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      onFileError?.(`"${file.name}" exceeds the 10MB limit.`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({
        ...prev,
        [refKey]: { ...prev[refKey], photoUrl: reader.result as string },
      }));
    };
    reader.readAsDataURL(file);
  };

  const renderDocSlot = (
    field:
      | 'cv'
      | 'educationalCertificates'
      | 'professionalCertificates'
      | 'trainingCertificates'
      | 'validId',
    label: string,
    accept: string,
    helperText: string,
    required?: boolean
  ) => {
    const doc = form[field];
    return (
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <label className="block text-xs font-bold text-slate-800">
              {label} {required ? <span className="text-rose-600">*</span> : null}
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">{helperText}</p>
          </div>
          {doc && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
              <CheckCircle2 className="w-3 h-3" /> Attached
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200 transition-colors">
            <Paperclip className="w-3.5 h-3.5 text-sky-700" />
            <span className="truncate max-w-[210px] sm:max-w-[280px]">
              {doc ? doc.name : 'Choose File to Attach'}
            </span>
            <input
              type="file"
              accept={accept}
              onChange={(e) => handleDocUpload(field, e)}
              className="hidden"
            />
          </label>

          {doc && (
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, [field]: null }))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderReferenceCard = (
    refKey: 'ref1' | 'ref2',
    title: string,
    rolePlaceholder: string,
    required: boolean
  ) => {
    const refData = form[refKey];
    return (
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold text-sky-800 block">{title}</span>

        {/* Optional Referee Photo / Letter ID */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200/80">
          <div className="w-12 h-12 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden shrink-0 relative group">
            {refData.photoUrl ? (
              <>
                <img src={refData.photoUrl} alt={title} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({ ...prev, [refKey]: { ...prev[refKey], photoUrl: null } }))
                  }
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
            <div className="flex items-center gap-2 flex-wrap">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-md border border-sky-200 transition-colors">
                <Upload className="w-3 h-3 text-sky-600" />
                <span>{refData.photoUrl ? 'Change Photo/Doc' : 'Attach Ref Photo / Letter ID'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleRefImageUpload(refKey, e)}
                  className="hidden"
                />
              </label>
              {refData.photoUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({ ...prev, [refKey]: { ...prev[refKey], photoUrl: null } }))
                  }
                  className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Optional: Attach referee ID photo, passport copy or reference letter image
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              Referee&apos;s Full Name {required ? '*' : ''}
            </label>
            <input
              type="text"
              required={required}
              placeholder="e.g. Dr. Margaret Adeyemi"
              value={refData.name}
              onChange={(e) =>
                setForm(prev => ({ ...prev, [refKey]: { ...prev[refKey], name: e.target.value } }))
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Relationship to Applicant {required ? '*' : ''}
            </label>
            <input
              type="text"
              required={required}
              placeholder={rolePlaceholder}
              value={refData.relationship}
              onChange={(e) =>
                setForm(prev => ({
                  ...prev,
                  [refKey]: { ...prev[refKey], relationship: e.target.value },
                }))
              }
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>
              Organisation {required ? '*' : ''}
            </label>
            <input
              type="text"
              required={required}
              placeholder="e.g. St. Nicholas Hospital / CarePlus Home"
              value={refData.organisation}
              onChange={(e) =>
                setForm(prev => ({
                  ...prev,
                  [refKey]: { ...prev[refKey], organisation: e.target.value },
                }))
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Phone Number {required ? '*' : ''}
            </label>
            <input
              type="tel"
              required={required}
              placeholder="+234 800 000 0000"
              value={refData.phone}
              onChange={(e) =>
                setForm(prev => ({ ...prev, [refKey]: { ...prev[refKey], phone: e.target.value } }))
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              placeholder="referee@organisation.com"
              value={refData.email}
              onChange={(e) =>
                setForm(prev => ({ ...prev, [refKey]: { ...prev[refKey], email: e.target.value } }))
              }
              className={inputCls}
            />
          </div>
        </div>
      </div>
    );
  };

  const uniquePositions = Array.from(new Set([form.position, ...positionOptions].filter(Boolean)));

  return (
    <div className="space-y-5">
      {/* Position Applied For */}
      <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200/80">
        <label className="block text-xs font-bold text-sky-900 mb-1.5">
          Position / Role Applied For *
        </label>
        <select
          required
          value={form.position}
          onChange={(e) => setForm(prev => ({ ...prev, position: e.target.value }))}
          className={inputCls}
        >
          {uniquePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 1 – Personal Information */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              SECTION 1 – Personal Information
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className={labelCls}>Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Eleanor Davis"
              value={form.fullName}
              onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Date of Birth *</label>
            <input
              type="date"
              required
              value={form.dateOfBirth}
              onChange={(e) => setForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Gender <span className="text-slate-400 font-normal">(optional, if needed for lawful recruitment purposes)</span>
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm(prev => ({ ...prev, gender: e.target.value }))}
              className={inputCls}
            >
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="+234 706 933 2193"
              value={form.phone}
              onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>WhatsApp Number</label>
            <input
              type="tel"
              placeholder="+234 706 933 2193"
              value={form.whatsappNumber}
              onChange={(e) => setForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Email Address *</label>
            <input
              type="email"
              required
              placeholder="eleanor@example.com"
              value={form.email}
              onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Residential Address *</label>
            <input
              type="text"
              required
              placeholder="House number, street name, area"
              value={form.residentialAddress}
              onChange={(e) => setForm(prev => ({ ...prev, residentialAddress: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>City / State *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ikeja, Lagos State"
              value={form.cityState}
              onChange={(e) => setForm(prev => ({ ...prev, cityState: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>
              Nationality <span className="text-slate-400 font-normal">(if relevant to employment eligibility)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Nigerian"
              value={form.nationality}
              onChange={(e) => setForm(prev => ({ ...prev, nationality: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2 – Educational Background */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              SECTION 2 – Educational Background
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={labelCls}>Highest Educational Qualification *</label>
            <select
              required
              value={form.highestQualification}
              onChange={(e) => setForm(prev => ({ ...prev, highestQualification: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select qualification...</option>
              <option value="SSCE / WAEC / O-Level">SSCE / WAEC / O-Level</option>
              <option value="OND / NCE">OND / NCE</option>
              <option value="HND">HND</option>
              <option value="RN / RM Nursing Diploma">RN / RM Nursing Diploma</option>
              <option value="B.Sc / B.NSc / B.A">B.Sc / B.NSc / B.A</option>
              <option value="M.Sc / Postgraduate Diploma">M.Sc / Postgraduate Diploma</option>
              <option value="NVQ Level 2 / 3 Health & Social Care">NVQ Level 2 / 3 Health & Social Care</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Name of Institution *</label>
            <input
              type="text"
              required
              placeholder="e.g. University of Lagos / School of Nursing"
              value={form.institutionName}
              onChange={(e) => setForm(prev => ({ ...prev, institutionName: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Course of Study *</label>
            <input
              type="text"
              required
              placeholder="e.g. Nursing Science / Health & Social Care"
              value={form.courseOfStudy}
              onChange={(e) => setForm(prev => ({ ...prev, courseOfStudy: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Year of Graduation *</label>
            <input
              type="text"
              required
              placeholder="e.g. 2021"
              value={form.graduationYear}
              onChange={(e) => setForm(prev => ({ ...prev, graduationYear: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Professional Qualifications</label>
            <input
              type="text"
              placeholder="e.g. Registered Nurse (RN), Healthcare Assistant Diploma, Care Certificate"
              value={form.professionalQualifications}
              onChange={(e) =>
                setForm(prev => ({ ...prev, professionalQualifications: e.target.value }))
              }
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Relevant Certifications</label>
            <input
              type="text"
              placeholder="e.g. Basic Life Support (BLS), First Aid, Dementia Care, Safeguarding, Medication Administration"
              value={form.relevantCertifications}
              onChange={(e) =>
                setForm(prev => ({ ...prev, relevantCertifications: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* SECTION 3 – Work Experience */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              SECTION 3 – Work Experience
            </h3>
          </div>
        </div>

        <div className="space-y-3.5">
          <div>
            <label className={labelCls}>
              Do you have previous caregiving or healthcare experience? *
            </label>
            <div className="grid grid-cols-2 gap-2.5 max-w-xs pt-0.5">
              {(['Yes', 'No'] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() =>
                    setForm(prev => ({ ...prev, hasPreviousCareExperience: choice }))
                  }
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    form.hasPreviousCareExperience === choice
                      ? 'bg-sky-700 text-white border-sky-700 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className={labelCls}>
                Previous Employer {form.hasPreviousCareExperience === 'Yes' ? '*' : '(optional)'}
              </label>
              <input
                type="text"
                required={form.hasPreviousCareExperience === 'Yes'}
                placeholder={
                  form.hasPreviousCareExperience === 'Yes'
                    ? 'e.g. Sunrise Elderly Care Home'
                    : 'Optional / N/A if no previous employer'
                }
                value={form.previousEmployer}
                onChange={(e) => setForm(prev => ({ ...prev, previousEmployer: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Job Title {form.hasPreviousCareExperience === 'Yes' ? '*' : '(optional)'}
              </label>
              <input
                type="text"
                required={form.hasPreviousCareExperience === 'Yes'}
                placeholder={
                  form.hasPreviousCareExperience === 'Yes'
                    ? 'e.g. Senior Care Assistant'
                    : 'Optional / N/A'
                }
                value={form.previousJobTitle}
                onChange={(e) => setForm(prev => ({ ...prev, previousJobTitle: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Years of Experience {form.hasPreviousCareExperience === 'Yes' ? '*' : '(optional)'}
              </label>
              <input
                type="text"
                required={form.hasPreviousCareExperience === 'Yes'}
                placeholder="e.g. 3 years"
                value={form.yearsOfExperience}
                onChange={(e) => setForm(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Reason for Leaving Previous Employment</label>
              <input
                type="text"
                placeholder="e.g. Career progression / Relocation"
                value={form.reasonForLeaving}
                onChange={(e) => setForm(prev => ({ ...prev, reasonForLeaving: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>
                Previous Responsibilities {form.hasPreviousCareExperience === 'Yes' ? '*' : '(optional)'}
              </label>
              <textarea
                rows={2}
                required={form.hasPreviousCareExperience === 'Yes'}
                placeholder="Describe key duties (e.g. personal care, medication assistance, vitals monitoring, dementia support)..."
                value={form.previousResponsibilities}
                onChange={(e) =>
                  setForm(prev => ({ ...prev, previousResponsibilities: e.target.value }))
                }
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Cover Letter &amp; Care Motivation (Optional)</label>
              <textarea
                rows={2}
                placeholder="Share why you are passionate about joining Samanthasappy Home..."
                value={form.coverLetter}
                onChange={(e) => setForm(prev => ({ ...prev, coverLetter: e.target.value }))}
                className={inputCls}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4 – Document Uploads */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <FolderUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              SECTION 4 – Document Uploads
            </h3>
          </div>
        </div>

        {/* Recent passport photograph with live thumbnail preview */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <label className="block text-xs font-bold text-slate-800 mb-2">
            Recent Passport Photograph <span className="text-rose-600">*</span>
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden shrink-0 relative group">
              {form.passportPhoto?.url ? (
                <>
                  <img
                    src={form.passportPhoto.url}
                    alt="Applicant passport preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, passportPhoto: null }))}
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

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{form.passportPhoto ? 'Change Passport Photo' : 'Upload Passport Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDocUpload('passportPhoto', e)}
                    className="hidden"
                  />
                </label>
                {form.passportPhoto && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, passportPhoto: null }))}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {form.passportPhoto
                  ? `Selected: ${form.passportPhoto.name}`
                  : 'Upload your recent passport-sized photograph (PNG, JPG). Max 10MB.'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {renderDocSlot(
            'cv',
            'Curriculum Vitae (CV)',
            '.pdf,.doc,.docx',
            'Attach your updated CV / Resume (PDF or Word document)',
            true
          )}

          {renderDocSlot(
            'educationalCertificates',
            'Educational Certificates',
            '.pdf,.doc,.docx,image/*',
            'Academic transcripts, degree, diploma, or SSCE certificates'
          )}

          {renderDocSlot(
            'professionalCertificates',
            'Professional Certificates (where applicable)',
            '.pdf,.doc,.docx,image/*',
            'Nursing license, NVQ Care Diploma, or professional body certificate'
          )}

          {renderDocSlot(
            'trainingCertificates',
            'Relevant Training Certificates',
            '.pdf,.doc,.docx,image/*',
            'First Aid, BLS, Safeguarding, Dementia Care, or Caregiver training'
          )}

          <div className="sm:col-span-2">
            {renderDocSlot(
              'validId',
              'Valid Identification Document (when required at the appropriate recruitment stage)',
              '.pdf,image/*',
              'National ID / NIN Slip, International Passport, or Driver’s Licence (optional now; required at verification stage)'
            )}
          </div>
        </div>
      </div>

      {/* SECTION 5 – References */}
      <div className={cardCls}>
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              SECTION 5 – References
            </h3>
            <p className="text-[11px] text-slate-500">
              Provide 2 professional or character references (Reference 1 required; Reference 2 strongly recommended)
            </p>
          </div>
        </div>

        <div className="space-y-3.5">
          {renderReferenceCard(
            'ref1',
            'Reference 1 (Primary Employer / Line Manager)',
            'e.g. Matron / Former Line Manager',
            true
          )}
          {renderReferenceCard(
            'ref2',
            'Reference 2 (Secondary Employer / Academic / Character Referee)',
            'e.g. Clinical Tutor / Supervisor',
            false
          )}
        </div>
      </div>

      {form.cv && (
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
          <FileCheck className="w-4 h-4 shrink-0" />
          <span>Ready to submit with CV ({form.cv.name}) and application profile.</span>
        </div>
      )}
    </div>
  );
};

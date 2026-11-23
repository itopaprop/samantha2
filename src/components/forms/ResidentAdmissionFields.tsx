import React from 'react';

export const CARE_TYPES_REQUIRED = [
  'Short-term care',
  'Long-term care',
  'Respite care',
  'Rehabilitation / recovery care',
] as const;

export type CareTypeRequiredOption = (typeof CARE_TYPES_REQUIRED)[number];

export const normalizeInternationalWhatsAppNumber = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Strip spaces, dashes, parentheses, dots
  const compact = trimmed.replace(/[\s\-().]/g, '');

  // Reject anything containing non-digit characters (apart from leading +)
  if (!/^\+?\d+$/.test(compact)) return null;

  // Convert leading 00 international prefix to +
  if (compact.startsWith('00')) {
    const intl = `+${compact.slice(2)}`;
    return /^\+[1-9]\d{6,14}$/.test(intl) ? intl : null;
  }

  // Already has + international prefix (E.164: +countryCode + subscriber, 7 to 15 digits)
  if (compact.startsWith('+')) {
    return /^\+[1-9]\d{6,14}$/.test(compact) ? compact : null;
  }

  // Nigerian local mobile format (e.g. 0803..., 0812..., 0706..., 0901..., 0915...) -> +234...
  if (/^0[789][01]\d{8}$/.test(compact)) {
    return `+234${compact.slice(1)}`;
  }

  // International number typed without leading + (e.g. 2348012345678, 447700900123)
  if (/^[1-9]\d{7,14}$/.test(compact)) {
    return `+${compact}`;
  }

  return null;
};

export const isValidInternationalWhatsAppNumber = (raw: string): boolean => {
  return normalizeInternationalWhatsAppNumber(raw) !== null;
};

export interface ResidentAdmissionFormState {
  // Section 1. Resident's Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  residentialAddress: string;
  // Section 2. Care Information
  careTypeRequired: CareTypeRequiredOption | '';
  reasonForAdmission: string;
  existingMedicalConditions: string;
  currentMedications: string;
  specialCareRequirements: string;
  mobilityStatus: string;
  // Section 3. Next of Kin / Emergency Contact
  nextOfKinName: string;
  nextOfKinRelationship: string;
  nextOfKinPhone: string;
  nextOfKinAltPhone: string;
  applicantWhatsApp: string;
  nextOfKinEmail: string;
  // 4. Admission Consent
  consentInfoAccurate: boolean;
  consentContactPermitted: boolean;
  whatsappConsent: boolean;
  applicantGuardianName: string;
  applicantSignature: string;
  consentDate: string;
}

export const createInitialResidentFormState = (): ResidentAdmissionFormState => ({
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  residentialAddress: '',
  careTypeRequired: 'Long-term care',
  reasonForAdmission: '',
  existingMedicalConditions: '',
  currentMedications: '',
  specialCareRequirements: '',
  mobilityStatus: '',
  nextOfKinName: '',
  nextOfKinRelationship: '',
  nextOfKinPhone: '',
  nextOfKinAltPhone: '',
  applicantWhatsApp: '',
  nextOfKinEmail: '',
  consentInfoAccurate: false,
  consentContactPermitted: false,
  whatsappConsent: false,
  applicantGuardianName: '',
  applicantSignature: '',
  consentDate: new Date().toISOString().split('T')[0],
});

interface ResidentAdmissionFieldsProps {
  form: ResidentAdmissionFormState;
  setForm: React.Dispatch<React.SetStateAction<ResidentAdmissionFormState>>;
}

export const ResidentAdmissionFields: React.FC<ResidentAdmissionFieldsProps> = ({
  form,
  setForm,
}) => {
  const inputCls =
    'w-full px-3 py-2 text-xs sm:text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors';
  const labelCls = 'block text-xs font-semibold text-slate-700 mb-1';
  const sectionHeaderCls =
    'text-xs font-extrabold uppercase tracking-[0.08em] text-teal-800 border-b border-slate-200 pb-1.5 mb-3';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
      {/* Clinical Document Sheet Header (Reference: akin.pdf + Heart-Care Medical Emblem + Inpatient Registration Sheet) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0f172a]">
        <div className="flex items-center gap-3.5">
          <img
            src="/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png"
            alt="Samanthasappy Care Home Logo"
            className="w-14 h-14 object-contain shrink-0 rounded-xl bg-white p-1 border border-slate-100 shadow-2xs"
          />
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0f172a] tracking-tight uppercase leading-tight">
              Samanthasappy Care Home
            </h3>
            <p className="text-xs font-bold text-teal-700 uppercase tracking-[0.12em] mt-0.5">
              Resident Care Admission Form
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right text-[11px] text-slate-500 font-medium shrink-0">
          <div className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
            Confidential Clinical Record
          </div>
          <div>Sections 1 &ndash; 4 (Applicant)</div>
        </div>
      </div>

      {/* Section 1. Resident's Personal Information */}
      <section>
        <h4 className={sectionHeaderCls}>
          Section 1. Resident&apos;s Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="sm:col-span-2">
            <label className={labelCls}>Full Name *</label>
            <input
              type="text"
              required
              placeholder="Enter resident's full legal name"
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Date of Birth *</label>
            <input
              type="date"
              required
              value={form.dateOfBirth}
              onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Gender *</label>
            <select
              required
              value={form.gender}
              onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Marital Status *</label>
            <select
              required
              value={form.maritalStatus}
              onChange={(e) => setForm((prev) => ({ ...prev, maritalStatus: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className={labelCls}>Residential Address *</label>
            <textarea
              rows={2}
              required
              placeholder="Full residential address (street, city, state)"
              value={form.residentialAddress}
              onChange={(e) => setForm((prev) => ({ ...prev, residentialAddress: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Section 2. Care Information */}
      <section>
        <h4 className={sectionHeaderCls}>
          Section 2. Care Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={labelCls}>Type of Care Required *</label>
            <select
              required
              value={form.careTypeRequired}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  careTypeRequired: e.target.value as CareTypeRequiredOption,
                }))
              }
              className={inputCls}
            >
              <option value="">Select type of care...</option>
              {CARE_TYPES_REQUIRED.map((careType) => (
                <option key={careType} value={careType}>
                  {careType}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Mobility Status *</label>
            <select
              required
              value={form.mobilityStatus}
              onChange={(e) => setForm((prev) => ({ ...prev, mobilityStatus: e.target.value }))}
              className={inputCls}
            >
              <option value="">Select mobility status...</option>
              <option value="Independent / Ambulatory">Independent / Ambulatory</option>
              <option value="Walks with Assistance (Cane / Walker)">Walks with Assistance (Cane / Walker)</option>
              <option value="Wheelchair Dependent">Wheelchair Dependent</option>
              <option value="Bedbound / Full Lifting Assistance">Bedbound / Full Lifting Assistance</option>
              <option value="Requires Supervision During Transfers">Requires Supervision During Transfers</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Reason for Admission *</label>
            <textarea
              rows={2}
              required
              placeholder="Primary reason for seeking admission to Samanthasappy Care Home..."
              value={form.reasonForAdmission}
              onChange={(e) => setForm((prev) => ({ ...prev, reasonForAdmission: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Existing Medical Conditions</label>
            <textarea
              rows={2}
              placeholder="e.g. Hypertension, Diabetes, Dementia, Arthritis, or None"
              value={form.existingMedicalConditions}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, existingMedicalConditions: e.target.value }))
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Current Medications</label>
            <textarea
              rows={2}
              placeholder="List current prescribed medications and dosages, or None"
              value={form.currentMedications}
              onChange={(e) => setForm((prev) => ({ ...prev, currentMedications: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Special Care Requirements</label>
            <textarea
              rows={2}
              placeholder="Dietary restrictions, allergies, sensory support, physiotherapy, or behavioral notes..."
              value={form.specialCareRequirements}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, specialCareRequirements: e.target.value }))
              }
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* Section 3. Next of Kin / Emergency Contact */}
      <section>
        <h4 className={sectionHeaderCls}>
          Section 3. Next of Kin / Emergency Contact
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className={labelCls}>Next of Kin Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Robert Thompson"
              value={form.nextOfKinName}
              onChange={(e) => setForm((prev) => ({ ...prev, nextOfKinName: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Relationship to Resident *</label>
            <select
              required
              value={form.nextOfKinRelationship}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nextOfKinRelationship: e.target.value }))
              }
              className={inputCls}
            >
              <option value="">Select relationship...</option>
              <option value="Spouse / Partner">Spouse / Partner</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Sibling">Sibling</option>
              <option value="Parent / Guardian">Parent / Guardian</option>
              <option value="Grandchild">Grandchild</option>
              <option value="Extended Family">Extended Family</option>
              <option value="Legal Representative / Friend">Legal Representative / Friend</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="+234 800 000 0000"
              value={form.nextOfKinPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, nextOfKinPhone: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Alternative Phone Number</label>
            <input
              type="tel"
              placeholder="+234 800 000 0000"
              value={form.nextOfKinAltPhone}
              onChange={(e) => setForm((prev) => ({ ...prev, nextOfKinAltPhone: e.target.value }))}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Applicant WhatsApp Number *</label>
            <input
              type="tel"
              inputMode="tel"
              required
              placeholder="+234 800 000 0000"
              value={form.applicantWhatsApp}
              onChange={(e) => setForm((prev) => ({ ...prev, applicantWhatsApp: e.target.value }))}
              className={`${inputCls} ${
                form.applicantWhatsApp.trim() && !isValidInternationalWhatsAppNumber(form.applicantWhatsApp)
                  ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500'
                  : ''
              }`}
            />
            <p className="text-[11px] text-slate-500 mt-1">
              International numbers supported, including Nigeria (+234) e.g. +234 801 234 5678.
            </p>
            {form.applicantWhatsApp.trim() && !isValidInternationalWhatsAppNumber(form.applicantWhatsApp) && (
              <p className="text-[11px] font-semibold text-rose-600 mt-0.5">
                Please enter a valid international WhatsApp number (e.g. +234 801 234 5678 or +44 7700 900123).
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Email Address *</label>
            <input
              type="email"
              required
              placeholder="nextofkin@example.com"
              value={form.nextOfKinEmail}
              onChange={(e) => setForm((prev) => ({ ...prev, nextOfKinEmail: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* 4. Admission Consent */}
      <section>
        <h4 className={sectionHeaderCls}>
          4. Admission Consent
        </h4>

        <div className="space-y-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 mb-4">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.consentInfoAccurate}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, consentInfoAccurate: e.target.checked }))
              }
              className="mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-800">
              I confirm that the information provided is accurate. <span className="text-rose-600">*</span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.consentContactPermitted}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, consentContactPermitted: e.target.checked }))
              }
              className="mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-800">
              I consent to the care home contacting me concerning this admission. <span className="text-rose-600">*</span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={form.whatsappConsent}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, whatsappConsent: e.target.checked }))
              }
              className="mt-0.5 rounded border-slate-300 text-teal-700 focus:ring-teal-600 cursor-pointer"
            />
            <span className="text-xs font-medium text-slate-800">
              I agree to receive WhatsApp notifications from Samanthasappy Care Home concerning this admission application. <span className="text-rose-600">*</span>
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div>
            <label className={labelCls}>Name of Applicant / Guardian *</label>
            <input
              type="text"
              required
              placeholder="Full name of applicant or guardian"
              value={form.applicantGuardianName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, applicantGuardianName: e.target.value }))
              }
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Applicant&apos;s Signature (or typed name) *</label>
            <input
              type="text"
              required
              placeholder="Type full name as signature"
              value={form.applicantSignature}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, applicantSignature: e.target.value }))
              }
              className={`${inputCls} italic font-serif`}
            />
          </div>

          <div>
            <label className={labelCls}>Date *</label>
            <input
              type="date"
              required
              value={form.consentDate}
              onChange={(e) => setForm((prev) => ({ ...prev, consentDate: e.target.value }))}
              className={inputCls}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

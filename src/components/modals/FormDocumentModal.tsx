import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileText,
  Eye,
  Loader2,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  generateResidentAdmissionPdfClient,
  generateCaregiverApplicationPdfClient,
  generateConsultationPdfClient,
  generateInquiryPdfClient,
  triggerBlobDownload,
} from '../../lib/clientPdfGenerator';

export type FormDocumentTarget =
  | { kind: 'application'; data: any }
  | { kind: 'consultation'; data: any }
  | { kind: 'inquiry'; data: any };

interface FormDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: FormDocumentTarget | null;
}

export const FormDocumentModal: React.FC<FormDocumentModalProps> = ({
  isOpen,
  onClose,
  target,
}) => {
  const [viewMode, setViewMode] = useState<'sheet' | 'pdf'>('sheet');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('Submitted_Form.pdf');
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Build in-memory AcroForm PDF Blob whenever target opens
  useEffect(() => {
    if (!isOpen || !target) return;
    let active = true;
    let createdUrl: string | null = null;

    setViewMode('sheet');
    setIsGeneratingPdf(true);
    setPdfBlobUrl(null);
    setPdfBlob(null);

    (async () => {
      try {
        let res;
        if (target.kind === 'application') {
          const isResident =
            target.data?.type === 'resident' ||
            target.data?.formType === 'resident_care_admission';
          res = isResident
            ? await generateResidentAdmissionPdfClient(target.data)
            : await generateCaregiverApplicationPdfClient(target.data);
        } else if (target.kind === 'consultation') {
          res = await generateConsultationPdfClient(target.data);
        } else {
          res = await generateInquiryPdfClient(target.data);
        }

        if (!active) return;
        createdUrl = URL.createObjectURL(res.blob);
        setPdfBlob(res.blob);
        setPdfBlobUrl(createdUrl);
        setPdfFilename(res.filename);
      } catch (err) {
        console.warn('Client PDF generation notice:', err);
      } finally {
        if (active) setIsGeneratingPdf(false);
      }
    })();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const record = target.data || {};
  const isResidentApp =
    target.kind === 'application' &&
    (record.type === 'resident' || record.formType === 'resident_care_admission');
  const isCaregiverApp = target.kind === 'application' && !isResidentApp;
  const isConsultation = target.kind === 'consultation';
  const isRoofing =
    target.kind === 'inquiry' &&
    (record.formType === 'roofing_quote' || record.senderId === 'public_roofing_inquiry');

  const formHeading = isResidentApp
    ? 'Resident Care Admission Form'
    : isCaregiverApp
    ? 'Caregiver / Staff Employment Application'
    : isConsultation
    ? 'Family Consultation Request Sheet'
    : isRoofing
    ? 'Roofing Quote & Site Inspection Request'
    : 'Website Contact Inquiry Record';

  const handleDownloadPdf = async () => {
    if (pdfBlob) {
      triggerBlobDownload(pdfBlob, pdfFilename);
      return;
    }
    setIsGeneratingPdf(true);
    try {
      let res;
      if (target.kind === 'application') {
        res = isResidentApp
          ? await generateResidentAdmissionPdfClient(record)
          : await generateCaregiverApplicationPdfClient(record);
      } else if (target.kind === 'consultation') {
        res = await generateConsultationPdfClient(record);
      } else {
        res = await generateInquiryPdfClient(record);
      }
      triggerBlobDownload(res.blob, res.filename);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrintSheet = () => {
    const esc = (v: unknown) =>
      String(v ?? 'N/A')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const sectionsHtml = buildPrintHtml(target, esc);
    const pw = window.open('', '_blank', 'width=880,height=1000');
    if (!pw) {
      window.print();
      return;
    }
    pw.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${esc(formHeading)} — Samanthasappy Care Home</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 28px; line-height: 1.45; font-size: 12px; }
            .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 18px; }
            .brand { display: flex; align-items: center; gap: 12px; }
            .logo { width: 48px; height: 48px; object-fit: contain; }
            .title { font-size: 17px; font-weight: 800; }
            .sub { font-size: 11px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 0.9px; }
            .sec { font-size: 11px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 16px 0 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 14px; }
            .full { grid-column: 1 / -1; }
            .lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .val { font-size: 12px; font-weight: 600; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; background: #f8fafc; margin-top: 2px; white-space: pre-wrap; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="hdr">
            <div class="brand">
              <img src="${window.location.origin}/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png" class="logo" />
              <div>
                <div class="title">SAMANTHASAPPY CARE HOME</div>
                <div class="sub">${esc(formHeading)}</div>
              </div>
            </div>
            <div style="text-align:right;font-size:11px;">
              <div><strong>Ref ID:</strong> ${esc(record.admissionId || record.id)}</div>
              <div><strong>Submitted:</strong> ${esc(record.createdAt || record.timestamp)}</div>
            </div>
          </div>
          ${sectionsHtml}
          <script>window.onload = function() { setTimeout(function(){ window.print(); }, 250); };</script>
        </body>
      </html>
    `);
    pw.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="bg-[#0f172a] text-white px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png"
              alt="Samanthasappy Care Home"
              className="w-10 h-10 object-contain rounded-lg bg-white p-1 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold truncate">{formHeading}</h2>
              <p className="text-xs text-slate-300 truncate">
                {record.fullName || record.applicantName || record.senderName || 'Submitted Record'} &bull;{' '}
                {record.admissionId || record.id}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Switch between Comfortable Form Sheet & Embedded Fillable PDF */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('sheet')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'sheet' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Form Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'pdf' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live PDF</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrintSheet}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download Editable PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close form viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {viewMode === 'pdf' ? (
          <div className="flex-1 bg-slate-100 flex flex-col min-h-[65vh]">
            {isGeneratingPdf || !pdfBlobUrl ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-slate-600">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-3" />
                <p className="text-sm font-bold">Preparing interactive editable PDF...</p>
              </div>
            ) : (
              <>
                <div className="bg-sky-50 border-b border-sky-200 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900">
                  <span className="font-semibold">
                    Interactive AcroForm PDF Ready &bull; Click any field to fill/edit or print directly from the viewer.
                  </span>
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="font-bold text-teal-700 hover:underline cursor-pointer"
                  >
                    Save Copy ({pdfFilename})
                  </button>
                </div>
                <iframe
                  src={pdfBlobUrl}
                  title={pdfFilename}
                  className="w-full flex-1 min-h-[62vh] border-0 bg-white"
                />
              </>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-7 bg-slate-50 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
              {/* Sheet Branding Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0f172a]">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png"
                    alt="Samanthasappy Care Home Logo"
                    className="w-12 h-12 object-contain rounded-xl border border-slate-200 p-1 bg-white"
                  />
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0f172a] uppercase">
                      Samanthasappy Care Home
                    </h3>
                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      {formHeading}
                    </p>
                  </div>
                </div>
                <div className="text-xs sm:text-right text-slate-600 space-y-0.5">
                  <div className="font-mono font-bold text-sky-700">
                    Ref: {record.admissionId || record.id}
                  </div>
                  <div>Submitted: {record.createdAt || record.timestamp || 'N/A'}</div>
                </div>
              </div>

              {isResidentApp && <ResidentFieldsView data={record} />}
              {isCaregiverApp && <CaregiverFieldsView data={record} />}
              {isConsultation && <ConsultationFieldsView data={record} />}
              {!isResidentApp && !isCaregiverApp && !isConsultation && (
                <InquiryFieldsView data={record} isRoofing={isRoofing} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FieldBox: React.FC<{ label: string; value?: unknown; full?: boolean }> = ({
  label,
  value,
  full,
}) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
      {label}
    </div>
    <div className="text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 whitespace-pre-wrap wrap-break-word">
      {value !== undefined && value !== null && String(value).trim() !== ''
        ? String(value)
        : 'N/A'}
    </div>
  </div>
);

const SectionWrap: React.FC<{
  title: string;
  staffOnly?: boolean;
  children: React.ReactNode;
}> = ({ title, staffOnly, children }) => (
  <div
    className={`rounded-xl border overflow-hidden ${
      staffOnly ? 'border-[#0f172a] bg-slate-50/70' : 'border-slate-200 bg-white'
    }`}
  >
    <div
      className={`px-4 py-2.5 flex items-center justify-between border-b ${
        staffOnly ? 'bg-slate-200/80 border-slate-300' : 'bg-teal-50/80 border-teal-100'
      }`}
    >
      <h4
        className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
          staffOnly ? 'text-[#0f172a]' : 'text-teal-800'
        }`}
      >
        {staffOnly && <ShieldCheck className="w-3.5 h-3.5" />}
        <span>{title}</span>
      </h4>
      {staffOnly && (
        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[#0f172a] text-white">
          Staff Only
        </span>
      )}
    </div>
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">{children}</div>
  </div>
);

const ResidentFieldsView: React.FC<{ data: any }> = ({ data }) => (
  <div className="space-y-4">
    <SectionWrap title="Section 1. Resident's Personal Information">
      <FieldBox label="Full Name" value={data.fullName} />
      <FieldBox label="Date of Birth" value={data.dateOfBirth} />
      <FieldBox label="Gender" value={data.gender} />
      <FieldBox label="Marital Status" value={data.maritalStatus} />
      <FieldBox
        label="Residential Address"
        value={[data.residentialAddress, data.cityState].filter(Boolean).join(', ')}
        full
      />
    </SectionWrap>

    <SectionWrap title="Section 2. Care Information">
      <FieldBox label="Type of Care Required" value={data.careTypeRequired || data.positionOrCategory} />
      <FieldBox label="Mobility Status" value={data.mobilityStatus} />
      <FieldBox label="Reason for Admission" value={data.reasonForAdmission || data.notesOrStatement} full />
      <FieldBox label="Existing Medical Conditions" value={data.existingMedicalConditions} />
      <FieldBox label="Current Medications" value={data.currentMedications} />
      <FieldBox label="Special Care Requirements" value={data.specialCareRequirements} full />
    </SectionWrap>

    <SectionWrap title="Section 3. Next of Kin / Emergency Contact">
      <FieldBox label="Next of Kin Full Name" value={data.nextOfKinName || data.sponsorName} />
      <FieldBox label="Relationship to Resident" value={data.nextOfKinRelationship} />
      <FieldBox label="Phone Number" value={data.nextOfKinPhone || data.phone} />
      <FieldBox label="Alternative Phone Number" value={data.nextOfKinAltPhone} />
      <FieldBox
        label="Applicant WhatsApp Number"
        value={data.applicantWhatsApp || data.whatsappNumber || data.phone}
      />
      <FieldBox label="Email Address" value={data.nextOfKinEmail || data.email} />
    </SectionWrap>

    <SectionWrap title="Section 4. Admission Consent & Attachments">
      <div className="sm:col-span-2 flex flex-wrap gap-4 text-xs font-bold text-slate-800">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className={`w-4 h-4 ${data.consentInfoAccurate ? 'text-teal-600' : 'text-slate-300'}`} />
          Information Confirmed Accurate: {data.consentInfoAccurate ? 'Yes' : 'No'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className={`w-4 h-4 ${data.consentContactPermitted ? 'text-teal-600' : 'text-slate-300'}`} />
          Care Home Contact Consent: {data.consentContactPermitted ? 'Yes' : 'No'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className={`w-4 h-4 ${data.whatsappConsent ? 'text-teal-600' : 'text-slate-300'}`} />
          WhatsApp Notifications Consent: {data.whatsappConsent ? 'Yes' : 'No'}
        </span>
      </div>
      <FieldBox label="Name of Applicant / Guardian" value={data.applicantGuardianName || data.applicantName} />
      <FieldBox label="Applicant's Signature" value={data.applicantSignature} />
      <FieldBox label="Consent Date" value={data.consentDate} />
      <FieldBox label="Payment Receipt" value={data.receiptName || (data.receiptUrl ? 'Attached' : 'Not uploaded')} />
    </SectionWrap>

    <SectionWrap title="Section 5. Administrative Section (Staff Only)" staffOnly>
      <FieldBox label="Admission ID" value={data.admissionId || data.id} />
      <FieldBox label="Admission Date" value={data.admissionDate || 'Not set'} />
      <FieldBox label="Admission Status" value={data.admissionStatus || data.status || 'Pending'} />
      <FieldBox label="Assigned Staff" value={data.assignedStaffName || 'Unassigned'} />
      <FieldBox label="Staff Notes" value={data.staffNotes || 'None'} full />
    </SectionWrap>
  </div>
);

const CaregiverFieldsView: React.FC<{ data: any }> = ({ data }) => {
  const refs = Array.isArray(data.references) ? data.references : [];
  const docs =
    data.documents && typeof data.documents === 'object'
      ? Object.entries<any>(data.documents)
          .filter(([, v]) => v && (v.name || v.url))
          .map(([k, v]) => `${k}: ${v.name || 'Attached'}`)
          .join('\n')
      : data.cvName || 'None';

  return (
    <div className="space-y-4">
      <SectionWrap title="Section 1. Personal Information">
        <FieldBox label="Full Name" value={data.fullName || data.applicantName} />
        <FieldBox label="Position Applied For" value={data.positionOrCategory} />
        <FieldBox label="Date of Birth" value={data.dateOfBirth} />
        <FieldBox label="Gender" value={data.gender} />
        <FieldBox label="Phone Number" value={data.phone} />
        <FieldBox label="WhatsApp Number" value={data.whatsappNumber || data.applicantWhatsApp} />
        <FieldBox label="Email Address" value={data.email} />
        <FieldBox label="Nationality" value={data.nationality} />
        <FieldBox label="City / State" value={data.cityState} />
        <FieldBox label="Residential Address" value={data.residentialAddress} full />
      </SectionWrap>

      <SectionWrap title="Section 2. Educational Background">
        <FieldBox label="Highest Educational Qualification" value={data.highestQualification} />
        <FieldBox label="Name of Institution" value={data.institutionName} />
        <FieldBox label="Course of Study" value={data.courseOfStudy} />
        <FieldBox label="Year of Graduation" value={data.graduationYear} />
        <FieldBox label="Professional Qualifications" value={data.professionalQualifications} full />
        <FieldBox label="Relevant Certifications" value={data.relevantCertifications} full />
      </SectionWrap>

      <SectionWrap title="Section 3. Work Experience">
        <FieldBox label="Previous Caregiving / Healthcare Experience" value={data.hasPreviousCareExperience} />
        <FieldBox label="Years of Experience" value={data.yearsOfExperience} />
        <FieldBox label="Previous Employer" value={data.previousEmployer} />
        <FieldBox label="Job Title" value={data.previousJobTitle} />
        <FieldBox label="Previous Responsibilities" value={data.previousResponsibilities} full />
        <FieldBox label="Reason for Leaving" value={data.reasonForLeaving} full />
        <FieldBox label="Cover Letter / Notes" value={data.notesOrStatement} full />
      </SectionWrap>

      <SectionWrap title="Section 4. Document Uploads">
        <FieldBox label="Uploaded Documents" value={docs} full />
      </SectionWrap>

      <SectionWrap title="Section 5. References">
        {refs.length === 0 ? (
          <FieldBox label="References" value="No references provided" full />
        ) : (
          refs.map((r: any, i: number) => (
            <FieldBox
              key={i}
              label={`Referee ${i + 1}`}
              value={`${r.name || 'N/A'} (${r.relationship || 'Referee'}${r.organisation ? `, ${r.organisation}` : ''}) — ${r.phone || ''} ${r.email ? `| ${r.email}` : ''}`}
              full
            />
          ))
        )}
      </SectionWrap>
    </div>
  );
};

const ConsultationFieldsView: React.FC<{ data: any }> = ({ data }) => (
  <SectionWrap title="Family Consultation Request Details">
    <FieldBox label="Full Name" value={data.fullName} />
    <FieldBox label="Status" value={data.status || 'Pending'} />
    <FieldBox label="Email Address" value={data.email} />
    <FieldBox label="Phone Number" value={data.phone} />
    <FieldBox label="Service of Interest" value={data.serviceInterest} />
    <FieldBox label="Preferred Date" value={data.preferredDate} />
    <FieldBox label="Preferred Time Slot" value={data.preferredTime} />
    <FieldBox label="Additional Care Notes" value={data.notes} full />
  </SectionWrap>
);

const InquiryFieldsView: React.FC<{ data: any; isRoofing: boolean }> = ({ data, isRoofing }) => (
  <SectionWrap title={isRoofing ? 'Roofing Quote Request Details' : 'Website Contact Inquiry Details'}>
    <FieldBox label="Sender Full Name" value={data.fullName || data.senderName} />
    <FieldBox label="Phone / WhatsApp" value={data.phone} />
    <FieldBox label="Email Address" value={data.email} />
    <FieldBox label="Subject" value={data.subject} />
    {isRoofing && (
      <>
        <FieldBox label="Project Location / State" value={data.stateLocation} />
        <FieldBox label="Roof Material" value={data.roofType} />
        <FieldBox label="Project Scope" value={data.projectScope} />
        <FieldBox label="Estimated Size" value={data.estimatedSize} />
      </>
    )}
    <FieldBox label="Message / Specifications" value={data.message || data.content} full />
  </SectionWrap>
);

function buildPrintHtml(target: FormDocumentTarget, esc: (v: unknown) => string): string {
  const d = target.data || {};
  const row = (l: string, v: unknown, full = false) =>
    `<div class="${full ? 'full' : ''}"><div class="lbl">${esc(l)}</div><div class="val">${esc(v || 'N/A')}</div></div>`;

  if (target.kind === 'consultation') {
    return `
      <div class="sec">Family Consultation Details</div>
      <div class="grid">
        ${row('Full Name', d.fullName)}${row('Status', d.status || 'Pending')}
        ${row('Email Address', d.email)}${row('Phone Number', d.phone)}
        ${row('Service of Interest', d.serviceInterest)}${row('Preferred Date', d.preferredDate)}
        ${row('Preferred Time', d.preferredTime)}${row('Notes', d.notes, true)}
      </div>`;
  }
  if (target.kind === 'inquiry') {
    return `
      <div class="sec">Inquiry Details</div>
      <div class="grid">
        ${row('Full Name', d.fullName || d.senderName)}${row('Phone', d.phone)}
        ${row('Email', d.email)}${row('Subject', d.subject)}
        ${d.stateLocation ? row('Location / State', d.stateLocation) : ''}
        ${d.roofType ? row('Roof Material', d.roofType) : ''}
        ${row('Message', d.message || d.content, true)}
      </div>`;
  }
  const isRes = d.type === 'resident' || d.formType === 'resident_care_admission';
  if (isRes) {
    return `
      <div class="sec">Section 1. Resident's Personal Information</div>
      <div class="grid">
        ${row('Full Name', d.fullName)}${row('Date of Birth', d.dateOfBirth)}
        ${row('Gender', d.gender)}${row('Marital Status', d.maritalStatus)}
        ${row('Residential Address', [d.residentialAddress, d.cityState].filter(Boolean).join(', '), true)}
      </div>
      <div class="sec">Section 2. Care Information</div>
      <div class="grid">
        ${row('Type of Care Required', d.careTypeRequired || d.positionOrCategory)}${row('Mobility Status', d.mobilityStatus)}
        ${row('Reason for Admission', d.reasonForAdmission || d.notesOrStatement, true)}
        ${row('Existing Medical Conditions', d.existingMedicalConditions)}${row('Current Medications', d.currentMedications)}
        ${row('Special Care Requirements', d.specialCareRequirements, true)}
      </div>
      <div class="sec">Section 3. Next of Kin / Emergency Contact</div>
      <div class="grid">
        ${row('Next of Kin Full Name', d.nextOfKinName || d.sponsorName)}${row('Relationship', d.nextOfKinRelationship)}
        ${row('Phone Number', d.nextOfKinPhone || d.phone)}${row('Alternative Phone', d.nextOfKinAltPhone)}
        ${row('WhatsApp Number', d.applicantWhatsApp || d.whatsappNumber || d.phone)}${row('Email', d.nextOfKinEmail || d.email)}
      </div>
      <div class="sec">Section 4. Consent</div>
      <div class="grid">
        ${row('Applicant / Guardian', d.applicantGuardianName || d.applicantName)}${row('Signature', d.applicantSignature)}
        ${row('Consent Date', d.consentDate)}${row('WhatsApp Consent', d.whatsappConsent ? 'Yes' : 'No')}
      </div>
      <div class="sec">Section 5. Administrative Section (Staff Only)</div>
      <div class="grid">
        ${row('Admission ID', d.admissionId || d.id)}${row('Admission Status', d.admissionStatus || d.status || 'Pending')}
        ${row('Assigned Staff', d.assignedStaffName)}${row('Staff Notes', d.staffNotes, true)}
      </div>`;
  }
  return `
    <div class="sec">Section 1. Personal Information</div>
    <div class="grid">
      ${row('Full Name', d.fullName || d.applicantName)}${row('Position Applied For', d.positionOrCategory)}
      ${row('Date of Birth', d.dateOfBirth)}${row('Phone', d.phone)}
      ${row('WhatsApp', d.whatsappNumber || d.applicantWhatsApp)}${row('Email', d.email)}
      ${row('Residential Address', d.residentialAddress, true)}
    </div>
    <div class="sec">Section 2. Education & Section 3. Work Experience</div>
    <div class="grid">
      ${row('Highest Qualification', d.highestQualification)}${row('Institution', d.institutionName)}
      ${row('Previous Care Experience', d.hasPreviousCareExperience)}${row('Previous Employer', d.previousEmployer)}
      ${row('Previous Responsibilities', d.previousResponsibilities, true)}
    </div>`;
}

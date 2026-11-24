import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  ShieldCheck,
  Printer,
  CheckCircle2,
  Eye,
  Loader2,
  FileCheck,
  Download,
} from 'lucide-react';
import { ApplicationSubmission, StaffMember } from '../../types';
import {
  generateResidentAdmissionPdfClient,
  triggerBlobDownload,
} from '../../lib/clientPdfGenerator';

interface ResidentAdmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationSubmission | null;
  staff: StaffMember[];
  onSaveAdminSection: (
    applicationId: string,
    updates: Partial<ApplicationSubmission>
  ) => Promise<void>;
  onPreviewImage?: (img: { url: string; title: string }) => void;
}

export const ResidentAdmissionReviewModal: React.FC<ResidentAdmissionReviewModalProps> = ({
  isOpen,
  onClose,
  application,
  staff,
  onSaveAdminSection,
  onPreviewImage,
}) => {
  const [admissionId, setAdmissionId] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [admissionStatus, setAdmissionStatus] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfPreviewBlobUrl, setPdfPreviewBlobUrl] = useState<string | null>(null);
  const [pdfPreviewFilename, setPdfPreviewFilename] = useState<string>('Resident_Care_Admission.pdf');

  useEffect(() => {
    return () => {
      if (pdfPreviewBlobUrl) URL.revokeObjectURL(pdfPreviewBlobUrl);
    };
  }, [pdfPreviewBlobUrl]);

  useEffect(() => {
    if (!application) return;
    const fallbackAdmissionId =
      application.admissionId ||
      `ADM-${new Date().getFullYear()}-${String(application.id || '').slice(0, 4).toUpperCase() || '1001'}`;
    setAdmissionId(fallbackAdmissionId);
    setAdmissionDate(application.admissionDate || '');
    setAdmissionStatus(
      application.admissionStatus ||
        (application.status === 'Approved'
          ? 'Approved'
          : application.status === 'Declined'
          ? 'Rejected'
          : 'Pending')
    );
    setAssignedStaffId(application.assignedStaffId || '');
    setStaffNotes(application.staffNotes || '');
  }, [application]);

  if (!isOpen || !application) return null;

  const selectedStaffMember = staff.find((s) => s.id === assignedStaffId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const mappedOverallStatus: ApplicationSubmission['status'] =
        admissionStatus === 'Approved'
          ? 'Approved'
          : admissionStatus === 'Rejected'
          ? 'Declined'
          : 'Under Review';

      await onSaveAdminSection(application.id, {
        admissionId,
        admissionDate: admissionDate || undefined,
        admissionStatus,
        assignedStaffId: assignedStaffId || undefined,
        assignedStaffName: selectedStaffMember?.name || undefined,
        staffNotes: staffNotes.trim() || undefined,
        status: mappedOverallStatus,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPdfPreview = async () => {
    try {
      setIsGeneratingPdf(true);
      const res = await generateResidentAdmissionPdfClient(application);
      if (pdfPreviewBlobUrl) URL.revokeObjectURL(pdfPreviewBlobUrl);
      const url = URL.createObjectURL(res.blob);
      setPdfPreviewFilename(res.filename);
      setPdfPreviewBlobUrl(url);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      const res = await generateResidentAdmissionPdfClient(application);
      triggerBlobDownload(res.blob, res.filename);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }

    const esc = (v?: string) =>
      String(v || 'N/A')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resident Care Admission Form - ${esc(application.fullName)}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 28px; line-height: 1.45; font-size: 12px; }
            .sheet-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px; }
            .brand-wrap { display: flex; align-items: center; gap: 12px; }
            .logo { width: 52px; height: 52px; object-fit: contain; }
            .care-name { font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; }
            .doc-title { font-size: 12px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 1px; }
            .sec-title { font-size: 11px; font-weight: 800; color: #0f766e; text-transform: uppercase; letter-spacing: 0.9px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin: 16px 0 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 14px; }
            .full { grid-column: 1 / -1; }
            .lbl { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; }
            .val { font-size: 12px; font-weight: 600; color: #0f172a; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; background: #f8fafc; margin-top: 2px; }
            .admin-box { margin-top: 16px; border: 1.5px solid #0f172a; border-radius: 8px; padding: 12px; background: #f8fafc; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="sheet-header">
            <div class="brand-wrap">
              <img src="/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png" class="logo" />
              <div>
                <div class="care-name">Samanthasappy Care Home</div>
                <div class="doc-title">Resident Care Admission Form</div>
              </div>
            </div>
            <div style="text-align: right;">
              <div><strong>Admission ID:</strong> ${esc(admissionId)}</div>
              <div><strong>Status:</strong> ${esc(admissionStatus)}</div>
              <div><strong>Submitted:</strong> ${esc(application.createdAt)}</div>
            </div>
          </div>

          <div class="sec-title">Section 1. Resident's Personal Information</div>
          <div class="grid">
            <div><div class="lbl">Full Name</div><div class="val">${esc(application.fullName)}</div></div>
            <div><div class="lbl">Date of Birth</div><div class="val">${esc(application.dateOfBirth)}</div></div>
            <div><div class="lbl">Gender</div><div class="val">${esc(application.gender)}</div></div>
            <div><div class="lbl">Marital Status</div><div class="val">${esc(application.maritalStatus)}</div></div>
            <div class="full"><div class="lbl">Residential Address</div><div class="val">${esc(application.residentialAddress)}</div></div>
          </div>

          <div class="sec-title">Section 2. Care Information</div>
          <div class="grid">
            <div><div class="lbl">Type of Care Required</div><div class="val">${esc(application.careTypeRequired || application.positionOrCategory)}</div></div>
            <div><div class="lbl">Mobility Status</div><div class="val">${esc(application.mobilityStatus)}</div></div>
            <div class="full"><div class="lbl">Reason for Admission</div><div class="val">${esc(application.reasonForAdmission || application.notesOrStatement)}</div></div>
            <div><div class="lbl">Existing Medical Conditions</div><div class="val">${esc(application.existingMedicalConditions)}</div></div>
            <div><div class="lbl">Current Medications</div><div class="val">${esc(application.currentMedications)}</div></div>
            <div class="full"><div class="lbl">Special Care Requirements</div><div class="val">${esc(application.specialCareRequirements)}</div></div>
          </div>

          <div class="sec-title">Section 3. Next of Kin / Emergency Contact</div>
          <div class="grid">
            <div><div class="lbl">Next of Kin Full Name</div><div class="val">${esc(application.nextOfKinName || application.sponsorName)}</div></div>
            <div><div class="lbl">Relationship to Resident</div><div class="val">${esc(application.nextOfKinRelationship)}</div></div>
            <div><div class="lbl">Phone Number</div><div class="val">${esc(application.nextOfKinPhone || application.phone)}</div></div>
            <div><div class="lbl">Alternative Phone Number</div><div class="val">${esc(application.nextOfKinAltPhone)}</div></div>
            <div class="full"><div class="lbl">Email Address</div><div class="val">${esc(application.nextOfKinEmail || application.email)}</div></div>
          </div>

          <div class="sec-title">4. Admission Consent</div>
          <div class="grid">
            <div><div class="lbl">Name of Applicant / Guardian</div><div class="val">${esc(application.applicantGuardianName)}</div></div>
            <div><div class="lbl">Applicant's Signature</div><div class="val">${esc(application.applicantSignature)}</div></div>
            <div><div class="lbl">Consent Date</div><div class="val">${esc(application.consentDate)}</div></div>
            <div><div class="lbl">Confirmations</div><div class="val">Accurate: ${application.consentInfoAccurate ? 'Yes' : 'No'} | Contact Consent: ${application.consentContactPermitted ? 'Yes' : 'No'}</div></div>
          </div>

          <div class="admin-box">
            <div class="sec-title" style="margin-top: 0;">Section 5. Administrative Section (Staff Only)</div>
            <div class="grid">
              <div><div class="lbl">Admission ID</div><div class="val">${esc(admissionId)}</div></div>
              <div><div class="lbl">Admission Date</div><div class="val">${esc(admissionDate || 'Pending assignment')}</div></div>
              <div><div class="lbl">Admission Status</div><div class="val">${esc(admissionStatus)}</div></div>
              <div><div class="lbl">Assigned Staff</div><div class="val">${esc(selectedStaffMember?.name || application.assignedStaffName || 'Unassigned')}</div></div>
              <div class="full"><div class="lbl">Staff Notes</div><div class="val">${esc(staffNotes || 'None')}</div></div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const statusBadgeCls =
    admissionStatus === 'Approved'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
      : admissionStatus === 'Rejected'
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : 'bg-amber-100 text-amber-800 border-amber-300';

  const fieldBoxCls = 'bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium';
  const fieldLabelCls = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1';
  const secHeaderCls =
    'text-xs font-extrabold uppercase tracking-[0.09em] text-teal-800 border-b border-slate-200 pb-1.5 mb-3';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Action Header */}
        <div className="bg-[#0f172a] text-white px-5 sm:px-6 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold truncate">
                Resident Care Admission Form — Admin Review
              </div>
              <div className="text-[11px] text-slate-300 truncate">
                Admission ID: <span className="font-mono font-bold text-teal-300">{admissionId}</span> &bull; Submitted {application.createdAt}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenPdfPreview}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Preview Editable & Printable PDF Inside Portal"
            >
              {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Preview PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-60 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download Editable AcroForm PDF File"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Form</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6 bg-slate-50/40">
          {pdfPreviewBlobUrl && (
            <div className="bg-white rounded-2xl border-2 border-sky-300 shadow-sm overflow-hidden">
              <div className="bg-sky-50 px-4 py-2.5 border-b border-sky-200 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-sky-900">
                  Interactive Fillable PDF Preview ({pdfPreviewFilename})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Save PDF Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfPreviewBlobUrl(null)}
                    className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
              <iframe
                src={pdfPreviewBlobUrl}
                title={pdfPreviewFilename}
                className="w-full h-[65vh] border-0 bg-slate-100"
              />
            </div>
          )}

          {/* Official Care Home Clinical Sheet Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-6">
            {/* Sheet Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0f172a]">
              <div className="flex items-center gap-3.5">
                <img
                  src="/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png"
                  alt="Samanthasappy Care Home Logo"
                  className="w-14 h-14 object-contain shrink-0 rounded-xl bg-white p-1 border border-slate-100"
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#0f172a] uppercase tracking-tight">
                    Samanthasappy Care Home
                  </h2>
                  <p className="text-xs font-bold text-teal-700 uppercase tracking-[0.12em]">
                    Resident Care Admission Form
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border ${statusBadgeCls}`}>
                  Status: {admissionStatus}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-600">
                  ID: {admissionId}
                </span>
              </div>
            </div>

            {/* Attached Photo & Payment Receipt Strip */}
            {(application.photoUrl || application.receiptUrl) && (
              <div className="flex flex-wrap items-center gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                {application.photoUrl && (
                  <div className="flex items-center gap-3">
                    <img
                      src={application.photoUrl}
                      alt={application.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-300 cursor-pointer"
                      onClick={() =>
                        onPreviewImage?.({
                          url: application.photoUrl!,
                          title: `Resident Photograph: ${application.fullName}`,
                        })
                      }
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Resident Photograph</div>
                      {onPreviewImage && (
                        <button
                          type="button"
                          onClick={() =>
                            onPreviewImage({
                              url: application.photoUrl!,
                              title: `Resident Photograph: ${application.fullName}`,
                            })
                          }
                          className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View Photo
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {application.receiptUrl && (
                  <div className="flex items-center gap-3 pl-0 sm:pl-4 sm:border-l border-slate-200">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center overflow-hidden shrink-0">
                      {application.receiptUrl.startsWith('data:image') ||
                      /\.(png|jpe?g|webp|gif)$/i.test(application.receiptUrl) ? (
                        <img
                          src={application.receiptUrl}
                          alt="Payment Receipt"
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() =>
                            onPreviewImage?.({
                              url: application.receiptUrl!,
                              title: `Payment Receipt: ${application.fullName}`,
                            })
                          }
                        />
                      ) : (
                        <FileCheck className="w-5 h-5 text-emerald-700" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900">Payment Receipt</div>
                      <div className="text-[11px] text-emerald-700">
                        {application.receiptName || 'Attached Proof of Payment'}
                      </div>
                      {onPreviewImage && (
                        <button
                          type="button"
                          onClick={() =>
                            onPreviewImage({
                              url: application.receiptUrl!,
                              title: `Payment Receipt: ${application.fullName}`,
                            })
                          }
                          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" /> View Receipt
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Section 1. Resident's Personal Information */}
            <section>
              <h3 className={secHeaderCls}>Section 1. Resident&apos;s Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <span className={fieldLabelCls}>Full Name</span>
                  <div className={fieldBoxCls}>{application.fullName || 'N/A'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Date of Birth</span>
                  <div className={fieldBoxCls}>{application.dateOfBirth || 'N/A'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Gender</span>
                  <div className={fieldBoxCls}>{application.gender || 'N/A'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Marital Status</span>
                  <div className={fieldBoxCls}>{application.maritalStatus || 'N/A'}</div>
                </div>
                <div className="sm:col-span-3">
                  <span className={fieldLabelCls}>Residential Address</span>
                  <div className={fieldBoxCls}>{application.residentialAddress || 'N/A'}</div>
                </div>
              </div>
            </section>

            {/* Section 2. Care Information */}
            <section>
              <h3 className={secHeaderCls}>Section 2. Care Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className={fieldLabelCls}>Type of Care Required</span>
                  <div className={fieldBoxCls}>
                    {application.careTypeRequired || application.positionOrCategory || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Mobility Status</span>
                  <div className={fieldBoxCls}>{application.mobilityStatus || 'N/A'}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className={fieldLabelCls}>Reason for Admission</span>
                  <div className={fieldBoxCls}>
                    {application.reasonForAdmission || application.notesOrStatement || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Existing Medical Conditions</span>
                  <div className={fieldBoxCls}>{application.existingMedicalConditions || 'None stated'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Current Medications</span>
                  <div className={fieldBoxCls}>{application.currentMedications || 'None stated'}</div>
                </div>
                <div className="sm:col-span-2">
                  <span className={fieldLabelCls}>Special Care Requirements</span>
                  <div className={fieldBoxCls}>{application.specialCareRequirements || 'None stated'}</div>
                </div>
              </div>
            </section>

            {/* Section 3. Next of Kin / Emergency Contact */}
            <section>
              <h3 className={secHeaderCls}>Section 3. Next of Kin / Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className={fieldLabelCls}>Next of Kin Full Name</span>
                  <div className={fieldBoxCls}>
                    {application.nextOfKinName || application.sponsorName || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Relationship to Resident</span>
                  <div className={fieldBoxCls}>{application.nextOfKinRelationship || 'N/A'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Phone Number</span>
                  <div className={fieldBoxCls}>{application.nextOfKinPhone || application.phone || 'N/A'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Alternative Phone Number</span>
                  <div className={fieldBoxCls}>{application.nextOfKinAltPhone || 'N/A'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Applicant WhatsApp Number</span>
                  <div className={fieldBoxCls}>
                    {application.applicantWhatsApp || application.whatsappNumber || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Email Address</span>
                  <div className={fieldBoxCls}>{application.nextOfKinEmail || application.email || 'N/A'}</div>
                </div>
              </div>
            </section>

            {/* 4. Admission Consent */}
            <section>
              <h3 className={secHeaderCls}>4. Admission Consent</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Information accuracy confirmed: {application.consentInfoAccurate ? 'Yes' : 'Not recorded'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Consent to contact confirmed: {application.consentContactPermitted ? 'Yes' : 'Not recorded'}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  WhatsApp notification consent: {application.whatsappConsent === true ? 'Yes (Agreed)' : 'No'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <span className={fieldLabelCls}>Name of Applicant / Guardian</span>
                  <div className={fieldBoxCls}>{application.applicantGuardianName || 'N/A'}</div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Applicant&apos;s Signature</span>
                  <div className={`${fieldBoxCls} italic font-serif`}>
                    {application.applicantSignature || 'N/A'}
                  </div>
                </div>
                <div>
                  <span className={fieldLabelCls}>Date</span>
                  <div className={fieldBoxCls}>{application.consentDate || application.createdAt}</div>
                </div>
              </div>
            </section>

            {/* Section 5. Administrative Section (Staff Only) — Reference: Inpatient Admission Sheet */}
            <form
              onSubmit={handleSave}
              className="mt-4 p-4 sm:p-5 rounded-xl border-2 border-[#0f172a] bg-slate-50 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0f172a]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#0f172a]">
                    Section 5. Administrative Section (Staff Only)
                  </h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0f172a] text-white">
                  Hidden From Applicants
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Admission ID
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={admissionId}
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-800 bg-slate-200/70 border border-slate-300 rounded-lg cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Admission Date
                  </label>
                  <input
                    type="date"
                    value={admissionDate}
                    onChange={(e) => setAdmissionDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Admission Status
                  </label>
                  <select
                    value={admissionStatus}
                    onChange={(e) =>
                      setAdmissionStatus(e.target.value as 'Pending' | 'Approved' | 'Rejected')
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Assigned Staff
                  </label>
                  <select
                    value={assignedStaffId}
                    onChange={(e) => setAssignedStaffId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="">-- Unassigned --</option>
                    {staff.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.position || member.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Staff Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Internal clinical assessment notes, room allocation, onboarding instructions..."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Administrative Section</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

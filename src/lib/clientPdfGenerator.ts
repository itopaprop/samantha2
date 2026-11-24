import {
  PDFBool,
  PDFDocument,
  PDFFont,
  PDFName,
  PDFPage,
  PDFForm,
  StandardFonts,
  rgb,
} from 'pdf-lib';

// ============================================================================
// BROWSER-SIDE INTERACTIVE / EDITABLE / PRINTABLE ACROFORM PDF GENERATOR
// Runs 100% client-side using pdf-lib so viewing, editing, printing, and
// downloading PDFs from Admin Notifications, Inbox, Applications, and Review
// Modals never triggers external URL redirects or 403 auth-bridge errors.
// ============================================================================

const PAGE_WIDTH = 595.28; // A4 portrait width (pt)
const PAGE_HEIGHT = 841.89; // A4 portrait height (pt)
const MARGIN_X = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const BOTTOM_MARGIN = 52;

const NAVY = rgb(0.059, 0.09, 0.165); // #0f172a
const TEAL = rgb(0.059, 0.463, 0.431); // #0f766e
const SKY = rgb(0.012, 0.412, 0.631); // #0369a1
const SLATE = rgb(0.28, 0.33, 0.41); // #475569
const MUTED = rgb(0.45, 0.51, 0.59);
const BORDER = rgb(0.79, 0.83, 0.88);
const FIELD_BG = rgb(0.975, 0.985, 0.995);
const HEADER_BG = rgb(0.94, 0.965, 0.985);
const STAFF_BG = rgb(0.96, 0.97, 0.985);
const WHITE = rgb(1, 1, 1);

function toWinAnsi(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2022/g, '*')
    .replace(/\u20A6/g, 'NGN ')
    .replace(/\r\n/g, '\n')
    .replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g, '');
}

let cachedEmblemBytes: Uint8Array | null | undefined;
async function loadEmblemPng(): Promise<Uint8Array | null> {
  if (cachedEmblemBytes !== undefined) return cachedEmblemBytes;
  try {
    const res = await fetch('/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png');
    if (res.ok) {
      const ab = await res.arrayBuffer();
      cachedEmblemBytes = new Uint8Array(ab);
      return cachedEmblemBytes;
    }
  } catch {
    // Graceful fallback without logo
  }
  cachedEmblemBytes = null;
  return null;
}

class ClientEditableFormBuilder {
  public doc!: PDFDocument;
  public form!: PDFForm;
  public fontRegular!: PDFFont;
  public fontBold!: PDFFont;
  public page!: PDFPage;
  public cursorY = PAGE_HEIGHT - 40;
  private fieldCounter = 0;
  private formTitle = '';
  private refLabel = '';
  private pageIndex = 0;

  async init(formTitle: string, refLabel: string) {
    this.doc = await PDFDocument.create();
    this.doc.setTitle(toWinAnsi(formTitle));
    this.doc.setAuthor('Samanthasappy Care Home');
    this.doc.setSubject('Editable & Printable Submitted Form Record');
    this.doc.setCreator('Samanthasappy Portal PDF Engine');
    this.form = this.doc.getForm();
    this.fontRegular = await this.doc.embedFont(StandardFonts.Helvetica);
    this.fontBold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.formTitle = toWinAnsi(formTitle);
    this.refLabel = toWinAnsi(refLabel);
    await this.addFirstPage();
  }

  private async addFirstPage() {
    this.pageIndex = 1;
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.cursorY = PAGE_HEIGHT - 36;

    const logoBytes = await loadEmblemPng();
    let textStartX = MARGIN_X;

    if (logoBytes) {
      try {
        const pngImage = await this.doc.embedPng(logoBytes);
        const dims = pngImage.scale(1);
        const size = 44;
        const ratio = Math.min(size / dims.width, size / dims.height);
        this.page.drawImage(pngImage, {
          x: MARGIN_X,
          y: this.cursorY - 40,
          width: dims.width * ratio,
          height: dims.height * ratio,
        });
        textStartX = MARGIN_X + 54;
      } catch {
        // Ignore logo embed errors
      }
    }

    this.page.drawText('SAMANTHASAPPY CARE HOME', {
      x: textStartX,
      y: this.cursorY - 12,
      size: 14,
      font: this.fontBold,
      color: NAVY,
    });
    this.page.drawText(this.formTitle, {
      x: textStartX,
      y: this.cursorY - 26,
      size: 10,
      font: this.fontBold,
      color: TEAL,
    });
    this.page.drawText(
      'No5 Ilemo Street, Ijapo Estate, Akure, Ondo State  |  +234 706 933 2193  |  samanthasappy@gmail.com',
      {
        x: textStartX,
        y: this.cursorY - 38,
        size: 7.5,
        font: this.fontRegular,
        color: MUTED,
      }
    );

    if (this.refLabel) {
      const refText = this.refLabel;
      const w = this.fontBold.widthOfTextAtSize(refText, 8);
      this.page.drawText(refText, {
        x: PAGE_WIDTH - MARGIN_X - w,
        y: this.cursorY - 12,
        size: 8,
        font: this.fontBold,
        color: SKY,
      });
    }

    this.cursorY -= 50;
    this.page.drawLine({
      start: { x: MARGIN_X, y: this.cursorY },
      end: { x: PAGE_WIDTH - MARGIN_X, y: this.cursorY },
      thickness: 1.5,
      color: NAVY,
    });

    this.cursorY -= 16;
    this.page.drawRectangle({
      x: MARGIN_X,
      y: this.cursorY - 4,
      width: CONTENT_WIDTH,
      height: 16,
      color: HEADER_BG,
      borderColor: BORDER,
      borderWidth: 0.6,
    });
    this.page.drawText(
      'EDITABLE FORM RECORD: All fields below are interactive PDF inputs. Click any box to edit, print, or save.',
      {
        x: MARGIN_X + 8,
        y: this.cursorY,
        size: 7.5,
        font: this.fontBold,
        color: SKY,
      }
    );
    this.cursorY -= 18;
    this.drawPageFooter();
  }

  private drawPageFooter() {
    this.page.drawLine({
      start: { x: MARGIN_X, y: 34 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: 34 },
      thickness: 0.5,
      color: BORDER,
    });
    this.page.drawText(
      toWinAnsi(
        `Samanthasappy Care Home • Interactive Editable PDF Copy • ${this.refLabel || 'Official Record'}`
      ),
      {
        x: MARGIN_X,
        y: 22,
        size: 7.5,
        font: this.fontRegular,
        color: MUTED,
      }
    );
    const pageTxt = `Page ${this.pageIndex}`;
    const pw = this.fontBold.widthOfTextAtSize(pageTxt, 7.5);
    this.page.drawText(pageTxt, {
      x: PAGE_WIDTH - MARGIN_X - pw,
      y: 22,
      size: 7.5,
      font: this.fontBold,
      color: MUTED,
    });
  }

  ensureSpace(neededHeight: number) {
    if (this.cursorY - neededHeight < BOTTOM_MARGIN) {
      this.pageIndex += 1;
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.cursorY = PAGE_HEIGHT - 44;

      this.page.drawText(toWinAnsi(`SAMANTHASAPPY CARE HOME — ${this.formTitle}`), {
        x: MARGIN_X,
        y: this.cursorY + 8,
        size: 8.5,
        font: this.fontBold,
        color: NAVY,
      });
      if (this.refLabel) {
        const w = this.fontRegular.widthOfTextAtSize(this.refLabel, 8);
        this.page.drawText(this.refLabel, {
          x: PAGE_WIDTH - MARGIN_X - w,
          y: this.cursorY + 8,
          size: 8,
          font: this.fontRegular,
          color: MUTED,
        });
      }
      this.page.drawLine({
        start: { x: MARGIN_X, y: this.cursorY + 2 },
        end: { x: PAGE_WIDTH - MARGIN_X, y: this.cursorY + 2 },
        thickness: 0.8,
        color: BORDER,
      });
      this.cursorY -= 14;
      this.drawPageFooter();
    }
  }

  drawSectionHeader(title: string, badge?: string, staffOnly = false) {
    this.ensureSpace(34);
    this.cursorY -= 6;
    const barColor = staffOnly ? NAVY : TEAL;
    this.page.drawRectangle({
      x: MARGIN_X,
      y: this.cursorY - 14,
      width: CONTENT_WIDTH,
      height: 18,
      color: staffOnly ? STAFF_BG : HEADER_BG,
      borderColor: barColor,
      borderWidth: 0.8,
    });
    this.page.drawText(toWinAnsi(title.toUpperCase()), {
      x: MARGIN_X + 8,
      y: this.cursorY - 9,
      size: 8.5,
      font: this.fontBold,
      color: barColor,
    });
    if (badge) {
      const bText = toWinAnsi(badge.toUpperCase());
      const bw = this.fontBold.widthOfTextAtSize(bText, 7);
      this.page.drawText(bText, {
        x: PAGE_WIDTH - MARGIN_X - bw - 8,
        y: this.cursorY - 8.5,
        size: 7,
        font: this.fontBold,
        color: barColor,
      });
    }
    this.cursorY -= 24;
  }

  private nextFieldName(prefix: string): string {
    this.fieldCounter += 1;
    const clean = prefix.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
    return `${clean}_${this.fieldCounter}`;
  }

  drawTextRow(
    fields: Array<{
      label: string;
      value?: string;
      span?: number;
      multiline?: boolean;
      height?: number;
      readOnly?: boolean;
    }>
  ) {
    const maxFieldH = Math.max(
      ...fields.map((f) => f.height ?? (f.multiline ? 46 : 21))
    );
    const totalNeeded = 12 + maxFieldH + 8;
    this.ensureSpace(totalNeeded);

    const gap = 10;
    const totalSpans = fields.reduce((acc, f) => acc + (f.span || 1), 0);
    const usableW = CONTENT_WIDTH - gap * (fields.length - 1);

    let x = MARGIN_X;
    for (const f of fields) {
      const colW = (usableW * (f.span || 1)) / totalSpans;
      const boxH = f.height ?? (f.multiline ? 46 : 21);

      this.page.drawText(toWinAnsi(f.label).toUpperCase(), {
        x,
        y: this.cursorY - 2,
        size: 7,
        font: this.fontBold,
        color: SLATE,
      });

      const fieldY = this.cursorY - 6 - boxH;
      const tf = this.form.createTextField(this.nextFieldName(f.label));
      if (f.multiline) {
        tf.enableMultiline();
      }
      if (f.readOnly) {
        tf.enableReadOnly();
      }
      tf.setText(toWinAnsi(f.value || ''));
      tf.addToPage(this.page, {
        x,
        y: fieldY,
        width: colW,
        height: boxH,
        textColor: NAVY,
        backgroundColor: f.readOnly ? rgb(0.93, 0.945, 0.96) : FIELD_BG,
        borderColor: BORDER,
        borderWidth: 0.75,
        font: this.fontRegular,
      });
      tf.setFontSize(f.multiline ? 8.5 : 9);

      x += colW + gap;
    }

    this.cursorY -= 6 + maxFieldH + 10;
  }

  drawCheckboxRow(items: Array<{ label: string; checked?: boolean }>) {
    const rowH = 18;
    this.ensureSpace(rowH + 6);
    const colW = CONTENT_WIDTH / items.length;

    items.forEach((item, idx) => {
      const x = MARGIN_X + idx * colW;
      const cb = this.form.createCheckBox(this.nextFieldName(item.label));
      if (item.checked) {
        cb.check();
      }
      cb.addToPage(this.page, {
        x,
        y: this.cursorY - 12,
        width: 11,
        height: 11,
        borderColor: TEAL,
        borderWidth: 1,
        backgroundColor: WHITE,
      });
      this.page.drawText(toWinAnsi(item.label), {
        x: x + 16,
        y: this.cursorY - 10,
        size: 8.5,
        font: this.fontRegular,
        color: NAVY,
      });
    });

    this.cursorY -= 20;
  }

  async toBytes(): Promise<Uint8Array> {
    try {
      this.form.acroForm.dict.set(PDFName.of('NeedAppearances'), PDFBool.True);
    } catch {
      // safe fallback
    }
    try {
      this.form.updateFieldAppearances(this.fontRegular);
    } catch {
      // safe fallback
    }
    return this.doc.save();
  }
}

export interface GeneratedPdfResult {
  bytes: Uint8Array;
  blob: Blob;
  filename: string;
}

export async function generateResidentAdmissionPdfClient(data: any): Promise<GeneratedPdfResult> {
  const admId =
    data.admissionId ||
    `ADM-${new Date().getFullYear()}-${String(data.id || '001').slice(0, 6).toUpperCase()}`;
  const submittedStr = String(data.createdAt || new Date().toISOString().slice(0, 16));
  const builder = new ClientEditableFormBuilder();
  await builder.init('Resident Care Admission Form', `ID: ${admId}`);

  builder.drawTextRow([
    { label: 'Admission Reference ID', value: admId, span: 1 },
    { label: 'Submission Date / Time', value: submittedStr, span: 1 },
    { label: 'Current Status', value: data.admissionStatus || data.status || 'Pending', span: 1 },
  ]);

  builder.drawSectionHeader("Section 1. Resident's Personal Information");
  builder.drawTextRow([
    { label: 'Resident Full Name', value: data.fullName, span: 2 },
    { label: 'Date of Birth', value: data.dateOfBirth, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Gender', value: data.gender, span: 1 },
    { label: 'Marital Status', value: data.maritalStatus, span: 1 },
    { label: 'Nationality', value: data.nationality, span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Residential Address',
      value: [data.residentialAddress, data.cityState].filter(Boolean).join(', '),
      multiline: true,
      height: 36,
    },
  ]);

  builder.drawSectionHeader('Section 2. Care Information');
  builder.drawTextRow([
    {
      label: 'Type of Care Required',
      value: data.careTypeRequired || data.positionOrCategory,
      span: 1,
    },
    { label: 'Mobility Status', value: data.mobilityStatus, span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Reason for Admission',
      value: data.reasonForAdmission || data.notesOrStatement,
      multiline: true,
      height: 44,
    },
  ]);
  builder.drawTextRow([
    {
      label: 'Existing Medical Conditions',
      value: data.existingMedicalConditions || 'None stated',
      multiline: true,
      height: 40,
    },
    {
      label: 'Current Medications',
      value: data.currentMedications || 'None stated',
      multiline: true,
      height: 40,
    },
  ]);
  builder.drawTextRow([
    {
      label: 'Special Care Requirements',
      value: data.specialCareRequirements || 'None stated',
      multiline: true,
      height: 38,
    },
  ]);

  builder.drawSectionHeader('Section 3. Next of Kin / Emergency Contact');
  builder.drawTextRow([
    {
      label: 'Next of Kin Full Name',
      value: data.nextOfKinName || data.sponsorName || data.applicantName,
      span: 1,
    },
    { label: 'Relationship to Resident', value: data.nextOfKinRelationship, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Phone Number', value: data.nextOfKinPhone || data.phone, span: 1 },
    { label: 'Alternative Phone Number', value: data.nextOfKinAltPhone, span: 1 },
    {
      label: 'Applicant WhatsApp Number',
      value: data.applicantWhatsApp || data.whatsappNumber || data.phone,
      span: 1,
    },
  ]);
  builder.drawTextRow([
    { label: 'Email Address', value: data.nextOfKinEmail || data.email },
  ]);

  builder.drawSectionHeader('Section 4. Admission Consent & Attachments');
  builder.drawCheckboxRow([
    { label: 'Information provided is confirmed accurate', checked: Boolean(data.consentInfoAccurate) },
    { label: 'Consent to contact regarding admission', checked: Boolean(data.consentContactPermitted) },
  ]);
  builder.drawCheckboxRow([
    { label: 'WhatsApp notifications consent granted', checked: Boolean(data.whatsappConsent) },
  ]);
  builder.drawTextRow([
    { label: 'Name of Applicant / Guardian', value: data.applicantGuardianName || data.applicantName, span: 1 },
    { label: "Applicant's Signature", value: data.applicantSignature, span: 1 },
    { label: 'Consent Date', value: data.consentDate || submittedStr.slice(0, 10), span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Resident Photograph Status',
      value: data.photoUrl ? 'Attached in Portal' : 'Not attached',
      span: 1,
    },
    {
      label: 'Admission Fee Payment Receipt',
      value: data.receiptUrl || data.receiptName ? `Attached (${data.receiptName || 'Bank Transfer Slip'})` : 'Not uploaded',
      span: 1,
    },
  ]);

  builder.drawSectionHeader('Section 5. Administrative Section (Staff Only)', 'STAFF REVIEW INPUTS', true);
  builder.drawTextRow([
    { label: 'Admission ID', value: admId, span: 1 },
    { label: 'Admission Date', value: data.admissionDate || '', span: 1 },
    { label: 'Admission Status (Pending / Approved / Rejected)', value: data.admissionStatus || 'Pending', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Assigned Staff Member', value: data.assignedStaffName || '', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Staff Clinical & Administrative Notes', value: data.staffNotes || '', multiline: true, height: 54 },
  ]);

  const bytes = await builder.toBytes();
  const safeName = String(data.fullName || data.applicantName || 'Applicant').replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    bytes,
    blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    filename: `Resident_Care_Admission_${safeName}.pdf`,
  };
}

export async function generateCaregiverApplicationPdfClient(data: any): Promise<GeneratedPdfResult> {
  const refId = `JOB-${String(data.id || '001').slice(0, 8).toUpperCase()}`;
  const submittedStr = String(data.createdAt || new Date().toISOString().slice(0, 16));
  const builder = new ClientEditableFormBuilder();
  await builder.init('Caregiver / Staff Employment Application', `Ref: ${refId}`);

  builder.drawTextRow([
    { label: 'Application Reference ID', value: refId, span: 1 },
    { label: 'Position Applied For', value: data.positionOrCategory, span: 1 },
    { label: 'Submission Date', value: submittedStr, span: 1 },
  ]);

  builder.drawSectionHeader('Section 1. Personal Information');
  builder.drawTextRow([
    { label: 'Full Name', value: data.fullName || data.applicantName, span: 2 },
    { label: 'Date of Birth', value: data.dateOfBirth, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Gender', value: data.gender, span: 1 },
    { label: 'Phone Number', value: data.phone, span: 1 },
    { label: 'WhatsApp Number', value: data.whatsappNumber || data.applicantWhatsApp, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Email Address', value: data.email, span: 1.5 },
    { label: 'Nationality', value: data.nationality, span: 1 },
    { label: 'City / State', value: data.cityState, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Residential Address', value: data.residentialAddress, multiline: true, height: 32 },
  ]);

  builder.drawSectionHeader('Section 2. Educational Background');
  builder.drawTextRow([
    { label: 'Highest Educational Qualification', value: data.highestQualification, span: 1 },
    { label: 'Name of Institution', value: data.institutionName, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Course of Study', value: data.courseOfStudy, span: 1.5 },
    { label: 'Year of Graduation', value: data.graduationYear, span: 0.7 },
  ]);
  builder.drawTextRow([
    { label: 'Professional Qualifications', value: data.professionalQualifications, multiline: true, height: 34 },
    { label: 'Relevant Certifications', value: data.relevantCertifications, multiline: true, height: 34 },
  ]);

  builder.drawSectionHeader('Section 3. Work Experience');
  builder.drawTextRow([
    { label: 'Previous Caregiving / Healthcare Experience', value: data.hasPreviousCareExperience, span: 1 },
    { label: 'Years of Experience', value: data.yearsOfExperience, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Previous Employer', value: data.previousEmployer, span: 1 },
    { label: 'Job Title', value: data.previousJobTitle, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Previous Responsibilities', value: data.previousResponsibilities, multiline: true, height: 40 },
  ]);
  builder.drawTextRow([
    { label: 'Reason for Leaving Previous Employment', value: data.reasonForLeaving, multiline: true, height: 32 },
  ]);
  if (data.notesOrStatement) {
    builder.drawTextRow([
      { label: 'Cover Letter / Additional Statement', value: data.notesOrStatement, multiline: true, height: 36 },
    ]);
  }

  builder.drawSectionHeader('Section 4. Document Uploads');
  const docLabels: string[] = [];
  if (data.documents && typeof data.documents === 'object') {
    for (const [key, val] of Object.entries<any>(data.documents)) {
      if (val && (val.name || val.url)) {
        docLabels.push(`${key}: ${val.name || 'Attached'}`);
      }
    }
  }
  if (data.cvName && !docLabels.some((d) => d.includes(data.cvName))) {
    docLabels.push(`CV: ${data.cvName}`);
  }
  builder.drawTextRow([
    {
      label: 'Submitted Documents Summary',
      value: docLabels.length ? docLabels.join('  |  ') : 'No files listed',
      multiline: true,
      height: 36,
    },
  ]);

  builder.drawSectionHeader('Section 5. References');
  const refs = Array.isArray(data.references) ? data.references : [];
  if (refs.length === 0) {
    builder.drawTextRow([{ label: 'Referee Details', value: 'No references provided' }]);
  } else {
    refs.forEach((r: any, idx: number) => {
      builder.drawTextRow([
        {
          label: `Referee ${idx + 1} Full Name`,
          value: `${r.name || ''} (${r.relationship || 'Referee'})`,
          span: 1.4,
        },
        { label: 'Organisation', value: r.organisation || '', span: 1 },
        { label: 'Phone / Email', value: [r.phone, r.email].filter(Boolean).join(' | '), span: 1.4 },
      ]);
    });
  }

  builder.drawSectionHeader('Recruitment Review (Staff Only)', 'STAFF REVIEW INPUTS', true);
  builder.drawTextRow([
    { label: 'Application Status', value: data.status || 'Received', span: 1 },
    { label: 'Shortlist / Interview Date', value: '', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Recruiter / Admin Notes', value: data.staffNotes || '', multiline: true, height: 44 },
  ]);

  const bytes = await builder.toBytes();
  const safeName = String(data.fullName || data.applicantName || 'Candidate').replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    bytes,
    blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    filename: `Caregiver_Job_Application_${safeName}.pdf`,
  };
}

export async function generateConsultationPdfClient(booking: any): Promise<GeneratedPdfResult> {
  const refId = String(booking.id || 'CON-001').toUpperCase();
  const submittedStr = String(booking.createdAt || new Date().toISOString().slice(0, 16));
  const builder = new ClientEditableFormBuilder();
  await builder.init('Family Consultation Request Sheet', `Ref: ${refId}`);

  builder.drawSectionHeader('Client & Scheduling Information');
  builder.drawTextRow([
    { label: 'Consultation Reference ID', value: refId, span: 1 },
    { label: 'Submitted Date / Time', value: submittedStr, span: 1 },
    { label: 'Status', value: booking.status || 'Pending', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Full Name', value: booking.fullName, span: 1.4 },
    { label: 'Service of Interest', value: booking.serviceInterest, span: 1.2 },
  ]);
  builder.drawTextRow([
    { label: 'Email Address', value: booking.email, span: 1.2 },
    { label: 'Phone Number', value: booking.phone, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Preferred Date', value: booking.preferredDate, span: 1 },
    { label: 'Preferred Time Slot', value: booking.preferredTime, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Additional Care Notes', value: booking.notes || 'None provided', multiline: true, height: 64 },
  ]);

  builder.drawSectionHeader('Administrative Follow-Up (Staff Only)', 'STAFF USE', true);
  builder.drawTextRow([
    { label: 'Assigned Coordinator', value: '', span: 1 },
    { label: 'Confirmed Appointment Date / Time', value: '', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Coordinator Consultation Notes', value: '', multiline: true, height: 64 },
  ]);

  const bytes = await builder.toBytes();
  const safeName = String(booking.fullName || 'Consultation').replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    bytes,
    blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    filename: `Consultation_Booking_${safeName}.pdf`,
  };
}

export async function generateInquiryPdfClient(msg: any): Promise<GeneratedPdfResult> {
  const isRoofing = msg.formType === 'roofing_quote' || msg.senderId === 'public_roofing_inquiry';
  const refId = String(msg.id || 'INQ-001').toUpperCase();
  const submittedStr = String(msg.timestamp || msg.createdAt || new Date().toISOString().slice(0, 16));
  const builder = new ClientEditableFormBuilder();
  await builder.init(
    isRoofing ? 'Roofing Quote & Site Inspection Request' : 'Website Contact Inquiry Record',
    `Ref: ${refId}`
  );

  builder.drawSectionHeader('Sender & Inquiry Details');
  builder.drawTextRow([
    { label: 'Inquiry Reference ID', value: refId, span: 1 },
    { label: 'Form Category', value: isRoofing ? 'Roofing Division Quote Request' : 'Care Home Contact Inquiry', span: 1 },
    { label: 'Submitted Date / Time', value: submittedStr, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Full Name', value: msg.fullName || msg.senderName, span: 1.3 },
    { label: 'Phone / WhatsApp', value: msg.phone || 'N/A', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Email Address', value: msg.email || 'N/A', span: 1 },
    { label: 'Subject', value: msg.subject, span: 1.5 },
  ]);

  if (isRoofing) {
    builder.drawSectionHeader('Roofing Project Specifications');
    builder.drawTextRow([
      { label: 'Project State / Site Location', value: msg.stateLocation, span: 1 },
      { label: 'Roof Material Preference', value: msg.roofType, span: 1 },
    ]);
    builder.drawTextRow([
      { label: 'Project Scope', value: msg.projectScope, span: 1 },
      { label: 'Estimated Size / Area', value: msg.estimatedSize, span: 1 },
    ]);
  }

  builder.drawSectionHeader('Message / Notes');
  builder.drawTextRow([
    { label: 'Submitted Message / Specifications', value: msg.message || msg.content || '', multiline: true, height: 86 },
  ]);

  builder.drawSectionHeader('Administrative Response Log (Staff Only)', 'STAFF USE', true);
  builder.drawTextRow([
    { label: 'Handled By', value: '', span: 1 },
    { label: 'Response Date', value: '', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Action Taken / Quote Notes', value: '', multiline: true, height: 60 },
  ]);

  const bytes = await builder.toBytes();
  const safeName = String(msg.fullName || msg.senderName || 'Inquiry').replace(/[^a-zA-Z0-9_-]/g, '_');
  return {
    bytes,
    blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
    filename: `${isRoofing ? 'Roofing_Quote' : 'Contact_Inquiry'}_${safeName}.pdf`,
  };
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

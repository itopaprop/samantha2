import fs from 'fs';
import path from 'path';
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
// INTERACTIVE / EDITABLE / PRINTABLE ACROFORM PDF GENERATOR
// Uses pdf-lib to generate multi-page AcroForm PDFs with pre-filled editable
// text boxes and checkboxes so Admin can view, edit, print, and save/download
// any submitted application, consultation, contact inquiry, or roofing quote.
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

/**
 * StandardFonts in pdf-lib only support WinAnsi encoding.
 * Cleanly normalize curly quotes, dashes, bullets, and strip unsupported characters
 * (like emojis) so PDF generation never throws encoding errors.
 */
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

function loadEmblemPng(): Uint8Array | null {
  try {
    const logoPath = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'Heart-Care_Medical_Emblem_b4b952cf.png'
    );
    if (fs.existsSync(logoPath)) {
      return fs.readFileSync(logoPath);
    }
  } catch {
    // Fallback gracefully without logo
  }
  return null;
}

class EditableFormBuilder {
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

    // Header strip
    const logoBytes = loadEmblemPng();
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
        // ignore logo embed errors
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

    // Subtle helper banner noting editable fields
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

  /**
   * Draw a row containing 1 or 2 editable text fields cleanly.
   */
  drawTextRow(
    fields: Array<{
      label: string;
      value?: string;
      span?: number; // fraction of row width (default equal split)
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

  async toBuffer(): Promise<Buffer> {
    // Ensure every PDF viewer (Chrome, Safari, Edge, Adobe, mobile) both displays pre-filled values
    // and keeps every field interactively editable and printable.
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
    const bytes = await this.doc.save();
    return Buffer.from(bytes);
  }
}

// ============================================================================
// 1. RESIDENT CARE ADMISSION FORM (Sections 1–5)
// ============================================================================
export async function generateResidentAdmissionPdf(data: any): Promise<Buffer> {
  const admId =
    data.admissionId ||
    `ADM-${new Date().getFullYear()}-${String(data.id || '001').slice(0, 6).toUpperCase()}`;
  const submittedStr = String(data.createdAt || data.created_at || new Date().toISOString().slice(0, 16));
  const builder = new EditableFormBuilder();
  await builder.init('Resident Care Admission Form', `ID: ${admId}`);

  builder.drawTextRow([
    { label: 'Admission Reference ID', value: admId, span: 1 },
    { label: 'Submission Date / Time', value: submittedStr, span: 1 },
    {
      label: 'Current Status',
      value: data.admissionStatus || data.status || 'Pending',
      span: 1,
    },
  ]);

  builder.drawSectionHeader("Section 1. Resident's Personal Information");
  builder.drawTextRow([
    { label: 'Resident Full Name', value: data.fullName || data.full_name, span: 2 },
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
      value: data.careTypeRequired || data.careCategory || data.positionOrCategory,
      span: 1,
    },
    { label: 'Mobility Status', value: data.mobilityStatus, span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Reason for Admission',
      value: data.reasonForAdmission || data.notesOrStatement || data.notes,
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
    {
      label: 'Information provided is confirmed accurate',
      checked: Boolean(data.consentInfoAccurate),
    },
    {
      label: 'Consent to contact regarding admission',
      checked: Boolean(data.consentContactPermitted),
    },
  ]);
  builder.drawCheckboxRow([
    {
      label: 'WhatsApp notifications consent granted',
      checked: Boolean(data.whatsappConsent),
    },
  ]);
  builder.drawTextRow([
    { label: 'Name of Applicant / Guardian', value: data.applicantGuardianName || data.applicantName, span: 1 },
    { label: "Applicant's Signature", value: data.applicantSignature, span: 1 },
    { label: 'Consent Date', value: data.consentDate || submittedStr.slice(0, 10), span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Resident Photograph Status',
      value: data.photoUrl || data.photo_url ? `Attached (${data.photoUrl || data.photo_url})` : 'Not attached',
      span: 1,
    },
    {
      label: 'Admission Fee Payment Receipt',
      value:
        data.receiptUrl || data.receipt_url || data.receiptName || data.receipt_name
          ? `Attached (${data.receiptName || data.receipt_name || 'Bank Transfer Slip'})`
          : 'Not uploaded',
      span: 1,
    },
  ]);

  builder.drawSectionHeader(
    'Section 5. Administrative Section (Staff Only)',
    'STAFF REVIEW INPUTS',
    true
  );
  builder.drawTextRow([
    { label: 'Admission ID', value: admId, span: 1 },
    { label: 'Admission Date', value: data.admissionDate || '', span: 1 },
    {
      label: 'Admission Status (Pending / Approved / Rejected)',
      value: data.admissionStatus || 'Pending',
      span: 1,
    },
  ]);
  builder.drawTextRow([
    { label: 'Assigned Staff Member', value: data.assignedStaffName || '', span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Staff Clinical & Administrative Notes',
      value: data.staffNotes || '',
      multiline: true,
      height: 54,
    },
  ]);

  return builder.toBuffer();
}

// ============================================================================
// 2. CAREGIVER / STAFF JOB APPLICATION FORM (Sections 1–5 + Review)
// ============================================================================
export async function generateCaregiverApplicationPdf(data: any): Promise<Buffer> {
  const refId = `JOB-${String(data.id || '001').slice(0, 8).toUpperCase()}`;
  const submittedStr = String(data.createdAt || data.created_at || new Date().toISOString().slice(0, 16));
  const builder = new EditableFormBuilder();
  await builder.init('Caregiver / Staff Employment Application', `Ref: ${refId}`);

  builder.drawTextRow([
    { label: 'Application Reference ID', value: refId, span: 1 },
    { label: 'Position Applied For', value: data.positionOrCategory || data.position, span: 1 },
    { label: 'Submission Date', value: submittedStr, span: 1 },
  ]);

  builder.drawSectionHeader('Section 1. Personal Information');
  builder.drawTextRow([
    { label: 'Full Name', value: data.fullName || data.full_name || data.applicantName, span: 2 },
    { label: 'Date of Birth', value: data.dateOfBirth, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Gender', value: data.gender, span: 1 },
    { label: 'Phone Number', value: data.phone, span: 1 },
    { label: 'WhatsApp Number', value: data.whatsappNumber || data.applicantWhatsApp, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Email Address', value: data.email, span: 1 },
    { label: 'City / State', value: data.cityState, span: 1 },
    { label: 'Nationality', value: data.nationality, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Residential Address', value: data.residentialAddress, multiline: true, height: 34 },
  ]);

  builder.drawSectionHeader('Section 2. Educational Background');
  builder.drawTextRow([
    { label: 'Highest Educational Qualification', value: data.highestQualification, span: 1 },
    { label: 'Year of Graduation', value: data.graduationYear, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Name of Institution', value: data.institutionName, span: 1 },
    { label: 'Course of Study', value: data.courseOfStudy, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Professional Qualifications', value: data.professionalQualifications, span: 1 },
    { label: 'Relevant Certifications', value: data.relevantCertifications, span: 1 },
  ]);

  builder.drawSectionHeader('Section 3. Work Experience');
  builder.drawTextRow([
    {
      label: 'Previous Caregiving / Healthcare Experience?',
      value: data.hasPreviousCareExperience,
      span: 1,
    },
    { label: 'Years of Experience', value: data.yearsOfExperience, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Previous Employer', value: data.previousEmployer, span: 1 },
    { label: 'Previous Job Title', value: data.previousJobTitle, span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Previous Responsibilities',
      value: data.previousResponsibilities,
      multiline: true,
      height: 44,
    },
  ]);
  builder.drawTextRow([
    { label: 'Reason for Leaving Previous Employment', value: data.reasonForLeaving, span: 1 },
    {
      label: 'Cover Letter / Care Statement',
      value: data.notesOrStatement || data.notes,
      multiline: true,
      height: 36,
      span: 1,
    },
  ]);

  const docs = data.documents || {};
  builder.drawSectionHeader('Section 4. Document Uploads Checklist');
  builder.drawCheckboxRow([
    {
      label: `Passport Photo (${docs.passportPhoto?.name || (data.photoUrl ? 'Attached' : 'Missing')})`,
      checked: Boolean(docs.passportPhoto?.url || data.photoUrl),
    },
    {
      label: `CV / Resume (${docs.cv?.name || data.cvName || (data.cvUrl ? 'Attached' : 'Missing')})`,
      checked: Boolean(docs.cv?.url || data.cvUrl),
    },
  ]);
  builder.drawCheckboxRow([
    {
      label: `Educational Certs (${docs.educationalCertificates?.name || 'Not uploaded'})`,
      checked: Boolean(docs.educationalCertificates?.url),
    },
    {
      label: `Professional Certs (${docs.professionalCertificates?.name || 'Not uploaded'})`,
      checked: Boolean(docs.professionalCertificates?.url),
    },
  ]);
  builder.drawCheckboxRow([
    {
      label: `Training Certs (${docs.trainingCertificates?.name || 'Not uploaded'})`,
      checked: Boolean(docs.trainingCertificates?.url),
    },
    {
      label: `Valid Identification (${docs.validId?.name || 'Not uploaded'})`,
      checked: Boolean(docs.validId?.url),
    },
  ]);

  builder.drawSectionHeader('Section 5. References');
  const refs = Array.isArray(data.references) ? data.references : [];
  const ref1 = refs[0] || {};
  const ref2 = refs[1] || {};
  builder.drawTextRow([
    { label: 'Referee 1 Full Name', value: ref1.name, span: 1 },
    { label: 'Relationship to Applicant', value: ref1.relationship, span: 1 },
    { label: 'Organisation', value: ref1.organisation, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Referee 1 Phone Number', value: ref1.phone, span: 1 },
    { label: 'Referee 1 Email Address', value: ref1.email, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Referee 2 Full Name', value: ref2.name, span: 1 },
    { label: 'Relationship to Applicant', value: ref2.relationship, span: 1 },
    { label: 'Organisation', value: ref2.organisation, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Referee 2 Phone Number', value: ref2.phone, span: 1 },
    { label: 'Referee 2 Email Address', value: ref2.email, span: 1 },
  ]);

  builder.drawSectionHeader('Administrative Recruitment Review (Staff Only)', 'EDITABLE BY HR', true);
  builder.drawTextRow([
    { label: 'Application Review Status', value: data.status || 'Received', span: 1 },
    { label: 'Interview / Reviewer Name', value: data.assignedStaffName || '', span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'HR & Recruitment Assessment Notes',
      value: data.staffNotes || '',
      multiline: true,
      height: 48,
    },
  ]);

  return builder.toBuffer();
}

// ============================================================================
// 3. FAMILY CONSULTATION BOOKING FORM
// ============================================================================
export async function generateConsultationPdf(data: any): Promise<Buffer> {
  const refId = `CON-${String(data.id || '001').slice(0, 8).toUpperCase()}`;
  const submittedStr = String(data.createdAt || data.created_at || new Date().toISOString().slice(0, 16));
  const builder = new EditableFormBuilder();
  await builder.init('Family Care Consultation Booking Form', `Booking: ${refId}`);

  builder.drawTextRow([
    { label: 'Consultation Reference ID', value: refId, span: 1 },
    { label: 'Status', value: data.status || 'Pending', span: 1 },
    { label: 'Submitted Date', value: submittedStr, span: 1 },
  ]);

  builder.drawSectionHeader('Section 1. Family Contact Information');
  builder.drawTextRow([
    { label: 'Full Name', value: data.fullName || data.full_name, span: 1 },
    { label: 'Email Address', value: data.email, span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Phone / WhatsApp Number', value: data.phone, span: 1 },
    { label: 'Service of Interest', value: data.serviceInterest, span: 1 },
  ]);

  builder.drawSectionHeader('Section 2. Requested Appointment Schedule & Care Notes');
  builder.drawTextRow([
    { label: 'Preferred Consultation Date', value: data.preferredDate, span: 1 },
    { label: 'Preferred Time Slot', value: data.preferredTime, span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Additional Care Notes / Loved One Needs',
      value: data.notes || 'None stated',
      multiline: true,
      height: 70,
    },
  ]);

  builder.drawSectionHeader('Section 3. Care Coordinator Review (Staff Only)', 'EDITABLE', true);
  builder.drawTextRow([
    { label: 'Assigned Care Coordinator', value: data.assignedStaffName || '', span: 1 },
    { label: 'Confirmed Appointment Date & Time', value: data.confirmedSchedule || '', span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Coordinator Outcome & Follow-Up Notes',
      value: data.staffNotes || '',
      multiline: true,
      height: 64,
    },
  ]);

  return builder.toBuffer();
}

// ============================================================================
// 4. CONTACT INQUIRY / ROOFING QUOTE FORM
// ============================================================================
export async function generateInquiryPdf(data: any): Promise<Buffer> {
  const isRoofing =
    data.formType === 'roofing_quote' ||
    String(data.subject || '').toLowerCase().includes('roofing') ||
    Boolean(data.roofType || data.stateLocation);
  const refId = `INQ-${String(data.id || '001').slice(0, 8).toUpperCase()}`;
  const submittedStr = String(
    data.timestamp || data.createdAt || new Date().toISOString().slice(0, 16)
  );
  const title = isRoofing
    ? 'Samanthasappy Roofing Quote & Project Inquiry Form'
    : 'Website Contact & Family Care Inquiry Form';

  const builder = new EditableFormBuilder();
  await builder.init(title, `Ref: ${refId}`);

  builder.drawTextRow([
    { label: 'Inquiry Reference ID', value: refId, span: 1 },
    {
      label: 'Form Source',
      value: isRoofing ? 'Samanthasappy Roofing Portal' : 'Main Website Contact Form',
      span: 1,
    },
    { label: 'Submitted Time', value: submittedStr, span: 1 },
  ]);

  builder.drawSectionHeader('Section 1. Sender / Client Contact Details');
  builder.drawTextRow([
    { label: 'Full Name', value: data.fullName || data.senderName, span: 1 },
    { label: 'Phone / WhatsApp', value: data.phone || 'N/A', span: 1 },
  ]);
  builder.drawTextRow([
    { label: 'Email Address', value: data.email || 'N/A', span: 1 },
    { label: 'Subject / Inquiry Category', value: data.subject, span: 1 },
  ]);

  if (isRoofing) {
    builder.drawSectionHeader('Section 2. Roofing Project Specifications');
    builder.drawTextRow([
      { label: 'Project State / Location', value: data.stateLocation, span: 1 },
      { label: 'Preferred Roof Material', value: data.roofType, span: 1 },
    ]);
    builder.drawTextRow([
      { label: 'Project Scope', value: data.projectScope, span: 1 },
      { label: 'Estimated Roof Area (sqm)', value: data.estimatedSize || 'Not specified', span: 1 },
    ]);
  }

  builder.drawSectionHeader(
    isRoofing ? 'Section 3. Project Details & Specifications' : 'Section 2. Message & Care Inquiry Details'
  );
  builder.drawTextRow([
    {
      label: isRoofing ? 'Project Notes / Instructions' : 'Inquiry Message',
      value: data.message || data.content || '',
      multiline: true,
      height: 95,
    },
  ]);

  builder.drawSectionHeader(
    'Administrative Follow-Up & Engineering Notes (Staff Only)',
    'EDITABLE',
    true
  );
  builder.drawTextRow([
    { label: 'Handling Status', value: data.status || 'Open / Pending Reply', span: 1 },
    { label: 'Assigned Coordinator / Engineer', value: data.assignedStaffName || '', span: 1 },
  ]);
  builder.drawTextRow([
    {
      label: 'Admin Follow-Up & Quotation Notes',
      value: data.staffNotes || '',
      multiline: true,
      height: 64,
    },
  ]);

  return builder.toBuffer();
}

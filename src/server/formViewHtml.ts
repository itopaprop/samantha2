// ============================================================================
// COMFORTABLE INTERACTIVE & PRINTABLE WEB FORM SHEET RENDERER
// Renders an accessible, mobile-friendly, editable & printable HTML document
// for any submitted form stored in Firestore / server store, with one-click
// Print, Download Editable PDF, and Native Browser PDF Viewer actions.
// ============================================================================

function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fieldBox(label: string, value: unknown, options?: { multiline?: boolean; full?: boolean; readOnly?: boolean }): string {
  const fullClass = options?.full ? 'col-span-full' : '';
  const safeVal = esc(value ?? '');
  if (options?.multiline) {
    return `
      <div class="field-group ${fullClass}">
        <label class="field-label">${esc(label)}</label>
        <textarea class="field-input field-textarea" rows="3" ${options?.readOnly ? 'readonly' : ''}>${safeVal}</textarea>
      </div>
    `;
  }
  return `
    <div class="field-group ${fullClass}">
      <label class="field-label">${esc(label)}</label>
      <input type="text" class="field-input" value="${safeVal}" ${options?.readOnly ? 'readonly' : ''} />
    </div>
  `;
}

function checkboxBadge(label: string, checked?: boolean): string {
  return `
    <label class="check-item">
      <input type="checkbox" ${checked ? 'checked' : ''} />
      <span>${esc(label)}</span>
    </label>
  `;
}

function sectionBlock(title: string, badge: string | undefined, contentHtml: string, staffOnly = false): string {
  return `
    <section class="form-section ${staffOnly ? 'staff-section' : ''}">
      <div class="section-header ${staffOnly ? 'staff-header' : ''}">
        <h2>${esc(title)}</h2>
        ${badge ? `<span class="section-badge">${esc(badge)}</span>` : ''}
      </div>
      <div class="section-grid">
        ${contentHtml}
      </div>
    </section>
  `;
}

function wrapPageHtml(params: {
  pageTitle: string;
  subtitle: string;
  refId: string;
  submittedAt: string;
  pdfOpenUrl: string;
  pdfDownloadUrl: string;
  bodyHtml: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(params.pageTitle)} — Samanthasappy Care Home</title>
  <style>
    :root {
      --navy: #0f172a;
      --teal: #0f766e;
      --sky: #0369a1;
      --border: #cbd5e1;
      --bg: #f1f5f9;
      --field-bg: #f8fafc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--navy);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.45;
      font-size: 14px;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--navy);
      color: #fff;
      padding: 12px 20px;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    }
    .toolbar-title {
      font-size: 13px;
      font-weight: 700;
      color: #e2e8f0;
    }
    .toolbar-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    .btn:hover { opacity: 0.92; }
    .btn-teal { background: #0d9488; color: #fff; }
    .btn-sky { background: #0284c7; color: #fff; }
    .btn-white { background: #fff; color: var(--navy); }
    .sheet {
      max-width: 880px;
      margin: 24px auto 48px;
      background: #fff;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
      padding: 28px 32px;
    }
    .sheet-header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 2px solid var(--navy);
      margin-bottom: 18px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand img {
      width: 56px;
      height: 56px;
      object-fit: contain;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      padding: 4px;
      background: #fff;
    }
    .brand-name {
      font-size: 19px;
      font-weight: 800;
      color: var(--navy);
      letter-spacing: -0.01em;
    }
    .brand-sub {
      font-size: 12px;
      font-weight: 700;
      color: var(--teal);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 2px;
    }
    .brand-contact {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-size: 12px;
    }
    .meta-id {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-weight: 800;
      color: var(--sky);
    }
    .edit-hint {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      color: #0369a1;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 18px;
    }
    .form-section {
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .staff-section {
      border: 1.5px solid var(--navy);
      background: #f8fafc;
    }
    .section-header {
      background: #f0fdfa;
      border-bottom: 1px solid #ccfbf1;
      padding: 9px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }
    .staff-header {
      background: #e2e8f0;
      border-bottom: 1px solid #cbd5e1;
    }
    .section-header h2 {
      margin: 0;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--teal);
    }
    .staff-header h2 {
      color: var(--navy);
    }
    .section-badge {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--navy);
      color: #fff;
    }
    .section-grid {
      padding: 14px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px 14px;
    }
    .col-span-full {
      grid-column: 1 / -1;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
    }
    .field-input {
      width: 100%;
      padding: 8px 10px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--field-bg);
      color: var(--navy);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
    }
    .field-input:focus {
      outline: none;
      border-color: var(--teal);
      background: #fff;
    }
    .field-textarea {
      resize: vertical;
      min-height: 68px;
    }
    .check-row {
      grid-column: 1 / -1;
      display: flex;
      flex-wrap: wrap;
      gap: 14px 24px;
      padding: 4px 0;
    }
    .check-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: var(--navy);
      cursor: pointer;
    }
    .check-item input {
      width: 16px;
      height: 16px;
      accent-color: var(--teal);
    }
    .sheet-footer {
      margin-top: 22px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
    @media (max-width: 640px) {
      .sheet { margin: 0; border-radius: 0; padding: 18px 16px; }
      .section-grid { grid-template-columns: 1fr; }
      .meta-box { text-align: left; }
    }
    @media print {
      body { background: #fff; }
      .toolbar, .edit-hint { display: none !important; }
      .sheet { margin: 0; box-shadow: none; border: none; padding: 0; max-width: 100%; }
      .field-input { border-color: #94a3b8; background: #fff; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">
      Samanthasappy Care Home &bull; ${esc(params.pageTitle)} (${esc(params.refId)})
    </div>
    <div class="toolbar-actions">
      <button type="button" class="btn btn-white" onclick="window.print()">Print / Save PDF</button>
      <a href="${esc(params.pdfOpenUrl)}" target="_blank" rel="noopener" class="btn btn-sky">Open Fillable PDF</a>
      <a href="${esc(params.pdfDownloadUrl)}" download class="btn btn-teal">Download PDF File</a>
    </div>
  </div>

  <main class="sheet">
    <header class="sheet-header">
      <div class="brand">
        <img src="/assets/aistudio/Heart-Care_Medical_Emblem_b4b952cf.png" alt="Samanthasappy Care Home Logo" />
        <div>
          <div class="brand-name">SAMANTHASAPPY CARE HOME</div>
          <div class="brand-sub">${esc(params.subtitle)}</div>
          <div class="brand-contact">No5 Ilemo Street, Ijapo Estate, Akure, Ondo State &bull; +234 706 933 2193 &bull; samanthasappy@gmail.com</div>
        </div>
      </div>
      <div class="meta-box">
        <div class="meta-id">ID: ${esc(params.refId)}</div>
        <div>Submitted: ${esc(params.submittedAt)}</div>
      </div>
    </header>

    <div class="edit-hint">
      Comfortable View &amp; Edit Mode: Click any field below to review or edit notes before printing or saving as PDF.
    </div>

    ${params.bodyHtml}

    <footer class="sheet-footer">
      <span>Samanthasappy Care Home &bull; Official Submitted Form Record</span>
      <span>Ref: ${esc(params.refId)}</span>
    </footer>
  </main>
</body>
</html>`;
}

export function renderApplicationFormHtml(
  data: any,
  urls: { pdfOpenUrl: string; pdfDownloadUrl: string }
): string {
  const isResident = data.type === 'resident' || data.formType === 'resident_care_admission';
  const submittedStr = String(data.createdAt || data.created_at || new Date().toISOString().slice(0, 16));

  if (isResident) {
    const admId =
      data.admissionId ||
      `ADM-${new Date().getFullYear()}-${String(data.id || '001').slice(0, 6).toUpperCase()}`;

    const bodyHtml = [
      sectionBlock(
        "Section 1. Resident's Personal Information",
        undefined,
        [
          fieldBox('Resident Full Name', data.fullName || data.full_name),
          fieldBox('Date of Birth', data.dateOfBirth),
          fieldBox('Gender', data.gender),
          fieldBox('Marital Status', data.maritalStatus),
          fieldBox('Nationality', data.nationality),
          fieldBox(
            'Residential Address',
            [data.residentialAddress, data.cityState].filter(Boolean).join(', '),
            { multiline: true, full: true }
          ),
        ].join('')
      ),
      sectionBlock(
        'Section 2. Care Information',
        undefined,
        [
          fieldBox('Type of Care Required', data.careTypeRequired || data.careCategory || data.positionOrCategory),
          fieldBox('Mobility Status', data.mobilityStatus),
          fieldBox('Reason for Admission', data.reasonForAdmission || data.notesOrStatement || data.notes, { multiline: true, full: true }),
          fieldBox('Existing Medical Conditions', data.existingMedicalConditions || 'None stated', { multiline: true }),
          fieldBox('Current Medications', data.currentMedications || 'None stated', { multiline: true }),
          fieldBox('Special Care Requirements', data.specialCareRequirements || 'None stated', { multiline: true, full: true }),
        ].join('')
      ),
      sectionBlock(
        'Section 3. Next of Kin / Emergency Contact',
        undefined,
        [
          fieldBox('Next of Kin Full Name', data.nextOfKinName || data.sponsorName || data.applicantName),
          fieldBox('Relationship to Resident', data.nextOfKinRelationship),
          fieldBox('Phone Number', data.nextOfKinPhone || data.phone),
          fieldBox('Alternative Phone Number', data.nextOfKinAltPhone),
          fieldBox('Applicant WhatsApp Number', data.applicantWhatsApp || data.whatsappNumber || data.phone),
          fieldBox('Email Address', data.nextOfKinEmail || data.email),
        ].join('')
      ),
      sectionBlock(
        'Section 4. Admission Consent & Attachments',
        undefined,
        [
          `<div class="check-row">
            ${checkboxBadge('Information provided is confirmed accurate', Boolean(data.consentInfoAccurate))}
            ${checkboxBadge('Consent to care home contacting applicant', Boolean(data.consentContactPermitted))}
            ${checkboxBadge('WhatsApp notifications consent granted', Boolean(data.whatsappConsent))}
          </div>`,
          fieldBox('Name of Applicant / Guardian', data.applicantGuardianName || data.applicantName),
          fieldBox("Applicant's Signature", data.applicantSignature),
          fieldBox('Consent Date', data.consentDate || submittedStr.slice(0, 10)),
          fieldBox('Payment Receipt', data.receiptName || (data.receiptUrl ? 'Attached' : 'Not uploaded')),
        ].join('')
      ),
      sectionBlock(
        'Section 5. Administrative Section (Staff Only)',
        'STAFF ONLY',
        [
          fieldBox('Admission ID', admId),
          fieldBox('Admission Date', data.admissionDate || ''),
          fieldBox('Admission Status (Pending / Approved / Rejected)', data.admissionStatus || data.status || 'Pending'),
          fieldBox('Assigned Staff Member', data.assignedStaffName || ''),
          fieldBox('Staff Clinical & Administrative Notes', data.staffNotes || '', { multiline: true, full: true }),
        ].join(''),
        true
      ),
    ].join('');

    return wrapPageHtml({
      pageTitle: `Resident Care Admission Form — ${data.fullName || 'Applicant'}`,
      subtitle: 'Resident Care Admission Form',
      refId: admId,
      submittedAt: submittedStr,
      pdfOpenUrl: urls.pdfOpenUrl,
      pdfDownloadUrl: urls.pdfDownloadUrl,
      bodyHtml,
    });
  }

  // Caregiver / Staff Job Application
  const refId = `JOB-${String(data.id || '001').slice(0, 8).toUpperCase()}`;
  const refs = Array.isArray(data.references) ? data.references : [];
  const docEntries: string[] = [];
  if (Array.isArray(data.uploadedDocNames) && data.uploadedDocNames.length > 0) {
    docEntries.push(...data.uploadedDocNames);
  } else if (data.documents && typeof data.documents === 'object') {
    for (const [k, v] of Object.entries<any>(data.documents)) {
      if (v && (v.name || v.url)) docEntries.push(`${k}: ${v.name || 'Attached'}`);
    }
  }

  const bodyHtml = [
    sectionBlock(
      'Section 1. Personal Information',
      undefined,
      [
        fieldBox('Full Name', data.fullName || data.full_name || data.applicantName),
        fieldBox('Position Applied For', data.positionOrCategory || data.position),
        fieldBox('Date of Birth', data.dateOfBirth),
        fieldBox('Gender', data.gender),
        fieldBox('Phone Number', data.phone),
        fieldBox('WhatsApp Number', data.whatsappNumber || data.applicantWhatsApp),
        fieldBox('Email Address', data.email),
        fieldBox('Nationality', data.nationality),
        fieldBox('City / State', data.cityState),
        fieldBox('Residential Address', data.residentialAddress, { multiline: true, full: true }),
      ].join('')
    ),
    sectionBlock(
      'Section 2. Educational Background',
      undefined,
      [
        fieldBox('Highest Educational Qualification', data.highestQualification),
        fieldBox('Name of Institution', data.institutionName),
        fieldBox('Course of Study', data.courseOfStudy),
        fieldBox('Year of Graduation', data.graduationYear),
        fieldBox('Professional Qualifications', data.professionalQualifications, { multiline: true, full: true }),
        fieldBox('Relevant Certifications', data.relevantCertifications, { multiline: true, full: true }),
      ].join('')
    ),
    sectionBlock(
      'Section 3. Work Experience',
      undefined,
      [
        fieldBox('Previous Caregiving Experience', data.hasPreviousCareExperience),
        fieldBox('Years of Experience', data.yearsOfExperience),
        fieldBox('Previous Employer', data.previousEmployer),
        fieldBox('Job Title', data.previousJobTitle),
        fieldBox('Previous Responsibilities', data.previousResponsibilities, { multiline: true, full: true }),
        fieldBox('Reason for Leaving', data.reasonForLeaving, { multiline: true, full: true }),
        fieldBox('Additional Notes / Statement', data.notesOrStatement || data.notes, { multiline: true, full: true }),
      ].join('')
    ),
    sectionBlock(
      'Section 4. Document Uploads',
      undefined,
      fieldBox('Uploaded Recruitment Documents', docEntries.length ? docEntries.join('\n') : 'None listed', {
        multiline: true,
        full: true,
      })
    ),
    sectionBlock(
      'Section 5. References',
      undefined,
      refs.length
        ? refs
            .map((r: any, idx: number) =>
              fieldBox(
                `Referee ${idx + 1}`,
                `${r.name || 'N/A'} | Relationship: ${r.relationship || 'N/A'}${r.organisation ? ` | Org: ${r.organisation}` : ''} | Tel: ${r.phone || 'N/A'}${r.email ? ` | ${r.email}` : ''}`,
                { full: true }
              )
            )
            .join('')
        : fieldBox('References', 'None listed', { full: true })
    ),
    sectionBlock(
      'Recruitment Review (Staff Only)',
      'STAFF ONLY',
      [
        fieldBox('Application Status', data.status || 'Received'),
        fieldBox('Reviewer Notes / Interview Schedule', data.staffNotes || '', { multiline: true, full: true }),
      ].join(''),
      true
    ),
  ].join('');

  return wrapPageHtml({
    pageTitle: `Caregiver Job Application — ${data.fullName || data.applicantName || 'Applicant'}`,
    subtitle: 'Caregiver / Staff Employment Application',
    refId,
    submittedAt: submittedStr,
    pdfOpenUrl: urls.pdfOpenUrl,
    pdfDownloadUrl: urls.pdfDownloadUrl,
    bodyHtml,
  });
}

export function renderConsultationFormHtml(
  booking: any,
  urls: { pdfOpenUrl: string; pdfDownloadUrl: string }
): string {
  const refId = String(booking.id || 'CON-001').toUpperCase();
  const submittedStr = String(booking.createdAt || new Date().toISOString().slice(0, 16));
  const bodyHtml = [
    sectionBlock(
      'Client & Scheduling Information',
      undefined,
      [
        fieldBox('Consultation Reference ID', refId),
        fieldBox('Current Status', booking.status || 'Pending'),
        fieldBox('Client Full Name', booking.fullName),
        fieldBox('Service of Interest', booking.serviceInterest),
        fieldBox('Email Address', booking.email),
        fieldBox('Phone Number', booking.phone),
        fieldBox('Preferred Date', booking.preferredDate),
        fieldBox('Preferred Time Slot', booking.preferredTime),
        fieldBox('Additional Care Notes', booking.notes || '', { multiline: true, full: true }),
      ].join('')
    ),
    sectionBlock(
      'Administrative Follow-up Notes (Staff Only)',
      'STAFF ONLY',
      [
        fieldBox('Assigned Coordinator', ''),
        fieldBox('Follow-up Summary / Confirmed Schedule', '', { multiline: true, full: true }),
      ].join(''),
      true
    ),
  ].join('');

  return wrapPageHtml({
    pageTitle: `Family Consultation Request — ${booking.fullName || 'Client'}`,
    subtitle: 'Family Consultation Request Sheet',
    refId,
    submittedAt: submittedStr,
    pdfOpenUrl: urls.pdfOpenUrl,
    pdfDownloadUrl: urls.pdfDownloadUrl,
    bodyHtml,
  });
}

export function renderInquiryFormHtml(
  msg: any,
  urls: { pdfOpenUrl: string; pdfDownloadUrl: string }
): string {
  const isRoofing = msg.formType === 'roofing_quote' || msg.senderId === 'public_roofing_inquiry';
  const refId = String(msg.id || 'INQ-001').toUpperCase();
  const submittedStr = String(msg.timestamp || msg.createdAt || new Date().toISOString().slice(0, 16));

  const fields = [
    fieldBox('Inquiry Reference ID', refId),
    fieldBox('Form Category', isRoofing ? 'Roofing Division Quote Request' : 'Care Home Contact Inquiry'),
    fieldBox('Sender Full Name', msg.fullName || msg.senderName),
    fieldBox('Phone / WhatsApp', msg.phone),
    fieldBox('Email Address', msg.email, { full: true }),
    fieldBox('Subject', msg.subject, { full: true }),
  ];

  if (isRoofing) {
    fields.push(
      fieldBox('Project State / Site Location', msg.stateLocation),
      fieldBox('Roof Material Preference', msg.roofType),
      fieldBox('Project Scope', msg.projectScope),
      fieldBox('Estimated Area / Size', msg.estimatedSize)
    );
  }

  fields.push(
    fieldBox('Detailed Message / Specifications', msg.message || msg.content || '', {
      multiline: true,
      full: true,
    })
  );

  const bodyHtml = [
    sectionBlock('Submitted Inquiry Details', undefined, fields.join('')),
    sectionBlock(
      'Administrative Response Notes (Staff Only)',
      'STAFF ONLY',
      fieldBox('Response / Quote Notes', '', { multiline: true, full: true }),
      true
    ),
  ].join('');

  return wrapPageHtml({
    pageTitle: `${isRoofing ? 'Roofing Quote Inquiry' : 'Contact Form Inquiry'} — ${msg.fullName || msg.senderName || 'Visitor'}`,
    subtitle: isRoofing ? 'Roofing Quote & Site Inspection Request' : 'Website Contact Inquiry Record',
    refId,
    submittedAt: submittedStr,
    pdfOpenUrl: urls.pdfOpenUrl,
    pdfDownloadUrl: urls.pdfDownloadUrl,
    bodyHtml,
  });
}

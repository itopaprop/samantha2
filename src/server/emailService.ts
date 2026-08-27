export interface StaffEmailData {
  fullName: string;
  username: string;
  role: string;
  position: string;
  loginUrl: string;
  setupPasswordUrl?: string;
  facilityName?: string;
}

export interface RelativeEmailData {
  relativeName: string;
  residentName: string;
  relationship: string;
  username: string;
  loginUrl: string;
  setupPasswordUrl?: string;
  careCategory?: string;
  facilityName?: string;
}

export function generateStaffWelcomeEmail(data: StaffEmailData): { subject: string; html: string; text: string } {
  const facility = data.facilityName || 'Samantha Sappy Care Home';
  const subject = `Welcome to the Care Team at ${facility} - Staff Portal Access`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background-color: #0d9488; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                Official Staff Onboarding
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                ${facility}
              </h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                Excellence in Compassionate Caregiving & Health Operations
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                Welcome to the Care Team, ${data.fullName}!
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
                Your staff authentication account has been successfully provisioned in the ${facility} Healthcare Management System. You now have authorized access to manage resident care records, log vitals, track shift rotations, and coordinate with administrative supervisors.
              </p>

              <!-- Account Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="color: #64748b; font-weight: 600;">Full Name:</td>
                        <td style="color: #0f172a; font-weight: 700;">${data.fullName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Staff Role / Title:</td>
                        <td style="color: #0d9488; font-weight: 700;">${data.position || data.role}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Username (Login Email):</td>
                        <td style="color: #0f172a; font-weight: 700; font-family: monospace;">${data.username}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Account Status:</td>
                        <td style="color: #16a34a; font-weight: 700;">Active & Provisioned</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action Buttons -->
              <div style="text-align: center; margin: 28px 0 24px 0;">
                <a href="${data.loginUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(13, 148, 136, 0.2);">
                  Sign In to Staff Portal
                </a>
                ${data.setupPasswordUrl ? `
                <div style="margin-top: 12px;">
                  <a href="${data.setupPasswordUrl}" style="color: #0284c7; font-size: 12px; text-decoration: underline;">
                    Set or Reset Your Private Password &rarr;
                  </a>
                </div>
                ` : ''}
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin-top: 24px;">
                <p style="margin: 0; color: #92400e; font-size: 12px;">
                  <strong>🔒 Security Note:</strong> For resident confidentiality and HIPAA/data protection compliance, never disclose your portal credentials or leave active sessions unattended.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; font-weight: 600;">
                ${facility} Administration
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Contact: samanthasappy@gmail.com | Emergency Helpline: +234 706 933 2193
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Welcome to the Care Team, ${data.fullName}!

Your staff account has been created for ${facility}.

Account Details:
- Full Name: ${data.fullName}
- Staff Role: ${data.position || data.role}
- Username / Login Email: ${data.username}
- Login Portal Link: ${data.loginUrl}
${data.setupPasswordUrl ? `- Password Setup Link: ${data.setupPasswordUrl}\n` : ''}

Welcome Message:
Your staff authentication account has been successfully provisioned. You can now access the Staff Care Portal to manage resident logs, track shift rotations, and record clinical vitals.

Best regards,
${facility} Administration
samanthasappy@gmail.com
`;

  return { subject, html, text };
}

export function generateRelativeWelcomeEmail(data: RelativeEmailData): { subject: string; html: string; text: string } {
  const facility = data.facilityName || 'Samantha Sappy Care Home';
  const subject = `Welcome to the Family Portal for ${data.residentName} - ${facility}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #0369a1; padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; padding: 8px 16px; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                Family Care Portal Access
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                ${facility}
              </h1>
              <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 13px;">
                Peace of Mind Through Transparent & Loving Care
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">
                Dear ${data.relativeName},
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">
                We are delighted to welcome <strong>${data.residentName}</strong> into our care family at ${facility}. To keep you continuously connected with their day-to-day well-being, we have activated your personal <strong>Family Care Portal</strong>.
              </p>

              <!-- Family Link Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="color: #0369a1; font-weight: 600;">Relative Name:</td>
                        <td style="color: #0f172a; font-weight: 700;">${data.relativeName}</td>
                      </tr>
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Linked Resident:</td>
                        <td style="color: #0284c7; font-weight: 700; font-size: 14px;">${data.residentName}</td>
                      </tr>
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Relationship:</td>
                        <td style="color: #0f172a; font-weight: 600;">${data.relationship}</td>
                      </tr>
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Username (Email):</td>
                        <td style="color: #0f172a; font-weight: 700; font-family: monospace;">${data.username}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Portal Features Highlights -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; font-weight: 700;">
                  What you can do in your Family Portal:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 13px;">
                  <li style="margin-bottom: 6px;">View daily care activity logs and meal updates</li>
                  <li style="margin-bottom: 6px;">Monitor vital signs and clinical health notes in real time</li>
                  <li style="margin-bottom: 6px;">Exchange secure, encrypted messages with assigned caregivers</li>
                  <li style="margin-bottom: 6px;">Schedule physical visits and request personalized care adjustments</li>
                </ul>
              </div>

              <!-- Call to Action Buttons -->
              <div style="text-align: center; margin: 28px 0 24px 0;">
                <a href="${data.loginUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);">
                  Open Family Care Portal
                </a>
                ${data.setupPasswordUrl ? `
                <div style="margin-top: 12px;">
                  <a href="${data.setupPasswordUrl}" style="color: #0369a1; font-size: 12px; text-decoration: underline;">
                    Click here to set your private password &rarr;
                  </a>
                </div>
                ` : ''}
              </div>

              <!-- Security Policy Notice -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-top: 24px;">
                <p style="margin: 0; color: #64748b; font-size: 12px;">
                  <strong>🔒 Privacy Protection:</strong> We never send permanent passwords via email. Please use the secure login or password setup link above to establish your secure password.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #64748b; font-size: 12px; font-weight: 600;">
                ${facility} - Family Relations Team
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Contact: samanthasappy@gmail.com | Family Care Line: +234 706 933 2193
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `
Dear ${data.relativeName},

Welcome to the Family Portal for ${data.residentName} at ${facility}!

Portal Connection Details:
- Relative Name: ${data.relativeName}
- Linked Resident: ${data.residentName}
- Relationship: ${data.relationship}
- Username (Login Email): ${data.username}
- Family Portal Login: ${data.loginUrl}
${data.setupPasswordUrl ? `- Secure Password Setup Link: ${data.setupPasswordUrl}\n` : ''}

Welcome Message:
Your personal Family Care Portal account is now active. You can log in to view real-time health logs, monitor daily vitals, communicate with caregivers, and review special activity updates.

Security Note:
We never send permanent passwords via email. Please use the secure password setup link or password reset flow to configure your private credentials.

Warm regards,
${facility} Administration
samanthasappy@gmail.com
`;

  return { subject, html, text };
}

export function generateAdminNewStaffNotificationEmail(data: {
  staffName: string;
  email: string;
  phone: string;
  position: string;
  qualification?: string;
  shift?: string;
  facilityName?: string;
  date?: string;
}): { subject: string; html: string; text: string } {
  const facility = data.facilityName || 'Samantha Sappy Care Home';
  const dateStr = data.date || new Date().toISOString().replace('T', ' ').slice(0, 16);
  const subject = `🔔 [Admin Alert] New Staff Registered: ${data.staffName} (${data.position})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: #0d9488; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                Administrator Notification
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                New Staff Member Registered
              </h1>
              <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">
                ${facility} Management System
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px;">
                A new staff profile has been created and provisioned in the care management platform. An onboarding confirmation email with login credentials has been automatically dispatched to the staff member.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td width="35%" style="color: #64748b; font-weight: 600;">Staff Full Name:</td>
                        <td style="color: #0f172a; font-weight: 700;">${data.staffName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Staff Role / Position:</td>
                        <td style="color: #0d9488; font-weight: 700;">${data.position}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Registered Email:</td>
                        <td style="color: #0f172a; font-weight: 600; font-family: monospace;">${data.email}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Contact Phone:</td>
                        <td style="color: #0f172a; font-weight: 600;">${data.phone}</td>
                      </tr>
                      ${data.qualification ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Qualification:</td>
                        <td style="color: #0f172a;">${data.qualification}</td>
                      </tr>` : ''}
                      ${data.shift ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Assigned Shift:</td>
                        <td style="color: #0f172a;">${data.shift}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Registration Time:</td>
                        <td style="color: #64748b;">${dateStr}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This notification is also recorded in your Admin Dashboard Inbox and Activity Logs.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
[Admin Alert] New Staff Registered: ${data.staffName} (${data.position})

A new staff member has been registered at ${facility}:
- Staff Name: ${data.staffName}
- Position: ${data.position}
- Email: ${data.email}
- Phone: ${data.phone}
- Qualification: ${data.qualification || 'N/A'}
- Shift: ${data.shift || 'N/A'}
- Registered Date: ${dateStr}

An automated confirmation email has been dispatched to the staff member.
`;

  return { subject, html, text };
}

export function generateAdminNewResidentNotificationEmail(data: {
  residentName: string;
  careCategory: string;
  roomNumber?: string;
  relativeName: string;
  relationship: string;
  relativePhone: string;
  relativeEmail: string;
  facilityName?: string;
  date?: string;
}): { subject: string; html: string; text: string } {
  const facility = data.facilityName || 'Samantha Sappy Care Home';
  const dateStr = data.date || new Date().toISOString().replace('T', ' ').slice(0, 16);
  const subject = `🏡 [Admin Alert] New Resident Admitted: ${data.residentName} (${data.careCategory})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #0369a1; padding: 28px 24px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                Administrator Notification
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                New Resident Admitted & Relative Provisioned
              </h1>
              <p style="margin: 4px 0 0 0; color: #e0f2fe; font-size: 13px;">
                ${facility} Care Records
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px;">
                A new resident has been registered into the care system, and the linked relative's Family Portal account has been activated.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td width="38%" style="color: #0369a1; font-weight: 600;">Resident Full Name:</td>
                        <td style="color: #0f172a; font-weight: 700; font-size: 14px;">${data.residentName}</td>
                      </tr>
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Care Category:</td>
                        <td style="color: #0284c7; font-weight: 700;">${data.careCategory}</td>
                      </tr>
                      ${data.roomNumber ? `
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Room / Suite:</td>
                        <td style="color: #0f172a;">${data.roomNumber}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Next of Kin / Relative:</td>
                        <td style="color: #0f172a; font-weight: 700;">${data.relativeName} (${data.relationship})</td>
                      </tr>
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Relative Email:</td>
                        <td style="color: #0f172a; font-family: monospace;">${data.relativeEmail}</td>
                      </tr>
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Relative Phone:</td>
                        <td style="color: #0f172a;">${data.relativePhone}</td>
                      </tr>
                      <tr>
                        <td style="color: #0369a1; font-weight: 600;">Admission Date:</td>
                        <td style="color: #64748b;">${dateStr}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px;">
                An automated onboarding confirmation has been emailed to the relative at <strong>${data.relativeEmail}</strong>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
[Admin Alert] New Resident Admitted: ${data.residentName} (${data.careCategory})

A new resident and family portal account have been registered at ${facility}:
- Resident Name: ${data.residentName}
- Care Category: ${data.careCategory}
- Room / Suite: ${data.roomNumber || 'Pending Assignment'}
- Next of Kin / Relative: ${data.relativeName} (${data.relationship})
- Relative Email: ${data.relativeEmail}
- Relative Phone: ${data.relativePhone}
- Date: ${dateStr}

An onboarding confirmation email has been dispatched to the relative.
`;

  return { subject, html, text };
}

export function generateApplicantReceiptConfirmationEmail(data: {
  applicantName: string;
  email: string;
  phone: string;
  appType: 'caregiver' | 'resident';
  positionOrCategory: string;
  notes?: string;
  hasReceipt: boolean;
  receiptName?: string;
  sponsorName?: string;
  facilityName?: string;
}): { subject: string; html: string; text: string } {
  const facility = data.facilityName || 'Samantha Sappy Care Home';
  const isCaregiver = data.appType === 'caregiver';
  const subject = isCaregiver
    ? `Application Receipt Confirmation: Job Application for ${data.positionOrCategory} - ${facility}`
    : `Application Receipt Confirmation: Resident Care Admission (${data.positionOrCategory}) - ${facility}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: ${isCaregiver ? '#0f172a' : '#0369a1'}; padding: 28px 24px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: ${isCaregiver ? '#0d9488' : '#0284c7'}; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                Official Application Receipt
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                Application Received Successfully
              </h1>
              <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px;">
                ${facility} Admissions & Recruitment Board
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 16px; font-weight: 700;">
                Dear ${data.applicantName},
              </h2>
              <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px;">
                Thank you for submitting your ${isCaregiver ? 'Caregiver / Staff Job Application' : 'Resident Care Admission Application'} to ${facility}. We have officially received your application along with all attached verification documents.
              </p>

              <!-- Application Summary Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td width="38%" style="color: #64748b; font-weight: 600;">Applicant Name:</td>
                        <td style="color: #0f172a; font-weight: 700;">${data.applicantName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">${isCaregiver ? 'Target Position:' : 'Care Program / Category:'}</td>
                        <td style="color: ${isCaregiver ? '#0d9488' : '#0284c7'}; font-weight: 700;">${data.positionOrCategory}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Applicant Email:</td>
                        <td style="color: #0f172a; font-family: monospace;">${data.email}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Phone Number:</td>
                        <td style="color: #0f172a;">${data.phone}</td>
                      </tr>
                      ${data.sponsorName ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Sponsor / Next of Kin:</td>
                        <td style="color: #0f172a;">${data.sponsorName}</td>
                      </tr>` : ''}
                      ${data.hasReceipt ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Payment Receipt:</td>
                        <td style="color: #16a34a; font-weight: 700;">✓ Attached (${data.receiptName || 'Bank Proof Verified'})</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Submission Status:</td>
                        <td style="color: #0d9488; font-weight: 700;">Under Review by Admissions</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next Steps -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 6px 0; color: #166534; font-size: 13px; font-weight: 700;">
                  What Happens Next?
                </h3>
                <p style="margin: 0; color: #15803d; font-size: 12px; line-height: 1.5;">
                  ${isCaregiver 
                    ? 'Our recruitment team will review your qualifications, experience, and references. Shortlisted candidates will be contacted for an interview within 24 to 48 hours.'
                    : 'Our clinical assessment team and admissions officer will review the medical care history and confirm accommodation suite availability. A representative will contact the sponsor promptly.'}
                </p>
              </div>

              <p style="margin: 0; color: #64748b; font-size: 12px;">
                If you have any questions or need to make adjustments to your application, please reach out to us at <strong>samanthasappy@gmail.com</strong> or call <strong>+234 706 933 2193</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <p style="margin: 0 0 4px 0; color: #64748b; font-size: 12px; font-weight: 600;">
                ${facility}
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                samanthasappy@gmail.com | +234 706 933 2193
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Dear ${data.applicantName},

Thank you for submitting your ${isCaregiver ? 'Caregiver / Staff Job Application' : 'Resident Care Admission Application'} to ${facility}.

Application Summary:
- Applicant Name: ${data.applicantName}
- ${isCaregiver ? 'Position Applied For' : 'Care Category'}: ${data.positionOrCategory}
- Email: ${data.email}
- Phone: ${data.phone}
${data.sponsorName ? `- Sponsor / Next of Kin: ${data.sponsorName}\n` : ''}
${data.hasReceipt ? `- Payment Receipt: Attached (${data.receiptName || 'Bank Proof'})\n` : ''}
- Status: Under Review by Admissions Board

Our team will review your submission and contact you within 24-48 hours.

Best regards,
${facility} Admissions & Recruitment Team
samanthasappy@gmail.com | +234 706 933 2193
`;

  return { subject, html, text };
}

export function generateAdminNewApplicationNotificationEmail(data: {
  applicantName: string;
  email: string;
  phone: string;
  appType: 'caregiver' | 'resident';
  positionOrCategory: string;
  notes?: string;
  hasReceipt: boolean;
  receiptName?: string;
  sponsorName?: string;
  referencesCount?: number;
  date?: string;
  facilityName?: string;
}): { subject: string; html: string; text: string } {
  const facility = data.facilityName || 'Samantha Sappy Care Home';
  const isCaregiver = data.appType === 'caregiver';
  const dateStr = data.date || new Date().toISOString().replace('T', ' ').slice(0, 16);
  const subject = `📥 [Admin Alert] New ${isCaregiver ? 'Caregiver Job Application' : 'Resident Care Admission'}: ${data.applicantName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; background-color: #f59e0b; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">
                New Form Submission
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800;">
                New ${isCaregiver ? 'Job Application' : 'Resident Admission'}
              </h1>
              <p style="margin: 4px 0 0 0; color: #cbd5e1; font-size: 13px;">
                Submitted via Care Portal Applications
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px;">
              <p style="margin: 0 0 16px 0; color: #334155; font-size: 14px;">
                A new web application has been submitted through the Care Portal. An email receipt confirmation has been automatically sent to the applicant.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td width="38%" style="color: #64748b; font-weight: 600;">Applicant Full Name:</td>
                        <td style="color: #0f172a; font-weight: 700; font-size: 14px;">${data.applicantName}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Application Type:</td>
                        <td style="color: #0f172a; font-weight: 600;">${isCaregiver ? 'Caregiver / Staff Job Application' : 'Resident Care Admission'}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">${isCaregiver ? 'Target Role:' : 'Care Category:'}</td>
                        <td style="color: #0d9488; font-weight: 700;">${data.positionOrCategory}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Email:</td>
                        <td style="color: #0f172a; font-family: monospace;">${data.email}</td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Phone:</td>
                        <td style="color: #0f172a;">${data.phone}</td>
                      </tr>
                      ${data.sponsorName ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Sponsor / Next of Kin:</td>
                        <td style="color: #0f172a;">${data.sponsorName}</td>
                      </tr>` : ''}
                      ${data.notes ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Notes / Experience:</td>
                        <td style="color: #334155;">${data.notes}</td>
                      </tr>` : ''}
                      ${data.hasReceipt ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Payment Receipt:</td>
                        <td style="color: #16a34a; font-weight: 700;">Attached (${data.receiptName || 'Bank Slip'})</td>
                      </tr>` : ''}
                      ${data.referencesCount !== undefined ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">References / Guarantors:</td>
                        <td style="color: #0f172a;">${data.referencesCount} document(s) uploaded</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Submitted Time:</td>
                        <td style="color: #64748b;">${dateStr}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #64748b; font-size: 12px;">
                You can review, approve, or manage this application in your Admin Dashboard Inbox and Applications tab.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
[Admin Alert] New ${isCaregiver ? 'Job Application' : 'Resident Admission'}: ${data.applicantName}

Applicant Details:
- Name: ${data.applicantName}
- Type: ${isCaregiver ? 'Caregiver / Staff Job Application' : 'Resident Care Admission'}
- Position / Category: ${data.positionOrCategory}
- Email: ${data.email}
- Phone: ${data.phone}
${data.sponsorName ? `- Sponsor / Next of Kin: ${data.sponsorName}\n` : ''}
${data.notes ? `- Notes / Experience: ${data.notes}\n` : ''}
${data.hasReceipt ? `- Payment Receipt: Attached (${data.receiptName || 'Bank Slip'})\n` : ''}
- Date: ${dateStr}

An automatic confirmation receipt has been emailed to ${data.email}.
`;

  return { subject, html, text };
}

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

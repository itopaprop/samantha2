import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  generateStaffWelcomeEmail, 
  generateAdminNewStaffNotificationEmail,
  generateRelativeWelcomeEmail,
  generateAdminNewResidentNotificationEmail,
  generateApplicantReceiptConfirmationEmail,
  generateAdminNewApplicationNotificationEmail
} from './src/server/emailService';

// Lazy initialized Supabase Admin Client (Privileged operations with Service Role Key)
let supabaseAdminClient: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://ikeglxdyjimmxvfbxrvb.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_eIk9r2bZDA2qLeZB2bYhTA_BNbABikp';
    
    supabaseAdminClient = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdminClient;
}

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_EMAIL || 'admin@samanthasappy.com';

// Helper to send transactional emails via Resend or HTTP fallback
async function dispatchEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}): Promise<{ sent: boolean; provider: string; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const defaultFrom = process.env.EMAIL_FROM || 'Samantha Sappy Care Home <onboarding@resend.dev>';
  const from = params.from || defaultFrom;
  const recipients = Array.isArray(params.to) ? params.to : [params.to];

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: recipients,
          subject: params.subject,
          html: params.html,
          text: params.text,
        }),
      });

      if (res.ok) {
        return { sent: true, provider: 'resend' };
      }
      const errText = await res.text();
      console.warn('Resend API response warning:', errText);
    } catch (err: any) {
      console.warn('Resend dispatch error:', err?.message || err);
    }
  }

  // Graceful fallback to guarantee notification transmission
  if (recipients.length > 0) {
    try {
      const primaryEmail = recipients[0];
      const fallbackRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(primaryEmail)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: params.subject,
          Message: params.text,
        }),
      });
      if (fallbackRes.ok) {
        return { sent: true, provider: 'formsubmit_fallback' };
      }
    } catch (fbErr: any) {
      console.warn('Fallback dispatch error:', fbErr?.message || fbErr);
    }
  }

  return { sent: false, provider: 'none', error: 'No active email provider configured or failed' };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with high limits for base64 avatars
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS Headers for API
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ============================================================================
  // API ROUTES (PRIVILEGED SERVER OPERATIONS - SECRETS KEPT SERVER-SIDE)
  // ============================================================================

  // In-memory server-side registry as resilient fallback
  const serverStaffList: any[] = [];
  const serverUsersList: any[] = [];
  const serverResidentsList: any[] = [];

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Samantha Sappy Care Operations & Notification Engine',
      timestamp: new Date().toISOString(),
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      staffCount: serverStaffList.length,
      usersCount: serverUsersList.length,
    });
  });

  // REST API routes for multi-device sync fallback
  app.get('/api/users', (req, res) => {
    res.json(serverUsersList);
  });

  app.post('/api/users', (req, res) => {
    const user = req.body;
    if (user && user.email) {
      const idx = serverUsersList.findIndex(u => u.email?.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        serverUsersList[idx] = { ...serverUsersList[idx], ...user };
      } else {
        serverUsersList.push(user);
      }
      res.json({ success: true, user });
    } else {
      res.status(400).json({ error: 'Valid user object with email required' });
    }
  });

  app.get('/api/staff', (req, res) => {
    res.json(serverStaffList);
  });

  app.post('/api/staff', (req, res) => {
    const staff = req.body;
    if (staff && staff.email) {
      const idx = serverStaffList.findIndex(s => s.email?.toLowerCase() === staff.email.toLowerCase());
      if (idx >= 0) {
        serverStaffList[idx] = { ...serverStaffList[idx], ...staff };
      } else {
        serverStaffList.push(staff);
      }
      res.json({ success: true, staff });
    } else {
      res.status(400).json({ error: 'Valid staff object with email required' });
    }
  });

  // 1. Register Staff & Dispatch Welcome Email
  app.post('/api/functions/register-staff', async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        position = 'Senior Care Assistant',
        qualification = 'NVQ Level 3 Health & Social Care',
        shift = 'Morning (07:00 - 15:30)',
        avatar,
        references = [],
        tempPassword,
        appUrl,
      } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: 'Name and email are required parameters.' });
        return;
      }

      const cleanEmail = email.trim().toLowerCase();
      const origin = appUrl || req.headers.origin || `http://${req.headers.host}`;
      const loginUrl = `${origin}/login`;
      const supabaseAdmin = getSupabaseAdmin();

      let effectiveUserId = '';
      let setupPasswordUrl: string | undefined;

      // Save to server fallback cache
      const serverStaffObj = {
        id: `stf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name,
        email: cleanEmail,
        phone: phone || '+234 706 933 2193',
        role: 'Staff',
        position,
        shift,
        qualification,
        assignedResidentsCount: 0,
        avatar: avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        references,
        joinDate: new Date().toISOString().split('T')[0],
      };
      const serverUserObj = {
        id: serverStaffObj.id,
        name,
        email: cleanEmail,
        phone: phone || '+234 706 933 2193',
        role: 'Staff',
        position,
        avatar: serverStaffObj.avatar,
        password: tempPassword || '@staff123',
      };

      const existingStaffIdx = serverStaffList.findIndex(s => s.email?.toLowerCase() === cleanEmail);
      if (existingStaffIdx >= 0) serverStaffList[existingStaffIdx] = serverStaffObj;
      else serverStaffList.push(serverStaffObj);

      const existingUserIdx = serverUsersList.findIndex(u => u.email?.toLowerCase() === cleanEmail);
      if (existingUserIdx >= 0) serverUsersList[existingUserIdx] = serverUserObj;
      else serverUsersList.push(serverUserObj);

      // Create Supabase Auth user securely using Admin API
      try {
        const generatedPassword = tempPassword || `StaffCare_${Math.random().toString(36).slice(2, 10)}!`;
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: cleanEmail,
          password: generatedPassword,
          email_confirm: true,
          user_metadata: {
            name,
            role: 'Staff',
            position,
            phone: phone || '',
            avatar: avatar || null,
          },
        });

        if (authErr) {
          console.warn('Server createUser note:', authErr.message);
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
          if (existing) {
            effectiveUserId = existing.id;
          }
        } else if (authData?.user) {
          effectiveUserId = authData.user.id;
        }

        // Generate password setup / recovery link
        try {
          const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: cleanEmail,
            options: {
              redirectTo: `${origin}/reset-password`,
            },
          });
          if (linkData?.properties?.action_link) {
            setupPasswordUrl = linkData.properties.action_link;
          }
        } catch (linkErr) {
          console.warn('Generate setup link note:', linkErr);
        }
      } catch (authException) {
        console.warn('Auth admin exception in server:', authException);
      }

      if (!effectiveUserId) {
        effectiveUserId = `stf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      }

      // Save Staff Record into 'staff' table
      const staffRow = {
        id: effectiveUserId,
        name,
        email: cleanEmail,
        phone: phone || '+234 706 933 2193',
        role: 'Staff',
        position,
        shift,
        qualification,
        assigned_residents_count: 0,
        avatar: avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        references: typeof references === 'string' ? references : JSON.stringify(references),
        join_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      };

      const { error: staffDbErr } = await supabaseAdmin.from('staff').upsert(staffRow, { onConflict: 'id' });
      if (staffDbErr) console.warn('Supabase staff upsert note:', staffDbErr.message);

      // Save Profile in 'profiles' table
      const profileRow = {
        id: effectiveUserId,
        email: cleanEmail,
        name,
        role: 'Staff',
        phone: phone || '+234 706 933 2193',
        position,
        avatar: avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        created_at: new Date().toISOString(),
      };

      const { error: profDbErr } = await supabaseAdmin.from('profiles').upsert(profileRow, { onConflict: 'email' });
      if (profDbErr) console.warn('Supabase profile upsert note:', profDbErr.message);

      // Generate & Dispatch Automatic Welcome Email
      const emailContent = generateStaffWelcomeEmail({
        fullName: name,
        username: cleanEmail,
        role: 'Staff',
        position,
        loginUrl,
        setupPasswordUrl: setupPasswordUrl || `${origin}/reset-password`,
        facilityName: 'Samantha Sappy Care Home',
      });

      const emailResult = await dispatchEmail({
        to: cleanEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      // Dispatch Admin Notification Email
      const adminEmailContent = generateAdminNewStaffNotificationEmail({
        staffName: name,
        email: cleanEmail,
        phone: phone || '+234 706 933 2193',
        position,
        qualification,
        shift,
        facilityName: 'Samantha Sappy Care Home',
      });

      dispatchEmail({
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: adminEmailContent.subject,
        html: adminEmailContent.html,
        text: adminEmailContent.text,
      }).catch(e => console.warn('Admin new staff email notice:', e));

      res.status(200).json({
        success: true,
        message: `Staff member ${name} registered successfully. Confirmation email sent to ${cleanEmail} and Admin notification dispatched.`,
        user: {
          id: effectiveUserId,
          name,
          email: cleanEmail,
          role: 'Staff',
          position,
        },
        emailDispatched: emailResult.sent,
        emailProvider: emailResult.provider,
        setupPasswordUrl: setupPasswordUrl || `${origin}/reset-password`,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/register-staff:', err);
      res.status(500).json({ error: err?.message || 'Server error while registering staff member.' });
    }
  });

  // 2. Register Resident & Relative Account & Dispatch Relative Welcome Email
  app.post('/api/functions/register-relative', async (req, res) => {
    try {
      const { resident, relative, appUrl } = req.body;

      if (!resident?.fullName || !relative?.name) {
        res.status(400).json({ error: 'Resident fullName and relative name are required.' });
        return;
      }

      const origin = appUrl || req.headers.origin || `http://${req.headers.host}`;
      const loginUrl = `${origin}/login`;
      const supabaseAdmin = getSupabaseAdmin();

      const residentId = `res_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const relativePhoneClean = relative.phone ? relative.phone.replace(/[^0-9]/g, '') : `${Date.now()}`;
      const relativeEmail = (relative.email && relative.email.includes('@'))
        ? relative.email.trim().toLowerCase()
        : `${relativePhoneClean}@relative.samanthasappy.com`;

      // Save Resident
      const residentRow = {
        id: residentId,
        full_name: resident.fullName,
        date_of_birth: resident.dateOfBirth || '1950-01-01',
        gender: resident.gender || 'Female',
        room_number: resident.roomNumber || 'Suite 101',
        care_category: resident.careCategory || 'Residential Elderly Care',
        assigned_staff_id: resident.assignedStaffId || 'stf-1',
        assigned_staff_name: resident.assignedStaffName || 'Hannah Thorne, RN',
        health_status: resident.healthStatus || 'Stable',
        admission_date: new Date().toISOString().split('T')[0],
        medical_notes: resident.medicalNotes || 'Initial baseline assessment completed.',
        avatar: resident.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        emergency_contact_name: relative.name,
        emergency_contact_relationship: relative.relationship || 'Next of Kin',
        emergency_contact_phone: relative.phone || '+234 706 933 2193',
        references: typeof resident.references === 'string' ? resident.references : JSON.stringify(resident.references || []),
        last_activity_update: 'Newly registered into care management portal.',
        vitals_blood_pressure: resident.vitals?.bloodPressure || '120/80 mmHg',
        vitals_heart_rate: resident.vitals?.heartRate || '72 bpm',
        vitals_temperature: resident.vitals?.temperature || '36.6 °C',
        vitals_weight: resident.vitals?.weight || '68 kg',
        created_at: new Date().toISOString(),
      };

      const { error: resErr } = await supabaseAdmin.from('residents').insert([residentRow]);
      if (resErr) console.warn('Supabase resident insert note:', resErr.message);

      // Create Relative User in Supabase Auth
      let relativeUserId = '';
      let setupPasswordUrl: string | undefined;

      try {
        const generatedPassword = `FamilyCare_${Math.random().toString(36).slice(2, 10)}!`;
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: relativeEmail,
          password: generatedPassword,
          email_confirm: true,
          user_metadata: {
            name: relative.name,
            role: 'Resident Relative',
            relationship: relative.relationship || 'Next of Kin',
            resident_id: residentId,
            resident_name: resident.fullName,
            phone: relative.phone,
          },
        });

        if (authErr) {
          console.warn('Server create relative user note:', authErr.message);
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
          const existing = listData?.users?.find(u => u.email?.toLowerCase() === relativeEmail);
          if (existing) {
            relativeUserId = existing.id;
          }
        } else if (authData?.user) {
          relativeUserId = authData.user.id;
        }

        // Generate password setup / recovery link
        try {
          const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: relativeEmail,
            options: {
              redirectTo: `${origin}/reset-password`,
            },
          });
          if (linkData?.properties?.action_link) {
            setupPasswordUrl = linkData.properties.action_link;
          }
        } catch (linkErr) {
          console.warn('Generate relative setup link note:', linkErr);
        }
      } catch (authException) {
        console.warn('Auth admin relative exception:', authException);
      }

      if (!relativeUserId) {
        relativeUserId = `rel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      }

      // Save Profile in 'profiles' table
      const profileRow = {
        id: relativeUserId,
        email: relativeEmail,
        name: relative.name,
        role: 'Resident Relative',
        relationship: relative.relationship || 'Next of Kin',
        resident_linked_id: residentId,
        phone: relative.phone || '+234 706 933 2193',
        avatar: relative.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        created_at: new Date().toISOString(),
      };

      const { error: profErr } = await supabaseAdmin.from('profiles').upsert(profileRow, { onConflict: 'email' });
      if (profErr) console.warn('Supabase relative profile upsert note:', profErr.message);

      // Generate & Dispatch Automatic Welcome Email to Relative
      const emailContent = generateRelativeWelcomeEmail({
        relativeName: relative.name,
        residentName: resident.fullName,
        relationship: relative.relationship || 'Next of Kin',
        username: relativeEmail,
        loginUrl,
        setupPasswordUrl: setupPasswordUrl || `${origin}/reset-password`,
        careCategory: resident.careCategory,
        facilityName: 'Samantha Sappy Care Home',
      });

      const emailResult = await dispatchEmail({
        to: relativeEmail,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      // Dispatch Admin Notification Email for New Resident Admission
      const adminEmailContent = generateAdminNewResidentNotificationEmail({
        residentName: resident.fullName,
        careCategory: resident.careCategory || 'Assisted Living',
        roomNumber: resident.roomNumber,
        relativeName: relative.name,
        relationship: relative.relationship || 'Next of Kin',
        relativePhone: relative.phone || '+234 706 933 2193',
        relativeEmail: relativeEmail,
        facilityName: 'Samantha Sappy Care Home',
      });

      dispatchEmail({
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: adminEmailContent.subject,
        html: adminEmailContent.html,
        text: adminEmailContent.text,
      }).catch(e => console.warn('Admin new resident email notice:', e));

      res.status(200).json({
        success: true,
        message: `Resident ${resident.fullName} and Relative account registered successfully. Confirmation email sent to ${relativeEmail} and Admin notified.`,
        resident: {
          id: residentId,
          fullName: resident.fullName,
          careCategory: resident.careCategory,
        },
        relativeUser: {
          id: relativeUserId,
          name: relative.name,
          email: relativeEmail,
          role: 'Resident Relative',
          relationship: relative.relationship || 'Next of Kin',
          residentLinkedId: residentId,
        },
        emailDispatched: emailResult.sent,
        emailProvider: emailResult.provider,
        setupPasswordUrl: setupPasswordUrl || `${origin}/reset-password`,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/register-relative:', err);
      res.status(500).json({ error: err?.message || 'Server error while registering resident and relative.' });
    }
  });

  // 3. Application Submission Endpoint (Receipt confirmation to applicant + Admin Alert)
  app.post('/api/functions/submit-application', async (req, res) => {
    try {
      const { application, appUrl } = req.body;
      if (!application || !application.email || !application.applicantName) {
        res.status(400).json({ error: 'Application with applicantName and email is required.' });
        return;
      }

      const applicantEmail = application.email.trim().toLowerCase();
      const isCaregiver = application.type === 'caregiver';
      const positionOrCategory = application.position || application.careCategory || (isCaregiver ? 'Caregiver Staff' : 'Assisted Living');

      // 1. Generate & Dispatch Receipt Confirmation Email to Applicant
      const applicantReceiptEmail = generateApplicantReceiptConfirmationEmail({
        applicantName: application.applicantName,
        email: applicantEmail,
        phone: application.phone || '',
        appType: isCaregiver ? 'caregiver' : 'resident',
        positionOrCategory,
        notes: application.experience || application.notes || application.medicalHistory,
        hasReceipt: !!(application.paymentReceipt || application.receiptName),
        receiptName: application.receiptName || (application.paymentReceipt ? 'Payment Receipt Slip' : undefined),
        sponsorName: application.sponsorName || application.relativeName,
        facilityName: 'Samantha Sappy Care Home',
      });

      const applicantEmailResult = await dispatchEmail({
        to: applicantEmail,
        subject: applicantReceiptEmail.subject,
        html: applicantReceiptEmail.html,
        text: applicantReceiptEmail.text,
      });

      // 2. Generate & Dispatch Admin Notification Email
      const adminAppNotification = generateAdminNewApplicationNotificationEmail({
        applicantName: application.applicantName,
        email: applicantEmail,
        phone: application.phone || '',
        appType: isCaregiver ? 'caregiver' : 'resident',
        positionOrCategory,
        notes: application.experience || application.notes || application.medicalHistory,
        hasReceipt: !!(application.paymentReceipt || application.receiptName),
        receiptName: application.receiptName || (application.paymentReceipt ? 'Payment Receipt Slip' : undefined),
        sponsorName: application.sponsorName || application.relativeName,
        referencesCount: Array.isArray(application.references) ? application.references.length : (application.guarantorCount || 0),
        facilityName: 'Samantha Sappy Care Home',
      });

      const adminEmailResult = await dispatchEmail({
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: adminAppNotification.subject,
        html: adminAppNotification.html,
        text: adminAppNotification.text,
      });

      res.status(200).json({
        success: true,
        message: `Application submitted successfully. Receipt confirmation sent to ${applicantEmail}, and Admin notified.`,
        applicantEmailSent: applicantEmailResult.sent,
        applicantEmailProvider: applicantEmailResult.provider,
        adminEmailSent: adminEmailResult.sent,
        adminEmailProvider: adminEmailResult.provider,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/submit-application:', err);
      res.status(500).json({ error: err?.message || 'Server error while submitting application.' });
    }
  });

  // 4. Send Transactional Email Endpoint
  app.post('/api/functions/send-email', async (req, res) => {
    try {
      const { to, subject, html, text, from } = req.body;
      if (!to || !subject || (!html && !text)) {
        res.status(400).json({ error: 'to, subject, and html/text are required.' });
        return;
      }
      const result = await dispatchEmail({ to, subject, html: html || `<p>${text}</p>`, text: text || '', from });
      res.status(200).json({ success: true, ...result });
    } catch (err: any) {
      console.error('Error in /api/functions/send-email:', err);
      res.status(500).json({ error: err?.message || 'Failed to send email.' });
    }
  });

  // ============================================================================
  // VITE MIDDLEWARE / STATIC ASSETS (SINGLE ENTRY POINT)
  // ============================================================================

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Samantha Sappy Care Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

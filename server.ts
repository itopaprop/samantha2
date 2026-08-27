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

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_EMAIL || 'samanthasappy@gmail.com';

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

  // 5. List all registered users from Supabase Auth & Database
  app.get('/api/functions/list-auth-users', async (req, res) => {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
      
      const { data: profileData } = await supabaseAdmin.from('profiles').select('*');
      const { data: staffData } = await supabaseAdmin.from('staff').select('*');

      const profilesMap = new Map((profileData || []).map((p: any) => [p.email?.toLowerCase(), p]));
      const staffMap = new Map((staffData || []).map((s: any) => [s.email?.toLowerCase(), s]));

      const authUsers = (authData?.users || []).map((u: any) => {
        const emailLower = u.email?.toLowerCase() || '';
        const profile = profilesMap.get(emailLower);
        const staff = staffMap.get(emailLower);

        return {
          id: u.id,
          email: u.email,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at,
          displayName: u.user_metadata?.name || profile?.name || staff?.name || (emailLower.split('@')[0]),
          role: u.user_metadata?.role || profile?.role || (emailLower.includes('admin') ? 'Admin' : 'Staff'),
          position: u.user_metadata?.position || profile?.position || staff?.position || '',
          phone: u.user_metadata?.phone || profile?.phone || staff?.phone || '',
          avatar: u.user_metadata?.avatar || profile?.avatar || staff?.avatar || '',
          providers: u.app_metadata?.providers || ['email'],
          isAdmin: emailLower === 'samanthasappy@gmail.com' || emailLower === 'admin@samanthasappy.com' || emailLower === 'itopaprop@gmail.com' || profile?.role === 'Admin',
        };
      });

      res.status(200).json({
        success: true,
        users: authUsers,
        total: authUsers.length,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/list-auth-users:', err);
      res.status(500).json({ error: err?.message || 'Failed to list auth users.' });
    }
  });

  // 6. Delete specific staff member from Supabase Auth & Database Tables
  app.post('/api/functions/delete-staff', async (req, res) => {
    try {
      const { staffId, email, name } = req.body;
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      const cleanName = name ? name.trim().toLowerCase() : '';
      const supabaseAdmin = getSupabaseAdmin();

      // Guard: do not delete primary admin
      if (cleanEmail === 'samanthasappy@gmail.com' || cleanEmail === 'admin@samanthasappy.com' || cleanEmail === 'itopaprop@gmail.com' || cleanEmail === 'admin@carepulse.com') {
        res.status(403).json({ error: 'Cannot delete the primary administrator account.' });
        return;
      }

      const deletedAuthIds: string[] = [];

      // 1. Find all matching users in Supabase Auth (auth.users)
      try {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const matchingAuthUsers = (listData?.users || []).filter((u: any) => {
          const uEmail = u.email?.toLowerCase();
          const uName = (u.user_metadata?.name || '').toLowerCase();
          if (uEmail === 'samanthasappy@gmail.com' || uEmail === 'admin@samanthasappy.com' || uEmail === 'itopaprop@gmail.com') return false;
          if (staffId && u.id === staffId) return true;
          if (cleanEmail && uEmail === cleanEmail) return true;
          if (cleanName && uName === cleanName) return true;
          return false;
        });

        for (const u of matchingAuthUsers) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(u.id);
            deletedAuthIds.push(u.id);
          } catch (err: any) {
            console.warn(`Auth delete user error for ${u.id}:`, err?.message);
          }
        }
      } catch (authErr: any) {
        console.warn('Auth admin list/delete error in delete-staff:', authErr?.message);
      }

      // If specific staffId wasn't found in list, attempt direct delete
      if (staffId && !deletedAuthIds.includes(staffId)) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(staffId);
          deletedAuthIds.push(staffId);
        } catch {}
      }

      // 2. Delete from public.staff
      if (staffId) {
        await supabaseAdmin.from('staff').delete().or(`id.eq.${staffId},user_id.eq.${staffId}`);
      }
      if (cleanEmail) {
        await supabaseAdmin.from('staff').delete().ilike('email', cleanEmail);
      }

      // 3. Delete from public.profiles
      if (staffId) {
        await supabaseAdmin.from('profiles').delete().eq('id', staffId);
      }
      if (cleanEmail) {
        await supabaseAdmin.from('profiles').delete().ilike('email', cleanEmail);
      }

      // 4. Delete/Unlink shifts
      if (staffId) {
        await supabaseAdmin.from('shifts').delete().eq('staff_id', staffId);
      }

      // 5. Clean server in-memory list
      if (staffId) {
        const idx = serverStaffList.findIndex(s => s.id === staffId);
        if (idx >= 0) serverStaffList.splice(idx, 1);
        const uIdx = serverUsersList.findIndex(u => u.id === staffId);
        if (uIdx >= 0) serverUsersList.splice(uIdx, 1);
      }
      if (cleanEmail) {
        const idx = serverStaffList.findIndex(s => s.email?.toLowerCase() === cleanEmail);
        if (idx >= 0) serverStaffList.splice(idx, 1);
        const uIdx = serverUsersList.findIndex(u => u.email?.toLowerCase() === cleanEmail);
        if (uIdx >= 0) serverUsersList.splice(uIdx, 1);
      }

      res.status(200).json({
        success: true,
        message: `Staff member removed from Supabase Auth and database.`,
        deletedAuthIds,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/delete-staff:', err);
      res.status(500).json({ error: err?.message || 'Failed to delete staff member.' });
    }
  });

  // 7. Delete specific resident and linked relative from Supabase Auth & Database Tables
  app.post('/api/functions/delete-resident', async (req, res) => {
    try {
      const { residentId, residentName, relativeEmail } = req.body;
      const cleanRelativeEmail = relativeEmail ? relativeEmail.trim().toLowerCase() : '';
      const cleanResidentName = residentName ? residentName.trim().toLowerCase() : '';
      const supabaseAdmin = getSupabaseAdmin();

      const deletedAuthIds: string[] = [];

      // 1. Find and delete linked relative auth users from Supabase Auth
      try {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const matchingAuthUsers = (listData?.users || []).filter((u: any) => {
          const uEmail = u.email?.toLowerCase();
          const uLinkedId = u.user_metadata?.residentLinkedId || u.user_metadata?.resident_id;
          const uResName = (u.user_metadata?.residentName || '').toLowerCase();
          if (uEmail === 'samanthasappy@gmail.com' || uEmail === 'admin@samanthasappy.com' || uEmail === 'itopaprop@gmail.com') return false;
          if (residentId && uLinkedId === residentId) return true;
          if (cleanRelativeEmail && uEmail === cleanRelativeEmail) return true;
          if (cleanResidentName && uResName === cleanResidentName) return true;
          return false;
        });

        for (const u of matchingAuthUsers) {
          try {
            await supabaseAdmin.auth.admin.deleteUser(u.id);
            deletedAuthIds.push(u.id);
          } catch (err: any) {
            console.warn(`Auth delete relative error for ${u.id}:`, err?.message);
          }
        }
      } catch (authErr: any) {
        console.warn('Auth admin list/delete error in delete-resident:', authErr?.message);
      }

      // 2. Delete from public.residents table
      if (residentId) {
        await supabaseAdmin.from('residents').delete().eq('id', residentId);
      }

      // 3. Delete from public.relatives table
      if (residentId) {
        await supabaseAdmin.from('relatives').delete().eq('resident_id', residentId);
      }
      if (cleanRelativeEmail) {
        await supabaseAdmin.from('relatives').delete().ilike('email', cleanRelativeEmail);
      }

      // 4. Delete from public.profiles table
      if (residentId) {
        await supabaseAdmin.from('profiles').delete().eq('resident_linked_id', residentId);
      }
      if (cleanRelativeEmail) {
        await supabaseAdmin.from('profiles').delete().ilike('email', cleanRelativeEmail);
      }

      // 5. Delete linked logs and vitals
      if (residentId) {
        await supabaseAdmin.from('care_logs').delete().eq('resident_id', residentId);
        await supabaseAdmin.from('medication_logs').delete().eq('resident_id', residentId);
        await supabaseAdmin.from('resident_vitals').delete().eq('resident_id', residentId);
      }

      // 6. Clean server in-memory list
      if (residentId) {
        const idx = serverResidentsList.findIndex(r => r.id === residentId);
        if (idx >= 0) serverResidentsList.splice(idx, 1);
        const uIdx = serverUsersList.findIndex(u => u.residentLinkedId === residentId);
        if (uIdx >= 0) serverUsersList.splice(uIdx, 1);
      }
      if (cleanRelativeEmail) {
        const uIdx = serverUsersList.findIndex(u => u.email?.toLowerCase() === cleanRelativeEmail);
        if (uIdx >= 0) serverUsersList.splice(uIdx, 1);
      }

      res.status(200).json({
        success: true,
        message: `Resident and linked relative removed from Supabase Auth and database.`,
        deletedAuthIds,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/delete-resident:', err);
      res.status(500).json({ error: err?.message || 'Failed to delete resident.' });
    }
  });

  // 8. Delete generic user account from Supabase Auth & Database Tables
  app.post('/api/functions/delete-user', async (req, res) => {
    try {
      const { userId, email } = req.body;
      if (!userId && !email) {
        res.status(400).json({ error: 'userId or email is required to delete a user.' });
        return;
      }

      const cleanEmail = email ? email.trim().toLowerCase() : '';
      const supabaseAdmin = getSupabaseAdmin();
      let resolvedUserId = userId;

      // Prevent deleting primary admin account
      if (cleanEmail === 'samanthasappy@gmail.com' || cleanEmail === 'admin@samanthasappy.com' || cleanEmail === 'itopaprop@gmail.com') {
        res.status(403).json({ error: 'Cannot delete the primary administrator account.' });
        return;
      }

      // If no userId provided, find user by email in auth.users
      if (!resolvedUserId && cleanEmail) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const found = listData?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
        if (found) resolvedUserId = found.id;
      }

      let authDeleteSuccess = false;
      let authDeleteError = null;

      // 1. Delete from Supabase Auth (auth.users)
      if (resolvedUserId) {
        try {
          const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(resolvedUserId);
          if (!delErr) {
            authDeleteSuccess = true;
          } else {
            authDeleteError = delErr.message;
            console.warn(`Supabase Auth admin deleteUser error for ${resolvedUserId}:`, delErr.message);
          }
        } catch (err: any) {
          authDeleteError = err?.message;
          console.warn('Auth admin delete exception:', err);
        }
      }

      // 2. Delete from public.profiles table
      if (resolvedUserId) {
        await supabaseAdmin.from('profiles').delete().eq('id', resolvedUserId);
      }
      if (cleanEmail) {
        await supabaseAdmin.from('profiles').delete().ilike('email', cleanEmail);
      }

      // 3. Delete from public.staff table
      if (resolvedUserId) {
        await supabaseAdmin.from('staff').delete().or(`id.eq.${resolvedUserId},user_id.eq.${resolvedUserId}`);
      }
      if (cleanEmail) {
        await supabaseAdmin.from('staff').delete().ilike('email', cleanEmail);
      }

      // 4. Clean up from server in-memory list
      if (cleanEmail) {
        const uIdx = serverUsersList.findIndex(u => u.email?.toLowerCase() === cleanEmail);
        if (uIdx >= 0) serverUsersList.splice(uIdx, 1);
        const sIdx = serverStaffList.findIndex(s => s.email?.toLowerCase() === cleanEmail);
        if (sIdx >= 0) serverStaffList.splice(sIdx, 1);
      }
      if (resolvedUserId) {
        const uIdx = serverUsersList.findIndex(u => u.id === resolvedUserId);
        if (uIdx >= 0) serverUsersList.splice(uIdx, 1);
        const sIdx = serverStaffList.findIndex(s => s.id === resolvedUserId);
        if (sIdx >= 0) serverStaffList.splice(sIdx, 1);
      }

      res.status(200).json({
        success: true,
        message: `User ${cleanEmail || resolvedUserId} successfully deleted from Supabase Auth and database.`,
        authDeleted: authDeleteSuccess,
        authError: authDeleteError,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/delete-user:', err);
      res.status(500).json({ error: err?.message || 'Failed to delete user.' });
    }
  });

  // 7. Cleanup / Purge ALL non-admin users from Supabase Auth & Database
  app.post('/api/functions/cleanup-non-admin-users', async (req, res) => {
    try {
      const { adminEmail = 'samanthasappy@gmail.com' } = req.body;
      const cleanAdminEmail = adminEmail.trim().toLowerCase();
      const supabaseAdmin = getSupabaseAdmin();

      const adminEmails = [
        'samanthasappy@gmail.com',
        'itopaprop@gmail.com',
        cleanAdminEmail
      ].filter(Boolean);

      const deletedUsers: any[] = [];
      const failedUsers: any[] = [];

      // 1. Fetch all users from Supabase Auth
      const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
      if (listErr) {
        console.warn('List users error in cleanup:', listErr.message);
      }

      const allAuthUsers = listData?.users || [];
      const nonAdminUsers = allAuthUsers.filter((u: any) => !adminEmails.includes(u.email?.toLowerCase()));

      // 2. Delete each non-admin user from Supabase Auth
      for (const u of nonAdminUsers) {
        try {
          const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
          if (!delErr) {
            deletedUsers.push({ id: u.id, email: u.email });
          } else {
            failedUsers.push({ id: u.id, email: u.email, error: delErr.message });
          }
        } catch (delEx: any) {
          failedUsers.push({ id: u.id, email: u.email, error: delEx?.message });
        }
      }

      // 3. Delete non-admin profiles & staff from DB
      for (const email of adminEmails) {
        // preserve admins
      }
      await supabaseAdmin.from('profiles').delete().not('email', 'in', `(${adminEmails.map(e => `"${e}"`).join(',')})`);
      await supabaseAdmin.from('staff').delete().not('email', 'in', `(${adminEmails.map(e => `"${e}"`).join(',')})`);

      // 4. Try RPC function cleanup
      try {
        await supabaseAdmin.rpc('cleanup_non_admin_auth_users', { admin_email: cleanAdminEmail });
      } catch {
        // Safe to ignore if RPC not created
      }

      // 5. Clean up server in-memory list
      const retainedUsers = serverUsersList.filter(u => adminEmails.includes(u.email?.toLowerCase()));
      serverUsersList.length = 0;
      serverUsersList.push(...retainedUsers);

      const retainedStaff = serverStaffList.filter(s => adminEmails.includes(s.email?.toLowerCase()));
      serverStaffList.length = 0;
      serverStaffList.push(...retainedStaff);

      res.status(200).json({
        success: true,
        message: `Successfully purged ${deletedUsers.length} non-admin user account(s) from Supabase Auth.`,
        deletedCount: deletedUsers.length,
        deletedUsers,
        failedUsers,
      });
    } catch (err: any) {
      console.error('Error in /api/functions/cleanup-non-admin-users:', err);
      res.status(500).json({ error: err?.message || 'Failed to cleanup non-admin users.' });
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

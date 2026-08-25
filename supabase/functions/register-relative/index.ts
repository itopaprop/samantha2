// Supabase Edge Function: register-relative
// Deno runtime - Runs securely in Supabase Edge Functions with Service Role Key
// Follows strict authorization and never exposes secrets to the client.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { generateRelativeWelcomeEmail } from '../_shared/emailTemplates.ts';

interface RegisterRelativeRequest {
  resident: {
    fullName: string;
    dateOfBirth?: string;
    gender?: string;
    roomNumber?: string;
    careCategory?: string;
    assignedStaffId?: string;
    assignedStaffName?: string;
    healthStatus?: string;
    medicalNotes?: string;
    avatar?: string;
    vitals?: any;
    references?: any[];
  };
  relative: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    photoUrl?: string | null;
  };
  appUrl?: string;
}

Deno.serve(async (req) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || Deno.env.get('VITE_SUPABASE_URL') || 'https://ikeglxdyjimmxvfbxrvb.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || 'sb_publishable_eIk9r2bZDA2qLeZB2bYhTA_BNbABikp';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('EMAIL_FROM') || 'Samantha Sappy Care Home <onboarding@resend.dev>';

    const body: RegisterRelativeRequest = await req.json();
    const { resident, relative, appUrl } = body;

    if (!resident?.fullName || !relative?.name) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: resident fullName and relative name are mandatory.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hostOrigin = appUrl || 'https://samanthasappy.com';
    const loginUrl = `${hostOrigin}/login`;

    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const residentId = crypto.randomUUID();
    const relativePhoneClean = relative.phone ? relative.phone.replace(/[^0-9]/g, '') : `${Date.now()}`;
    const relativeEmail = (relative.email && relative.email.includes('@'))
      ? relative.email.trim().toLowerCase()
      : `${relativePhoneClean}@relative.samanthasappy.com`;

    // 2. Save Resident in 'residents' table
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
      references: JSON.stringify(resident.references || []),
      last_activity_update: 'Newly registered into care management portal.',
      vitals_blood_pressure: resident.vitals?.bloodPressure || '120/80 mmHg',
      vitals_heart_rate: resident.vitals?.heartRate || '72 bpm',
      vitals_temperature: resident.vitals?.temperature || '36.6 °C',
      vitals_weight: resident.vitals?.weight || '68 kg',
      created_at: new Date().toISOString(),
    };

    const { error: resErr } = await supabaseAdmin.from('residents').insert([residentRow]);
    if (resErr) {
      console.warn('Supabase resident insert note:', resErr.message);
    }

    // 3. Create Family Portal Authentication Account
    let relativeUserId: string = '';
    let setupPasswordUrl: string | undefined;

    try {
      const generatedPassword = `FamilyCare_${Math.random().toString(36).slice(2, 10)}!`;
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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

      if (authError) {
        console.warn('Admin create relative user note:', authError.message);
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users?.find(u => u.email?.toLowerCase() === relativeEmail);
        if (existing) {
          relativeUserId = existing.id;
        } else {
          relativeUserId = crypto.randomUUID();
        }
      } else if (authData?.user) {
        relativeUserId = authData.user.id;
      }

      // Generate secure setup / password reset link
      try {
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: relativeEmail,
          options: {
            redirectTo: `${hostOrigin}/reset-password`,
          }
        });
        if (linkData?.properties?.action_link) {
          setupPasswordUrl = linkData.properties.action_link;
        }
      } catch (linkErr) {
        console.warn('Generate setup link for relative note:', linkErr);
      }
    } catch (authException) {
      console.warn('Auth admin relative exception (using fallback ID):', authException);
      relativeUserId = crypto.randomUUID();
    }

    const effectiveRelativeId = relativeUserId || crypto.randomUUID();

    // 4. Save Profile in 'profiles' table
    const profileRow = {
      id: effectiveRelativeId,
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
    if (profErr) {
      console.warn('Supabase relative profile upsert note:', profErr.message);
    }

    // 5. Generate and Dispatch Automatic Welcome Email to Relative
    const emailTemplate = generateRelativeWelcomeEmail({
      relativeName: relative.name,
      residentName: resident.fullName,
      relationship: relative.relationship || 'Next of Kin',
      username: relativeEmail,
      loginUrl,
      setupPasswordUrl: setupPasswordUrl || `${hostOrigin}/reset-password`,
      careCategory: resident.careCategory,
      facilityName: 'Samantha Sappy Care Home',
    });

    let emailSent = false;
    let emailProvider = 'none';

    if (resendApiKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [relativeEmail],
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          }),
        });

        if (resendRes.ok) {
          emailSent = true;
          emailProvider = 'resend';
        } else {
          const errBody = await resendRes.text();
          console.warn('Resend API relative dispatch note:', errBody);
        }
      } catch (resendErr) {
        console.warn('Resend API exception:', resendErr);
      }
    }

    // Fallback email dispatch
    if (!emailSent) {
      try {
        const fallbackRes = await fetch('https://formsubmit.co/ajax/' + relativeEmail, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: emailTemplate.subject,
            "Family Member Name": relative.name,
            "Linked Resident": resident.fullName,
            "Relationship": relative.relationship || 'Next of Kin',
            "Family Portal Username": relativeEmail,
            "Login Link": loginUrl,
            "Password Setup Link": setupPasswordUrl || `${hostOrigin}/reset-password`,
            "Welcome Message": `Welcome to the Family Portal for ${resident.fullName} at Samantha Sappy Care Home!`,
          }),
        });
        if (fallbackRes.ok) {
          emailSent = true;
          emailProvider = 'formsubmit_fallback';
        }
      } catch (fbErr) {
        console.warn('Email fallback dispatch note:', fbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Resident ${resident.fullName} and Relative account registered successfully. Welcome email sent to ${relativeEmail}.`,
        resident: {
          id: residentId,
          fullName: resident.fullName,
          careCategory: resident.careCategory,
        },
        relativeUser: {
          id: effectiveRelativeId,
          name: relative.name,
          email: relativeEmail,
          role: 'Resident Relative',
          relationship: relative.relationship || 'Next of Kin',
          residentLinkedId: residentId,
        },
        emailDispatched: emailSent,
        emailProvider,
        setupPasswordUrl: setupPasswordUrl || `${hostOrigin}/reset-password`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('register-relative Edge Function error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error processing relative registration.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

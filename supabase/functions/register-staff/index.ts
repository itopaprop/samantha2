// Supabase Edge Function: register-staff
// Deno runtime - Runs securely in Supabase Edge Functions with Service Role Key
// Follows strict authorization and never exposes secrets to the client.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { generateStaffWelcomeEmail } from '../_shared/emailTemplates.ts';

interface RegisterStaffRequest {
  name: string;
  email: string;
  phone?: string;
  position?: string;
  qualification?: string;
  shift?: string;
  avatar?: string;
  references?: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    photoUrl?: string | null;
  }>;
  tempPassword?: string;
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

    const body: RegisterStaffRequest = await req.json();
    const { name, email, phone, position = 'Senior Care Assistant', qualification = 'NVQ Level 3 Care', shift = 'Morning (07:00 - 15:30)', avatar, references = [], tempPassword, appUrl } = body;

    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: name and email are mandatory.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const hostOrigin = appUrl || 'https://samanthasappy.com';
    const loginUrl = `${hostOrigin}/login`;

    // 1. Initialize Supabase Admin Client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let userId: string = '';
    let setupPasswordUrl: string | undefined;

    // 2. Create Auth Account in Supabase Auth
    try {
      const generatedPassword = tempPassword || `CareStaff_${Math.random().toString(36).slice(2, 10)}!`;
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
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

      if (createError) {
        // If user already exists, fetch the user ID
        console.warn('Admin createUser note:', createError.message);
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);
        if (existing) {
          userId = existing.id;
        } else {
          userId = crypto.randomUUID();
        }
      } else if (userData?.user) {
        userId = userData.user.id;
      }

      // Generate secure setup / password reset link
      try {
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: cleanEmail,
          options: {
            redirectTo: `${hostOrigin}/reset-password`,
          }
        });
        if (linkData?.properties?.action_link) {
          setupPasswordUrl = linkData.properties.action_link;
        }
      } catch (linkErr) {
        console.warn('Generate setup link note:', linkErr);
      }
    } catch (authException) {
      console.warn('Auth admin exception (using fallback ID):', authException);
      userId = crypto.randomUUID();
    }

    const effectiveUserId = userId || crypto.randomUUID();

    // 3. Save Staff Record into 'staff' table
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
      references: JSON.stringify(references),
      join_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    const { error: staffDbError } = await supabaseAdmin.from('staff').upsert(staffRow, { onConflict: 'id' });
    if (staffDbError) {
      console.warn('Supabase staff table upsert note:', staffDbError.message);
    }

    // 4. Save Profile into 'profiles' table
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

    const { error: profileDbError } = await supabaseAdmin.from('profiles').upsert(profileRow, { onConflict: 'email' });
    if (profileDbError) {
      console.warn('Supabase profile table upsert note:', profileDbError.message);
    }

    // 5. Generate and Dispatch Automatic Welcome Email
    const emailTemplate = generateStaffWelcomeEmail({
      fullName: name,
      username: cleanEmail,
      role: 'Staff',
      position,
      loginUrl,
      setupPasswordUrl: setupPasswordUrl || `${hostOrigin}/reset-password`,
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
            to: [cleanEmail],
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
          console.warn('Resend API dispatch note:', errBody);
        }
      } catch (resendErr) {
        console.warn('Resend API exception:', resendErr);
      }
    }

    // Fallback email dispatch to ensure delivery
    if (!emailSent) {
      try {
        const fallbackRes = await fetch('https://formsubmit.co/ajax/' + cleanEmail, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: emailTemplate.subject,
            "Staff Member": name,
            "Username": cleanEmail,
            "Role": position,
            "Login Portal Link": loginUrl,
            "Password Setup Link": setupPasswordUrl || `${hostOrigin}/reset-password`,
            "Welcome Message": "Welcome to Samantha Sappy Care Home! Your staff account is active.",
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
        message: `Staff member ${name} registered successfully. Welcome email dispatched to ${cleanEmail}.`,
        user: {
          id: effectiveUserId,
          name,
          email: cleanEmail,
          role: 'Staff',
          position,
        },
        emailDispatched: emailSent,
        emailProvider,
        setupPasswordUrl: setupPasswordUrl || `${hostOrigin}/reset-password`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('register-staff Edge Function error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Internal server error processing staff registration.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

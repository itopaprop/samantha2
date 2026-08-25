// Supabase Edge Function: send-email
// Deno runtime - Dispatches transactional emails via Resend API or SMTP
// Never exposes API keys or secrets to the frontend.

import { corsHeaders } from '../_shared/cors.ts';

interface SendEmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const defaultFrom = Deno.env.get('EMAIL_FROM') || 'Samantha Sappy Care Home <onboarding@resend.dev>';

    const body: SendEmailRequest = await req.json();
    const { to, subject, html, text, from = defaultFrom } = body;

    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: to, subject, and body (html or text) are mandatory.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipients = Array.isArray(to) ? to : [to];
    let sent = false;
    let provider = 'none';

    if (resendApiKey) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: recipients,
          subject,
          html,
          text,
        }),
      });

      if (resendRes.ok) {
        sent = true;
        provider = 'resend';
      } else {
        const errorText = await resendRes.text();
        console.warn('Resend send email note:', errorText);
      }
    }

    // Fallback if needed
    if (!sent && recipients.length > 0) {
      try {
        const primaryRecipient = recipients[0];
        const fallbackRes = await fetch('https://formsubmit.co/ajax/' + primaryRecipient, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: subject,
            "Message": text || "Notification from Samantha Sappy Care Home",
          }),
        });
        if (fallbackRes.ok) {
          sent = true;
          provider = 'formsubmit_fallback';
        }
      } catch (fbErr) {
        console.warn('Fallback email note:', fbErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        provider,
        recipients,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('send-email error:', err);
    return new Response(
      JSON.stringify({ error: err?.message || 'Error sending email.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { supabase } from './supabase';

export interface RegisterStaffPayload {
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
    email?: string;
    photoUrl?: string | null;
  }>;
  tempPassword?: string;
}

export interface RegisterRelativePayload {
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
}

export interface EdgeFunctionResult<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  user?: T;
  resident?: any;
  relativeUser?: any;
  emailDispatched?: boolean;
  emailProvider?: string;
  setupPasswordUrl?: string;
}

/**
 * Invoke privileged Staff Registration Edge Function & Email Notification
 * Securely communicates with Edge Function or backend without exposing service keys.
 */
export async function invokeRegisterStaff(payload: RegisterStaffPayload): Promise<EdgeFunctionResult> {
  const appUrl = window.location.origin;
  const fullPayload = { ...payload, appUrl };

  // 1. Try Supabase Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke('register-staff', {
      body: fullPayload,
    });

    if (!error && data && data.success) {
      return data;
    }
  } catch (edgeErr) {
    console.info('Supabase Edge Function note (switching to server proxy):', edgeErr);
  }

  // 2. Fallback to full-stack server API endpoint
  try {
    const res = await fetch('/api/functions/register-staff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullPayload),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with ${res.status}`);
    }
  } catch (apiErr: any) {
    console.warn('API route fallback notice:', apiErr);
    return {
      success: false,
      error: apiErr?.message || 'Failed to complete staff registration via Edge Function.',
    };
  }
}

/**
 * Invoke privileged Resident & Relative Registration Edge Function & Email Notification
 * Securely creates family portal account and dispatches welcome email.
 */
export async function invokeRegisterRelative(payload: RegisterRelativePayload): Promise<EdgeFunctionResult> {
  const appUrl = window.location.origin;
  const fullPayload = { ...payload, appUrl };

  // 1. Try Supabase Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke('register-relative', {
      body: fullPayload,
    });

    if (!error && data && data.success) {
      return data;
    }
  } catch (edgeErr) {
    console.info('Supabase Edge Function note (switching to server proxy):', edgeErr);
  }

  // 2. Fallback to full-stack server API endpoint
  try {
    const res = await fetch('/api/functions/register-relative', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullPayload),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with ${res.status}`);
    }
  } catch (apiErr: any) {
    console.warn('API route fallback notice:', apiErr);
    return {
      success: false,
      error: apiErr?.message || 'Failed to complete resident & relative registration via Edge Function.',
    };
  }
}

/**
 * Send transactional email via Edge Function
 */
export async function invokeSendEmail(params: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      return await res.json();
    }
    return { success: false, error: `Failed to dispatch email (HTTP ${res.status})` };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error sending email' };
  }
}

/**
 * Invoke Application Submission Edge Function & Email Receipt Confirmation + Admin Notification
 */
export async function invokeSubmitApplication(application: any): Promise<EdgeFunctionResult> {
  const appUrl = window.location.origin;
  const fullPayload = { application, appUrl };

  try {
    const res = await fetch('/api/functions/submit-application', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errJson.error || `Server responded with status ${res.status}`,
      };
    }
  } catch (apiErr: any) {
    console.warn('Submit application API error:', apiErr);
    return {
      success: false,
      error: apiErr?.message || 'Failed to dispatch application notifications.',
    };
  }
}


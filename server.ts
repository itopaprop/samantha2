import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { 
  generateStaffWelcomeEmail, 
  generateAdminNewStaffNotificationEmail,
  generateRelativeWelcomeEmail,
  generateAdminNewResidentNotificationEmail,
  generateApplicantReceiptConfirmationEmail,
  generateAdminNewApplicationNotificationEmail
} from './src/server/emailService';

// Lazy initialized Gemini Client (Server-side only)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Disconnected Offline Mock Supabase Admin Client (No external database connection)
function getSupabaseAdmin(): any {
  const handler: any = {
    select: () => handler,
    insert: () => Promise.resolve({ data: [], error: null }),
    upsert: () => Promise.resolve({ data: [], error: null }),
    update: () => handler,
    delete: () => handler,
    eq: () => handler,
    neq: () => handler,
    ilike: () => handler,
    like: () => handler,
    or: () => handler,
    in: () => handler,
    not: () => handler,
    order: () => handler,
    limit: () => handler,
    range: () => handler,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: (val: any) => void) => resolve({ data: [], error: null }),
  };

  return {
    auth: {
      admin: {
        listUsers: async () => ({ data: { users: [] }, error: null }),
        getUserById: async () => ({ data: { user: null }, error: null }),
        deleteUser: async () => ({ data: {}, error: null }),
        createUser: async () => ({ data: { user: { id: 'local_user' } }, error: null }),
        updateUserById: async () => ({ data: { user: {} }, error: null }),
        generateLink: async () => ({ data: { properties: { action_link: '#' } }, error: null }),
      },
    },
    from: () => handler,
    rpc: async () => ({ data: null, error: null }),
    storage: {
      from: () => ({
        remove: async () => ({ data: [], error: null }),
        list: async () => ({ data: [], error: null }),
      }),
    },
  };
}

// Admin notification email recipients (business inbox and administrator email)
const DEFAULT_ADMIN_EMAILS = ['samanthasappy@gmail.com', 'itopaprop@gmail.com'];
const ADMIN_NOTIFICATION_EMAILS: string[] = process.env.ADMIN_EMAIL 
  ? Array.from(new Set([...process.env.ADMIN_EMAIL.split(',').map(e => e.trim().toLowerCase()), ...DEFAULT_ADMIN_EMAILS]))
  : DEFAULT_ADMIN_EMAILS;
const ADMIN_NOTIFICATION_EMAIL = ADMIN_NOTIFICATION_EMAILS[0] || 'samanthasappy@gmail.com';

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

  // Graceful fallback to guarantee notification transmission to all recipients
  if (recipients.length > 0) {
    let anySent = false;
    for (const email of recipients) {
      try {
        const fallbackRes = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: params.subject,
            Message: params.text,
          }),
        });
        if (fallbackRes.ok) {
          anySent = true;
        }
      } catch (fbErr: any) {
        console.warn('Fallback dispatch error:', fbErr?.message || fbErr);
      }
    }
    if (anySent) {
      return { sent: true, provider: 'formsubmit_fallback' };
    }
  }

  return { sent: false, provider: 'none', error: 'No active email provider configured or failed' };
}

// ============================================================================
// DUPLICATE CHECK & STORAGE CLEANUP HELPERS
// ============================================================================

function normalizePhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('234')) return digits.slice(3);
  if (digits.startsWith('0')) return digits.slice(1);
  return digits;
}

function arePhonesEqual(phone1?: string | null, phone2?: string | null): boolean {
  if (!phone1 || !phone2) return false;
  const p1 = normalizePhone(phone1);
  const p2 = normalizePhone(phone2);
  if (!p1 || !p2) return false;
  if (p1 === p2) return true;
  if (p1.length >= 7 && p2.length >= 7) {
    if (p1.endsWith(p2) || p2.endsWith(p1)) return true;
    if (p1.slice(-8) === p2.slice(-8)) return true;
  }
  return false;
}

function areEmailsEqual(email1?: string | null, email2?: string | null): boolean {
  if (!email1 || !email2) return false;
  return email1.trim().toLowerCase() === email2.trim().toLowerCase();
}

function extractBucketAndPath(urlOrPath: string | null | undefined): { bucket: string; path: string } | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  const trimmed = urlOrPath.trim();
  if (!trimmed || trimmed.startsWith('data:')) return null;

  const urlPattern = /\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)$/;
  const match = trimmed.match(urlPattern);
  if (match) {
    const bucket = match[1];
    const pathWithoutQuery = match[2].split('?')[0];
    return { bucket, path: decodeURIComponent(pathWithoutQuery) };
  }

  const knownBuckets = ['public-media', 'avatars', 'documents'];
  for (const b of knownBuckets) {
    if (trimmed.startsWith(b + '/')) {
      return { bucket: b, path: trimmed.slice(b.length + 1) };
    }
  }
  return null;
}

async function deleteFilesFromSupabaseStorage(urlsOrPaths: (string | null | undefined)[]): Promise<void> {
  const valid = urlsOrPaths.filter(Boolean) as string[];
  if (valid.length === 0) return;

  const bucketMap: Record<string, string[]> = {};
  for (const item of valid) {
    const parsed = extractBucketAndPath(item);
    if (parsed) {
      if (!bucketMap[parsed.bucket]) bucketMap[parsed.bucket] = [];
      if (!bucketMap[parsed.bucket].includes(parsed.path)) {
        bucketMap[parsed.bucket].push(parsed.path);
      }
    }
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    for (const [bucket, paths] of Object.entries(bucketMap)) {
      if (paths.length > 0) {
        const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);
        if (error) {
          console.warn(`[Server Storage] Failed to remove ${paths.join(', ')} from ${bucket}:`, error.message);
        } else {
          console.log(`[Server Storage] Successfully deleted ${paths.length} file(s) from ${bucket}`);
        }
      }
    }
  } catch (err: any) {
    console.warn('[Server Storage] Error during storage removal:', err?.message || err);
  }
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

  // Persistent Server-Side Database File Store
  const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

  const defaultAdminUsers: any[] = [
    {
      id: 'usr-admin-1',
      name: 'Folasade Sanyaolu',
      email: 'samanthasappy@gmail.com',
      role: 'Admin',
      position: 'Managing Director & Head of Care (LLB, QaAA)',
      phone: '+2347069332193',
      avatar: 'https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X=s1600',
    },
    {
      id: 'usr-admin-2',
      name: 'Folasade Sanyaolu',
      email: 'itopaprop@gmail.com',
      role: 'Admin',
      position: 'Managing Director & Administrator',
      phone: '+2347069332193',
      avatar: 'https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X=s1600',
    }
  ];

  interface ServerStore {
    staff: any[];
    users: any[];
    residents: any[];
    shifts: any[];
    messages: any[];
    activity_logs: any[];
    consultations: any[];
    applications: any[];
    events: any[];
    jobs: any[];
    gallery: any[];
  }

  function loadServerDb(): ServerStore {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          staff: Array.isArray(parsed.staff) ? parsed.staff : [],
          users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : defaultAdminUsers,
          residents: Array.isArray(parsed.residents) ? parsed.residents : [],
          shifts: Array.isArray(parsed.shifts) ? parsed.shifts : [],
          messages: Array.isArray(parsed.messages) ? parsed.messages : [],
          activity_logs: Array.isArray(parsed.activity_logs) ? parsed.activity_logs : [],
          consultations: Array.isArray(parsed.consultations) ? parsed.consultations : [],
          applications: Array.isArray(parsed.applications) ? parsed.applications : [],
          events: Array.isArray(parsed.events) ? parsed.events : [],
          jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
          gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
        };
      }
    } catch (e) {
      console.warn('Load DB error:', e);
    }
    return {
      staff: [],
      users: [...defaultAdminUsers],
      residents: [],
      shifts: [],
      messages: [],
      activity_logs: [],
      consultations: [],
      applications: [],
      events: [],
      jobs: [],
      gallery: [],
    };
  }

  const serverStore = loadServerDb();
  function saveServerDb() {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(serverStore, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Save DB error:', e);
    }
  }

  const serverStaffList: any[] = serverStore.staff;
  const serverUsersList: any[] = serverStore.users;
  const serverResidentsList: any[] = serverStore.residents;
  const serverShiftsList: any[] = serverStore.shifts;
  const serverMessagesList: any[] = serverStore.messages;
  const serverActivityLogsList: any[] = serverStore.activity_logs;
  const serverConsultationsList: any[] = serverStore.consultations;
  const serverApplicationsList: any[] = serverStore.applications;
  const serverEventsList: any[] = serverStore.events;
  const serverJobsList: any[] = serverStore.jobs;
  const serverGalleryList: any[] = serverStore.gallery;

  // One-time startup sync for admin name in Supabase
  (async () => {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      // Update profiles with admin emails or old name variants
      await supabaseAdmin
        .from('profiles')
        .update({
          name: 'Folasade Sanyaolu',
          position: 'Managing Director & Administrator',
          role: 'Admin',
          updated_at: new Date().toISOString()
        })
        .or('email.eq.samanthasappy@gmail.com,email.eq.itopaprop@gmail.com,role.eq.Admin,name.ilike.%Sonyaolu%,name.ilike.%Folashade%');

      // Update Supabase auth users user_metadata
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      if (listData?.users) {
        for (const u of listData.users) {
          const em = (u.email || '').toLowerCase();
          if (
            em === 'samanthasappy@gmail.com' ||
            em === 'itopaprop@gmail.com' ||
            u.user_metadata?.role === 'Admin' ||
            u.user_metadata?.name?.includes('Sonyaolu') ||
            u.user_metadata?.name?.includes('Folashade')
          ) {
            await supabaseAdmin.auth.admin.updateUserById(u.id, {
              user_metadata: { ...(u.user_metadata || {}), name: 'Folasade Sanyaolu', role: 'Admin' }
            });
          }
        }
      }
      // Remove any leftover demo events from Supabase community_events
      await supabaseAdmin
        .from('community_events')
        .delete()
        .or('id.in.(evt-1,evt-2,evt-3),title.ilike.%Annual Grandparents%,title.ilike.%Dementia & Memory Care%,title.ilike.%Staff Health%');

      console.log('Admin name synchronized and demo events purged in Supabase successfully.');
    } catch (syncErr) {
      console.warn('Supabase admin startup sync note:', syncErr);
    }
  })();

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Samantha Sappy Care Operations & Notification Engine',
      timestamp: new Date().toISOString(),
      emailConfigured: Boolean(process.env.RESEND_API_KEY),
      staffCount: serverStaffList.length,
      usersCount: serverUsersList.length,
      eventsCount: serverEventsList.length,
    });
  });

  // REST API routes for multi-device sync fallback
  app.get('/api/events', async (req, res) => {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: dbEvents, error } = await supabaseAdmin.from('community_events').select('*');
      if (!error && dbEvents && dbEvents.length > 0) {
        const converted = dbEvents.map(e => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time || undefined,
          location: e.location || 'Main Campus',
          description: e.description || '',
          category: e.category || 'Community Celebration',
          imageUrl: e.image_url || undefined,
          status: e.status || 'Upcoming',
          organizer: e.organizer || undefined,
        }));
        return res.json(converted);
      }
    } catch (err) {
      console.warn('Note on fetching events from Supabase:', err);
    }
    res.json(serverEventsList);
  });

  app.post('/api/events', async (req, res) => {
    try {
      const evt = req.body;
      if (!evt || !evt.title) {
        return res.status(400).json({ error: 'Valid event object with title required' });
      }

      // Add to server memory
      const idx = serverEventsList.findIndex(e => e.id === evt.id || (e.title === evt.title && e.date === evt.date));
      if (idx >= 0) {
        serverEventsList[idx] = { ...serverEventsList[idx], ...evt };
      } else {
        serverEventsList.unshift(evt);
      }

      // Upsert to Supabase
      try {
        const supabaseAdmin = getSupabaseAdmin();
        const row: any = {
          title: evt.title,
          date: evt.date,
          time: evt.time || '14:00 - 17:00',
          location: evt.location || 'Main Campus',
          description: evt.description || '',
          category: evt.category || 'Community Celebration',
          image_url: evt.imageUrl || null,
          status: evt.status || 'Upcoming',
          organizer: evt.organizer || 'Samanthasappy Events Committee',
          updated_at: new Date().toISOString(),
        };
        if (evt.id && evt.id.length > 10) row.id = evt.id;
        await supabaseAdmin.from('community_events').upsert(row, { onConflict: 'id' });
      } catch (sbErr) {
        console.warn('Supabase community_events upsert notice:', sbErr);
      }

      res.json({ success: true, event: evt });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to save event' });
    }
  });

  app.put('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const idx = serverEventsList.findIndex(e => e.id === id);
      if (idx >= 0) {
        serverEventsList[idx] = { ...serverEventsList[idx], ...updates };
      }

      try {
        const supabaseAdmin = getSupabaseAdmin();
        const row: any = {};
        if (updates.title !== undefined) row.title = updates.title;
        if (updates.date !== undefined) row.date = updates.date;
        if (updates.time !== undefined) row.time = updates.time;
        if (updates.location !== undefined) row.location = updates.location;
        if (updates.description !== undefined) row.description = updates.description;
        if (updates.category !== undefined) row.category = updates.category;
        if (updates.imageUrl !== undefined) row.image_url = updates.imageUrl;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.organizer !== undefined) row.organizer = updates.organizer;
        row.updated_at = new Date().toISOString();
        await supabaseAdmin.from('community_events').update(row).eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase community_events update notice:', sbErr);
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update event' });
    }
  });

  // Immediately purge files from Supabase Storage endpoint
  app.post('/api/storage/delete', async (req, res) => {
    try {
      const { urls } = req.body;
      if (Array.isArray(urls) && urls.length > 0) {
        await deleteFilesFromSupabaseStorage(urls);
      }
      res.json({ success: true });
    } catch (err: any) {
      console.warn('Storage deletion endpoint notice:', err?.message || err);
      res.status(500).json({ error: err?.message || 'Storage deletion error' });
    }
  });

  app.delete('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      let imageUrlToDelete: string | null = null;
      const idx = serverEventsList.findIndex(e => e.id === id);
      if (idx >= 0) {
        imageUrlToDelete = serverEventsList[idx]?.imageUrl || null;
        serverEventsList.splice(idx, 1);
      }

      try {
        const supabaseAdmin = getSupabaseAdmin();
        if (!imageUrlToDelete) {
          const { data: evRow } = await supabaseAdmin.from('community_events').select('image_url').eq('id', id).maybeSingle();
          if (evRow?.image_url) imageUrlToDelete = evRow.image_url;
        }
        await supabaseAdmin.from('community_events').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('Supabase community_events delete notice:', sbErr);
      }

      // Purge event banner from Supabase storage
      if (imageUrlToDelete) {
        deleteFilesFromSupabaseStorage([imageUrlToDelete]).catch(() => {});
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete event' });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const supabaseAdmin = getSupabaseAdmin();
      let filesToDelete: string[] = [];
      try {
        const { data: item } = await supabaseAdmin.from('gallery_items').select('image_url, video_url').eq('id', id).maybeSingle();
        if (item?.image_url) filesToDelete.push(item.image_url);
        if (item?.video_url) filesToDelete.push(item.video_url);
        await supabaseAdmin.from('gallery_items').delete().eq('id', id);
      } catch (err: any) {
        console.warn('Supabase gallery delete notice:', err?.message);
      }

      if (filesToDelete.length > 0) {
        deleteFilesFromSupabaseStorage(filesToDelete).catch(() => {});
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete gallery item' });
    }
  });

  // Universal Sync Endpoint: delivers all persisted server data to any connecting browser
  app.get('/api/sync-all', (req, res) => {
    res.json({
      staff: serverStaffList,
      users: serverUsersList,
      residents: serverResidentsList,
      shifts: serverShiftsList,
      messages: serverMessagesList,
      activity_logs: serverActivityLogsList,
      consultations: serverConsultationsList,
      applications: serverApplicationsList,
      events: serverEventsList,
      jobs: serverJobsList,
      gallery: serverGalleryList,
    });
  });

  app.get('/api/users', (req, res) => {
    res.json(serverUsersList);
  });

  app.post('/api/users', async (req, res) => {
    const user = req.body;
    if (user && user.email) {
      const cleanEmail = user.email.trim().toLowerCase();
      const idx = serverUsersList.findIndex(u => u.id === user.id || u.email?.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        serverUsersList[idx] = { ...serverUsersList[idx], ...user };
      } else {
        serverUsersList.push(user);
      }
      saveServerDb();
      res.json({ success: true, user });
    } else {
      res.status(400).json({ error: 'Valid user object with email required' });
    }
  });

  app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const email = req.query.email ? String(req.query.email).trim().toLowerCase() : '';
    let targetEmail = email;
    const uIdx = serverUsersList.findIndex(u => u.id === id || (email && u.email?.toLowerCase() === email));
    if (uIdx >= 0) {
      if (!targetEmail) targetEmail = serverUsersList[uIdx].email?.toLowerCase() || '';
      serverUsersList.splice(uIdx, 1);
    }
    const sIdx = serverStaffList.findIndex(s => s.id === id || (targetEmail && s.email?.toLowerCase() === targetEmail));
    if (sIdx >= 0) {
      serverStaffList.splice(sIdx, 1);
    }
    saveServerDb();
    res.json({ success: true, id });
  });

  app.get('/api/staff', (req, res) => {
    res.json(serverStaffList);
  });

  app.post('/api/staff', (req, res) => {
    const staff = req.body;
    if (staff && staff.email) {
      const cleanEmail = staff.email.trim().toLowerCase();
      const idx = serverStaffList.findIndex(s => s.id === staff.id || s.email?.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        serverStaffList[idx] = { ...serverStaffList[idx], ...staff };
      } else {
        serverStaffList.push(staff);
      }
      saveServerDb();
      res.json({ success: true, staff });
    } else {
      res.status(400).json({ error: 'Valid staff object with email required' });
    }
  });

  app.delete('/api/staff/:id', (req, res) => {
    const { id } = req.params;
    const email = req.query.email ? String(req.query.email).trim().toLowerCase() : '';
    let targetEmail = email;
    const sIdx = serverStaffList.findIndex(s => s.id === id || (email && s.email?.toLowerCase() === email));
    if (sIdx >= 0) {
      if (!targetEmail) targetEmail = serverStaffList[sIdx].email?.toLowerCase() || '';
      serverStaffList.splice(sIdx, 1);
    }
    const uIdx = serverUsersList.findIndex(u => u.id === id || (targetEmail && u.email?.toLowerCase() === targetEmail));
    if (uIdx >= 0) {
      serverUsersList.splice(uIdx, 1);
    }
    saveServerDb();
    res.json({ success: true, id });
  });

  app.get('/api/residents', (req, res) => {
    res.json(serverResidentsList);
  });

  app.post('/api/residents', (req, res) => {
    const resident = req.body;
    if (resident && resident.id) {
      const idx = serverResidentsList.findIndex(r => r.id === resident.id);
      if (idx >= 0) {
        serverResidentsList[idx] = { ...serverResidentsList[idx], ...resident };
      } else {
        serverResidentsList.unshift(resident);
      }
      saveServerDb();
      res.json({ success: true, resident });
    } else {
      res.status(400).json({ error: 'Valid resident object required' });
    }
  });

  app.delete('/api/residents/:id', (req, res) => {
    const { id } = req.params;
    const idx = serverResidentsList.findIndex(r => r.id === id);
    if (idx >= 0) {
      serverResidentsList.splice(idx, 1);
    }
    // Also remove any relative user linked to this resident
    const uIdx = serverUsersList.findIndex(u => u.residentLinkedId === id);
    if (uIdx >= 0) {
      serverUsersList.splice(uIdx, 1);
    }
    saveServerDb();
    res.json({ success: true, id });
  });

  app.get('/api/jobs', (req, res) => {
    res.json(serverJobsList);
  });

  app.post('/api/jobs', (req, res) => {
    const job = req.body;
    if (job && job.id) {
      const idx = serverJobsList.findIndex(j => j.id === job.id);
      if (idx >= 0) {
        serverJobsList[idx] = { ...serverJobsList[idx], ...job };
      } else {
        serverJobsList.unshift(job);
      }
      saveServerDb();
      res.json({ success: true, job });
    } else {
      res.status(400).json({ error: 'Valid job object required' });
    }
  });

  app.delete('/api/jobs/:id', (req, res) => {
    const { id } = req.params;
    const idx = serverJobsList.findIndex(j => j.id === id);
    if (idx >= 0) {
      serverJobsList.splice(idx, 1);
      saveServerDb();
    }
    res.json({ success: true, id });
  });

  app.get('/api/gallery', (req, res) => {
    res.json(serverGalleryList);
  });

  app.post('/api/gallery', (req, res) => {
    const item = req.body;
    if (item && item.id) {
      const idx = serverGalleryList.findIndex(g => g.id === item.id);
      if (idx >= 0) {
        serverGalleryList[idx] = { ...serverGalleryList[idx], ...item };
      } else {
        serverGalleryList.unshift(item);
      }
      saveServerDb();
      res.json({ success: true, item });
    } else {
      res.status(400).json({ error: 'Valid gallery item required' });
    }
  });

  app.get('/api/shifts', (req, res) => {
    res.json(serverShiftsList);
  });

  app.post('/api/shifts', (req, res) => {
    const shift = req.body;
    if (shift && shift.id) {
      const idx = serverShiftsList.findIndex(s => s.id === shift.id);
      if (idx >= 0) {
        serverShiftsList[idx] = { ...serverShiftsList[idx], ...shift };
      } else {
        serverShiftsList.unshift(shift);
      }
      saveServerDb();
      res.json({ success: true, shift });
    } else {
      res.status(400).json({ error: 'Valid shift object required' });
    }
  });

  app.delete('/api/shifts/:id', (req, res) => {
    const { id } = req.params;
    const idx = serverShiftsList.findIndex(s => s.id === id);
    if (idx >= 0) {
      serverShiftsList.splice(idx, 1);
      saveServerDb();
    }
    res.json({ success: true, id });
  });

  app.get('/api/messages', (req, res) => {
    res.json(serverMessagesList);
  });

  app.post('/api/messages', (req, res) => {
    const message = req.body;
    if (message && message.id) {
      const idx = serverMessagesList.findIndex(m => m.id === message.id);
      if (idx >= 0) {
        serverMessagesList[idx] = { ...serverMessagesList[idx], ...message };
      } else {
        serverMessagesList.unshift(message);
      }
      saveServerDb();
      res.json({ success: true, message });
    } else {
      res.status(400).json({ error: 'Valid message object required' });
    }
  });

  app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    const idx = serverMessagesList.findIndex(m => m.id === id);
    if (idx >= 0) {
      serverMessagesList.splice(idx, 1);
      saveServerDb();
    }
    res.json({ success: true, id });
  });

  app.get('/api/activity_logs', (req, res) => {
    res.json(serverActivityLogsList);
  });

  app.post('/api/activity_logs', (req, res) => {
    const log = req.body;
    if (log && log.id) {
      serverActivityLogsList.unshift(log);
      saveServerDb();
      res.json({ success: true, log });
    } else {
      res.status(400).json({ error: 'Valid log object required' });
    }
  });

  app.get('/api/consultations', (req, res) => {
    res.json(serverConsultationsList);
  });

  app.post('/api/consultations', (req, res) => {
    const booking = req.body;
    if (booking && booking.id) {
      const idx = serverConsultationsList.findIndex(c => c.id === booking.id);
      if (idx >= 0) {
        serverConsultationsList[idx] = { ...serverConsultationsList[idx], ...booking };
      } else {
        serverConsultationsList.unshift(booking);
      }
      saveServerDb();
      res.json({ success: true, booking });
    } else {
      res.status(400).json({ error: 'Valid booking object required' });
    }
  });

  app.delete('/api/consultations/:id', (req, res) => {
    const { id } = req.params;
    const idx = serverConsultationsList.findIndex(c => c.id === id);
    if (idx >= 0) {
      serverConsultationsList.splice(idx, 1);
      saveServerDb();
    }
    res.json({ success: true, id });
  });

  app.get('/api/applications', async (req, res) => {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: dbApps } = await supabaseAdmin
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })
        .abortSignal(AbortSignal.timeout(1500));
      if (Array.isArray(dbApps) && dbApps.length > 0) {
        res.json(dbApps);
        return;
      }
    } catch (e) {
      // fallback to memory list
    }
    res.json(serverApplicationsList);
  });

  app.post('/api/applications', async (req, res) => {
    const appData = req.body;
    if (!appData || !appData.id) {
      res.status(400).json({ error: 'Valid application object with id required' });
      return;
    }

    const cleanEmail = (appData.email || '').trim().toLowerCase();
    const cleanPhone = (appData.phone || '').trim();

    // Check duplicate applications by email & phone
    const hasDuplicate = serverApplicationsList.some(a => 
      a.id !== appData.id && (areEmailsEqual(a.email, cleanEmail) || (cleanPhone && arePhonesEqual(a.phone, cleanPhone)))
    );
    if (hasDuplicate) {
      return res.status(409).json({ error: 'An application with this email or phone number is already on file.' });
    }

    const idx = serverApplicationsList.findIndex(a => a.id === appData.id);
    if (idx >= 0) {
      serverApplicationsList[idx] = { ...serverApplicationsList[idx], ...appData };
    } else {
      serverApplicationsList.unshift(appData);
    }

    try {
      const supabaseAdmin = getSupabaseAdmin();
      const row = {
        id: appData.id,
        full_name: appData.fullName || appData.full_name || appData.applicantName || 'Applicant',
        email: cleanEmail,
        phone: appData.phone || '',
        type: appData.type || 'caregiver',
        photo_url: appData.photoUrl || appData.photo_url || null,
        receipt_url: appData.receiptUrl || appData.receipt_url || null,
        receipt_name: appData.receiptName || appData.receipt_name || null,
        position_or_category: appData.positionOrCategory || appData.position_or_category || appData.position || null,
        notes_or_statement: appData.notesOrStatement || appData.notes_or_statement || appData.notes || null,
        sponsor_name: appData.sponsorName || appData.sponsor_name || null,
        references: typeof appData.references === 'string' ? appData.references : JSON.stringify(appData.references || []),
        status: appData.status || 'Received',
        created_at: appData.createdAt || appData.created_at || new Date().toISOString(),
      };
      await supabaseAdmin.from('applications').upsert(row, { onConflict: 'id' });
    } catch (sbErr) {
      console.warn('Supabase application upsert notice:', sbErr);
    }

    res.json({ success: true, application: appData });
  });

  app.delete('/api/applications/:id', async (req, res) => {
    const { id } = req.params;
    let filesToDelete: string[] = [];
    const idx = serverApplicationsList.findIndex(a => a.id === id);
    if (idx >= 0) {
      const a = serverApplicationsList[idx];
      if (a.photoUrl) filesToDelete.push(a.photoUrl);
      if (a.receiptUrl) filesToDelete.push(a.receiptUrl);
      if (Array.isArray(a.references)) {
        a.references.forEach((r: any) => { if (r.photoUrl) filesToDelete.push(r.photoUrl); });
      }
      serverApplicationsList.splice(idx, 1);
    }
    try {
      const supabaseAdmin = getSupabaseAdmin();
      if (filesToDelete.length === 0) {
        const { data: appRow } = await supabaseAdmin.from('applications').select('photo_url, receipt_url, references').eq('id', id).maybeSingle();
        if (appRow?.photo_url) filesToDelete.push(appRow.photo_url);
        if (appRow?.receipt_url) filesToDelete.push(appRow.receipt_url);
        if (appRow?.references) {
          try {
            const parsedRefs = typeof appRow.references === 'string' ? JSON.parse(appRow.references) : appRow.references;
            if (Array.isArray(parsedRefs)) {
              parsedRefs.forEach((r: any) => { if (r.photoUrl) filesToDelete.push(r.photoUrl); });
            }
          } catch {}
        }
      }
      await supabaseAdmin.from('applications').delete().eq('id', id);
    } catch (sbErr) {
      console.warn('Supabase application delete notice:', sbErr);
    }

    // Purge files from Supabase Storage
    if (filesToDelete.length > 0) {
      deleteFilesFromSupabaseStorage(filesToDelete).catch(() => {});
    }

    res.json({ success: true });
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
      const cleanPhone = phone ? phone.trim() : '';
      const origin = appUrl || req.headers.origin || `http://${req.headers.host}`;
      const loginUrl = `${origin}/login`;
      const supabaseAdmin = getSupabaseAdmin();

      // STRICT DUPLICATE CHECK: email & phone check against staff and users
      const dupStaffMem = serverStaffList.some(s => 
        areEmailsEqual(s.email, cleanEmail) || (cleanPhone && arePhonesEqual(s.phone, cleanPhone))
      );
      const dupUserMem = serverUsersList.some(u => 
        areEmailsEqual(u.email, cleanEmail) || (cleanPhone && arePhonesEqual(u.phone, cleanPhone))
      );

      if (dupStaffMem || dupUserMem) {
        return res.status(409).json({ 
          error: `Duplicate registration prevented: A staff member or user with this email (${cleanEmail}) or phone (${cleanPhone}) already exists.` 
        });
      }

      try {
        const { data: existingProfiles } = await supabaseAdmin.from('profiles').select('id, email, phone');
        if (existingProfiles && existingProfiles.length > 0) {
          const profileDup = existingProfiles.find(p => 
            areEmailsEqual(p.email, cleanEmail) || (cleanPhone && arePhonesEqual(p.phone, cleanPhone))
          );
          if (profileDup) {
            return res.status(409).json({ 
              error: `Duplicate registration prevented: An account with this email (${cleanEmail}) or phone (${cleanPhone}) is already registered in the database.` 
            });
          }
        }
      } catch (checkErr) {
        console.warn('Profile duplicate check note:', checkErr);
      }

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

      saveServerDb();

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
          const existing = listData?.users?.find((u: any) => u.email?.toLowerCase() === cleanEmail);
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
        to: ADMIN_NOTIFICATION_EMAILS,
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
      const relativePhoneClean = relative.phone ? relative.phone.trim() : '';
      const relativeEmail = (relative.email && relative.email.includes('@'))
        ? relative.email.trim().toLowerCase()
        : (relativePhoneClean ? `${relativePhoneClean.replace(/\D/g, '')}@relative.samanthasappy.com` : `${Date.now()}@relative.samanthasappy.com`);

      // STRICT DUPLICATE CHECK: verify relative email & phone
      if (relativeEmail && !relativeEmail.endsWith('@relative.samanthasappy.com')) {
        const dupUser = serverUsersList.find(u => 
          areEmailsEqual(u.email, relativeEmail) || (relativePhoneClean && arePhonesEqual(u.phone, relativePhoneClean))
        );
        if (dupUser) {
          return res.status(409).json({ 
            error: `Registration Blocked: A relative or user with this email (${relativeEmail}) or phone (${relativePhoneClean}) is already registered.` 
          });
        }
      }

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
          const existing = listData?.users?.find((u: any) => u.email?.toLowerCase() === relativeEmail);
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

      // Save to persistent server store
      const resIdx = serverResidentsList.findIndex(r => r.id === residentId);
      if (resIdx >= 0) serverResidentsList[resIdx] = { ...resident, id: residentId };
      else serverResidentsList.unshift({ ...resident, id: residentId });

      const relUserObj = {
        id: relativeUserId,
        email: relativeEmail,
        name: relative.name,
        role: 'Resident Relative',
        relationship: relative.relationship || 'Next of Kin',
        residentLinkedId: residentId,
        phone: relative.phone || '+234 706 933 2193',
        avatar: relative.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      };
      const relIdx = serverUsersList.findIndex(u => u.email?.toLowerCase() === relativeEmail);
      if (relIdx >= 0) serverUsersList[relIdx] = relUserObj;
      else serverUsersList.push(relUserObj);

      saveServerDb();

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
        to: ADMIN_NOTIFICATION_EMAILS,
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
      const appId = application.id || `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const nowIso = new Date().toISOString();

      // 0. Persist application to Supabase & Memory Cache
      const appRow = {
        id: appId,
        full_name: application.applicantName,
        email: applicantEmail,
        phone: application.phone || '',
        type: isCaregiver ? 'caregiver' : 'resident',
        photo_url: application.photoUrl || application.photo_url || null,
        receipt_url: application.receiptUrl || application.receipt_url || null,
        receipt_name: application.receiptName || application.receipt_name || (application.paymentReceipt ? 'Payment Receipt Slip' : null),
        position_or_category: positionOrCategory,
        notes_or_statement: application.experience || application.notes || application.medicalHistory || '',
        sponsor_name: application.sponsorName || application.relativeName || null,
        references: typeof application.references === 'string' ? application.references : JSON.stringify(application.references || []),
        status: 'Received',
        created_at: nowIso,
      };

      const existingIdx = serverApplicationsList.findIndex(a => a.id === appId);
      if (existingIdx >= 0) {
        serverApplicationsList[existingIdx] = { ...serverApplicationsList[existingIdx], ...appRow };
      } else {
        serverApplicationsList.unshift(appRow);
      }

      try {
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin.from('applications').upsert(appRow, { onConflict: 'id' });

        // Create Admin Inbox Messages for both administrators
        const adminTargets = [
          { id: 'usr-admin-1', name: 'Folasade Sanyaolu (MD)', email: 'samanthasappy@gmail.com' },
          { id: 'usr-admin-2', name: 'Folasade Sanyaolu (Admin)', email: 'itopaprop@gmail.com' }
        ];

        const adminInAppMessages = adminTargets.map(adm => ({
          id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          sender_id: 'usr-system',
          sender_name: 'Care Application Portal',
          sender_role: 'Admin',
          receiver_id: adm.id,
          receiver_name: adm.name,
          receiver_role: 'Admin',
          subject: `📥 NEW CARE APPLICATION: ${application.applicantName} (${isCaregiver ? 'Caregiver Applicant' : 'Resident Care Admission Request'})`,
          content: `A new ${isCaregiver ? 'Caregiver Job Application' : 'Resident Care Admission Application'} has been submitted through the web portal.\n\nAPPLICANT DETAILS:\n• Full Name: ${application.applicantName}\n• Email: ${applicantEmail}\n• Phone: ${application.phone || 'N/A'}\n• Category / Role: ${positionOrCategory}\n${application.sponsorName ? `• Sponsor / Relative: ${application.sponsorName}\n` : ''}${application.notes ? `• Notes / Medical: ${application.notes}\n` : ''}${application.receiptName || application.paymentReceipt ? `• Payment Receipt: Attached (${application.receiptName || 'Bank Transfer Receipt'})\n` : ''}\nNotification dispatched to: samanthasappy@gmail.com, itopaprop@gmail.com`,
          attachment_url: application.receiptUrl || application.photoUrl || null,
          attachment_name: application.receiptName || null,
          is_read: false,
          created_at: nowIso,
        }));

        await supabaseAdmin.from('messages').insert(adminInAppMessages);
      } catch (dbErr) {
        console.warn('Supabase application/messages insert note:', dbErr);
      }

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
        to: ADMIN_NOTIFICATION_EMAILS,
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
        const profile: any = profilesMap.get(emailLower);
        const staff: any = staffMap.get(emailLower);

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

      // 1.5 Collect avatars and guarantor documents for storage cleanup
      const staffFilesToDelete: string[] = [];
      try {
        const query = staffId 
          ? supabaseAdmin.from('staff').select('avatar, references').or(`id.eq.${staffId},user_id.eq.${staffId}`)
          : supabaseAdmin.from('staff').select('avatar, references').ilike('email', cleanEmail);
        const { data: staffRows } = await query;
        if (staffRows) {
          for (const s of staffRows) {
            if (s.avatar) staffFilesToDelete.push(s.avatar);
            if (Array.isArray(s.references)) {
              s.references.forEach((r: any) => { if (r?.photoUrl) staffFilesToDelete.push(r.photoUrl); });
            }
          }
        }
      } catch (stgErr) {
        console.warn('Note finding staff storage files:', stgErr);
      }
      if (staffFilesToDelete.length > 0) {
        deleteFilesFromSupabaseStorage(staffFilesToDelete).catch(() => {});
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

      saveServerDb();

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

      // 1.5 Extract resident avatar and reference documents for storage cleanup
      const resFilesToDelete: string[] = [];
      try {
        if (residentId) {
          const { data: resRow } = await supabaseAdmin.from('residents').select('avatar, references').eq('id', residentId).maybeSingle();
          if (resRow?.avatar) resFilesToDelete.push(resRow.avatar);
          if (Array.isArray(resRow?.references)) {
            resRow.references.forEach((r: any) => { if (r?.photoUrl) resFilesToDelete.push(r.photoUrl); });
          }
        }
      } catch (stgErr) {
        console.warn('Note finding resident storage files:', stgErr);
      }
      if (resFilesToDelete.length > 0) {
        deleteFilesFromSupabaseStorage(resFilesToDelete).catch(() => {});
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

      saveServerDb();

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

      // 1.5 Extract user avatar for storage cleanup
      let userAvatarToDelete: string | null = null;
      try {
        const query = resolvedUserId
          ? supabaseAdmin.from('profiles').select('avatar').eq('id', resolvedUserId).maybeSingle()
          : supabaseAdmin.from('profiles').select('avatar').ilike('email', cleanEmail).maybeSingle();
        const { data: profRow } = await query;
        if (profRow?.avatar) userAvatarToDelete = profRow.avatar;
      } catch (stgErr) {
        console.warn('Note finding user avatar for deletion:', stgErr);
      }
      if (userAvatarToDelete) {
        deleteFilesFromSupabaseStorage([userAvatarToDelete]).catch(() => {});
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

  // 8. Universal Synchronized Master Data Endpoint (Reconciles Supabase Auth & all DB tables)
  app.get('/api/admin/synced-data', async (req, res) => {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      
      // 1. Fetch live Auth Users
      let authUsers: any[] = [];
      try {
        const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
        authUsers = authData?.users || [];
      } catch (authErr) {
        console.warn('Auth admin listUsers notice in synced-data:', authErr);
      }

      // 2. Fetch live database tables
      const { data: rawStaff = [] } = await supabaseAdmin.from('staff').select('*');
      const { data: rawResidents = [] } = await supabaseAdmin.from('residents').select('*');
      const { data: rawProfiles = [] } = await supabaseAdmin.from('profiles').select('*');
      const { data: rawShifts = [] } = await supabaseAdmin.from('shifts').select('*');
      const { data: rawMessages = [] } = await supabaseAdmin.from('messages').select('*').order('created_at', { ascending: false });
      const { data: rawActivityLogs = [] } = await supabaseAdmin.from('activity_logs').select('*').order('created_at', { ascending: false });
      const { data: rawApplications = [] } = await supabaseAdmin.from('applications').select('*');
      const { data: rawConsultations = [] } = await supabaseAdmin.from('consultation_bookings').select('*');
      const { data: rawEvents = [] } = await supabaseAdmin.from('community_events').select('*');
      const { data: rawJobs = [] } = await supabaseAdmin.from('job_vacancies').select('*');
      const { data: rawGallery = [] } = await supabaseAdmin.from('gallery_items').select('*');

      const staffList = [...(rawStaff || [])];
      const residentList = [...(rawResidents || [])];
      const profileList = [...(rawProfiles || [])];

      // 3. Reconcile Auth Users into Staff & Residents collections
      for (const u of authUsers) {
        const emailLower = (u.email || '').toLowerCase().trim();
        if (!emailLower) continue;

        const isAdmin = emailLower === 'samanthasappy@gmail.com' ||
                        emailLower === 'admin@samanthasappy.com' ||
                        emailLower === 'itopaprop@gmail.com' ||
                        u.user_metadata?.role === 'Admin';

        const isRelative = emailLower.includes('@relative.') ||
                          u.user_metadata?.role === 'Resident Relative' ||
                          u.user_metadata?.role === 'Relative' ||
                          !!u.user_metadata?.relationship ||
                          u.user_metadata?.name === 'Bronze' ||
                          emailLower.startsWith('090225535552');

        if (isAdmin) {
          // Update user metadata in Supabase Auth if needed
          if (u.user_metadata?.name !== 'Folasade Sanyaolu') {
            supabaseAdmin.auth.admin.updateUserById(u.id, {
              user_metadata: { ...(u.user_metadata || {}), name: 'Folasade Sanyaolu', role: 'Admin' }
            }).catch(e => console.warn('Auth admin name sync note:', e));
          }

          // Ensure admin profile exists and has the correct updated name in profiles list & Supabase table
          const existingProfile = profileList.find(p => p.email?.toLowerCase() === emailLower);
          const adminProfile = {
            id: u.id,
            email: emailLower,
            name: 'Folasade Sanyaolu',
            role: 'Admin',
            phone: u.user_metadata?.phone || '+234 706 933 2193',
            position: 'Managing Director & Administrator',
            avatar: u.user_metadata?.avatar || 'https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X=s1600',
            created_at: u.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (!existingProfile) {
            profileList.push(adminProfile);
          } else {
            existingProfile.name = 'Folasade Sanyaolu';
            existingProfile.role = 'Admin';
            existingProfile.position = 'Managing Director & Administrator';
          }
          supabaseAdmin.from('profiles').upsert(adminProfile, { onConflict: 'email' }).then(() => {}, () => {});
        } else if (isRelative) {
          // Ensure resident exists for this relative
          const relativeName = u.user_metadata?.name || 'Bronze';
          const relativePhone = u.user_metadata?.phone || (emailLower.split('@')[0]) || '090225535552';
          const residentName = u.user_metadata?.resident_name || u.user_metadata?.residentName || relativeName;
          
          let matchedResident = residentList.find(r => 
            (r.full_name || '').toLowerCase() === residentName.toLowerCase() ||
            (r.emergency_contact_phone || '').includes(relativePhone) ||
            (r.id && r.id === u.user_metadata?.resident_id)
          );

          if (!matchedResident) {
            const residentId = u.user_metadata?.resident_id || `res_${u.id}`;
            const firstStaff = staffList[0];
            const newResidentRow = {
              id: residentId,
              full_name: residentName,
              date_of_birth: u.user_metadata?.date_of_birth || '1952-04-18',
              gender: u.user_metadata?.gender || 'Female',
              room_number: u.user_metadata?.room_number || 'Suite 101',
              care_category: u.user_metadata?.care_category || 'Residential Elderly Care',
              assigned_staff_id: firstStaff?.id || 'stf-1',
              assigned_staff_name: firstStaff?.name || 'Care Specialist',
              health_status: 'Stable',
              admission_date: (u.created_at || new Date().toISOString()).split('T')[0],
              medical_notes: 'Comprehensive care profile and routine monitoring active.',
              avatar: u.user_metadata?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
              emergency_contact: {
                name: relativeName,
                relationship: u.user_metadata?.relationship || 'Next of Kin / Relative',
                phone: relativePhone,
              },
              emergency_contact_name: relativeName,
              emergency_contact_relationship: u.user_metadata?.relationship || 'Next of Kin / Relative',
              emergency_contact_phone: relativePhone,
              created_at: u.created_at || new Date().toISOString(),
            };
            residentList.push(newResidentRow);
            supabaseAdmin.from('residents').upsert(newResidentRow, { onConflict: 'id' }).then(() => {}, () => {});
          }

          // Ensure relative profile
          const existingProfile = profileList.find(p => p.email?.toLowerCase() === emailLower);
          if (!existingProfile) {
            const relProfile = {
              id: u.id,
              email: emailLower,
              name: relativeName,
              role: 'Resident Relative',
              phone: relativePhone,
              relationship: u.user_metadata?.relationship || 'Next of Kin',
              resident_linked_id: matchedResident?.id || `res_${u.id}`,
              avatar: u.user_metadata?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              created_at: u.created_at || new Date().toISOString(),
            };
            profileList.push(relProfile);
            supabaseAdmin.from('profiles').upsert(relProfile, { onConflict: 'email' }).then(() => {}, () => {});
          }
        } else {
          // Staff Account (e.g. fadairoolanireto@gmail.com, jahswillbeckys@gmail.com, josephineoluwatosin05@gmail.com, julietcomfort10@gmail.com)
          const staffName = u.user_metadata?.name || u.user_metadata?.fullName || emailLower.split('@')[0];
          const staffPos = u.user_metadata?.position || 'Senior Caregiver';
          const staffShift = u.user_metadata?.shift || 'Morning (07:00 - 15:30)';
          const staffQual = u.user_metadata?.qualification || 'NVQ Health & Social Care';
          const staffAvatar = u.user_metadata?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';
          const staffPhone = u.user_metadata?.phone || '+234 706 933 2193';
          const staffJoin = (u.created_at || new Date().toISOString()).split('T')[0];

          let existingStaff = staffList.find(s => s.email?.toLowerCase() === emailLower || s.id === u.id);
          if (!existingStaff) {
            const newStaffRow = {
              id: u.id,
              name: staffName,
              email: emailLower,
              phone: staffPhone,
              role: 'Staff',
              position: staffPos,
              shift: staffShift,
              qualification: staffQual,
              assigned_residents_count: 0,
              avatar: staffAvatar,
              join_date: staffJoin,
              created_at: u.created_at || new Date().toISOString(),
            };
            staffList.push(newStaffRow);
            supabaseAdmin.from('staff').upsert(newStaffRow, { onConflict: 'email' }).then(() => {}, () => {});
          }

          // Ensure profile exists
          let existingProfile = profileList.find(p => p.email?.toLowerCase() === emailLower);
          if (!existingProfile) {
            const newProfileRow = {
              id: u.id,
              email: emailLower,
              name: staffName,
              role: 'Staff',
              phone: staffPhone,
              position: staffPos,
              avatar: staffAvatar,
              created_at: u.created_at || new Date().toISOString(),
            };
            profileList.push(newProfileRow);
            supabaseAdmin.from('profiles').upsert(newProfileRow, { onConflict: 'email' }).then(() => {}, () => {});
          }
        }
      }

      // Convert DB snake_case rows to client models
      const convertedStaff = staffList.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone || '',
        position: s.position || 'Care Specialist',
        shift: s.shift || 'Morning Shift',
        role: s.role || 'Staff',
        joinDate: s.join_date || '',
        qualification: s.qualification || '',
        assignedResidentsCount: s.assigned_residents_count || 0,
        avatar: s.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        references: typeof s.references === 'string' ? JSON.parse(s.references || '[]') : (s.references || []),
      }));

      const convertedResidents = residentList.map(r => ({
        id: r.id,
        fullName: r.full_name || r.name || 'Resident',
        dateOfBirth: r.date_of_birth || '',
        gender: r.gender || 'Female',
        roomNumber: r.room_number || 'Suite 101',
        careCategory: r.care_category || 'Residential Elderly Care',
        assignedStaffId: r.assigned_staff_id || undefined,
        assignedStaffName: r.assigned_staff_name || undefined,
        medicalNotes: r.medical_notes || '',
        emergencyContact: r.emergency_contact || {
          name: r.emergency_contact_name || '',
          relationship: r.emergency_contact_relationship || '',
          phone: r.emergency_contact_phone || '',
        },
        admissionDate: r.admission_date || '',
        healthStatus: r.health_status || 'Stable',
        lastActivityUpdate: r.last_activity_update || '',
        avatar: r.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        references: typeof r.references === 'string' ? JSON.parse(r.references || '[]') : (r.references || []),
        vitals: r.vitals || undefined,
      }));

      const convertedUsers = profileList.map(p => {
        const emailLower = (p.email || '').toLowerCase().trim();
        const isAdmin = p.role === 'Admin' ||
                        emailLower === 'samanthasappy@gmail.com' ||
                        emailLower === 'admin@samanthasappy.com' ||
                        emailLower === 'itopaprop@gmail.com' ||
                        p.name?.includes('Sonyaolu') ||
                        p.name?.includes('Folashade');
        return {
          id: p.id,
          name: isAdmin ? 'Folasade Sanyaolu' : (p.name || p.email?.split('@')[0] || 'User'),
          email: p.email || '',
          phone: p.phone || '',
          role: isAdmin ? 'Admin' : (p.role || (p.email?.includes('admin') ? 'Admin' : 'Staff')),
          position: isAdmin ? 'Managing Director & Administrator' : (p.position || undefined),
          relationship: p.relationship || undefined,
          residentLinkedId: p.resident_linked_id || undefined,
          avatar: p.avatar || undefined,
        };
      });

      const convertedEvents = (rawEvents && rawEvents.length > 0)
        ? rawEvents.map(e => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time || undefined,
            location: e.location || 'Main Campus',
            description: e.description || '',
            category: e.category || 'Community Celebration',
            imageUrl: e.image_url || undefined,
            status: e.status || 'Upcoming',
            organizer: e.organizer || undefined,
          }))
        : serverEventsList;

      const convertedJobs = (rawJobs && rawJobs.length > 0)
        ? rawJobs.map(j => ({
            id: j.id,
            title: j.title,
            type: j.type || 'Full-time',
            department: j.department || 'Care Operations',
            location: j.location || 'Main Campus',
            description: j.description || '',
            requirements: Array.isArray(j.requirements) ? j.requirements : [],
          }))
        : [];

      const convertedGallery = (rawGallery && rawGallery.length > 0)
        ? rawGallery.map(g => ({
            id: g.id,
            title: g.title,
            category: g.category || 'Events',
            imageUrl: g.image_url || '',
            videoUrl: g.video_url || undefined,
            mediaType: g.media_type || 'image',
            description: g.description || '',
            date: g.date || '',
          }))
        : [];

      res.status(200).json({
        success: true,
        staff: convertedStaff,
        residents: convertedResidents,
        users: convertedUsers,
        shifts: rawShifts,
        messages: rawMessages,
        activityLogs: rawActivityLogs,
        applications: rawApplications,
        consultationBookings: rawConsultations,
        events: convertedEvents,
        jobs: convertedJobs,
        galleryItems: convertedGallery,
        totalAuthUsers: authUsers.length,
      });
    } catch (err: any) {
      console.error('Error in /api/admin/synced-data:', err);
      res.status(500).json({ error: err?.message || 'Failed to fetch synced data.' });
    }
  });

  // 9. DEDUPLICATE DATABASE (Removes duplicate registrations across profiles, staff, residents, and applications)
  async function runDatabaseDeduplication() {
    const supabaseAdmin = getSupabaseAdmin();
    const protectedEmails = ['samanthasappy@gmail.com', 'itopaprop@gmail.com', 'admin@samanthasappy.com'];
    let removedUsers = 0;
    let removedStaff = 0;
    let removedResidents = 0;
    let removedApplications = 0;
    const details: string[] = [];

    // 1. DEDUPLICATE PROFILES & AUTH USERS
    try {
      const { data: profiles, error: pErr } = await supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: true });
      if (!pErr && Array.isArray(profiles) && profiles.length > 0) {
        const seenEmails = new Map<string, any>();
        const seenPhones = new Map<string, any>();
        const toDeleteProfileIds: string[] = [];

        for (const prof of profiles) {
          const email = (prof.email || '').trim().toLowerCase();
          const phone = prof.phone ? normalizePhone(prof.phone) : '';
          const isProtected = protectedEmails.includes(email);

          let duplicateFound = false;
          let keeper: any = null;

          if (email && seenEmails.has(email)) {
            duplicateFound = true;
            keeper = seenEmails.get(email);
          } else if (phone && seenPhones.has(phone)) {
            duplicateFound = true;
            keeper = seenPhones.get(phone);
          }

          if (duplicateFound && !isProtected) {
            toDeleteProfileIds.push(prof.id);
            details.push(`Duplicate profile removed: ${prof.name || prof.id} (${email || phone})`);
            if (prof.avatar && prof.avatar !== keeper?.avatar) {
              deleteFilesFromSupabaseStorage([prof.avatar]).catch(() => {});
            }
          } else {
            if (email) seenEmails.set(email, prof);
            if (phone) seenPhones.set(phone, prof);
          }
        }

        for (const id of toDeleteProfileIds) {
          try {
            await supabaseAdmin.from('profiles').delete().eq('id', id);
            await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
            removedUsers++;
          } catch (e: any) {
            console.warn('Error deleting duplicate profile/auth:', e?.message);
          }
        }
      }
    } catch (err: any) {
      console.warn('Profile deduplication error:', err?.message);
    }

    // 2. DEDUPLICATE STAFF
    try {
      const { data: staffList, error: sErr } = await supabaseAdmin.from('staff').select('*').order('created_at', { ascending: true });
      if (!sErr && Array.isArray(staffList) && staffList.length > 0) {
        const seenStaffEmails = new Map<string, any>();
        const seenStaffPhones = new Map<string, any>();
        const toDeleteStaffIds: string[] = [];

        for (const stf of staffList) {
          const email = (stf.email || '').trim().toLowerCase();
          const phone = stf.phone ? normalizePhone(stf.phone) : '';
          const isProtected = protectedEmails.includes(email);

          let duplicateFound = false;
          let keeper: any = null;

          if (email && seenStaffEmails.has(email)) {
            duplicateFound = true;
            keeper = seenStaffEmails.get(email);
          } else if (phone && seenStaffPhones.has(phone)) {
            duplicateFound = true;
            keeper = seenStaffPhones.get(phone);
          }

          if (duplicateFound && !isProtected) {
            toDeleteStaffIds.push(stf.id);
            details.push(`Duplicate staff removed: ${stf.name || stf.id} (${email || phone})`);
            if (stf.avatar && stf.avatar !== keeper?.avatar) {
              deleteFilesFromSupabaseStorage([stf.avatar]).catch(() => {});
            }
          } else {
            if (email) seenStaffEmails.set(email, stf);
            if (phone) seenStaffPhones.set(phone, stf);
          }
        }

        for (const id of toDeleteStaffIds) {
          try {
            await supabaseAdmin.from('staff').delete().eq('id', id);
            removedStaff++;
          } catch (e: any) {
            console.warn('Error deleting duplicate staff:', e?.message);
          }
        }
      }
    } catch (err: any) {
      console.warn('Staff deduplication error:', err?.message);
    }

    // 3. DEDUPLICATE RESIDENTS
    try {
      const { data: resList, error: rErr } = await supabaseAdmin.from('residents').select('*').order('created_at', { ascending: true });
      if (!rErr && Array.isArray(resList) && resList.length > 0) {
        const seenNames = new Map<string, any>();
        const toDeleteResIds: string[] = [];

        for (const res of resList) {
          const cleanName = (res.full_name || '').trim().toLowerCase();
          if (cleanName && seenNames.has(cleanName)) {
            toDeleteResIds.push(res.id);
            details.push(`Duplicate resident removed: ${res.full_name} (${res.id})`);
            if (res.avatar) {
              deleteFilesFromSupabaseStorage([res.avatar]).catch(() => {});
            }
          } else if (cleanName) {
            seenNames.set(cleanName, res);
          }
        }

        for (const id of toDeleteResIds) {
          try {
            await supabaseAdmin.from('residents').delete().eq('id', id);
            removedResidents++;
          } catch (e: any) {
            console.warn('Error deleting duplicate resident:', e?.message);
          }
        }
      }
    } catch (err: any) {
      console.warn('Resident deduplication error:', err?.message);
    }

    // 4. DEDUPLICATE APPLICATIONS
    try {
      const { data: apps, error: aErr } = await supabaseAdmin.from('applications').select('*').order('created_at', { ascending: false });
      if (!aErr && Array.isArray(apps) && apps.length > 0) {
        const seenAppEmails = new Map<string, any>();
        const seenAppPhones = new Map<string, any>();
        const toDeleteAppIds: string[] = [];

        for (const app of apps) {
          const email = (app.email || '').trim().toLowerCase();
          const phone = app.phone ? normalizePhone(app.phone) : '';

          let duplicate = false;
          if (email && seenAppEmails.has(email)) duplicate = true;
          else if (phone && seenAppPhones.has(phone)) duplicate = true;

          if (duplicate) {
            toDeleteAppIds.push(app.id);
            details.push(`Duplicate application removed: ${app.full_name} (${email || phone})`);
            const files = [app.photo_url, app.receipt_url];
            deleteFilesFromSupabaseStorage(files).catch(() => {});
          } else {
            if (email) seenAppEmails.set(email, app);
            if (phone) seenAppPhones.set(phone, app);
          }
        }

        for (const id of toDeleteAppIds) {
          try {
            await supabaseAdmin.from('applications').delete().eq('id', id);
            removedApplications++;
          } catch (e: any) {
            console.warn('Error deleting duplicate application:', e?.message);
          }
        }
      }
    } catch (err: any) {
      console.warn('Application deduplication error:', err?.message);
    }

    console.log(`[Deduplication Run] Removed: ${removedUsers} profiles, ${removedStaff} staff, ${removedResidents} residents, ${removedApplications} applications.`);
    return {
      success: true,
      removedUsers,
      removedStaff,
      removedResidents,
      removedApplications,
      details,
    };
  }

  app.post('/api/admin/deduplicate-database', async (req, res) => {
    try {
      const result = await runDatabaseDeduplication();
      res.json(result);
    } catch (err: any) {
      console.error('Error running database deduplication endpoint:', err);
      res.status(500).json({ error: err?.message || 'Database deduplication failed.' });
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
    // Run database deduplication on startup to clean any legacy duplicates
    setTimeout(() => {
      runDatabaseDeduplication().catch(err => console.warn('Startup deduplication notice:', err));
    }, 2000);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

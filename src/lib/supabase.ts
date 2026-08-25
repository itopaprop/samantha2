import { createClient } from '@supabase/supabase-js';

// Environment variables with fallback to the configured project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ikeglxdyjimmxvfbxrvb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_eIk9r2bZDA2qLeZB2bYhTA_BNbABikp';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Ephemeral client for registering users in Supabase Auth without overriding the current admin session
export const ephemeralAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

/**
 * Storage Helper: Upload a File or base64 data URL to Supabase Storage with timeout and graceful fallback
 */
export async function uploadToStorage(
  bucket: 'public-media' | 'avatars' | 'documents',
  folder: string,
  fileOrDataUrl: File | Blob | string,
  customFileName?: string
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  try {
    let fileBody: Blob | File;
    let fileName = customFileName || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.startsWith('http')) {
        // Already a remote URL
        return { url: fileOrDataUrl, path: null, error: null };
      } else if (fileOrDataUrl.startsWith('data:')) {
        try {
          // Fast convert data URL to Blob
          const res = await fetch(fileOrDataUrl);
          fileBody = await res.blob();
          const mimeType = fileBody.type || 'image/jpeg';
          const ext = mimeType.split('/')[1] || 'jpg';
          if (!fileName.includes('.')) fileName = `${fileName}.${ext}`;
        } catch {
          // Fallback manual blob
          const [header, base64Data] = fileOrDataUrl.split(',');
          const mimeMatch = header.match(/:(.*?);/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          fileBody = new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
          const ext = mimeType.split('/')[1] || 'jpg';
          if (!fileName.includes('.')) fileName = `${fileName}.${ext}`;
        }
      } else {
        return { url: null, path: null, error: new Error('Invalid string format for upload') };
      }
    } else {
      fileBody = fileOrDataUrl;
      if (fileOrDataUrl instanceof File && !customFileName) {
        fileName = `${Date.now()}_${fileOrDataUrl.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      }
    }

    const filePath = `${folder}/${fileName}`;

    // Execute upload with a 4 second timeout race
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(filePath, fileBody, {
        cacheControl: '3600',
        upsert: true,
      });

    const timeoutPromise = new Promise<{ data: null; error: Error }>((_, reject) =>
      setTimeout(() => reject(new Error('Storage upload timeout after 4000ms')), 4000)
    );

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

    if (error || !data?.path) {
      console.warn(`Supabase Storage upload note for bucket '${bucket}':`, error?.message || 'Upload bypassed');
      return { 
        url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null, 
        path: null, 
        error: error || null 
      };
    }

    // Always get clean public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { 
      url: publicUrlData?.publicUrl || (typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null), 
      path: data.path, 
      error: null 
    };
  } catch (err: any) {
    console.warn('Storage Upload Notice (gracefully using fallback):', err?.message || err);
    return { 
      url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null, 
      path: null, 
      error: err 
    };
  }
}

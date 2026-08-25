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
 * Storage Helper: Upload a File or base64 data URL to Supabase Storage
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
      if (fileOrDataUrl.startsWith('data:')) {
        // Convert data URL to Blob
        const [header, base64Data] = fileOrDataUrl.split(',');
        const mimeMatch = header.match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }
        fileBody = new Blob(byteArrays, { type: mimeType });
        const ext = mimeType.split('/')[1] || 'jpg';
        if (!fileName.includes('.')) fileName = `${fileName}.${ext}`;
      } else if (fileOrDataUrl.startsWith('http')) {
        // Already a remote URL
        return { url: fileOrDataUrl, path: null, error: null };
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

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBody, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn(`Supabase Storage upload error for bucket '${bucket}':`, error.message);
      // Fallback: return data URL if string, else null
      return { 
        url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null, 
        path: null, 
        error 
      };
    }

    if (bucket === 'documents') {
      // For private documents, retrieve signed URL or fallback path
      const { data: signedData } = await supabase.storage
        .from(bucket)
        .createSignedUrl(data.path, 60 * 60 * 24); // 24 hours
      return { url: signedData?.signedUrl || null, path: data.path, error: null };
    } else {
      // For public buckets
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);
      return { url: publicUrlData.publicUrl, path: data.path, error: null };
    }
  } catch (err: any) {
    console.error('Storage Upload Exception:', err);
    return { 
      url: typeof fileOrDataUrl === 'string' ? fileOrDataUrl : null, 
      path: null, 
      error: err 
    };
  }
}

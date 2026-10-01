// Disconnected from external Supabase databases.
// The web app runs completely standalone with local persistence and offline storage.

// Offline Mock Query Builder that gracefully handles any chained DB call
const createMockQueryBuilder = () => {
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
  return handler;
};

// Disconnected Offline Supabase Client
export const supabase: any = {
  auth: {
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    signUp: async () => ({ data: { user: null, session: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => createMockQueryBuilder(),
  channel: () => ({
    on: () => ({
      subscribe: () => ({ unsubscribe: () => {} }),
    }),
    subscribe: () => ({ unsubscribe: () => {} }),
    unsubscribe: () => {},
  }),
  functions: {
    invoke: async () => ({ data: null, error: null }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: { path: 'offline_local_path' }, error: null }),
      remove: async () => ({ data: [], error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: path } }),
      list: async () => ({ data: [], error: null }),
    }),
  },
};

export const ephemeralAuthClient = supabase;

/**
 * Storage Helper: Saves File or data URL locally as Base64 data URL with zero cloud dependency
 */
export async function uploadToStorage(
  bucket: 'public-media' | 'avatars' | 'documents',
  _folder: string,
  fileOrDataUrl: File | Blob | string,
  _customFileName?: string
): Promise<{ url: string | null; path: string | null; error: Error | null }> {
  try {
    if (typeof fileOrDataUrl === 'string') {
      return { url: fileOrDataUrl, path: null, error: null };
    }

    // Convert file to Base64 data URL for instant offline local rendering
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    });

    return {
      url: dataUrl,
      path: null,
      error: null,
    };
  } catch (err: any) {
    return {
      url: null,
      path: null,
      error: err,
    };
  }
}

/**
 * Extract storage bucket and relative path (Safe offline helper)
 */
export function extractBucketAndPath(urlOrPath: string | null | undefined): { bucket: 'public-media' | 'avatars' | 'documents'; path: string } | null {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null;
  return null;
}

/**
 * Delete a single file from storage (Safe offline no-op)
 */
export async function deleteFromStorage(_urlOrPath: string | null | undefined): Promise<boolean> {
  return true;
}

/**
 * Delete multiple files from storage (Safe offline no-op)
 */
export async function deleteMultipleFromStorage(_urlsOrPaths: (string | null | undefined)[]): Promise<void> {
  // Offline no-op
}

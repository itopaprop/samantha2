// Firebase Configuration & SDK Initialization
// Configured for Firebase Authentication & Cloud Firestore Database
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  setLogLevel,
  type Firestore,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCZO_l6x6mV40EstawWrjMXhi-eRG-lkeE",
  authDomain: "samanthasappy-984e1.firebaseapp.com",
  projectId: "samanthasappy-984e1",
  storageBucket: "samanthasappy-984e1.firebasestorage.app",
  messagingSenderId: "464985984293",
  appId: "1:464985984293:web:b1639a568ed7508c44decc",
  firestoreDatabaseId: "ai-studio-samanthasappyhom-e751c061-d614-43a5-b34e-3cd8c73886de"
};

// Initialize Primary Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore Database
export const db: Firestore = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);

// Silence internal Firestore SDK transport warnings (e.g. backoff retries when free quota is reached)
try {
  setLogLevel('silent');
} catch {}

if (typeof window !== 'undefined') {
  const originalClientConsoleError = console.error;
  console.error = function (...args: any[]) {
    const fullMsg = args.map(a => (typeof a === 'string' ? a : a?.message || JSON.stringify(a) || '')).join(' ');
    if (fullMsg.includes('Disconnecting idle stream') || fullMsg.includes('Timed out waiting for new targets')) {
      return;
    }
    originalClientConsoleError.apply(console, args);
  };
}

// Secondary Firebase Auth instance dedicated to registering users in the background
// so the logged-in admin's current session is never signed out or disrupted.
let secondaryAuthInstance: Auth | null = null;
function getSecondaryAuth(): Auth {
  if (!secondaryAuthInstance) {
    const existing = getApps().find(a => a.name === 'adminUserProvisioner');
    const secApp = existing || initializeApp(firebaseConfig, 'adminUserProvisioner');
    secondaryAuthInstance = getAuth(secApp);
  }
  return secondaryAuthInstance;
}

/**
 * Registers a new user into Firebase Authentication on behalf of an admin.
 * Uses the secondary auth client so the currently logged-in admin is NOT signed out.
 */
export async function createFirebaseUserByAdmin(
  email: string, 
  password: string, 
  displayName?: string
): Promise<{ success: boolean; user?: FirebaseUser; alreadyExists?: boolean; error?: string }> {
  try {
    const secAuth = getSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(secAuth, email.trim().toLowerCase(), password.trim());
    if (displayName && cred.user) {
      try {
        await updateProfile(cred.user, { displayName });
      } catch (profErr) {
        console.warn('Could not update display name in Firebase Auth:', profErr);
      }
    }
    await signOut(secAuth);
    return { success: true, user: cred.user };
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      return { success: true, alreadyExists: true };
    }
    console.warn('Firebase Auth user creation notice:', err);
    return { success: false, error: err?.message || String(err) };
  }
}

export const signInWithEmail = async (email: string, pass: string): Promise<any> => {
  return signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pass.trim());
};

export const signUpWithEmail = async (email: string, pass: string): Promise<any> => {
  return createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), pass.trim());
};

export const signInWithGoogle = async (): Promise<any> => {
  return signInWithPopup(auth, googleProvider);
};

export const resetFirebasePassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email.trim().toLowerCase());
};

export const logoutFirebaseUser = async (): Promise<void> => {
  return signOut(auth);
};

export {
  onAuthStateChanged,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  setLogLevel,
};

// ============================================================================
// FIRESTORE ERROR HANDLING & SANITIZATION
// ============================================================================
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (error?.code === 'resource-exhausted' || msg.includes('Quota limit exceeded') || msg.includes('Quota exceeded')) {
      markFirestoreQuotaExhausted();
    } else if (error instanceof Error && msg.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
    }
  }
}

// Initial test connection check
testConnection().catch(() => {});

export const sanitizeForFirestore = (data: any): any => {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeForFirestore);
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sanitized[key] = sanitizeForFirestore(value);
    }
  }
  return sanitized;
};

// ============================================================================
// RESILIENT FIRESTORE WRITERS WITH QUOTA EXHAUSTION PROTECTION
// ============================================================================
const STORAGE_QUOTA_KEY = 'shh_fs_quota_exhausted';
const STORAGE_TIMESTAMP_KEY = 'shh_fs_quota_timestamp';
const QUOTA_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours cooldown since free daily quota resets daily

let firestoreQuotaExhausted = false;
let quotaExhaustedTimestamp = 0;

try {
  if (typeof window !== 'undefined') {
    const isExhausted = 
      localStorage.getItem(STORAGE_QUOTA_KEY) === 'true' || 
      sessionStorage.getItem(STORAGE_QUOTA_KEY) === 'true';
    if (isExhausted) {
      firestoreQuotaExhausted = true;
      quotaExhaustedTimestamp = parseInt(
        localStorage.getItem(STORAGE_TIMESTAMP_KEY) || 
        sessionStorage.getItem(STORAGE_TIMESTAMP_KEY) || 
        String(Date.now()), 
        10
      );
    }
  }
} catch {}

export function isFirestoreQuotaExhausted(): boolean {
  if (firestoreQuotaExhausted) {
    if (Date.now() - quotaExhaustedTimestamp > QUOTA_COOLDOWN_MS) {
      firestoreQuotaExhausted = false;
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_QUOTA_KEY);
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
          sessionStorage.removeItem(STORAGE_QUOTA_KEY);
          sessionStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        }
      } catch {}
    }
  }
  return firestoreQuotaExhausted;
}

export function markFirestoreQuotaExhausted(): void {
  firestoreQuotaExhausted = true;
  quotaExhaustedTimestamp = Date.now();
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_QUOTA_KEY, 'true');
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, String(quotaExhaustedTimestamp));
      sessionStorage.setItem(STORAGE_QUOTA_KEY, 'true');
      sessionStorage.setItem(STORAGE_TIMESTAMP_KEY, String(quotaExhaustedTimestamp));
    }
  } catch {}
  console.warn('[Firebase] Firestore daily write quota limit reached. Gracefully operating with Express backend database storage.');
}

function isQuotaError(err: any): boolean {
  const code = String(err?.code || '').toLowerCase();
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    code === 'resource-exhausted' ||
    msg.includes('quota limit exceeded') ||
    msg.includes('quota exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('free daily write units') ||
    msg.includes('free daily read units')
  );
}

export async function safeFirestoreSetDoc(docRef: any, data: any, options: any = { merge: true }): Promise<boolean> {
  if (!db || isFirestoreQuotaExhausted()) {
    return false;
  }
  try {
    await setDoc(docRef, sanitizeForFirestore(data), options);
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return false;
    }
    console.debug('Firestore setDoc notice:', err?.code || err?.message || err);
    return false;
  }
}

export async function safeFirestoreDeleteDoc(docRef: any): Promise<boolean> {
  if (!db || isFirestoreQuotaExhausted()) {
    return false;
  }
  try {
    await deleteDoc(docRef);
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return false;
    }
    console.debug('Firestore deleteDoc notice:', err?.code || err?.message || err);
    return false;
  }
}

export async function safeFirestoreUpdateDoc(docRef: any, data: any): Promise<boolean> {
  if (!db || isFirestoreQuotaExhausted()) {
    return false;
  }
  try {
    await updateDoc(docRef, sanitizeForFirestore(data));
    return true;
  } catch (err: any) {
    if (isQuotaError(err)) {
      markFirestoreQuotaExhausted();
      return false;
    }
    console.debug('Firestore updateDoc notice:', err?.code || err?.message || err);
    return false;
  }
}

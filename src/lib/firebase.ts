import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.log('Google Sign-In popup closed or cancelled by user.');
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      console.warn('Google Sign-In popup was blocked by browser.');
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups and try again.');
    }
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error('Email Sign-In Error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, pass: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error('Email Sign-Up Error:', error);
    throw error;
  }
};

export const logoutFirebaseUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign-Out Error:', error);
  }
};

export { app, onAuthStateChanged };
export type { FirebaseUser };

/**
 * Strips or truncates large base64 image strings before sending to Firestore
 * to prevent write queue exhaustion or document limit overflow.
 */
export const sanitizeForFirestore = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    if (data.startsWith('data:image/') && data.length > 500) {
      return '[Photo Document Attached]';
    }
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item));
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      cleaned[key] = sanitizeForFirestore(data[key]);
    }
    return cleaned;
  }
  return data;
};


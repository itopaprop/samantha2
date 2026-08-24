/**
 * Disconnected Firebase Client Module
 * Firebase live links and connections have been completely disabled.
 */

export const auth = null;
export const db = null;
export const googleProvider = null;

export const signInWithGoogle = async () => {
  return null;
};

export const signInWithEmail = async (_email: string, _pass: string) => {
  return null;
};

export const signUpWithEmail = async (_email: string, _pass: string) => {
  return null;
};

export const logoutFirebaseUser = async () => {
  // Disconnected - no operation
};

export const sanitizeForFirestore = (data: any): any => data;

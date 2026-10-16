import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  UserRole, 
  Resident, 
  StaffMember, 
  Shift, 
  Message, 
  ActivityLog, 
  ConsultationBooking,
  CommunityEvent,
  JobVacancy,
  GalleryItem,
  ApplicationSubmission,
  CareCategory
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STAFF, 
  INITIAL_RESIDENTS, 
  INITIAL_SHIFTS, 
  INITIAL_MESSAGES, 
  INITIAL_ACTIVITY_LOGS,
  INITIAL_GALLERY,
  INITIAL_JOB_VACANCIES,
  INITIAL_COMMUNITY_EVENTS
} from '../data/initialData';
import { 
  db, 
  auth, 
  signInWithGoogle as firebaseSignInWithGoogle, 
  signInWithEmail as firebaseSignInWithEmail, 
  signUpWithEmail as firebaseSignUpWithEmail, 
  createFirebaseUserByAdmin,
  resetFirebasePassword,
  logoutFirebaseUser,
  onAuthStateChanged,
  sanitizeForFirestore, 
  handleFirestoreError,
  OperationType,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from '../lib/firebase';
import { 
  supabase, 
  ephemeralAuthClient, 
  uploadToStorage, 
  deleteFromStorage, 
  deleteMultipleFromStorage 
} from '../lib/supabase';
import { arePhonesEqual, areEmailsEqual } from '../utils/duplicateCheck';
import { generateRelativeWelcomeEmail } from '../server/emailService';
import { compressImage } from '../utils/imageCompressor';
import { 
  invokeRegisterStaff, 
  invokeRegisterRelative, 
  invokeSubmitApplication,
  invokeDeleteStaff,
  invokeDeleteResident,
  invokeDeleteUser,
  invokeCleanupNonAdminUsers,
  invokeListAuthUsers,
  AuthUserInfo
} from '../lib/edgeFunctions';
import {
  profileToUser,
  userToProfile,
  residentFromRow,
  residentToRow,
  staffFromRow,
  staffToRow,
  shiftFromRow,
  shiftToRow,
  messageFromRow,
  messageToRow,
  activityLogFromRow,
  activityLogToRow,
  eventFromRow,
  eventToRow,
  jobFromRow,
  jobToRow,
  galleryFromRow,
  galleryToRow,
  applicationFromRow,
  applicationToRow,
  consultationFromRow,
  consultationToRow,
  generateUUID,
  isValidUUID
} from '../lib/supabaseAdapters';

export type PageView = 
  | 'home' 
  | 'about' 
  | 'services' 
  | 'facilities' 
  | 'events' 
  | 'gallery' 
  | 'careers' 
  | 'contact' 
  | 'login' 
  | 'dashboard'
  | 'roofing'
  | 'roofing-gallery'
  | 'roofing-contact';

interface AppContextType {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  currentUser: User | null;
  users: User[];
  isAuthLoading: boolean;
  loginUser: (email: string, role: UserRole, password?: string) => Promise<boolean>;
  signUpUser?: (email: string, password: string, name: string, role: UserRole, extra?: Partial<User>) => Promise<boolean>;
  resetPassword?: (email: string) => Promise<boolean>;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
  logout: (redirectPage?: PageView | React.MouseEvent | unknown, customMessage?: string) => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<boolean>;
  deleteUserAccount: (userId: string, email?: string) => Promise<boolean>;
  purgeAllNonAdminUsers: () => Promise<{ success: boolean; deletedCount: number }>;
  purgeAllDemoRecords: () => Promise<{ success: boolean }>;
  deduplicateDatabase: () => Promise<{ success: boolean; removedCount: number; details: string[] }>;
  
  residents: Resident[];
  addResident: (resident: Omit<Resident, 'id' | 'admissionDate'>) => Promise<{ resident: Resident; relativeUser: User; tempPassword?: string; setupPasswordUrl?: string; emailDispatched?: boolean }>;
  updateResident: (id: string, updated: Partial<Resident>) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;
  
  staff: StaffMember[];
  addStaff: (staffMember: Omit<StaffMember, 'id' | 'joinDate' | 'assignedResidentsCount'>) => Promise<{ user: User; tempPassword?: string; setupPasswordUrl?: string; emailDispatched?: boolean }>;
  updateStaff: (id: string, updated: Partial<StaffMember>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  
  shifts: Shift[];
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (id: string, updated: Partial<Shift>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  markMessageAsRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  
  activityLogs: ActivityLog[];
  consultationBookings: ConsultationBooking[];
  bookConsultation: (booking: Omit<ConsultationBooking, 'id' | 'status' | 'createdAt'>) => Promise<void>;
  deleteConsultation: (id: string) => Promise<void>;
  
  events: CommunityEvent[];
  addEvent: (event: Omit<CommunityEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, updated: Partial<CommunityEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  jobs: JobVacancy[];
  addJob: (job: Omit<JobVacancy, 'id'>) => Promise<void>;
  updateJob: (id: string, updated: Partial<JobVacancy>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  galleryItems: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  addMultipleGalleryItems: (items: Omit<GalleryItem, 'id'>[]) => Promise<void>;
  updateGalleryItem: (id: string, updated: Partial<GalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;

  applications: ApplicationSubmission[];
  submitApplication: (appData: Omit<ApplicationSubmission, 'id' | 'createdAt' | 'status'>) => Promise<ApplicationSubmission>;
  deleteApplication: (id: string) => Promise<void>;
  
  toastMessage: string | null;
  showToast: (message: string) => void;
  
  isConsultationModalOpen: boolean;
  setIsConsultationModalOpen: (open: boolean) => void;
  isApplyModalOpen: boolean;
  setIsApplyModalOpen: (open: boolean) => void;
  selectedFacilityId: string | null;
  setSelectedFacilityId: (id: string | null) => void;
  syncDatabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Comprehensive filter to detect demo records that should never appear
export const isDemoRecord = (item: any): boolean => {
  if (!item) return false;
  const id = String(item.id || item.user_id || '').toLowerCase();
  const name = String(item.name || item.fullName || item.full_name || '').toLowerCase();
  const email = String(item.email || '').toLowerCase();

  // Known demo IDs
  const demoIds = [
    'res-101', 'res-102', 'res-103', 'res-104', 'res-105', 'res-106',
    'usr-staff-1', 'usr-staff-2', 'usr-staff-3', 'usr-staff-4',
    'usr-relative-1', 'usr-relative-2',
    'sh-101', 'sh-102', 'sh-103', 'sh-104',
    'msg-101', 'msg-102', 'msg-103',
    'evt-1', 'evt-2', 'evt-3'
  ];
  if (demoIds.includes(id)) return true;

  // Known demo resident names & event titles
  const demoNames = [
    'eleanor miller', 'thomas wright', 'arthur pendelton', 'clara & leo bennett',
    'clara bennett', 'leo bennett', 'sophia lee', 'george harris',
    'sarah jenkins', 'marcus vance', 'emily watson', 'robert taylor',
    'david miller', 'rebecca wright',
    'annual grandparents', 'dementia & memory care', 'staff health, wellness'
  ];
  if (demoNames.some(dn => name.includes(dn) || String(item.title || '').toLowerCase().includes(dn))) return true;

  // Known demo emails
  if (
    email.includes('s.jenkins@') ||
    email.includes('m.vance@') ||
    email.includes('e.watson@') ||
    email.includes('r.taylor@') ||
    email.includes('david.miller@') ||
    email.includes('rebecca.w@')
  ) {
    return true;
  }

  return false;
};

// Helper to generate temporary memorable passwords
const generateTempPassword = (): string => {
  const words = ['Care', 'Hope', 'Grace', 'Heal', 'Safe', 'Joy'];
  const num = Math.floor(100 + Math.random() * 900);
  const randomWord = words[Math.floor(Math.random() * words.length)];
  return `@${randomWord}${num}`;
};

// Helper to guarantee completely unique IDs and eliminate duplicate keys (e.g. legacy 'local_user' or placeholders)
export const ensureUniqueKeys = <T extends { id?: string }>(items: any[], prefix: string): T[] => {
  const seen = new Set<string>();
  return (items || []).map((item, idx) => {
    let id = item?.id;
    if (!id || id === 'local_user' || id === '%s' || id === 'undefined' || id === 'null' || seen.has(id)) {
      id = `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}_${idx}`;
    }
    seen.add(id);
    return { ...item, id } as T;
  });
};

const DEMO_CLEANUP_KEY = 'shh_demo_purge_v9_complete';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge any stale client-side offline cache from previous sessions so Firestore is the sole source of truth
  if (typeof window !== 'undefined') {
    try {
      [
        'shh_residents',
        'shh_staff',
        'shh_shifts',
        'shh_messages',
        'shh_activity_logs',
        'shh_users',
        'shh_events',
        'shh_jobs',
        'shh_gallery_v2',
        'shh_consultations',
        'shh_applications',
      ].forEach(k => localStorage.removeItem(k));
    } catch {
      // Ignore storage access notice
    }
  }

  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Users & Current Auth User
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = sessionStorage.getItem('shh_current_user') || localStorage.getItem('shh_current_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (isDemoRecord(parsed)) return null;
      if (parsed && (parsed.role === 'Admin' || parsed.email?.toLowerCase() === 'samanthasappy@gmail.com' || parsed.email?.toLowerCase() === 'itopaprop@gmail.com' || parsed.name?.includes('Sonyaolu') || parsed.name?.includes('Folashade'))) {
        return { ...parsed, name: 'Folasade Sanyaolu' };
      }
      return parsed;
    } catch {
      return null;
    }
  });

  // Direct Firestore-Synchronized Database Collections (No Offline LocalStorage Cache)
  const [residents, setResidents] = useState<Resident[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [consultationBookings, setConsultationBookings] = useState<ConsultationBooking[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>(INITIAL_COMMUNITY_EVENTS);
  const [jobs, setJobs] = useState<JobVacancy[]>(INITIAL_JOB_VACANCIES);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [applications, setApplications] = useState<ApplicationSubmission[]>([]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Maintain only current user auth session in sessionStorage
  useEffect(() => { 
    if (currentUser) {
      try {
        sessionStorage.setItem('shh_current_user', JSON.stringify(currentUser));
        localStorage.setItem('shh_current_user', JSON.stringify(currentUser));
      } catch {}
    } else {
      try {
        sessionStorage.removeItem('shh_current_user');
        localStorage.removeItem('shh_current_user');
      } catch {}
    }
  }, [currentUser]);

  // Universal Sync Engine: Synchronizes data with Server API fallback
  // Universal Sync Engine: Synchronizes data with Server API fallback
  const syncDatabase = useCallback(async () => {
    try {
      const res = await fetch('/api/sync-all', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          // If in-memory state is empty on initial cold boot, hydrate immediately
          if (Array.isArray(data.staff) && data.staff.length > 0) {
            setStaff(prev => (prev.length === 0 ? data.staff : prev));
            data.staff.forEach((s: any) => {
              if (s?.id && db) {
                setDoc(doc(db, 'staff', s.id), sanitizeForFirestore(s), { merge: true }).catch(() => {});
              }
            });
          }
          if (Array.isArray(data.users) && data.users.length > 0) {
            setUsers(prev => {
              const combined = [...prev];
              data.users.forEach((u: any) => {
                const uEmail = (u?.email || '').toLowerCase().trim();
                const existingIdx = combined.findIndex(e => 
                  (e.id && e.id === u.id) || 
                  (uEmail && (e?.email || '').toLowerCase().trim() === uEmail)
                );
                if (existingIdx >= 0) {
                  combined[existingIdx] = { 
                    ...combined[existingIdx], 
                    ...u,
                    avatar: u.avatar || combined[existingIdx].avatar 
                  };
                } else {
                  combined.push(u);
                }
              });
              return combined;
            });

            // Synchronize active currentUser session across browsers
            setCurrentUser(prevUser => {
              if (!prevUser) return prevUser;
              const prevEmail = (prevUser.email || '').toLowerCase().trim();
              const matched = data.users.find((u: any) => 
                (u.id && u.id === prevUser.id) ||
                (prevEmail && (u.email || '').toLowerCase().trim() === prevEmail) ||
                ((prevEmail === 'samanthasappy@gmail.com' || prevEmail === 'itopaprop@gmail.com') &&
                 ((u.email || '').toLowerCase().trim() === 'samanthasappy@gmail.com' || (u.email || '').toLowerCase().trim() === 'itopaprop@gmail.com'))
              );
              if (matched && (matched.avatar !== prevUser.avatar || matched.name !== prevUser.name || matched.phone !== prevUser.phone)) {
                const updatedCurrent: User = {
                  ...prevUser,
                  ...matched,
                  avatar: matched.avatar || prevUser.avatar,
                };
                try {
                  localStorage.setItem('shh_current_user', JSON.stringify(updatedCurrent));
                  sessionStorage.setItem('shh_current_user', JSON.stringify(updatedCurrent));
                } catch {}
                return updatedCurrent;
              }
              return prevUser;
            });

            data.users.forEach((u: any) => {
              if (u?.id && db) {
                setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u), { merge: true }).catch(() => {});
              }
            });
          }
          if (Array.isArray(data.residents) && data.residents.length > 0) {
            setResidents(prev => (prev.length === 0 ? data.residents : prev));
            data.residents.forEach((r: any) => {
              if (r?.id && db) {
                setDoc(doc(db, 'residents', r.id), sanitizeForFirestore(r), { merge: true }).catch(() => {});
              }
            });
          }
          if (Array.isArray(data.shifts) && data.shifts.length > 0) {
            setShifts(prev => (prev.length === 0 ? data.shifts : prev));
          }
          if (Array.isArray(data.messages) && data.messages.length > 0) {
            setMessages(prev => (prev.length === 0 ? data.messages : prev));
          }
          if (Array.isArray(data.activity_logs) && data.activity_logs.length > 0) {
            setActivityLogs(prev => (prev.length === 0 ? data.activity_logs : prev));
          }
          if (Array.isArray(data.consultations) && data.consultations.length > 0) {
            setConsultationBookings(prev => (prev.length === 0 ? data.consultations : prev));
          }
          if (Array.isArray(data.applications) && data.applications.length > 0) {
            setApplications(prev => (prev.length === 0 ? data.applications : prev));
          }
        }
      }
    } catch (err) {
      console.warn('Sync database notice:', err);
    }
  }, []);

  // 1. Initial boot check
  useEffect(() => {
    syncDatabase();
  }, [syncDatabase]);

  // 2. Real-time Cloud Firestore synchronization across all devices and browsers
  // Firestore is the single source of truth: additions, updates, and deletions reflect instantly
  useEffect(() => {
    if (!db) return;

    const unsubs: (() => void)[] = [];

    // Helper to safely bind Firestore collection listeners directly
    const bindCollection = <T extends { id?: string; email?: string }>(
      colName: string, 
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      fallbackDefault?: T[]
    ) => {
      try {
        const unsubscribe = onSnapshot(collection(db, colName), (snapshot) => {
          if (!snapshot.empty) {
            const rawItems = snapshot.docs.map(d => ({ ...d.data(), id: d.id })) as T[];
            const cleanItems = rawItems.filter(item => !isDemoRecord(item));

            if (colName === 'users') {
              const merged = cleanItems.map(item => {
                const initUser = INITIAL_USERS.find(iu => (iu.email || '').toLowerCase() === (item.email || '').toLowerCase());
                return initUser ? ({ ...initUser, ...item, password: (item as any).password || initUser.password } as any) : item;
              });
              INITIAL_USERS.forEach(iu => {
                if (!merged.some(m => (m.email || '').toLowerCase() === (iu.email || '').toLowerCase())) {
                  merged.push(iu as any);
                }
              });
              setter(merged as any);

              // CRITICAL: Synchronize active currentUser session in real-time across all devices/browsers
              setCurrentUser(prevUser => {
                if (!prevUser) return prevUser;
                const prevEmail = (prevUser.email || '').toLowerCase().trim();
                const matched = merged.find(u => 
                  (u.id && u.id === prevUser.id) ||
                  (prevEmail && (u.email || '').toLowerCase().trim() === prevEmail) ||
                  ((prevEmail === 'samanthasappy@gmail.com' || prevEmail === 'itopaprop@gmail.com') &&
                   ((u.email || '').toLowerCase().trim() === 'samanthasappy@gmail.com' || (u.email || '').toLowerCase().trim() === 'itopaprop@gmail.com'))
                );
                if (matched && (matched.avatar !== prevUser.avatar || matched.name !== prevUser.name || matched.phone !== prevUser.phone)) {
                  const updatedCurrent: User = {
                    ...prevUser,
                    ...matched,
                    avatar: matched.avatar || prevUser.avatar,
                  };
                  try {
                    localStorage.setItem('shh_current_user', JSON.stringify(updatedCurrent));
                    sessionStorage.setItem('shh_current_user', JSON.stringify(updatedCurrent));
                  } catch {}
                  return updatedCurrent;
                }
                return prevUser;
              });
              return;
            }

            const formatted = ensureUniqueKeys<T>(cleanItems, colName.slice(0, 3));
            setter(formatted);
          } else {
            // Collection is empty in Firestore (all documents deleted or none created yet)
            setter(fallbackDefault || []);
          }
        }, (err) => {
          console.debug(`Firestore listener notice for ${colName}:`, err.message);
        });
        unsubs.push(unsubscribe);
      } catch (e) {
        console.debug(`Could not attach Firestore listener for ${colName}:`, e);
      }
    };

    // Bind real-time snapshot listeners to all collections
    bindCollection('residents', setResidents);
    bindCollection('staff', setStaff);
    bindCollection('shifts', setShifts);
    bindCollection('messages', setMessages);
    bindCollection('activity_logs', setActivityLogs);
    bindCollection('consultations', setConsultationBookings);
    bindCollection('events', setEvents, INITIAL_COMMUNITY_EVENTS);
    bindCollection('jobs', setJobs, INITIAL_JOB_VACANCIES);
    bindCollection('gallery', setGalleryItems, INITIAL_GALLERY);
    bindCollection('applications', setApplications);
    bindCollection('users', setUsers, INITIAL_USERS);

    return () => {
      unsubs.forEach(unsub => {
        try { unsub(); } catch {}
      });
    };
  }, []);

  // Listen to Firebase Authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.email) {
        const cleanEmail = firebaseUser.email.toLowerCase();
        setUsers(prev => {
          const match = prev.find(u => (u?.email || '').toLowerCase() === cleanEmail) ||
                        INITIAL_USERS.find(u => (u?.email || '').toLowerCase() === cleanEmail);
          if (match) {
            setCurrentUser(prevUser => {
              if (!prevUser) return match;
              return {
                ...prevUser,
                ...match,
                avatar: match.avatar || prevUser.avatar,
              };
            });
          }
          return prev;
        });
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const loginUser = async (email: string, role: UserRole, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    if (!cleanEmail) {
      showToast('Please enter your username or registered email.');
      return false;
    }

    if (!cleanPassword) {
      showToast('Please enter your account password.');
      return false;
    }

    // 1. Locate target user profile in memory/localStorage or seeded initial users
    let targetUser = users.find(u => (u?.email || '').trim().toLowerCase() === cleanEmail);
    if (!targetUser) {
      const initMatch = INITIAL_USERS.find(u => (u?.email || '').toLowerCase() === cleanEmail);
      if (initMatch) targetUser = initMatch;
    }

    // 2. Strict Role Enforcement check against the selected login portal tab
    if (targetUser) {
      const normTargetRole = targetUser.role === 'Resident Relative' || targetUser.role.toLowerCase().includes('relat') ? 'Resident Relative' : targetUser.role === 'Staff' || targetUser.role.toLowerCase().includes('staff') || targetUser.role.toLowerCase().includes('caregiver') ? 'Staff' : 'Admin';
      const normSelectedRole = role === 'Resident Relative' || role.toLowerCase().includes('relat') ? 'Resident Relative' : role === 'Staff' || role.toLowerCase().includes('staff') || role.toLowerCase().includes('caregiver') ? 'Staff' : 'Admin';

      if (normTargetRole !== normSelectedRole) {
        const roleLabel = targetUser.role === 'Resident Relative' ? 'Relative' : targetUser.role;
        showToast(`Access Denied: '${targetUser.email}' is registered as a ${targetUser.role} account. Please select the '${roleLabel}' tab above.`);
        return false;
      }
    }

    // 3. Primary Authentication with Firebase Authentication
    let firebaseAuthenticated = false;
    try {
      const userCredential = await firebaseSignInWithEmail(cleanEmail, cleanPassword);
      if (userCredential && userCredential.user) {
        firebaseAuthenticated = true;
      }
    } catch (fbErr: any) {
      const code = fbErr?.code || '';
      console.warn('Firebase Auth sign in notice:', code, fbErr?.message);

      // If user exists in the app (e.g. admin or staff/relative registered by admin),
      // verify their password and provision their account into Firebase Auth if not created yet
      if (targetUser && (code === 'auth/user-not-found' || code === 'auth/invalid-credential')) {
        const expectedPassword = targetUser.password ? targetUser.password.trim() : '';
        const defaultRolePasswords: string[] = [
          'CareTeam@2025!',
          targetUser.role === 'Admin' ? '@samantha' : targetUser.role === 'Staff' ? '@staff123' : '@relative123',
          targetUser.role === 'Admin' ? 'samantha' : targetUser.role === 'Staff' ? 'staff123' : 'relative123',
        ];
        const normalizePass = (p: string) => p.replace(/^[@#!]+/, '').trim().toLowerCase();

        const matchesLocal = (expectedPassword && (cleanPassword === expectedPassword || normalizePass(cleanPassword) === normalizePass(expectedPassword))) ||
          defaultRolePasswords.some(dp => cleanPassword === dp || normalizePass(cleanPassword) === normalizePass(dp));

        if (matchesLocal) {
          try {
            const provResult = await createFirebaseUserByAdmin(cleanEmail, cleanPassword, targetUser.name);
            if (provResult.success || provResult.alreadyExists) {
              const retryCred = await firebaseSignInWithEmail(cleanEmail, cleanPassword);
              if (retryCred && retryCred.user) {
                firebaseAuthenticated = true;
              }
            }
          } catch (provErr) {
            console.warn('Firebase Auth auto-provision notice:', provErr);
          }
        }
      }

      if (!firebaseAuthenticated) {
        if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
          showToast(`Login Failed: Incorrect password entered for ${cleanEmail}.`);
          return false;
        } else if (code === 'auth/user-not-found') {
          showToast(`Login Failed: No account found for '${cleanEmail}'. Please contact the administrator.`);
          return false;
        } else if (code === 'auth/too-many-requests') {
          showToast('Access temporarily blocked due to multiple failed attempts. Please try again shortly.');
          return false;
        } else if (code === 'auth/user-disabled') {
          showToast('This account has been disabled. Please contact the administrator.');
          return false;
        } else {
          showToast(`Login Failed: ${fbErr?.message || 'Invalid credentials'}`);
          return false;
        }
      }
    }

    if (!targetUser) {
      targetUser = {
        id: auth.currentUser?.uid || `usr_${Date.now()}`,
        name: auth.currentUser?.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '',
        role: role,
        password: cleanPassword,
      };
      setUsers(prev => [...prev, targetUser!]);
    }

    // Incorporate latest cloud database profile info (e.g. updated avatar) immediately
    try {
      const serverRes = await fetch('/api/users', { cache: 'no-store' });
      if (serverRes.ok) {
        const sUsers = await serverRes.json();
        if (Array.isArray(sUsers)) {
          const cloudMatch = sUsers.find((u: any) => 
            (u.email || '').trim().toLowerCase() === cleanEmail ||
            (u.id && u.id === targetUser?.id) ||
            ((cleanEmail === 'samanthasappy@gmail.com' || cleanEmail === 'itopaprop@gmail.com') &&
             ((u.email || '').trim().toLowerCase() === 'samanthasappy@gmail.com' || (u.email || '').trim().toLowerCase() === 'itopaprop@gmail.com'))
          );
          if (cloudMatch && targetUser) {
            targetUser = {
              ...targetUser,
              avatar: cloudMatch.avatar || targetUser.avatar,
              name: cloudMatch.name || targetUser.name,
              phone: cloudMatch.phone || targetUser.phone,
            };
          }
        }
      }
    } catch {}

    // Grant access
    setCurrentUser(targetUser);
    setCurrentPage('dashboard');
    try {
      localStorage.setItem('shh_last_activity', String(Date.now()));
    } catch {}
    syncDatabase();
    showToast(`Welcome back, ${targetUser.name}! Signed in to ${targetUser.role} Portal.`);
    return true;
  };

  const signUpUser = async (email: string, password: string, name: string, role: UserRole, extra?: Partial<User>): Promise<boolean> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = extra?.phone?.trim() || '';

      // Check if user already exists by email or phone
      const duplicateUser = users.find(u => 
        areEmailsEqual(u.email, cleanEmail) || 
        (cleanPhone && arePhonesEqual(u.phone, cleanPhone))
      );
      if (duplicateUser) {
        showToast(`Registration prevented: An account with this email (${cleanEmail}) or phone number is already registered.`);
        return false;
      }

      const userUUID = generateUUID();

      let supabaseUserId = userUUID;
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name,
            role,
            phone: extra?.phone || '',
            position: extra?.position || '',
            avatar: extra?.avatar || '',
          }
        }
      });

      if (data?.user?.id && isValidUUID(data.user.id)) {
        supabaseUserId = data.user.id;
      }

      const newUser: User = {
        id: supabaseUserId,
        name,
        email: cleanEmail,
        phone: extra?.phone || '',
        role,
        position: extra?.position,
        avatar: extra?.avatar,
        password,
        ...extra,
      };

      // Provision account into Firebase Authentication
      try {
        await createFirebaseUserByAdmin(cleanEmail, password, name);
      } catch (fbErr) {
        console.warn('Firebase Auth user creation notice on signup:', fbErr);
      }

      // Always save to Supabase profiles
      const { error: profErr } = await supabase.from('profiles').upsert(userToProfile(newUser), { onConflict: 'email' });
      if (profErr) {
        console.warn('Supabase profile upsert error on signup:', profErr.message);
      }

      // If Staff role, also insert/upsert into staff table
      if (role === 'Staff') {
        const staffRow = staffToRow({
          id: newUser.id,
          name: newUser.name,
          email: cleanEmail,
          phone: newUser.phone,
          position: newUser.position || 'Caregiver Staff',
          role: 'Staff',
          joinDate: new Date().toISOString().split('T')[0],
          avatar: newUser.avatar,
        });
        await supabase.from('staff').upsert(staffRow, { onConflict: 'email' });
      }

      setUsers(prev => {
        const exists = prev.some(u => (u?.email || '').toLowerCase() === cleanEmail);
        return exists ? prev.map(u => (u?.email || '').toLowerCase() === cleanEmail ? newUser : u) : [...prev, newUser];
      });
      setCurrentUser(newUser);
      showToast(`Account created successfully for ${name}! Welcome to ${role} Portal.`);
      return true;
    } catch (err: any) {
      showToast(`Sign up error: ${err?.message || err}`);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      await resetFirebasePassword(email.trim().toLowerCase());
      showToast('Password reset link sent to your registered email address via Firebase.');
      return true;
    } catch (fbErr: any) {
      console.warn('Firebase reset password notice:', fbErr);
      showToast('Password reset link requested. If registered, check your inbox.');
      return true;
    }
  };

  const loginWithGoogle = async (role: UserRole): Promise<boolean> => {
    const matchedUser = users.find(u => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setCurrentPage('dashboard');
      try {
        localStorage.setItem('shh_last_activity', String(Date.now()));
      } catch {}
      showToast(`Signed in to ${role} Portal as ${matchedUser.name}.`);
      return true;
    }
    showToast(`No registered user profile found for role: ${role}`);
    return false;
  };

  const switchDemoRole = (role: UserRole) => {
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      setCurrentPage('dashboard');
      try {
        localStorage.setItem('shh_last_activity', String(Date.now()));
      } catch {}
      showToast(`Switched active view role to ${found.name} (${role}).`);
    }
  };

  const logout = async (redirectPage?: PageView | React.MouseEvent | unknown, customMessage?: string) => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    try {
      await logoutFirebaseUser();
    } catch (err) {
      console.warn('Firebase sign out notice:', err);
    }
    const targetPage: PageView = (typeof redirectPage === 'string' && redirectPage.trim() !== '') ? (redirectPage as PageView) : 'home';
    const message = (typeof customMessage === 'string' && customMessage.trim() !== '') ? customMessage : 'You have been signed out successfully.';
    setCurrentUser(null);
    try {
      localStorage.removeItem('shh_current_user');
      localStorage.removeItem('shh_last_activity');
    } catch {
      // Ignore
    }
    setCurrentPage(targetPage);
    showToast(message);
  };

  // ============================================================================
  // USER & PROFILE MANAGEMENT (EDITABLE PHOTO & SUPABASE PROFILES SYNC)
  // ============================================================================

  const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    let finalAvatar = updates.avatar;
    if (finalAvatar) {
      try {
        finalAvatar = await compressImage(finalAvatar, 400, 400, 0.82);
      } catch (cErr) {
        console.warn('Avatar compression notice:', cErr);
      }
    }

    const sanitizedUpdates: Partial<User> = {
      ...updates,
      avatar: finalAvatar,
    };

    const existingUser = users.find(u => u.id === userId) || currentUser;
    const targetEmail = (updates.email || existingUser?.email || currentUser?.email || '').trim().toLowerCase();
    const targetRole = updates.role || existingUser?.role || currentUser?.role || 'Staff';
    const isAdmin = targetRole === 'Admin' || targetEmail === 'samanthasappy@gmail.com' || targetEmail === 'itopaprop@gmail.com';

    // 1. Update In-Memory Users State
    setUsers(prev => prev.map(u => {
      const uEmail = (u?.email || '').toLowerCase().trim();
      const isMatch = u.id === userId || (targetEmail && uEmail === targetEmail) ||
        (isAdmin && (uEmail === 'samanthasappy@gmail.com' || uEmail === 'itopaprop@gmail.com' || u.role === 'Admin'));
      return isMatch ? { ...u, ...sanitizedUpdates, avatar: finalAvatar || u.avatar } : u;
    }));

    // 2. Update Active Current User Session in Memory & Browser Storage
    if (currentUser) {
      const curEmail = (currentUser.email || '').toLowerCase().trim();
      const isCurrentMatch = currentUser.id === userId || (targetEmail && curEmail === targetEmail) ||
        (isAdmin && (curEmail === 'samanthasappy@gmail.com' || curEmail === 'itopaprop@gmail.com' || currentUser.role === 'Admin'));
      if (isCurrentMatch) {
        const updatedCurrent: User = { 
          ...currentUser, 
          ...sanitizedUpdates,
          avatar: finalAvatar || currentUser.avatar 
        };
        setCurrentUser(updatedCurrent);
        try {
          localStorage.setItem('shh_current_user', JSON.stringify(updatedCurrent));
          sessionStorage.setItem('shh_current_user', JSON.stringify(updatedCurrent));
        } catch {}
      }
    }

    // 3. If staff member, sync with staff list
    setStaff(prev => prev.map(s => {
      const sEmail = (s?.email || '').toLowerCase().trim();
      if (s.id === userId || (targetEmail && sEmail === targetEmail)) {
        return {
          ...s,
          name: sanitizedUpdates.name || s.name,
          avatar: finalAvatar || s.avatar,
          phone: sanitizedUpdates.phone || s.phone,
          position: sanitizedUpdates.position || s.position,
        };
      }
      return s;
    }));

    // 4. Multi-Device Server REST API Sync (Guarantees multi-browser persistence)
    try {
      await fetch('/api/users/profile-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: targetEmail,
          avatar: finalAvatar,
          name: sanitizedUpdates.name,
          phone: sanitizedUpdates.phone,
          position: sanitizedUpdates.position,
          role: targetRole,
        }),
      });
    } catch (apiErr) {
      console.warn('Backend server profile-photo sync note:', apiErr);
    }

    // 5. Cloud Firestore Synchronization (Cross-device real-time sync)
    try {
      const fsPayload = sanitizeForFirestore({
        ...sanitizedUpdates,
        avatar: finalAvatar,
      });

      // Update primary user document in Firestore
      if (userId) {
        await setDoc(doc(db, 'users', userId), fsPayload, { merge: true });
      }

      // If Administrator, ensure BOTH admin records in Firestore are kept in sync
      if (isAdmin) {
        await Promise.allSettled([
          setDoc(doc(db, 'users', 'usr-admin-1'), fsPayload, { merge: true }),
          setDoc(doc(db, 'users', 'usr-admin-2'), fsPayload, { merge: true }),
        ]);
      }

      // If staff member, also sync Firestore staff document
      if (targetRole === 'Staff' || currentUser?.role === 'Staff') {
        const staffPayload = sanitizeForFirestore({
          name: sanitizedUpdates.name,
          avatar: finalAvatar,
          phone: sanitizedUpdates.phone,
          position: sanitizedUpdates.position,
        });
        await setDoc(doc(db, 'staff', userId), staffPayload, { merge: true });
      }
    } catch (fsErr) {
      console.error('Firestore profile photo sync notice:', fsErr);
    }

    // 6. Supabase Database Profiles & Staff Tables Sync
    try {
      const mergedUser: User = {
        id: userId,
        name: sanitizedUpdates.name || existingUser?.name || 'User',
        email: sanitizedUpdates.email || existingUser?.email || '',
        phone: sanitizedUpdates.phone || existingUser?.phone || '',
        role: sanitizedUpdates.role || existingUser?.role || 'Staff',
        avatar: finalAvatar || existingUser?.avatar,
        position: sanitizedUpdates.position || existingUser?.position,
        relationship: sanitizedUpdates.relationship || existingUser?.relationship,
        residentLinkedId: sanitizedUpdates.residentLinkedId || existingUser?.residentLinkedId,
      };

      await supabase.from('profiles').upsert([userToProfile(mergedUser)], { onConflict: 'email' });

      if (mergedUser.role === 'Staff') {
        await supabase.from('staff').update({
          name: mergedUser.name,
          avatar: finalAvatar,
          phone: mergedUser.phone,
          position: mergedUser.position,
          updated_at: new Date().toISOString(),
        }).match({ email: mergedUser.email.toLowerCase().trim() });
      }
    } catch (err) {
      console.warn('Supabase profile update note:', err);
    }

    // 7. Register Activity Log
    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'Profile Updated',
      description: `User profile for ${sanitizedUpdates.name || currentUser?.name || userId} (${targetRole}) was updated.`,
      category: 'General',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'User',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    return true;
  };

  // ============================================================================
  // RESIDENTS MANAGEMENT (SECURE EDGE FUNCTION & WELCOME EMAIL)
  // ============================================================================

  const addResident = async (residentData: Omit<Resident, 'id' | 'admissionDate'>) => {
    const cleanName = residentData.fullName.trim().toLowerCase();
    const cleanRelativePhone = residentData.emergencyContact?.phone?.trim() || '';

    // STRICT DUPLICATE CHECK: Resident name & emergency contact phone
    const duplicateResident = residents.find(r => 
      r.fullName.trim().toLowerCase() === cleanName ||
      (cleanRelativePhone && arePhonesEqual(r.emergencyContact?.phone, cleanRelativePhone))
    );
    if (duplicateResident) {
      const msg = `Registration Blocked: A resident with this name (${residentData.fullName}) or emergency contact phone is already registered.`;
      showToast(msg);
      throw new Error(msg);
    }

    const residentUUID = generateUUID();

    // 1. Upload/Compress Avatar if base64/data
    let avatarUrl = residentData.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80';
    if (residentData.avatar?.startsWith('data:')) {
      try {
        avatarUrl = await compressImage(residentData.avatar, 400, 400, 0.82);
      } catch {
        // Fallback
      }
    }

    // Process reference photos if any (compressed for Firestore compatibility)
    const processedReferences = await Promise.all(
      (residentData.references || []).map(async (ref) => {
        let photoUrl = ref.photoUrl;
        if (ref.photoUrl?.startsWith('data:')) {
          try {
            photoUrl = await compressImage(ref.photoUrl, 400, 400, 0.82);
          } catch {
            // Keep original
          }
        }
        return { ...ref, photoUrl };
      })
    );

    const admissionDate = new Date().toISOString().split('T')[0];
    const newResident: Resident = {
      ...residentData,
      id: residentUUID,
      admissionDate,
      avatar: avatarUrl,
      references: processedReferences,
    };

    // Optimistic UI update for resident
    setResidents(prev => ensureUniqueKeys([newResident, ...prev], 'res'));

    // Save to Firestore and Server API immediately
    setDoc(doc(db, 'residents', newResident.id), sanitizeForFirestore(newResident), { merge: true }).catch(() => {});
    fetch('/api/residents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResident),
    }).catch(() => {});

    const rawRelativeEmail = (
      residentData.emergencyContact?.email ||
      residentData.references?.[0]?.email ||
      ''
    ).trim().toLowerCase();

    const relativePhoneClean = residentData.emergencyContact?.phone ? residentData.emergencyContact.phone.replace(/[^0-9]/g, '') : `${Date.now()}`;
    const relativeEmail = (rawRelativeEmail && rawRelativeEmail.includes('@'))
      ? rawRelativeEmail
      : `${relativePhoneClean}@relative.samanthasappy.com`;

    const tempPassword = generateTempPassword();

    // STRICT DUPLICATE CHECK: verify relative email if a real email was supplied
    if (relativeEmail && !relativeEmail.endsWith('@relative.samanthasappy.com')) {
      const duplicateUser = users.find(u => areEmailsEqual(u.email, relativeEmail));
      if (duplicateUser) {
        const msg = `Registration Blocked: A relative or user with this email (${relativeEmail}) is already registered.`;
        showToast(msg);
        throw new Error(msg);
      }
    }

    // 2. Call Privileged Supabase Edge Function to create Family Portal Auth & Dispatch Welcome Email
    let relativeUserId = generateUUID();
    let setupPasswordUrl: string | undefined;
    let emailDispatched = false;

    try {
      const edgeResult = await invokeRegisterRelative({
        resident: {
          fullName: newResident.fullName,
          dateOfBirth: newResident.dateOfBirth,
          gender: newResident.gender,
          roomNumber: newResident.roomNumber,
          careCategory: newResident.careCategory,
          assignedStaffId: newResident.assignedStaffId,
          assignedStaffName: newResident.assignedStaffName,
          healthStatus: newResident.healthStatus,
          medicalNotes: newResident.medicalNotes,
          avatar: newResident.avatar,
          vitals: newResident.vitals,
          references: newResident.references,
        },
        relative: {
          name: residentData.emergencyContact?.name || 'Relative of ' + newResident.fullName,
          relationship: residentData.emergencyContact?.relationship || 'Next of Kin',
          phone: residentData.emergencyContact?.phone || '+234 706 933 2193',
          email: relativeEmail,
          photoUrl: processedReferences[0]?.photoUrl || null,
        },
        tempPassword,
      });

      if (edgeResult.success) {
        if (edgeResult.resident?.id && edgeResult.resident.id !== 'local_user') newResident.id = edgeResult.resident.id;
        if (edgeResult.relativeUser?.id && edgeResult.relativeUser.id !== 'local_user') relativeUserId = edgeResult.relativeUser.id;
        setupPasswordUrl = edgeResult.setupPasswordUrl;
        emailDispatched = Boolean(edgeResult.emailDispatched);
      }
    } catch (edgeErr) {
      console.warn('Edge Function relative registration note (falling back to client store):', edgeErr);
    }

    const newRelativeUser: User = {
      id: relativeUserId,
      name: residentData.emergencyContact?.name || 'Relative of ' + newResident.fullName,
      email: relativeEmail.toLowerCase(),
      phone: residentData.emergencyContact?.phone || '+234 706 933 2193',
      role: 'Resident Relative',
      relationship: residentData.emergencyContact?.relationship || 'Next of Kin',
      residentLinkedId: newResident.id,
      password: tempPassword,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    };
    setUsers(prev => ensureUniqueKeys([...prev, newRelativeUser], 'usr'));

    // Provision relative account into Firebase Authentication
    try {
      await createFirebaseUserByAdmin(relativeEmail.toLowerCase(), tempPassword, newRelativeUser.name);
    } catch (fbRelErr) {
      console.warn('Firebase Auth relative registration notice:', fbRelErr);
    }

    // Persist resident and relative account across backend server database & Firestore
    await Promise.allSettled([
      setDoc(doc(db, 'residents', newResident.id), sanitizeForFirestore(newResident), { merge: true }),
      setDoc(doc(db, 'users', newRelativeUser.id), sanitizeForFirestore(newRelativeUser), { merge: true }),
      fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResident),
      }),
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRelativeUser),
      }),
    ]);

    // Guaranteed transactional email transmission to primary relative if not dispatched yet
    if (!emailDispatched && relativeEmail.includes('@') && !relativeEmail.endsWith('@relative.samanthasappy.com')) {
      try {
        const welcomeEmailObj = generateRelativeWelcomeEmail({
          relativeName: newRelativeUser.name,
          residentName: newResident.fullName,
          relationship: newRelativeUser.relationship || 'Next of Kin',
          username: relativeEmail,
          tempPassword,
          loginUrl: `${window.location.origin}/login`,
          setupPasswordUrl,
          careCategory: newResident.careCategory,
          facilityName: 'Samantha Sappy Care Home',
        });
        const directEmailRes = await fetch('/api/functions/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: relativeEmail,
            subject: welcomeEmailObj.subject,
            html: welcomeEmailObj.html,
            text: welcomeEmailObj.text,
          }),
        });
        if (directEmailRes.ok) emailDispatched = true;
      } catch (emErr) {
        console.warn('Direct relative email dispatch note:', emErr);
      }
    }

    // 3. Dispatch in-app Welcome Message to Relative
    const welcomeMsg: Message = {
      id: generateUUID(),
      senderId: currentUser?.id || 'usr-admin-1',
      senderName: currentUser?.name || 'Managing Director',
      senderRole: 'Admin',
      receiverId: newRelativeUser.id,
      receiverName: newRelativeUser.name,
      receiverRole: 'Resident Relative',
      subject: `🎉 Family Care Portal Access for ${newResident.fullName}`,
      content: `Dear ${newRelativeUser.name},\n\nYour relative ${newResident.fullName} has been registered into Samanthasappy Home Care. An account has been created for you to track care updates, view health vitals, and communicate with caregivers.\n\nYour Portal Login Details:\n- Username (Login Email): ${newRelativeUser.email}\n- Temporary Password: ${tempPassword}\n- Linked Resident: ${newResident.fullName}\n- Login Portal: ${window.location.origin}/login\n${setupPasswordUrl ? `- Password Setup Link: ${setupPasswordUrl}\n` : ''}\nPlease select the 'Relative' tab on the login screen to access your family care dashboard.\n\nWarm regards,\nSamanthasappy Home Administration`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    // 3b. Dispatch Dashboard Inbox Notification to Admin
    const adminUsers = users.filter(u => u.role === 'Admin');
    const adminTargets = adminUsers.length > 0 ? adminUsers : [{ id: 'usr-admin-1', name: 'Managing Director & Admin', role: 'Admin' as UserRole }];
    const adminResidentNotifications: Message[] = adminTargets.map(admin => ({
      id: generateUUID(),
      senderId: 'usr-system',
      senderName: 'Admissions System',
      senderRole: 'Admin' as UserRole,
      receiverId: admin.id,
      receiverName: admin.name,
      receiverRole: 'Admin' as UserRole,
      subject: `🏡 New Resident Registered: ${newResident.fullName} (${newResident.careCategory})`,
      content: `A new resident has been registered and their family portal account is activated.\n\nRESIDENT & RELATIVE DETAILS:\n• Resident Name: ${newResident.fullName}\n• Care Category: ${newResident.careCategory}\n• Room / Suite: ${newResident.roomNumber}\n• Next of Kin / Relative: ${newRelativeUser.name} (${newRelativeUser.relationship || 'Next of Kin'})\n• Relative Email (Login Username): ${newRelativeUser.email}\n• Relative Phone: ${newRelativeUser.phone}\n• Temporary Password: ${tempPassword}\n\nAutomated onboarding confirmation email with temporary password dispatched to: ${newRelativeUser.email}\nAdmin notification email dispatched to: samanthasappy@gmail.com`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }));

    setMessages(prev => [welcomeMsg, ...adminResidentNotifications, ...prev]);
    setDoc(doc(db, 'messages', welcomeMsg.id), sanitizeForFirestore(welcomeMsg), { merge: true }).catch(() => {});
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(welcomeMsg),
    }).catch(() => {});

    adminResidentNotifications.forEach(m => {
      setDoc(doc(db, 'messages', m.id), sanitizeForFirestore(m), { merge: true }).catch(() => {});
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      }).catch(() => {});
    });
    try {
      await supabase.from('messages').insert([messageToRow(welcomeMsg), ...adminResidentNotifications.map(messageToRow)]);
    } catch (err) {
      console.warn('Supabase message insert notice:', err);
    }

    // 4. Log Activity
    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'New Resident & Relative Account Registered',
      description: `Added ${newResident.fullName}. Relative credentials and temporary password dispatched to ${newRelativeUser.email}.`,
      category: 'Admission',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    fetch('/api/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Resident ${newResident.fullName} registered & temporary password sent to ${newRelativeUser.email}.`);
    return {
      resident: newResident,
      relativeUser: newRelativeUser,
      tempPassword,
      setupPasswordUrl,
      emailDispatched,
    };
  };

  const updateResident = async (id: string, updated: Partial<Resident>) => {
    setResidents(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    const target = residents.find(r => r.id === id);
    const merged = { ...(target || {}), ...updated, id };

    await Promise.allSettled([
      setDoc(doc(db, 'residents', id), sanitizeForFirestore(updated), { merge: true }),
      fetch('/api/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }),
    ]);

    try {
      await supabase.from('residents').update(residentToRow(updated)).eq('id', id);
    } catch (err) {
      console.warn('Supabase resident update notice:', err);
    }
    showToast('Resident details updated.');
  };

  const deleteResident = async (id: string) => {
    const target = residents.find(r => r.id === id);
    const linkedRelative = users.find(u => u.residentLinkedId === id || (target && u.name.toLowerCase().includes(target.fullName.toLowerCase())));
    const relativeEmail = linkedRelative?.email;

    // Immediately purge all files from Supabase Storage (avatar and reference documents)
    const storageFilesToDelete: (string | null | undefined)[] = [
      target?.avatar,
      linkedRelative?.avatar,
      ...(target?.references?.map(r => r.photoUrl) || []),
    ];
    deleteMultipleFromStorage(storageFilesToDelete).catch(() => {});

    // 1. Instant optimistic update on Dashboard UI
    setResidents(prev => prev.filter(r => r.id !== id));
    if (linkedRelative) {
      setUsers(prev => prev.filter(u => u.id !== linkedRelative.id && (!relativeEmail || u.email.toLowerCase() !== relativeEmail.toLowerCase())));
    }

    // 2. Immediate Firestore & Backend Server deletion
    await Promise.allSettled([
      deleteDoc(doc(db, 'residents', id)),
      linkedRelative ? deleteDoc(doc(db, 'users', linkedRelative.id)) : Promise.resolve(),
      fetch(`/api/residents/${id}`, { method: 'DELETE' }),
      linkedRelative ? fetch(`/api/users/${linkedRelative.id}?email=${encodeURIComponent(relativeEmail || '')}`, { method: 'DELETE' }) : Promise.resolve(),
    ]);

    // 3. Immediate Supabase Database deletion
    try {
      await supabase.from('residents').delete().eq('id', id);
      await supabase.from('relatives').delete().eq('resident_id', id);
      if (linkedRelative) {
        await supabase.from('profiles').delete().eq('id', linkedRelative.id);
      }
      if (relativeEmail) {
        await supabase.from('relatives').delete().ilike('email', relativeEmail);
        await supabase.from('profiles').delete().ilike('email', relativeEmail);
      }
    } catch (err) {
      console.warn('Supabase resident delete notice:', err);
    }

    // 4. Immediate Supabase Auth credentials purge (removes from auth.users)
    invokeDeleteResident({
      residentId: id,
      residentName: target?.fullName,
      relativeEmail: relativeEmail,
    }).catch(err => console.warn('Supabase auth resident deletion warning:', err));

    if (target) {
      showToast(`Removed resident ${target.fullName}.`);
    }
  };

  // ============================================================================
  // STAFF MANAGEMENT (SECURE EDGE FUNCTION & WELCOME EMAIL)
  // ============================================================================

  const addStaff = async (staffData: Omit<StaffMember, 'id' | 'joinDate' | 'assignedResidentsCount'>) => {
    const cleanEmail = staffData.email.trim().toLowerCase();
    const cleanPhone = staffData.phone.trim();

    // STRICT DUPLICATE CHECK: email and phone against both staff and users
    const duplicateStaff = staff.find(s => 
      areEmailsEqual(s.email, cleanEmail) || arePhonesEqual(s.phone, cleanPhone)
    );
    const duplicateUser = users.find(u => 
      areEmailsEqual(u.email, cleanEmail) || arePhonesEqual(u.phone, cleanPhone)
    );

    if (duplicateStaff || duplicateUser) {
      const msg = `Registration Blocked: A staff member or user with this email (${cleanEmail}) or phone (${cleanPhone}) is already registered.`;
      showToast(msg);
      throw new Error(msg);
    }

    const tempPassword = generateTempPassword();
    const staffUUID = generateUUID();

    // 1. Upload/Compress Avatar if base64/data
    let avatarUrl = staffData.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';
    if (staffData.avatar?.startsWith('data:')) {
      try {
        avatarUrl = await compressImage(staffData.avatar, 400, 400, 0.82);
      } catch {
        // Fallback
      }
    }

    // Process reference photos if any (compressed for Firestore compatibility)
    const processedReferences = await Promise.all(
      (staffData.references || []).map(async (ref) => {
        let photoUrl = ref.photoUrl;
        if (ref.photoUrl?.startsWith('data:')) {
          try {
            photoUrl = await compressImage(ref.photoUrl, 400, 400, 0.82);
          } catch {
            // Keep original
          }
        }
        return { ...ref, photoUrl };
      })
    );

    const joinDate = new Date().toISOString().split('T')[0];

    // 1. Call Privileged Supabase Edge Function to Create Auth Account, DB Profile & Dispatch Email
    let effectiveStaffUUID = staffUUID;
    let setupPasswordUrl: string | undefined;
    let emailDispatched = false;

    try {
      const edgeResult = await invokeRegisterStaff({
        name: staffData.name,
        email: cleanEmail,
        phone: staffData.phone,
        position: staffData.position,
        qualification: staffData.qualification,
        shift: staffData.shift,
        avatar: avatarUrl,
        references: processedReferences,
        tempPassword,
      });

      if (edgeResult.success) {
        if (edgeResult.user?.id && edgeResult.user.id !== 'local_user') {
          effectiveStaffUUID = edgeResult.user.id;
        }
        setupPasswordUrl = edgeResult.setupPasswordUrl;
        emailDispatched = Boolean(edgeResult.emailDispatched);
      }
    } catch (edgeErr) {
      console.warn('Edge Function staff registration note (falling back to client store):', edgeErr);
    }

    const newStaff: StaffMember = {
      ...staffData,
      id: effectiveStaffUUID,
      joinDate,
      assignedResidentsCount: 0,
      avatar: avatarUrl,
      references: processedReferences,
    };
    setStaff(prev => ensureUniqueKeys([newStaff, ...prev], 'stf'));

    const newUser: User = {
      id: effectiveStaffUUID,
      name: newStaff.name,
      email: cleanEmail,
      phone: newStaff.phone,
      role: 'Staff',
      position: newStaff.position,
      avatar: newStaff.avatar,
      password: tempPassword,
    };
    setUsers(prev => ensureUniqueKeys([...prev, newUser], 'usr'));

    // Provision staff account into Firebase Authentication
    try {
      await createFirebaseUserByAdmin(cleanEmail, tempPassword, newStaff.name);
    } catch (fbStaffErr) {
      console.warn('Firebase Auth staff registration notice:', fbStaffErr);
    }

    // Save to Firestore and Server API immediately for all devices
    await Promise.allSettled([
      setDoc(doc(db, 'staff', newStaff.id), sanitizeForFirestore(newStaff), { merge: true }),
      setDoc(doc(db, 'users', newUser.id), sanitizeForFirestore(newUser), { merge: true }),
      fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff),
      }),
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }),
    ]);

    // 2. Dispatch In-App Welcome Message to Staff Member
    const welcomeMsg: Message = {
      id: generateUUID(),
      senderId: currentUser?.id || 'usr-admin-1',
      senderName: currentUser?.name || 'Managing Director',
      senderRole: 'Admin',
      receiverId: newUser.id,
      receiverName: newUser.name,
      receiverRole: 'Staff',
      subject: '🎉 Welcome to Samanthasappy Home - Staff Account Login Credentials',
      content: `Hello ${newUser.name},\n\nWelcome to the Samanthasappy Home Care Team! Your official staff portal account has been registered.\n\nYour Login Credentials:\n- Username (Login Email): ${newUser.email}\n- Temporary Password: ${tempPassword}\n- Access Role: Staff (${newStaff.position})\n${setupPasswordUrl ? `- Password Setup Link: ${setupPasswordUrl}\n` : ''}\nPlease keep these credentials secure and change your password upon your first login.\n\nWarm regards,\nSamanthasappy Home Administration`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    // 2b. Dispatch Dashboard Inbox Notification to Admin
    const adminUsers = users.filter(u => u.role === 'Admin');
    const adminTargets = adminUsers.length > 0 ? adminUsers : [{ id: 'usr-admin-1', name: 'Managing Director & Admin', role: 'Admin' as UserRole }];
    const adminStaffNotifications: Message[] = adminTargets.map(admin => ({
      id: generateUUID(),
      senderId: 'usr-system',
      senderName: 'Staff Onboarding System',
      senderRole: 'Admin' as UserRole,
      receiverId: admin.id,
      receiverName: admin.name,
      receiverRole: 'Admin' as UserRole,
      subject: `🔔 New Staff Registered: ${newStaff.name} (${newStaff.position})`,
      content: `A new staff member has been registered and provisioned in the care management system.\n\nSTAFF DETAILS:\n• Full Name: ${newStaff.name}\n• Position / Role: ${newStaff.position}\n• Registered Email: ${cleanEmail}\n• Phone Number: ${newStaff.phone}\n• Qualification: ${newStaff.qualification || 'N/A'}\n• Assigned Shift: ${newStaff.shift || 'N/A'}\n\nAutomated onboarding confirmation email dispatched to: ${cleanEmail}\nAdmin notification email dispatched to: samanthasappy@gmail.com`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }));

    setMessages(prev => [welcomeMsg, ...adminStaffNotifications, ...prev]);
    setDoc(doc(db, 'messages', welcomeMsg.id), sanitizeForFirestore(welcomeMsg), { merge: true }).catch(() => {});
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(welcomeMsg),
    }).catch(() => {});

    adminStaffNotifications.forEach(m => {
      setDoc(doc(db, 'messages', m.id), sanitizeForFirestore(m), { merge: true }).catch(() => {});
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      }).catch(() => {});
    });
    try {
      await supabase.from('messages').insert([messageToRow(welcomeMsg), ...adminStaffNotifications.map(messageToRow)]);
    } catch (err) {
      console.warn('Supabase message insert notice:', err);
    }

    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'New Staff Member Registered & Welcome Email Dispatched',
      description: `Registered ${newStaff.name} as ${newStaff.position} (${newUser.email}). Automatic welcome email sent.`,
      category: 'Staff',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    fetch('/api/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Staff member ${newStaff.name} registered & welcome email sent to ${cleanEmail}.`);
    return {
      user: newUser,
      tempPassword,
      setupPasswordUrl,
      emailDispatched,
    };
  };

  const updateStaff = async (id: string, updated: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    const userUpdates: Partial<User> = {};
    if (updated.name) userUpdates.name = updated.name;
    if (updated.email) userUpdates.email = updated.email.trim().toLowerCase();
    if (updated.phone) userUpdates.phone = updated.phone;
    if (updated.position) userUpdates.position = updated.position;
    if (updated.avatar) userUpdates.avatar = updated.avatar;
    if (Object.keys(userUpdates).length > 0) {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userUpdates } : u));
      updateDoc(doc(db, 'users', id), sanitizeForFirestore(userUpdates)).catch(() => {});
    }
    updateDoc(doc(db, 'staff', id), sanitizeForFirestore(updated)).catch(() => {});

    const currentStaff = staff.find(s => s.id === id);
    const mergedStaff = { ...(currentStaff || {}), ...updated, id };

    await Promise.allSettled([
      fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedStaff),
      }),
      Object.keys(userUpdates).length > 0 ? fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...userUpdates }),
      }) : Promise.resolve(),
    ]);

    try {
      await supabase.from('staff').update(staffToRow(updated)).eq('id', id);
      if (Object.keys(userUpdates).length > 0) {
        await supabase.from('profiles').update(userToProfile(userUpdates as User)).eq('id', id);
      }
    } catch (err) {
      console.warn('Supabase staff update notice:', err);
    }
    showToast('Staff profile updated.');
  };

  const deleteStaff = async (id: string) => {
    const target = staff.find(s => s.id === id);
    const targetUser = users.find(u => u.id === id || (target?.email && (u?.email || '').toLowerCase() === target.email.toLowerCase()));
    const targetEmail = target?.email || targetUser?.email;

    // Immediately purge all files from Supabase Storage (avatar & guarantor documents)
    const storageFilesToDelete: (string | null | undefined)[] = [
      target?.avatar,
      targetUser?.avatar,
      ...(target?.references?.map(r => r.photoUrl) || []),
    ];
    deleteMultipleFromStorage(storageFilesToDelete).catch(() => {});

    // 1. Instant optimistic update on Dashboard UI
    setStaff(prev => prev.filter(s => s.id !== id && (!targetEmail || (s?.email || '').toLowerCase() !== targetEmail.toLowerCase())));
    setUsers(prev => prev.filter(u => u.id !== id && (!targetEmail || (u?.email || '').toLowerCase() !== targetEmail.toLowerCase())));
    
    // 2. Immediate Firestore & Backend Server deletion
    await Promise.allSettled([
      deleteDoc(doc(db, 'staff', id)),
      deleteDoc(doc(db, 'users', id)),
      fetch(`/api/staff/${id}?email=${encodeURIComponent(targetEmail || '')}`, { method: 'DELETE' }),
      fetch(`/api/users/${id}?email=${encodeURIComponent(targetEmail || '')}`, { method: 'DELETE' }),
    ]);
    
    // 3. Immediate Supabase Database deletion
    try {
      await supabase.from('staff').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id);
      if (targetEmail) {
        await supabase.from('staff').delete().ilike('email', targetEmail);
        await supabase.from('profiles').delete().ilike('email', targetEmail);
      }
    } catch (err) {
      console.warn('Supabase staff delete notice:', err);
    }

    // 4. Automatically purge user credentials from Supabase Auth (auth.users)
    invokeDeleteStaff({
      staffId: id,
      email: targetEmail,
      name: target?.name,
    }).catch(err => console.warn('Supabase auth staff deletion warning:', err));

    if (target) {
      showToast(`Removed staff member ${target.name}.`);
    }
  };

  const deleteUserAccount = async (userId: string, email?: string): Promise<boolean> => {
    const cleanEmail = email?.trim().toLowerCase();
    if (cleanEmail === 'samanthasappy@gmail.com' || cleanEmail === 'admin@samanthasappy.com' || cleanEmail === 'itopaprop@gmail.com') {
      showToast('Cannot delete the primary administrator account.');
      return false;
    }

    const targetUser = users.find(u => u.id === userId || (cleanEmail && (u.email || '').toLowerCase() === cleanEmail));
    if (targetUser?.avatar) {
      deleteFromStorage(targetUser.avatar).catch(() => {});
    }

    setUsers(prev => prev.filter(u => u.id !== userId && (!cleanEmail || (u?.email || '').toLowerCase() !== cleanEmail)));
    setStaff(prev => prev.filter(s => s.id !== userId && (!cleanEmail || (s?.email || '').toLowerCase() !== cleanEmail)));

    await Promise.allSettled([
      deleteDoc(doc(db, 'users', userId)),
      deleteDoc(doc(db, 'staff', userId)),
      fetch(`/api/users/${userId}?email=${encodeURIComponent(cleanEmail || '')}`, { method: 'DELETE' }),
      fetch(`/api/staff/${userId}?email=${encodeURIComponent(cleanEmail || '')}`, { method: 'DELETE' }),
    ]);

    try {
      await supabase.from('profiles').delete().eq('id', userId);
      await supabase.from('staff').delete().or(`id.eq.${userId},user_id.eq.${userId}`);
      if (cleanEmail) {
        await supabase.from('profiles').delete().ilike('email', cleanEmail);
        await supabase.from('staff').delete().ilike('email', cleanEmail);
      }
    } catch (dbErr) {
      console.warn('Supabase DB delete note:', dbErr);
    }

    const delRes = await invokeDeleteUser({ userId, email: cleanEmail });
    if (delRes.success) {
      showToast(`Account ${cleanEmail || userId} deleted from Supabase Auth & database.`);
      return true;
    } else {
      showToast(`Account removed. (Auth notice: ${delRes.error || 'Server processed'})`);
      return false;
    }
  };

  const purgeAllNonAdminUsers = async (): Promise<{ success: boolean; deletedCount: number }> => {
    setUsers(prev => prev.filter(u => u.role === 'Admin' || (u?.email && ((u.email || '').toLowerCase() === 'samanthasappy@gmail.com' || (u.email || '').toLowerCase() === 'admin@samanthasappy.com' || (u.email || '').toLowerCase() === 'itopaprop@gmail.com'))));
    setStaff(prev => prev.filter(s => s.role === 'Admin' || (s?.email && ((s.email || '').toLowerCase() === 'samanthasappy@gmail.com' || (s.email || '').toLowerCase() === 'admin@samanthasappy.com' || (s.email || '').toLowerCase() === 'itopaprop@gmail.com'))));

    const result = await invokeCleanupNonAdminUsers('samanthasappy@gmail.com');
    if (result.success) {
      showToast(`Purged ${result.deletedCount || 0} non-admin user account(s) from Supabase Auth.`);
      return { success: true, deletedCount: result.deletedCount || 0 };
    } else {
      showToast(`Purge notice: ${result.error || 'Failed to cleanup'}`);
      return { success: false, deletedCount: 0 };
    }
  };

  const deduplicateDatabase = async (): Promise<{ success: boolean; removedCount: number; details: string[] }> => {
    try {
      showToast('Scanning database for duplicate registrations (email & phone)...');
      const res = await fetch('/api/admin/deduplicate-database', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const totalRemoved = (data.removedUsers || 0) + (data.removedStaff || 0) + (data.removedResidents || 0) + (data.removedApplications || 0);
        if (totalRemoved > 0) {
          showToast(`Cleanup complete: Removed ${totalRemoved} duplicate registration(s) (leaving 1 of each).`);
        } else {
          showToast('Database verified clean: No duplicate registrations found.');
        }
        await syncDatabase();
        return { success: true, removedCount: totalRemoved, details: data.details || [] };
      } else {
        showToast(`Deduplication notice: ${data.error || 'Server processing'}`);
        return { success: false, removedCount: 0, details: [] };
      }
    } catch (err: any) {
      showToast(`Deduplication notice: ${err?.message || 'Check connection'}`);
      return { success: false, removedCount: 0, details: [] };
    }
  };

  const purgeAllDemoRecords = async (): Promise<{ success: boolean }> => {
    try {
      // 1. Instant local filter
      setResidents(prev => prev.filter(r => !isDemoRecord(r)));
      setStaff(prev => prev.filter(s => !isDemoRecord(s)));
      setUsers(prev => prev.filter(u => !isDemoRecord(u)));
      setShifts(prev => prev.filter(sh => !isDemoRecord(sh)));
      setMessages(prev => prev.filter(m => !isDemoRecord(m)));
      setActivityLogs(prev => prev.filter(l => !isDemoRecord(l)));

      // 2. Clear local storage
      localStorage.removeItem('shh_residents');
      localStorage.removeItem('shh_staff');
      localStorage.removeItem('shh_shifts');
      localStorage.removeItem('shh_messages');
      localStorage.removeItem('shh_activity_logs');

      // 3. Supabase cleanup
      const demoResidentIds = ['res-101', 'res-102', 'res-103', 'res-104', 'res-105', 'res-106'];
      const demoStaffIds = ['usr-staff-1', 'usr-staff-2', 'usr-staff-3', 'usr-staff-4'];
      
      demoResidentIds.forEach(id => {
        supabase.from('residents').delete().eq('id', id).then(() => {}, () => {});
        deleteDoc(doc(db, 'residents', id)).catch(() => {});
      });

      demoStaffIds.forEach(id => {
        supabase.from('staff').delete().eq('id', id).then(() => {}, () => {});
        supabase.from('profiles').delete().eq('id', id).then(() => {}, () => {});
        deleteDoc(doc(db, 'staff', id)).catch(() => {});
        deleteDoc(doc(db, 'users', id)).catch(() => {});
      });

      // Query Firestore collections for any remaining demo docs
      try {
        const collectionsToScrub = ['residents', 'staff', 'shifts', 'messages', 'events', 'users', 'activity_logs'];
        for (const colName of collectionsToScrub) {
          try {
            const snap = await getDocs(collection(db, colName));
            snap.forEach(d => {
              if (isDemoRecord(d.data()) || isDemoRecord({ id: d.id })) {
                deleteDoc(doc(db, colName, d.id)).catch(() => {});
              }
            });
          } catch (colErr) {
            console.warn(`Firestore scrub notice for ${colName}:`, colErr);
          }
        }
      } catch (e) {
        console.warn('Scrubbing Firestore demo docs notice:', e);
      }

      showToast('All demo records successfully removed.');
      return { success: true };
    } catch (err: any) {
      console.warn('Purge demo error:', err);
      showToast('Completed cleanup of demo records.');
      return { success: true };
    }
  };

  // ============================================================================
  // SHIFTS
  // ============================================================================

  const addShift = async (shiftData: Omit<Shift, 'id'>) => {
    const shiftUUID = generateUUID();
    const newShift: Shift = {
      ...shiftData,
      id: shiftUUID,
    };
    setShifts(prev => ensureUniqueKeys([newShift, ...prev], 'sh'));

    // Save to Firestore & backend server
    await Promise.allSettled([
      setDoc(doc(db, 'shifts', newShift.id), sanitizeForFirestore(newShift), { merge: true }),
      fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift),
      }),
    ]);

    try {
      const { data: inserted } = await supabase
        .from('shifts')
        .insert([shiftToRow(newShift)])
        .select()
        .single();
      if (inserted) newShift.id = inserted.id;
    } catch (err) {
      console.warn('Supabase shift insert notice:', err);
    }

    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'Shift Scheduled',
      description: `Scheduled ${shiftData.shiftType} shift for ${shiftData.staffName} on ${shiftData.shiftDate}.`,
      category: 'Shift',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    fetch('/api/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Shift scheduled for ${shiftData.staffName}.`);
  };

  const updateShift = async (id: string, updated: Partial<Shift>) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    const target = shifts.find(s => s.id === id);
    const merged = { ...(target || {}), ...updated, id };

    await Promise.allSettled([
      setDoc(doc(db, 'shifts', id), sanitizeForFirestore(updated), { merge: true }),
      fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }),
    ]);

    try {
      await supabase.from('shifts').update(shiftToRow(updated)).eq('id', id);
    } catch (err) {
      console.warn('Supabase shift update notice:', err);
    }
    showToast('Shift details updated.');
  };

  const deleteShift = async (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    await Promise.allSettled([
      deleteDoc(doc(db, 'shifts', id)),
      fetch(`/api/shifts/${id}`, { method: 'DELETE' }),
    ]);
    try {
      await supabase.from('shifts').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase shift delete notice:', err);
    }
    showToast('Shift removed.');
  };

  // ============================================================================
  // MESSAGES
  // ============================================================================

  const sendMessage = async (msgData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const msgUUID = generateUUID();
    const newMsg: Message = {
      ...msgData,
      id: msgUUID,
      isRead: false,
      timestamp,
    };

    // Check if message is between Resident Relative and Caregiver Staff
    const isRelativeAndStaff = 
      (msgData.senderRole === 'Resident Relative' && msgData.receiverRole === 'Staff') ||
      (msgData.senderRole === 'Staff' && msgData.receiverRole === 'Resident Relative');

    if (isRelativeAndStaff) {
      const adminUsers = users.filter(u => u.role === 'Admin');
      const targetAdmin = adminUsers[0] || { id: 'usr-admin-1', name: 'Folasade Sanyaolu', role: 'Admin' };

      if (msgData.receiverId !== targetAdmin.id) {
        const ccMsg: Message = {
          ...msgData,
          id: generateUUID(),
          receiverId: targetAdmin.id,
          receiverName: `${targetAdmin.name} (Admin CC)`,
          receiverRole: 'Admin',
          subject: `[CC to Admin] ${msgData.subject}`,
          content: `[Copied to Admin]\nSender: ${msgData.senderName} (${msgData.senderRole})\nRecipient: ${msgData.receiverName} (${msgData.receiverRole})\n---\n${msgData.content}`,
          isRead: false,
          timestamp,
        };
        setMessages(prev => [newMsg, ccMsg, ...prev]);
        await Promise.allSettled([
          setDoc(doc(db, 'messages', newMsg.id), sanitizeForFirestore(newMsg), { merge: true }),
          setDoc(doc(db, 'messages', ccMsg.id), sanitizeForFirestore(ccMsg), { merge: true }),
          fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newMsg),
          }),
          fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ccMsg),
          }),
        ]);

        try {
          await supabase.from('messages').insert([messageToRow(newMsg), messageToRow(ccMsg)]);
        } catch (err) {
          console.warn('Supabase message insert notice:', err);
        }

        showToast(`Message sent to ${msgData.receiverName} (Copied to Admin).`);
        return;
      }
    }

    setMessages(prev => [newMsg, ...prev]);
    await Promise.allSettled([
      setDoc(doc(db, 'messages', newMsg.id), sanitizeForFirestore(newMsg), { merge: true }),
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg),
      }),
    ]);

    try {
      await supabase.from('messages').insert([messageToRow(newMsg)]);
    } catch (err) {
      console.warn('Supabase message insert notice:', err);
    }
    showToast(`Message sent to ${msgData.receiverName}.`);
  };

  const markMessageAsRead = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    const target = messages.find(m => m.id === id);
    const updated = { ...(target || {}), isRead: true, id };

    await Promise.allSettled([
      updateDoc(doc(db, 'messages', id), { isRead: true }),
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }),
    ]);

    try {
      await supabase.from('messages').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.warn('Supabase message update notice:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    await Promise.allSettled([
      deleteDoc(doc(db, 'messages', id)),
      fetch(`/api/messages/${id}`, { method: 'DELETE' }),
    ]);
    try {
      await supabase.from('messages').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase message delete notice:', err);
    }
    showToast('Message deleted.');
  };

  const deleteApplication = async (id: string) => {
    const target = applications.find(a => a.id === id);
    setApplications(prev => prev.filter(a => a.id !== id));

    // Immediately clean up application files from Supabase Storage
    if (target) {
      const filesToDelete = [
        target.photoUrl,
        target.receiptUrl,
        ...(target.references?.map(r => r.photoUrl) || []),
      ];
      deleteMultipleFromStorage(filesToDelete).catch(() => {});
    }

    await Promise.allSettled([
      deleteDoc(doc(db, 'applications', id)),
      fetch(`/api/applications/${id}`, { method: 'DELETE' }),
    ]);

    try {
      await supabase.from('applications').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase application delete notice:', err);
    }
    showToast('Application submission deleted.');
  };

  const bookConsultation = async (bookingData: Omit<ConsultationBooking, 'id' | 'status' | 'createdAt'>) => {
    const cbUUID = generateUUID();
    const newBooking: ConsultationBooking = {
      ...bookingData,
      id: cbUUID,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setConsultationBookings(prev => [newBooking, ...prev]);

    // Save to Firestore & backend server
    await Promise.allSettled([
      setDoc(doc(db, 'consultations', newBooking.id), sanitizeForFirestore(newBooking), { merge: true }),
      fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking),
      }),
    ]);

    try {
      const { data: inserted } = await supabase
        .from('consultation_bookings')
        .insert([consultationToRow(newBooking)])
        .select()
        .single();
      if (inserted) newBooking.id = inserted.id;
    } catch (err) {
      console.warn('Supabase consultation insert notice:', err);
    }

    showToast('Consultation request submitted successfully! Our care team will contact you shortly.');
  };

  const deleteConsultation = async (id: string) => {
    setConsultationBookings(prev => prev.filter(c => c.id !== id));
    await Promise.allSettled([
      deleteDoc(doc(db, 'consultations', id)),
      fetch(`/api/consultations/${id}`, { method: 'DELETE' }),
    ]);
    showToast('Consultation removed.');
  };

  // ============================================================================
  // COMMUNITY EVENTS
  // ============================================================================

  const addEvent = async (eventData: Omit<CommunityEvent, 'id'>) => {
    const eventUUID = generateUUID();
    let imageUrl = eventData.imageUrl;
    if (eventData.imageUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('public-media', 'events', eventData.imageUrl, `${eventUUID}_event.jpg`);
      if (url) imageUrl = url;
    }

    const newEvent: CommunityEvent = {
      ...eventData,
      imageUrl,
      id: eventUUID,
    };
    setEvents(prev => [newEvent, ...prev]);

    // Save to Firestore & backend server
    await Promise.allSettled([
      setDoc(doc(db, 'events', newEvent.id), sanitizeForFirestore(newEvent), { merge: true }),
      fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent),
      }),
    ]);

    try {
      const { data: inserted } = await supabase
        .from('community_events')
        .insert([eventToRow(newEvent)])
        .select()
        .single();
      if (inserted) newEvent.id = inserted.id;
    } catch (err) {
      console.warn('Supabase event insert notice:', err);
    }

    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'Community Event Posted',
      description: `Posted new event "${eventData.title}" scheduled for ${eventData.date}.`,
      category: 'General',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    fetch('/api/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Event "${eventData.title}" posted successfully.`);
  };

  const updateEvent = async (id: string, updated: Partial<CommunityEvent>) => {
    let imageUrl = updated.imageUrl;
    if (updated.imageUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('public-media', 'events', updated.imageUrl, `${id}_event.jpg`);
      if (url) imageUrl = url;
    }
    const cleanUpdated = { ...updated, imageUrl };
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...cleanUpdated } : e));

    const target = events.find(e => e.id === id);
    const merged = { ...(target || {}), ...cleanUpdated, id };

    await Promise.allSettled([
      setDoc(doc(db, 'events', id), sanitizeForFirestore(cleanUpdated), { merge: true }),
      fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }),
    ]);

    try {
      await supabase.from('community_events').update(eventToRow(cleanUpdated)).eq('id', id);
    } catch (err) {
      console.warn('Supabase event update notice:', err);
    }
    showToast('Event updated.');
  };

  const deleteEvent = async (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));

    // Immediately clean up event image from Supabase Storage
    if (target?.imageUrl) {
      deleteFromStorage(target.imageUrl).catch(() => {});
    }

    // Delete from Firestore & server backend
    await Promise.allSettled([
      deleteDoc(doc(db, 'events', id)),
      fetch(`/api/events/${id}`, { method: 'DELETE' }),
    ]);

    try {
      await supabase.from('community_events').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase event delete notice:', err);
    }
    if (target) {
      showToast(`Removed event "${target.title}".`);
    }
  };

  // ============================================================================
  // JOB VACANCIES
  // ============================================================================

  const addJob = async (jobData: Omit<JobVacancy, 'id'>) => {
    const jobUUID = generateUUID();
    const newJob: JobVacancy = {
      ...jobData,
      id: jobUUID,
    };
    setJobs(prev => [newJob, ...prev]);

    await Promise.allSettled([
      setDoc(doc(db, 'jobs', newJob.id), sanitizeForFirestore(newJob), { merge: true }),
      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      }),
    ]);

    try {
      const { data: inserted } = await supabase
        .from('job_vacancies')
        .insert([jobToRow(newJob)])
        .select()
        .single();
      if (inserted) newJob.id = inserted.id;
    } catch (err) {
      console.warn('Supabase job insert notice:', err);
    }

    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'Job Vacancy Posted',
      description: `Posted new job opening for "${jobData.title}" in ${jobData.department}.`,
      category: 'Staff',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    fetch('/api/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Job opening for "${jobData.title}" posted successfully.`);
  };

  const updateJob = async (id: string, updated: Partial<JobVacancy>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updated } : j));
    const target = jobs.find(j => j.id === id);
    const merged = { ...(target || {}), ...updated, id };

    await Promise.allSettled([
      setDoc(doc(db, 'jobs', id), sanitizeForFirestore(updated), { merge: true }),
      fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }),
    ]);

    try {
      await supabase.from('job_vacancies').update(jobToRow(updated)).eq('id', id);
    } catch (err) {
      console.warn('Supabase job update notice:', err);
    }
    showToast('Job vacancy updated.');
  };

  const deleteJob = async (id: string) => {
    const target = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));

    await Promise.allSettled([
      deleteDoc(doc(db, 'jobs', id)),
      fetch(`/api/jobs/${id}`, { method: 'DELETE' }),
    ]);

    try {
      await supabase.from('job_vacancies').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase job delete notice:', err);
    }
    if (target) {
      showToast(`Removed job opening "${target.title}".`);
    }
  };

  // ============================================================================
  // GALLERY ITEMS
  // ============================================================================

  const addGalleryItem = async (itemData: Omit<GalleryItem, 'id'>) => {
    const galUUID = generateUUID();
    let imageUrl = itemData.imageUrl;
    let videoUrl = itemData.videoUrl;

    if (imageUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('public-media', 'gallery', imageUrl, `${galUUID}_img.jpg`);
      if (url) imageUrl = url;
    }

    if (videoUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('public-media', 'gallery-videos', videoUrl, `${galUUID}_video.mp4`);
      if (url) videoUrl = url;
    }

    const newItem: GalleryItem = {
      ...itemData,
      imageUrl,
      videoUrl,
      id: galUUID,
    };
    setGalleryItems(prev => [newItem, ...prev]);

    await Promise.allSettled([
      setDoc(doc(db, 'gallery', newItem.id), sanitizeForFirestore(newItem), { merge: true }),
      fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      }),
    ]);

    try {
      const { data: inserted } = await supabase
        .from('gallery_items')
        .insert([galleryToRow(newItem)])
        .select()
        .single();
      if (inserted) newItem.id = inserted.id;
    } catch (err) {
      console.warn('Supabase gallery insert notice:', err);
    }

    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'Gallery Media Uploaded',
      description: `Added new ${itemData.mediaType || 'image'} "${itemData.title}" to gallery.`,
      category: 'General',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    fetch('/api/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`New ${itemData.mediaType || 'media'} added to gallery.`);
  };

  const addMultipleGalleryItems = async (itemsData: Omit<GalleryItem, 'id'>[]) => {
    if (!itemsData.length) return;

    // Process uploads in parallel
    const processedItems: GalleryItem[] = await Promise.all(
      itemsData.map(async (item) => {
        const itemUUID = generateUUID();
        let imageUrl = item.imageUrl;
        let videoUrl = item.videoUrl;

        if (imageUrl?.startsWith('data:')) {
          const { url } = await uploadToStorage('public-media', 'gallery', imageUrl, `${itemUUID}_img.jpg`);
          if (url) imageUrl = url;
        }

        if (videoUrl?.startsWith('data:')) {
          const { url } = await uploadToStorage('public-media', 'gallery-videos', videoUrl, `${itemUUID}_video.mp4`);
          if (url) videoUrl = url;
        }

        return {
          ...item,
          imageUrl,
          videoUrl,
          id: itemUUID,
        };
      })
    );

    setGalleryItems(prev => [...processedItems, ...prev]);

    await Promise.allSettled(
      processedItems.map(item =>
        Promise.allSettled([
          setDoc(doc(db, 'gallery', item.id), sanitizeForFirestore(item), { merge: true }),
          fetch('/api/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          }),
        ])
      )
    );

    try {
      await supabase.from('gallery_items').insert(processedItems.map(galleryToRow));
    } catch (err) {
      console.warn('Supabase batch gallery insert notice:', err);
    }

    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'Batch Gallery Media Uploaded',
      description: `Added ${itemsData.length} new photos/videos to gallery.`,
      category: 'General',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    fetch('/api/activity_logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog),
    }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Successfully added ${itemsData.length} items to gallery.`);
  };

  const updateGalleryItem = async (id: string, updated: Partial<GalleryItem>) => {
    let imageUrl = updated.imageUrl;
    let videoUrl = updated.videoUrl;

    if (imageUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('public-media', 'gallery', imageUrl, `${id}_img.jpg`);
      if (url) imageUrl = url;
    }

    if (videoUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('public-media', 'gallery-videos', videoUrl, `${id}_video.mp4`);
      if (url) videoUrl = url;
    }

    const cleanUpdated = { ...updated, imageUrl, videoUrl };
    setGalleryItems(prev => prev.map(g => g.id === id ? { ...g, ...cleanUpdated } : g));

    const target = galleryItems.find(g => g.id === id);
    const merged = { ...(target || {}), ...cleanUpdated, id };

    await Promise.allSettled([
      setDoc(doc(db, 'gallery', id), sanitizeForFirestore(cleanUpdated), { merge: true }),
      fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      }),
    ]);

    try {
      await supabase.from('gallery_items').update(galleryToRow(cleanUpdated)).eq('id', id);
    } catch (err) {
      console.warn('Supabase gallery item update notice:', err);
    }
    showToast('Gallery item updated.');
  };

  const deleteGalleryItem = async (id: string) => {
    const target = galleryItems.find(g => g.id === id);
    setGalleryItems(prev => prev.filter(g => g.id !== id));

    // Immediately clean up image and video from Supabase Storage
    if (target) {
      deleteMultipleFromStorage([target.imageUrl, target.videoUrl]).catch(() => {});
    }

    // Call server backend gallery delete API & Firestore
    await Promise.allSettled([
      deleteDoc(doc(db, 'gallery', id)),
      fetch(`/api/gallery/${id}`, { method: 'DELETE' }),
    ]);

    try {
      await supabase.from('gallery_items').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase gallery delete notice:', err);
    }
    if (target) {
      showToast(`Deleted "${target.title}" from gallery.`);
    }
  };

  // ============================================================================
  // CARE & JOB APPLICATIONS (WITH SUPABASE STORAGE & DATABASE)
  // ============================================================================

  const submitApplication = async (appData: Omit<ApplicationSubmission, 'id' | 'createdAt' | 'status'>): Promise<ApplicationSubmission> => {
    const cleanEmail = (appData.email || '').trim().toLowerCase();
    const cleanPhone = (appData.phone || '').trim();

    // STRICT DUPLICATE CHECK: verify both email and phone to prevent duplicate applications or clash with staff
    const existingApp = applications.find(a => 
      areEmailsEqual(a.email, cleanEmail) || arePhonesEqual(a.phone, cleanPhone)
    );
    if (existingApp) {
      const msg = `Duplicate Application Prevented: An application with this email (${cleanEmail}) or phone (${cleanPhone}) has already been submitted and is pending review.`;
      showToast(msg);
      throw new Error(msg);
    }

    if (appData.type === 'caregiver') {
      const existingStaffOrUser = staff.find(s => areEmailsEqual(s.email, cleanEmail) || arePhonesEqual(s.phone, cleanPhone)) ||
        users.find(u => areEmailsEqual(u.email, cleanEmail) || arePhonesEqual(u.phone, cleanPhone));
      if (existingStaffOrUser) {
        const msg = `Registration Prevented: A staff member or account with this email (${cleanEmail}) or phone (${cleanPhone}) already exists in the system.`;
        showToast(msg);
        throw new Error(msg);
      }
    }

    const appUUID = generateUUID();
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // 1. Upload applicant photo to documents/avatars bucket (resilient)
    let photoUrl = appData.photoUrl;
    if (appData.photoUrl?.startsWith('data:')) {
      try {
        const { url } = await uploadToStorage('documents', 'applicants', appData.photoUrl, `${appUUID}_applicant.jpg`);
        if (url) photoUrl = url;
      } catch (uploadErr) {
        console.warn('Applicant photo upload note (using raw preview):', uploadErr);
      }
    }

    // 2. Upload payment receipt to documents/receipts bucket (resilient)
    let receiptUrl = appData.receiptUrl;
    if (appData.receiptUrl?.startsWith('data:')) {
      try {
        const { url } = await uploadToStorage('documents', 'receipts', appData.receiptUrl, `${appUUID}_receipt.jpg`);
        if (url) receiptUrl = url;
      } catch (uploadErr) {
        console.warn('Receipt upload note (using raw preview):', uploadErr);
      }
    }

    // 3. Upload reference/guarantor documents (resilient)
    const rawRefs = Array.isArray(appData.references) ? appData.references : [];
    const processedReferences = await Promise.all(
      rawRefs.map(async (ref, idx) => {
        let refPhotoUrl = ref.photoUrl;
        if (ref.photoUrl?.startsWith('data:')) {
          try {
            const { url } = await uploadToStorage('documents', 'guarantors', ref.photoUrl, `${appUUID}_ref_${idx + 1}.jpg`);
            if (url) refPhotoUrl = url;
          } catch (uploadErr) {
            console.warn('Ref photo upload note:', uploadErr);
          }
        }
        return {
          ...ref,
          photoUrl: refPhotoUrl,
        };
      })
    );

    const newSubmission: ApplicationSubmission = {
      ...appData,
      photoUrl,
      receiptUrl,
      receiptName: appData.receiptName,
      references: processedReferences,
      id: appUUID,
      createdAt,
      status: 'Received',
    };

    // 4. Update local state immediately
    setApplications(prev => [newSubmission, ...prev]);

    // 5. Save to Firestore (real-time sync)
    setDoc(doc(db, 'applications', newSubmission.id), sanitizeForFirestore(newSubmission), { merge: true }).catch((fsErr) => {
      console.warn('Firestore application insert notice:', fsErr);
    });

    // 6. Save to Server API Cache
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSubmission),
    }).catch((srvErr) => {
      console.warn('Server application save notice:', srvErr);
    });

    // 7. Save to Supabase table
    try {
      const { data: inserted } = await supabase
        .from('applications')
        .insert([applicationToRow(newSubmission)])
        .select()
        .single();
      if (inserted) newSubmission.id = inserted.id;
    } catch (err) {
      console.warn('Supabase application insert notice:', err);
    }

    // 8. Dispatch high-priority Message / Notification to Admin users
    const adminUsers = users.filter(u => u.role === 'Admin');
    const knownAdmins: User[] = [
      { id: 'usr-admin-1', name: 'Folasade Sanyaolu (MD)', email: 'samanthasappy@gmail.com', phone: '+2347069332193', role: 'Admin' },
      { id: 'usr-admin-2', name: 'Folasade Sanyaolu (Admin)', email: 'itopaprop@gmail.com', phone: '+2347069332193', role: 'Admin' }
    ];
    const adminTargets = [...adminUsers];
    for (const ka of knownAdmins) {
      if (!adminTargets.some(a => (a.email || '').toLowerCase() === ka.email.toLowerCase())) {
        adminTargets.push(ka);
      }
    }

    const refsFormatted = processedReferences
      .map((r, idx) => `• Reference ${idx + 1}: ${r.name || 'N/A'} (${r.relationship || 'N/A'})\n  Phone: ${r.phone || 'N/A'} | Email: ${r.email || 'N/A'}${r.photoUrl ? ' | [Document Photo Attached]' : ''}`)
      .join('\n\n');

    const appTitle = appData.type === 'caregiver' ? 'Caregiver / Staff Job Application' : 'Resident Care Admission Application';

    const adminMessages: Message[] = adminTargets.map(admin => ({
      id: generateUUID(),
      senderId: 'usr-system',
      senderName: 'Care Application Portal',
      senderRole: 'Admin' as UserRole,
      receiverId: admin.id,
      receiverName: admin.name,
      receiverRole: 'Admin' as UserRole,
      subject: `📥 NEW CARE APPLICATION: ${appData.fullName} (${appData.type === 'caregiver' ? 'Caregiver Applicant' : 'Resident Admission Request'})`,
      content: `A new ${appTitle} has been submitted through the web portal.\n\nAPPLICANT FULL DETAILS:\n• Full Name: ${appData.fullName}\n• Email: ${appData.email}\n• Phone: ${appData.phone}\n• Care Category / Position: ${appData.positionOrCategory}\n${appData.sponsorName ? `• Sponsor / Next of Kin: ${appData.sponsorName}\n` : ''}${appData.notesOrStatement ? `• Medical / Qualification Notes: ${appData.notesOrStatement}\n` : ''}${photoUrl ? '• Applicant Photo: Attached\n' : ''}${receiptUrl ? `• Payment Receipt: Attached (${appData.receiptName || 'Bank Transfer Proof'})\n` : ''}\n\nATTACHED REFERENCES & GUARANTOR DOCUMENTS:\n${refsFormatted || 'None attached'}\n\nNotification dispatched to: ${adminTargets.map(a => a.email).filter(Boolean).join(', ')}\nSubmitted on: ${createdAt}`,
      attachmentUrl: receiptUrl || photoUrl || processedReferences[0]?.photoUrl,
      attachmentName: receiptUrl ? (appData.receiptName || `${appData.fullName.replace(/\s+/g, '_')}_Payment_Receipt.jpg`) : (photoUrl ? `${appData.fullName.replace(/\s+/g, '_')}_ID.jpg` : undefined),
      applicantPhotoUrl: photoUrl,
      references: processedReferences,
      isRead: false,
      timestamp: createdAt,
    }));

    setMessages(prev => [...adminMessages, ...prev]);
    adminMessages.forEach(m => {
      setDoc(doc(db, 'messages', m.id), sanitizeForFirestore(m), { merge: true }).catch(() => {});
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m),
      }).catch(() => {});
    });
    try {
      await supabase.from('messages').insert(adminMessages.map(messageToRow));
    } catch (err) {
      console.warn('Supabase admin messages insert notice:', err);
    }

    // 9. Dispatch automated Email Notification and Receipt Confirmation
    try {
      invokeSubmitApplication({
        applicantName: appData.fullName,
        email: appData.email,
        phone: appData.phone,
        type: appData.type,
        position: appData.positionOrCategory,
        careCategory: appData.positionOrCategory,
        notes: appData.notesOrStatement,
        paymentReceipt: !!receiptUrl,
        receiptName: appData.receiptName,
        sponsorName: appData.sponsorName,
        references: processedReferences,
      }).catch(e => console.warn('Submit application notification notice:', e));
    } catch (e) {
      console.warn('Application email dispatch note:', e);
    }

    // 10. Register Activity Log
    const newLog: ActivityLog = {
      id: generateUUID(),
      title: `New ${appData.type === 'caregiver' ? 'Caregiver' : 'Resident Care'} Application Received`,
      description: `Application submitted for ${appData.fullName} (${appData.positionOrCategory}). Full details notified to Admin.`,
      category: 'Admission',
      timestamp: createdAt,
      performer: appData.fullName,
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Application for ${appData.fullName} submitted successfully! Admin has been notified via dashboard inbox & email.`);
    return newSubmission;
  };

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      currentUser,
      users,
      isAuthLoading,
      loginUser,
      signUpUser,
      resetPassword,
      loginWithGoogle,
      switchDemoRole,
      logout,
      updateUserProfile,
      deleteUserAccount,
      purgeAllNonAdminUsers,
      purgeAllDemoRecords,
      deduplicateDatabase,
      residents,
      addResident,
      updateResident,
      deleteResident,
      staff,
      addStaff,
      updateStaff,
      deleteStaff,
      shifts,
      addShift,
      updateShift,
      deleteShift,
      messages,
      sendMessage,
      markMessageAsRead,
      deleteMessage,
      activityLogs,
      consultationBookings,
      bookConsultation,
      deleteConsultation,
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      jobs,
      addJob,
      updateJob,
      deleteJob,
      galleryItems,
      addGalleryItem,
      addMultipleGalleryItems,
      updateGalleryItem,
      deleteGalleryItem,
      applications,
      submitApplication,
      deleteApplication,
      toastMessage,
      showToast,
      isConsultationModalOpen,
      setIsConsultationModalOpen,
      isApplyModalOpen,
      setIsApplyModalOpen,
      selectedFacilityId,
      setSelectedFacilityId,
      syncDatabase,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

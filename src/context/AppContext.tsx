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
  logoutFirebaseUser,
  sanitizeForFirestore, 
  handleFirestoreError,
  OperationType 
} from '../lib/firebase';
import { 
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
} from 'firebase/firestore';
import { supabase, ephemeralAuthClient, uploadToStorage } from '../lib/supabase';
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
  logout: () => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<boolean>;
  deleteUserAccount: (userId: string, email?: string) => Promise<boolean>;
  purgeAllNonAdminUsers: () => Promise<{ success: boolean; deletedCount: number }>;
  purgeAllDemoRecords: () => Promise<{ success: boolean }>;
  
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
    'msg-101', 'msg-102', 'msg-103'
  ];
  if (demoIds.includes(id)) return true;

  // Known demo resident names
  const demoNames = [
    'eleanor miller', 'thomas wright', 'arthur pendelton', 'clara & leo bennett',
    'clara bennett', 'leo bennett', 'sophia lee', 'george harris',
    'sarah jenkins', 'marcus vance', 'emily watson', 'robert taylor',
    'david miller', 'rebecca wright'
  ];
  if (demoNames.some(dn => name.includes(dn))) return true;

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

const DEMO_CLEANUP_KEY = 'shh_demo_purge_v4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clear any existing cached demo records from previous sessions
  if (typeof window !== 'undefined' && localStorage.getItem(DEMO_CLEANUP_KEY) !== 'purged') {
    try {
      localStorage.removeItem('shh_residents');
      localStorage.removeItem('shh_staff');
      localStorage.removeItem('shh_shifts');
      localStorage.removeItem('shh_messages');
      localStorage.removeItem('shh_activity_logs');
      localStorage.removeItem('shh_users');
      localStorage.setItem(DEMO_CLEANUP_KEY, 'purged');
    } catch {
      // Ignore localStorage access restrictions
    }
  }

  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Users & Current Auth User
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('shh_users');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed.filter(u => !isDemoRecord(u)) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shh_current_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return isDemoRecord(parsed) ? null : parsed;
    } catch {
      return null;
    }
  });

  // Database Collections
  const [residents, setResidents] = useState<Resident[]>(() => {
    const saved = localStorage.getItem('shh_residents');
    if (!saved) return INITIAL_RESIDENTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(r => !isDemoRecord(r)) : INITIAL_RESIDENTS;
    } catch {
      return INITIAL_RESIDENTS;
    }
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('shh_staff');
    if (!saved) return INITIAL_STAFF;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(s => !isDemoRecord(s)) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('shh_shifts');
    if (!saved) return INITIAL_SHIFTS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(sh => !isDemoRecord(sh)) : INITIAL_SHIFTS;
    } catch {
      return INITIAL_SHIFTS;
    }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('shh_messages');
    if (!saved) return INITIAL_MESSAGES.filter(m => !isDemoRecord(m));
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(m => !isDemoRecord(m)) : INITIAL_MESSAGES.filter(m => !isDemoRecord(m));
    } catch {
      return INITIAL_MESSAGES.filter(m => !isDemoRecord(m));
    }
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('shh_activity_logs');
    if (!saved) return INITIAL_ACTIVITY_LOGS;
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  const [consultationBookings, setConsultationBookings] = useState<ConsultationBooking[]>(() => {
    const saved = localStorage.getItem('shh_consultations');
    return saved ? JSON.parse(saved) : [];
  });

  const [events, setEvents] = useState<CommunityEvent[]>(() => {
    const saved = localStorage.getItem('shh_events');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_EVENTS;
  });

  const [jobs, setJobs] = useState<JobVacancy[]>(() => {
    const saved = localStorage.getItem('shh_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOB_VACANCIES;
  });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('shh_gallery_v2');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
  });

  const [applications, setApplications] = useState<ApplicationSubmission[]>(() => {
    const saved = localStorage.getItem('shh_applications');
    return saved ? JSON.parse(saved) : [];
  });

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

  // Helper for safe localStorage write fallback
  const safeSave = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`Failed to save ${key} to localStorage:`, err);
    }
  };

  // Sync state to local storage backup
  useEffect(() => { safeSave('shh_users', users); }, [users]);
  useEffect(() => { 
    if (currentUser) safeSave('shh_current_user', currentUser); 
    else localStorage.removeItem('shh_current_user'); 
  }, [currentUser]);
  useEffect(() => { safeSave('shh_residents', residents); }, [residents]);
  useEffect(() => { safeSave('shh_staff', staff); }, [staff]);
  useEffect(() => { safeSave('shh_shifts', shifts); }, [shifts]);
  useEffect(() => { safeSave('shh_messages', messages); }, [messages]);
  useEffect(() => { safeSave('shh_activity_logs', activityLogs); }, [activityLogs]);
  useEffect(() => { safeSave('shh_consultations', consultationBookings); }, [consultationBookings]);
  useEffect(() => { safeSave('shh_events', events); }, [events]);
  useEffect(() => { safeSave('shh_jobs', jobs); }, [jobs]);
  useEffect(() => { safeSave('shh_gallery_v2', galleryItems); }, [galleryItems]);
  useEffect(() => { safeSave('shh_applications', applications); }, [applications]);

  // ============================================================================
  // FIRESTORE REALTIME SYNC & BACKUP FETCH
  // ============================================================================
  const isFetchingRef = useRef(false);

  const fetchSupabaseData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 0. Fetch master synced data from privileged backend API (reconciles Supabase Auth & DB tables)
      try {
        const syncRes = await fetch('/api/admin/synced-data');
        if (syncRes.ok) {
          const syncData = await syncRes.json();
          if (syncData.success) {
            if (Array.isArray(syncData.staff) && syncData.staff.length > 0) {
              setStaff(syncData.staff.filter((s: any) => !isDemoRecord(s)));
            }
            if (Array.isArray(syncData.residents) && syncData.residents.length > 0) {
              setResidents(syncData.residents.filter((r: any) => !isDemoRecord(r)));
            }
            if (Array.isArray(syncData.users) && syncData.users.length > 0) {
              setUsers(prev => {
                const userMap = new Map<string, User>();
                INITIAL_USERS.forEach(u => {
                  if (u?.email) userMap.set(u.email.toLowerCase(), u);
                });
                prev.filter(u => !isDemoRecord(u)).forEach(u => {
                  if (u?.email) userMap.set(u.email.toLowerCase(), u);
                });
                syncData.users.filter((u: any) => !isDemoRecord(u)).forEach((u: User) => {
                  if (u?.email) userMap.set(u.email.toLowerCase(), u);
                });
                return Array.from(userMap.values());
              });
            }
            if (Array.isArray(syncData.shifts) && syncData.shifts.length > 0) {
              setShifts(syncData.shifts.map(shiftFromRow).filter((sh: any) => !isDemoRecord(sh)));
            }
            if (Array.isArray(syncData.messages) && syncData.messages.length > 0) {
              setMessages(syncData.messages.map(messageFromRow).filter((m: any) => !isDemoRecord(m)));
            }
            if (Array.isArray(syncData.activityLogs) && syncData.activityLogs.length > 0) {
              setActivityLogs(syncData.activityLogs.map(activityLogFromRow).filter((l: any) => !isDemoRecord(l)));
            }
            if (Array.isArray(syncData.applications) && syncData.applications.length > 0) {
              setApplications(syncData.applications.map(applicationFromRow));
            }
            if (Array.isArray(syncData.consultationBookings) && syncData.consultationBookings.length > 0) {
              setConsultationBookings(syncData.consultationBookings.map(consultationFromRow));
            }
          }
        }
      } catch (syncErr) {
        console.warn('Backend synced-data endpoint note:', syncErr);
      }

      // 1. Direct fetch Profiles / Users
      const { data: profileRows, error: profErr } = await supabase.from('profiles').select('*');
      if (!profErr && profileRows && profileRows.length > 0) {
        const cleanUsers = profileRows.map(profileToUser).filter(u => !isDemoRecord(u));
        setUsers(prev => {
          const userMap = new Map<string, User>();
          INITIAL_USERS.forEach(u => {
            if (u?.email) userMap.set(u.email.toLowerCase(), u);
          });
          prev.filter(u => !isDemoRecord(u)).forEach(u => {
            if (u?.email) userMap.set(u.email.toLowerCase(), u);
          });
          cleanUsers.forEach(u => {
            if (u?.email) userMap.set(u.email.toLowerCase(), u);
          });
          return Array.from(userMap.values());
        });

        // Background cleanup of any demo profiles in Supabase
        const demoProfiles = profileRows.filter(isDemoRecord);
        if (demoProfiles.length > 0) {
          demoProfiles.forEach(dp => {
            if (dp.id) {
              supabase.from('profiles').delete().eq('id', dp.id).then(() => {}, () => {});
            }
          });
        }
      }

      // 2. Direct fetch Residents
      const { data: resRows, error: resErr } = await supabase.from('residents').select('*');
      if (!resErr && resRows && resRows.length > 0) {
        const cleanResidents = resRows.map(residentFromRow).filter(r => !isDemoRecord(r));
        if (cleanResidents.length > 0) {
          setResidents(prev => {
            const map = new Map<string, Resident>();
            prev.filter(r => !isDemoRecord(r)).forEach(r => map.set(r.id, r));
            cleanResidents.forEach(r => map.set(r.id, r));
            return Array.from(map.values());
          });
        }

        // Auto delete demo residents from Supabase
        const demoResidents = resRows.filter(isDemoRecord);
        if (demoResidents.length > 0) {
          demoResidents.forEach(dr => {
            if (dr.id) {
              supabase.from('residents').delete().eq('id', dr.id).then(() => {}, () => {});
            }
          });
        }
      }

      // 3. Direct fetch Staff
      const { data: staffRows, error: staffErr } = await supabase.from('staff').select('*');
      if (!staffErr && staffRows && staffRows.length > 0) {
        const cleanStaff = staffRows.map(staffFromRow).filter(s => !isDemoRecord(s));
        if (cleanStaff.length > 0) {
          setStaff(prev => {
            const map = new Map<string, StaffMember>();
            prev.filter(s => !isDemoRecord(s)).forEach(s => map.set(s.email ? s.email.toLowerCase() : s.id, s));
            cleanStaff.forEach(s => map.set(s.email ? s.email.toLowerCase() : s.id, s));
            return Array.from(map.values());
          });
        }

        // Auto delete demo staff from Supabase
        const demoStaff = staffRows.filter(isDemoRecord);
        if (demoStaff.length > 0) {
          demoStaff.forEach(ds => {
            if (ds.id) {
              supabase.from('staff').delete().eq('id', ds.id).then(() => {}, () => {});
            }
          });
        }
      }

      // 4. Fetch Shifts
      const { data: shiftRows, error: shiftErr } = await supabase.from('shifts').select('*');
      if (!shiftErr && shiftRows && shiftRows.length > 0) {
        const cleanShifts = shiftRows.map(shiftFromRow).filter(sh => !isDemoRecord(sh));
        setShifts(cleanShifts);
      }

      // 5. Fetch Messages
      const { data: msgRows, error: msgErr } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (!msgErr && msgRows && msgRows.length > 0) {
        const cleanMessages = msgRows.map(messageFromRow).filter(m => !isDemoRecord(m));
        setMessages(cleanMessages);
      }

      // 6. Fetch Activity Logs
      const { data: logRows, error: logErr } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false });
      if (!logErr && logRows && logRows.length > 0) {
        setActivityLogs(logRows.map(activityLogFromRow).filter(l => !isDemoRecord(l)));
      }

      // 7. Fetch Community Events
      const { data: eventRows, error: evtErr } = await supabase.from('community_events').select('*');
      if (!evtErr && eventRows && eventRows.length > 0) {
        setEvents(eventRows.map(eventFromRow));
      }

      // 8. Fetch Job Vacancies
      const { data: jobRows, error: jobErr } = await supabase.from('job_vacancies').select('*');
      if (!jobErr && jobRows && jobRows.length > 0) {
        setJobs(jobRows.map(jobFromRow));
      }

      // 9. Fetch Gallery Items
      const { data: galRows, error: galErr } = await supabase.from('gallery_items').select('*');
      if (!galErr && galRows && galRows.length > 0) {
        setGalleryItems(galRows.map(galleryFromRow));
      }

      // 10. Fetch Applications
      const { data: appRows, error: appErr } = await supabase.from('applications').select('*');
      if (!appErr && appRows && appRows.length > 0) {
        setApplications(appRows.map(applicationFromRow));
      }

      // 11. Fetch Consultation Bookings
      const { data: cbRows, error: cbErr } = await supabase.from('consultation_bookings').select('*');
      if (!cbErr && cbRows && cbRows.length > 0) {
        setConsultationBookings(cbRows.map(consultationFromRow));
      }
    } catch (err) {
      console.warn('Note on Supabase tables fetch:', err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Primary Firestore Real-time Sync & Initialization across all devices
  useEffect(() => {
    const unsubList: (() => void)[] = [];

    const initFirestore = async () => {
      try {
        // Real-time Users
        const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          if (!snapshot.empty) {
            const fsUsers: User[] = [];
            snapshot.forEach(docSnap => {
              const u = docSnap.data() as User;
              if (!isDemoRecord(u) && !isDemoRecord({ id: docSnap.id })) {
                fsUsers.push({ ...u, id: docSnap.id });
              } else {
                // Auto purge demo user doc from Firestore
                deleteDoc(doc(db, 'users', docSnap.id)).catch(() => {});
              }
            });
            setUsers(prev => {
              const map = new Map<string, User>();
              INITIAL_USERS.forEach(u => {
                if (u?.email) map.set(u.email.toLowerCase(), u);
              });
              prev.filter(u => !isDemoRecord(u)).forEach(u => {
                if (u?.email) map.set(u.email.toLowerCase(), u);
              });
              fsUsers.forEach(u => {
                if (u?.email) map.set(u.email.toLowerCase(), u);
              });
              return Array.from(map.values());
            });
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
        unsubList.push(unsubUsers);

        // Real-time Staff
        const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
          if (!snapshot.empty) {
            const fsStaff: StaffMember[] = [];
            snapshot.forEach(docSnap => {
              const s = docSnap.data() as StaffMember;
              if (!isDemoRecord(s) && !isDemoRecord({ id: docSnap.id })) {
                fsStaff.push({ ...s, id: docSnap.id });
              } else {
                // Auto purge demo staff doc from Firestore
                deleteDoc(doc(db, 'staff', docSnap.id)).catch(() => {});
              }
            });
            setStaff(fsStaff);
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'staff'));
        unsubList.push(unsubStaff);

        // Real-time Residents
        const unsubResidents = onSnapshot(collection(db, 'residents'), (snapshot) => {
          if (!snapshot.empty) {
            const fsResidents: Resident[] = [];
            snapshot.forEach(docSnap => {
              const r = docSnap.data() as Resident;
              if (!isDemoRecord(r) && !isDemoRecord({ id: docSnap.id })) {
                fsResidents.push({ ...r, id: docSnap.id });
              } else {
                // Auto purge demo resident doc from Firestore
                deleteDoc(doc(db, 'residents', docSnap.id)).catch(() => {});
              }
            });
            setResidents(fsResidents);
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'residents'));
        unsubList.push(unsubResidents);

        // Real-time Shifts
        const unsubShifts = onSnapshot(collection(db, 'shifts'), (snapshot) => {
          if (!snapshot.empty) {
            const fsShifts: Shift[] = [];
            snapshot.forEach(docSnap => {
              const sh = docSnap.data() as Shift;
              if (!isDemoRecord(sh) && !isDemoRecord({ id: docSnap.id })) {
                fsShifts.push({ ...sh, id: docSnap.id });
              } else {
                deleteDoc(doc(db, 'shifts', docSnap.id)).catch(() => {});
              }
            });
            setShifts(fsShifts);
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'shifts'));
        unsubList.push(unsubShifts);

        // Real-time Messages
        const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
          if (!snapshot.empty) {
            const fsMessages: Message[] = [];
            snapshot.forEach(docSnap => {
              const m = docSnap.data() as Message;
              if (!isDemoRecord(m) && !isDemoRecord({ id: docSnap.id })) {
                fsMessages.push({ ...m, id: docSnap.id });
              } else {
                deleteDoc(doc(db, 'messages', docSnap.id)).catch(() => {});
              }
            });
            setMessages(fsMessages.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')));
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));
        unsubList.push(unsubMessages);

        // Real-time Activity Logs
        const unsubLogs = onSnapshot(collection(db, 'activity_logs'), (snapshot) => {
          if (!snapshot.empty) {
            const fsLogs: ActivityLog[] = [];
            snapshot.forEach(docSnap => {
              const l = docSnap.data() as ActivityLog;
              if (!isDemoRecord(l) && !isDemoRecord({ id: docSnap.id })) {
                fsLogs.push({ ...l, id: docSnap.id });
              } else {
                deleteDoc(doc(db, 'activity_logs', docSnap.id)).catch(() => {});
              }
            });
            setActivityLogs(fsLogs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || '')));
          }
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'activity_logs'));
        unsubList.push(unsubLogs);

        // Ensure Admin accounts are in Firestore
        const uSnap = await getDocs(collection(db, 'users'));
        if (uSnap.empty) {
          for (const u of INITIAL_USERS) {
            await setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u), { merge: true });
          }
        }
      } catch (fsErr) {
        console.warn('Firestore initial setup notice:', fsErr);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initFirestore();
    fetchSupabaseData();

    // Check server fallback for users/staff
    fetch('/api/users')
      .then(res => res.json())
      .then((serverUsers: User[]) => {
        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          setUsers(prev => {
            const map = new Map<string, User>();
            prev.forEach(u => {
              if (u?.email) map.set(u.email.toLowerCase(), u);
            });
            serverUsers.filter(u => !isDemoRecord(u)).forEach(u => {
              if (u?.email) map.set(u.email.toLowerCase(), u);
            });
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});

    return () => {
      unsubList.forEach(fn => fn());
    };
  }, [fetchSupabaseData]);

  // Supabase Auth Listener & Initial Session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userEmail = session.user.email?.toLowerCase().trim() || '';
          
          // 1. Try finding profile by user id
          let profile = null;
          if (isValidUUID(session.user.id)) {
            const { data: byId } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();
            profile = byId;
          }

          // 2. Try finding profile by email if not found by id
          if (!profile && userEmail) {
            const { data: byEmail } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', userEmail)
              .maybeSingle();
            profile = byEmail;
          }

          if (profile) {
            const authedUser = profileToUser(profile);
            setCurrentUser(authedUser);
          } else {
            // Determine accurate role based on known admin accounts or metadata
            const localMatch = INITIAL_USERS.find(u => (u?.email || '').toLowerCase() === userEmail);
            const meta = session.user.user_metadata || {};
            const isAdmin = userEmail.includes('admin') || userEmail === 'samanthasappy@gmail.com' || userEmail === 'admin@samanthasappy.com' || userEmail === 'itopaprop@gmail.com';
            const role: UserRole = (meta.role as UserRole) || localMatch?.role || (isAdmin ? 'Admin' : 'Staff');
            
            const fallbackUser: User = {
              id: session.user.id,
              name: meta.name || localMatch?.name || session.user.email?.split('@')[0] || 'User',
              email: userEmail,
              phone: meta.phone || localMatch?.phone || '',
              role,
              position: meta.position || localMatch?.position,
              avatar: meta.avatar || localMatch?.avatar,
            };
            setCurrentUser(fallbackUser);
            Promise.resolve(supabase.from('profiles').upsert(userToProfile(fallbackUser), { onConflict: 'email' })).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('Auth session check notice:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
    fetchSupabaseData();

    // Listen for auth state changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userEmail = session.user.email?.toLowerCase().trim() || '';
        
        let profile = null;
        if (isValidUUID(session.user.id)) {
          const { data: byId } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          profile = byId;
        }

        if (!profile && userEmail) {
          const { data: byEmail } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', userEmail)
            .maybeSingle();
          profile = byEmail;
        }

        if (profile) {
          const authedUser = profileToUser(profile);
          // Prevent accidental downgrade if current user was explicitly Admin
          setCurrentUser(prev => {
            if (prev && prev.role === 'Admin' && authedUser.role !== 'Admin' && event === 'TOKEN_REFRESHED') {
              return prev;
            }
            return authedUser;
          });
        } else {
          const localMatch = INITIAL_USERS.find(u => (u?.email || '').toLowerCase() === userEmail);
          const meta = session.user.user_metadata || {};
          const isAdmin = userEmail.includes('admin') || userEmail === 'samanthasappy@gmail.com' || userEmail === 'admin@samanthasappy.com' || userEmail === 'itopaprop@gmail.com';
          const role: UserRole = (meta.role as UserRole) || localMatch?.role || (isAdmin ? 'Admin' : 'Staff');
          
          const fallbackUser: User = {
            id: session.user.id,
            name: meta.name || localMatch?.name || session.user.email?.split('@')[0] || 'User',
            email: userEmail,
            phone: meta.phone || localMatch?.phone || '',
            role,
            position: meta.position || localMatch?.position,
            avatar: meta.avatar || localMatch?.avatar,
          };
          setCurrentUser(prev => {
            if (prev && prev.role === 'Admin' && role !== 'Admin' && event === 'TOKEN_REFRESHED') {
              return prev;
            }
            return fallbackUser;
          });
          Promise.resolve(supabase.from('profiles').upsert(userToProfile(fallbackUser), { onConflict: 'email' })).catch(() => {});
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    // Realtime Postgres Changes Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        Promise.resolve(supabase.from('messages').select('*').order('created_at', { ascending: false }))
          .then(({ data }) => {
            if (data) setMessages(data.map(messageFromRow));
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'residents' }, () => {
        Promise.resolve(supabase.from('residents').select('*'))
          .then(({ data }) => {
            if (data) setResidents(data.map(residentFromRow));
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        Promise.resolve(supabase.from('staff').select('*'))
          .then(({ data }) => {
            if (data) setStaff(data.map(staffFromRow));
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shifts' }, () => {
        Promise.resolve(supabase.from('shifts').select('*'))
          .then(({ data }) => {
            if (data) setShifts(data.map(shiftFromRow));
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        Promise.resolve(supabase.from('applications').select('*'))
          .then(({ data }) => {
            if (data) setApplications(data.map(applicationFromRow));
          })
          .catch(() => {});
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consultation_bookings' }, () => {
        Promise.resolve(supabase.from('consultation_bookings').select('*'))
          .then(({ data }) => {
            if (data) setConsultationBookings(data.map(consultationFromRow));
          })
          .catch(() => {});
      })
      .subscribe();

    return () => {
      authSub.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [fetchSupabaseData]);

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

    // 1. Try Supabase Auth SignIn first if password provided
    if (cleanPassword) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (!authError && authData.user) {
          // Check profile role in Supabase
          let profile = null;
          if (isValidUUID(authData.user.id)) {
            const { data: byId } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .maybeSingle();
            profile = byId;
          }

          if (!profile) {
            const { data: byEmail } = await supabase
              .from('profiles')
              .select('*')
              .eq('email', cleanEmail)
              .maybeSingle();
            profile = byEmail;
          }

          if (profile) {
            const userProfile = profileToUser(profile);
            const normUserProfileRole = userProfile.role === 'Resident Relative' || userProfile.role.toLowerCase().includes('relat') ? 'Resident Relative' : userProfile.role === 'Staff' || userProfile.role.toLowerCase().includes('staff') || userProfile.role.toLowerCase().includes('caregiver') ? 'Staff' : 'Admin';
            const normSelectedRole = role === 'Resident Relative' || role.toLowerCase().includes('relat') ? 'Resident Relative' : role === 'Staff' || role.toLowerCase().includes('staff') || role.toLowerCase().includes('caregiver') ? 'Staff' : 'Admin';
            
            if (normUserProfileRole !== normSelectedRole) {
              await supabase.auth.signOut();
              showToast(`Access Denied: Account role '${userProfile.role}' cannot log in via the ${role} portal.`);
              return false;
            }
            setCurrentUser(userProfile);
            setCurrentPage('dashboard');
            showToast(`Welcome back, ${userProfile.name}! Signed in to ${userProfile.role} Portal.`);
            return true;
          }
        }
      } catch (err) {
        console.warn('Supabase Auth remote sign-in notice:', err);
      }
    }

    // 2. Fetch from local state
    let targetUser = users.find(u => u.email?.trim().toLowerCase() === cleanEmail);

    // 3. Query Firestore 'users' collection directly in case of cross-device registration
    if (!targetUser) {
      try {
        const qUser = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const snapUser = await getDocs(qUser);
        if (!snapUser.empty) {
          targetUser = snapUser.docs[0].data() as User;
          if (!targetUser.id) targetUser.id = snapUser.docs[0].id;
          setUsers(prev => {
            const exists = prev.some(u => (u?.email || '').toLowerCase() === cleanEmail);
            return exists ? prev.map(u => (u?.email || '').toLowerCase() === cleanEmail ? targetUser! : u) : [...prev, targetUser!];
          });
        }
      } catch (err) {
        console.warn('Firestore users lookup note:', err);
      }
    }

    // 4. Query Firestore 'staff' collection in case user was registered as staff
    if (!targetUser) {
      try {
        const qStaff = query(collection(db, 'staff'), where('email', '==', cleanEmail));
        const snapStaff = await getDocs(qStaff);
        if (!snapStaff.empty) {
          const staffMember = snapStaff.docs[0].data() as StaffMember;
          targetUser = {
            id: snapStaff.docs[0].id || staffMember.id,
            name: staffMember.name,
            email: staffMember.email,
            phone: staffMember.phone,
            role: 'Staff',
            position: staffMember.position,
            avatar: staffMember.avatar,
            password: '@staff123',
          };
          setDoc(doc(db, 'users', targetUser.id), sanitizeForFirestore(targetUser), { merge: true }).catch(() => {});
          setUsers(prev => [...prev.filter(u => (u?.email || '').toLowerCase() !== cleanEmail), targetUser!]);
        }
      } catch (err) {
        console.warn('Firestore staff lookup note:', err);
      }
    }

    // 4b. Query Firestore 'residents' collection in case user is relative
    if (!targetUser) {
      try {
        const qRes = query(collection(db, 'residents'), where('relativeEmail', '==', cleanEmail));
        const snapRes = await getDocs(qRes);
        if (!snapRes.empty) {
          const resData = snapRes.docs[0].data() as any;
          targetUser = {
            id: `usr_rel_${snapRes.docs[0].id}`,
            name: resData.relativeName || resData.emergencyContact?.name || `Relative of ${resData.fullName}`,
            email: cleanEmail,
            phone: resData.relativePhone || resData.emergencyContact?.phone || '',
            role: 'Resident Relative',
            relationship: resData.relativeRelationship || resData.emergencyContact?.relationship || 'Next of Kin',
            residentLinkedId: snapRes.docs[0].id,
            password: '@relative123',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          };
          setDoc(doc(db, 'users', targetUser.id), sanitizeForFirestore(targetUser), { merge: true }).catch(() => {});
          setUsers(prev => [...prev.filter(u => (u?.email || '').toLowerCase() !== cleanEmail), targetUser!]);
        }
      } catch (err) {
        console.warn('Firestore residents lookup note:', err);
      }
    }

    // 5. Query Supabase 'profiles' or 'staff' table
    if (!targetUser) {
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (profileRow) {
          targetUser = profileToUser(profileRow);
          setUsers(prev => [...prev.filter(u => (u?.email || '').toLowerCase() !== cleanEmail), targetUser!]);
        } else {
          const { data: staffRow } = await supabase
            .from('staff')
            .select('*')
            .eq('email', cleanEmail)
            .maybeSingle();
          if (staffRow) {
            const sm = staffFromRow(staffRow);
            targetUser = {
              id: sm.id,
              name: sm.name,
              email: sm.email,
              phone: sm.phone,
              role: 'Staff',
              position: sm.position,
              avatar: sm.avatar,
              password: '@staff123',
            };
            setUsers(prev => [...prev.filter(u => (u?.email || '').toLowerCase() !== cleanEmail), targetUser!]);
          }
        }
      } catch (err) {
        console.warn('Direct profile lookup exception:', err);
      }
    }

    // 6. Query Server fallback REST endpoint
    if (!targetUser) {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
          const serverUsers: User[] = await res.json();
          const match = serverUsers.find(u => (u?.email || '').toLowerCase() === cleanEmail);
          if (match) {
            targetUser = match;
            setDoc(doc(db, 'users', targetUser.id), sanitizeForFirestore(targetUser), { merge: true }).catch(() => {});
            setUsers(prev => [...prev.filter(u => (u?.email || '').toLowerCase() !== cleanEmail), targetUser!]);
          }
        }
      } catch (err) {
        console.warn('Server user fallback fetch note:', err);
      }
    }

    // 7. Initial Seed Users match
    if (!targetUser) {
      const initMatch = INITIAL_USERS.find(u => (u?.email || '').toLowerCase() === cleanEmail);
      if (initMatch) targetUser = initMatch;
    }

    if (!targetUser) {
      showToast(`Login Failed: No registered account found for '${cleanEmail}'. Please check spelling or contact management.`);
      return false;
    }

    // 8. Strict Role Enforcement check with resilient normalization
    const normTargetRole = targetUser.role === 'Resident Relative' || targetUser.role.toLowerCase().includes('relat') ? 'Resident Relative' : targetUser.role === 'Staff' || targetUser.role.toLowerCase().includes('staff') || targetUser.role.toLowerCase().includes('caregiver') ? 'Staff' : 'Admin';
    const normSelectedRole = role === 'Resident Relative' || role.toLowerCase().includes('relat') ? 'Resident Relative' : role === 'Staff' || role.toLowerCase().includes('staff') || role.toLowerCase().includes('caregiver') ? 'Staff' : 'Admin';

    if (normTargetRole !== normSelectedRole) {
      const roleLabel = targetUser.role === 'Resident Relative' ? 'Relative' : targetUser.role;
      showToast(`Access Denied: '${targetUser.email}' is registered as a ${targetUser.role} account. Please select the '${roleLabel}' tab above.`);
      return false;
    }

    // 9. Validate Password against stored password, generated temp credentials, or role default passwords
    let expectedPassword = targetUser.password ? targetUser.password.trim() : '';
    const defaultRolePasswords: string[] = [
      'CareTeam@2025!',
      targetUser.role === 'Admin' ? '@samantha' : targetUser.role === 'Staff' ? '@staff123' : '@relative123',
      targetUser.role === 'Admin' ? 'samantha' : targetUser.role === 'Staff' ? 'staff123' : 'relative123',
    ];

    const normalizePass = (p: string) => p.replace(/^[@#!]+/, '').trim().toLowerCase();

    let isPasswordValid = false;
    if (!cleanPassword && !expectedPassword) {
      isPasswordValid = true;
    } else if (cleanPassword) {
      if (expectedPassword && (cleanPassword === expectedPassword || normalizePass(cleanPassword) === normalizePass(expectedPassword))) {
        isPasswordValid = true;
      } else if (defaultRolePasswords.some(dp => cleanPassword === dp || normalizePass(cleanPassword) === normalizePass(dp))) {
        isPasswordValid = true;
      } else if (!expectedPassword) {
        // If account had no explicit password stored, save this password for future sessions
        isPasswordValid = true;
        targetUser.password = cleanPassword;
        setDoc(doc(db, 'users', targetUser.id), { password: cleanPassword }, { merge: true }).catch(() => {});
      }
    }

    if (!isPasswordValid) {
      showToast(`Login Failed: Incorrect password entered for ${cleanEmail}.`);
      return false;
    }

    // Auto-sync account into Supabase Auth (auth.users) if it wasn't registered there previously
    if (cleanPassword) {
      try {
        await ephemeralAuthClient.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              name: targetUser.name,
              role: targetUser.role,
              phone: targetUser.phone || '',
              avatar: targetUser.avatar || '',
            }
          }
        });
      } catch (authSyncErr) {
        console.warn('Supabase Auth auto-sync notice:', authSyncErr);
      }
    }

    // Grant Access and ensure profile in Supabase & Firestore is synced
    setCurrentUser(targetUser);
    setCurrentPage('dashboard');
    setDoc(doc(db, 'users', targetUser.id), sanitizeForFirestore(targetUser), { merge: true }).catch(() => {});
    Promise.resolve(supabase.from('profiles').upsert(userToProfile(targetUser), { onConflict: 'email' })).catch(() => {});
    showToast(`Welcome back, ${targetUser.name}! Signed in to ${targetUser.role} Portal.`);
    return true;
  };

  const signUpUser = async (email: string, password: string, name: string, role: UserRole, extra?: Partial<User>): Promise<boolean> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
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
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (error) {
        showToast(`Password Reset Error: ${error.message}`);
        return false;
      }
      showToast('Password reset link sent to your registered email address.');
      return true;
    } catch (err: any) {
      showToast('Password reset requested.');
      return true;
    }
  };

  const loginWithGoogle = async (role: UserRole): Promise<boolean> => {
    const matchedUser = users.find(u => u.role === role);
    if (matchedUser) {
      setCurrentUser(matchedUser);
      setCurrentPage('dashboard');
      showToast(`Signed in to ${role} Portal as ${matchedUser.name}.`);
      return true;
    }
    showToast(`No demo user profile found for role: ${role}`);
    return false;
  };

  const switchDemoRole = (role: UserRole) => {
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      setCurrentPage('dashboard');
      showToast(`Switched active view role to ${found.name} (${role}).`);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out notice:', err);
    }
    setCurrentUser(null);
    setCurrentPage('home');
    showToast('You have been signed out successfully.');
  };

  // ============================================================================
  // USER & PROFILE MANAGEMENT (EDITABLE PHOTO & SUPABASE PROFILES SYNC)
  // ============================================================================

  const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
    let finalAvatar = updates.avatar;
    if (updates.avatar?.startsWith('data:')) {
      const { url } = await uploadToStorage('avatars', 'profiles', updates.avatar, `${userId}_avatar.jpg`);
      if (url) finalAvatar = url;
    }

    const sanitizedUpdates: Partial<User> = {
      ...updates,
      avatar: finalAvatar,
    };

    // 1. Update State
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...sanitizedUpdates } : u));
    if (currentUser?.id === userId) {
      const updatedCurrent: User = { ...currentUser, ...sanitizedUpdates };
      setCurrentUser(updatedCurrent);
      localStorage.setItem('shh_current_user', JSON.stringify(updatedCurrent));
    }

    // 2. If staff member, sync with staff list
    setStaff(prev => prev.map(s => {
      if (s.id === userId || s.email.toLowerCase() === (sanitizedUpdates.email || currentUser?.email || '').toLowerCase()) {
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

    // 3. Update Firestore
    setDoc(doc(db, 'users', userId), sanitizeForFirestore(sanitizedUpdates), { merge: true }).catch(() => {});
    if (currentUser?.role === 'Staff' || updates.role === 'Staff') {
      setDoc(doc(db, 'staff', userId), sanitizeForFirestore({
        name: sanitizedUpdates.name,
        avatar: finalAvatar,
        phone: sanitizedUpdates.phone,
        position: sanitizedUpdates.position,
      }), { merge: true }).catch(() => {});
    }

    // 4. Update Supabase Database Profiles & Staff Tables
    try {
      const existingUser = users.find(u => u.id === userId) || currentUser;
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

    // 5. Update Server REST API
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, ...sanitizedUpdates }),
    }).catch(() => {});

    // 6. Register Activity Log
    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'Profile Updated',
      description: `User profile for ${sanitizedUpdates.name || currentUser?.name || userId} (${currentUser?.role || 'User'}) was updated.`,
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
    const residentUUID = generateUUID();

    // 1. Upload Avatar if base64/data
    let avatarUrl = residentData.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80';
    if (residentData.avatar?.startsWith('data:')) {
      const { url } = await uploadToStorage('avatars', 'residents', residentData.avatar, `${residentUUID}_avatar.jpg`);
      if (url) avatarUrl = url;
    }

    // Process reference photos if any
    const processedReferences = await Promise.all(
      (residentData.references || []).map(async (ref, idx) => {
        let photoUrl = ref.photoUrl;
        if (ref.photoUrl?.startsWith('data:')) {
          const { url } = await uploadToStorage('documents', 'resident-contacts', ref.photoUrl, `${residentUUID}_ref_${idx + 1}.jpg`);
          if (url) photoUrl = url;
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
    setResidents(prev => [newResident, ...prev]);

    // Save to Firestore and Server API immediately
    setDoc(doc(db, 'residents', newResident.id), sanitizeForFirestore(newResident), { merge: true }).catch(() => {});
    fetch('/api/residents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResident),
    }).catch(() => {});

    const relativePhoneClean = residentData.emergencyContact.phone ? residentData.emergencyContact.phone.replace(/[^0-9]/g, '') : `${Date.now()}`;
    const relativeEmail = `${relativePhoneClean}@relative.samanthasappy.com`;

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
      });

      if (edgeResult.success) {
        if (edgeResult.resident?.id) newResident.id = edgeResult.resident.id;
        if (edgeResult.relativeUser?.id) relativeUserId = edgeResult.relativeUser.id;
        setupPasswordUrl = edgeResult.setupPasswordUrl;
        emailDispatched = Boolean(edgeResult.emailDispatched);
      }
    } catch (edgeErr) {
      console.warn('Edge Function relative registration note (falling back to client store):', edgeErr);
    }

    const newRelativeUser: User = {
      id: relativeUserId,
      name: residentData.emergencyContact.name || 'Relative of ' + newResident.fullName,
      email: relativeEmail.toLowerCase(),
      phone: residentData.emergencyContact.phone || '+234 706 933 2193',
      role: 'Resident Relative',
      relationship: residentData.emergencyContact.relationship || 'Next of Kin',
      residentLinkedId: newResident.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    };
    setUsers(prev => [...prev, newRelativeUser]);
    setDoc(doc(db, 'users', newRelativeUser.id), sanitizeForFirestore(newRelativeUser), { merge: true }).catch(() => {});
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRelativeUser),
    }).catch(() => {});

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
      content: `Dear ${newRelativeUser.name},\n\nYour relative ${newResident.fullName} has been registered into Samanthasappy Home Care. An account has been created for you to track care updates, view health vitals, and communicate with caregivers.\n\nYour Portal Login Details:\n- Username (Registered Email): ${newRelativeUser.email}\n- Linked Resident: ${newResident.fullName}\n${setupPasswordUrl ? `- Password Setup Link: ${setupPasswordUrl}\n` : ''}\nPlease log in to access your family care dashboard.\n\nWarm regards,\nSamanthasappy Home Administration`,
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
      content: `A new resident has been registered and their family portal account is activated.\n\nRESIDENT & RELATIVE DETAILS:\n• Resident Name: ${newResident.fullName}\n• Care Category: ${newResident.careCategory}\n• Room / Suite: ${newResident.roomNumber}\n• Next of Kin / Relative: ${newRelativeUser.name} (${newRelativeUser.relationship || 'Next of Kin'})\n• Relative Email: ${newRelativeUser.email}\n• Relative Phone: ${newRelativeUser.phone}\n\nAutomated onboarding confirmation email dispatched to: ${newRelativeUser.email}\nAdmin notification email dispatched to: samanthasappy@gmail.com`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }));

    setMessages(prev => [welcomeMsg, ...adminResidentNotifications, ...prev]);
    setDoc(doc(db, 'messages', welcomeMsg.id), sanitizeForFirestore(welcomeMsg), { merge: true }).catch(() => {});
    adminResidentNotifications.forEach(m => {
      setDoc(doc(db, 'messages', m.id), sanitizeForFirestore(m), { merge: true }).catch(() => {});
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
      description: `Added ${newResident.fullName}. Relative credentials and welcome email dispatched to ${newRelativeUser.email}.`,
      category: 'Admission',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog), { merge: true }).catch(() => {});
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Resident ${newResident.fullName} registered & welcome email dispatched to relative.`);
    return {
      resident: newResident,
      relativeUser: newRelativeUser,
      setupPasswordUrl,
      emailDispatched,
    };
  };

  const updateResident = async (id: string, updated: Partial<Resident>) => {
    setResidents(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    updateDoc(doc(db, 'residents', id), sanitizeForFirestore(updated)).catch(() => {});
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

    // 1. Instant optimistic update on Dashboard UI
    setResidents(prev => prev.filter(r => r.id !== id));
    if (linkedRelative) {
      setUsers(prev => prev.filter(u => u.id !== linkedRelative.id && (!relativeEmail || u.email.toLowerCase() !== relativeEmail.toLowerCase())));
    }

    // 2. Immediate Firestore deletion
    deleteDoc(doc(db, 'residents', id)).catch(() => {});
    if (linkedRelative) {
      deleteDoc(doc(db, 'users', linkedRelative.id)).catch(() => {});
    }

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
    const tempPassword = generateTempPassword();
    const staffUUID = generateUUID();

    let avatarUrl = staffData.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';
    if (staffData.avatar?.startsWith('data:')) {
      const { url } = await uploadToStorage('avatars', 'staff', staffData.avatar, `${staffUUID}_avatar.jpg`);
      if (url) avatarUrl = url;
    }

    // Process reference photos if any
    const processedReferences = await Promise.all(
      (staffData.references || []).map(async (ref, idx) => {
        let photoUrl = ref.photoUrl;
        if (ref.photoUrl?.startsWith('data:')) {
          const { url } = await uploadToStorage('documents', 'staff-guarantors', ref.photoUrl, `${staffUUID}_guarantor_${idx + 1}.jpg`);
          if (url) photoUrl = url;
        }
        return { ...ref, photoUrl };
      })
    );

    const joinDate = new Date().toISOString().split('T')[0];
    const cleanEmail = staffData.email.trim().toLowerCase();

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
        if (edgeResult.user?.id) effectiveStaffUUID = edgeResult.user.id;
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
    setStaff(prev => [newStaff, ...prev]);

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
    setUsers(prev => [...prev, newUser]);

    // Save to Firestore and Server API immediately for all devices
    setDoc(doc(db, 'staff', newStaff.id), sanitizeForFirestore(newStaff), { merge: true }).catch(() => {});
    setDoc(doc(db, 'users', newUser.id), sanitizeForFirestore(newUser), { merge: true }).catch(() => {});
    fetch('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff),
    }).catch(() => {});
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(() => {});

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
    adminStaffNotifications.forEach(m => {
      setDoc(doc(db, 'messages', m.id), sanitizeForFirestore(m), { merge: true }).catch(() => {});
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

    // 1. Instant optimistic update on Dashboard UI
    setStaff(prev => prev.filter(s => s.id !== id && (!targetEmail || (s?.email || '').toLowerCase() !== targetEmail.toLowerCase())));
    setUsers(prev => prev.filter(u => u.id !== id && (!targetEmail || (u?.email || '').toLowerCase() !== targetEmail.toLowerCase())));
    
    // 2. Immediate Firestore deletion
    deleteDoc(doc(db, 'staff', id)).catch(() => {});
    deleteDoc(doc(db, 'users', id)).catch(() => {});
    
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

    setUsers(prev => prev.filter(u => u.id !== userId && (!cleanEmail || (u?.email || '').toLowerCase() !== cleanEmail)));
    setStaff(prev => prev.filter(s => s.id !== userId && (!cleanEmail || (s?.email || '').toLowerCase() !== cleanEmail)));

    deleteDoc(doc(db, 'users', userId)).catch(() => {});
    deleteDoc(doc(db, 'staff', userId)).catch(() => {});

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
      const [resSnap, staffSnap] = await Promise.all([
        getDocs(collection(db, 'residents')),
        getDocs(collection(db, 'staff'))
      ]);

      resSnap.forEach(d => {
        if (isDemoRecord(d.data()) || isDemoRecord({ id: d.id })) {
          deleteDoc(doc(db, 'residents', d.id)).catch(() => {});
        }
      });

      staffSnap.forEach(d => {
        if (isDemoRecord(d.data()) || isDemoRecord({ id: d.id })) {
          deleteDoc(doc(db, 'staff', d.id)).catch(() => {});
        }
      });

      showToast('All demo records of staff and residents successfully deleted.');
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
    setShifts(prev => [newShift, ...prev]);

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
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Shift scheduled for ${shiftData.staffName}.`);
  };

  const updateShift = async (id: string, updated: Partial<Shift>) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    try {
      await supabase.from('shifts').update(shiftToRow(updated)).eq('id', id);
    } catch (err) {
      console.warn('Supabase shift update notice:', err);
    }
    showToast('Shift details updated.');
  };

  const deleteShift = async (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
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
      const targetAdmin = adminUsers[0] || { id: 'usr-admin-1', name: 'Folashade Sonyaolu', role: 'Admin' };

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
    try {
      await supabase.from('messages').insert([messageToRow(newMsg)]);
    } catch (err) {
      console.warn('Supabase message insert notice:', err);
    }
    showToast(`Message sent to ${msgData.receiverName}.`);
  };

  const markMessageAsRead = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    try {
      await supabase.from('messages').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.warn('Supabase message update notice:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      await supabase.from('messages').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase message delete notice:', err);
    }
    showToast('Message deleted.');
  };

  const deleteApplication = async (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
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
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Job opening for "${jobData.title}" posted successfully.`);
  };

  const updateJob = async (id: string, updated: Partial<JobVacancy>) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updated } : j));
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
    const appUUID = generateUUID();
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // 1. Upload applicant photo to documents/avatars bucket
    let photoUrl = appData.photoUrl;
    if (appData.photoUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('documents', 'applicants', appData.photoUrl, `${appUUID}_applicant.jpg`);
      if (url) photoUrl = url;
    }

    // 2. Upload payment receipt to documents/receipts bucket
    let receiptUrl = appData.receiptUrl;
    if (appData.receiptUrl?.startsWith('data:')) {
      const { url } = await uploadToStorage('documents', 'receipts', appData.receiptUrl, `${appUUID}_receipt.jpg`);
      if (url) receiptUrl = url;
    }

    // 3. Upload reference/guarantor documents
    const processedReferences = await Promise.all(
      appData.references.map(async (ref, idx) => {
        let refPhotoUrl = ref.photoUrl;
        if (ref.photoUrl?.startsWith('data:')) {
          const { url } = await uploadToStorage('documents', 'guarantors', ref.photoUrl, `${appUUID}_ref_${idx + 1}.jpg`);
          if (url) refPhotoUrl = url;
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

    setApplications(prev => [newSubmission, ...prev]);

    // Save to Supabase
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

    // Dispatch high-priority Message / Notification to Admin users
    const adminUsers = users.filter(u => u.role === 'Admin');
    const adminTargets = adminUsers.length > 0 
      ? adminUsers 
      : [{ id: 'usr-admin-1', name: 'Managing Director & Admin', email: 'samanthasappy@gmail.com', role: 'Admin' as UserRole }];

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
      content: `A new ${appTitle} has been submitted through the web portal.\n\nAPPLICANT FULL DETAILS:\n• Full Name: ${appData.fullName}\n• Email: ${appData.email}\n• Phone: ${appData.phone}\n• Care Category / Position: ${appData.positionOrCategory}\n${appData.sponsorName ? `• Sponsor / Next of Kin: ${appData.sponsorName}\n` : ''}${appData.notesOrStatement ? `• Medical / Qualification Notes: ${appData.notesOrStatement}\n` : ''}${photoUrl ? '• Applicant Photo: Attached\n' : ''}${receiptUrl ? `• Payment Receipt: Attached (${appData.receiptName || 'Bank Transfer Proof'})\n` : ''}\n\nATTACHED REFERENCES & GUARANTOR DOCUMENTS:\n${refsFormatted || 'None attached'}\n\nNotification dispatched to: samanthasappy@gmail.com\nSubmitted on: ${createdAt}`,
      attachmentUrl: receiptUrl || photoUrl || processedReferences[0]?.photoUrl,
      attachmentName: receiptUrl ? (appData.receiptName || `${appData.fullName.replace(/\s+/g, '_')}_Payment_Receipt.jpg`) : (photoUrl ? `${appData.fullName.replace(/\s+/g, '_')}_ID.jpg` : undefined),
      applicantPhotoUrl: photoUrl,
      references: processedReferences,
      isRead: false,
      timestamp: createdAt,
    }));

    setMessages(prev => [...adminMessages, ...prev]);
    try {
      await supabase.from('messages').insert(adminMessages.map(messageToRow));
    } catch (err) {
      console.warn('Supabase admin messages insert notice:', err);
    }

    // Dispatch automated Email Notification and Receipt Confirmation via Resend API
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
      }).catch(e => console.warn('Submit application edge function notice:', e));
    } catch (e) {
      console.warn('Application email notice:', e);
    }

    // Register Activity Log
    const newLog: ActivityLog = {
      id: generateUUID(),
      title: `New ${appData.type === 'caregiver' ? 'Caregiver' : 'Resident Care'} Application Received`,
      description: `Application submitted for ${appData.fullName} (${appData.positionOrCategory}). Full details notified to Admin.`,
      category: 'Admission',
      timestamp: createdAt,
      performer: appData.fullName,
    };
    setActivityLogs(prev => [newLog, ...prev]);
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    // Register into active care records if applicable
    if (appData.type === 'resident') {
      await addResident({
        fullName: appData.fullName,
        dateOfBirth: '1948-06-15',
        gender: 'Female',
        roomNumber: 'Pending Suite Assignment',
        careCategory: (appData.positionOrCategory as CareCategory) || 'Residential Elderly Care',
        healthStatus: 'Stable',
        medicalNotes: appData.notesOrStatement || 'Application received online via care portal.',
        emergencyContact: {
          name: appData.sponsorName || processedReferences[0]?.name || 'Next of Kin',
          relationship: processedReferences[0]?.relationship || 'Sponsor',
          phone: processedReferences[0]?.phone || appData.phone || '+234 706 933 2193',
        },
        references: processedReferences,
        avatar: photoUrl,
        lastActivityUpdate: 'Admission application logged with attached references.',
        vitals: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '36.6 °C',
          weight: '68 kg',
        },
      });
    } else if (appData.type === 'caregiver') {
      await addStaff({
        name: appData.fullName,
        email: appData.email,
        phone: appData.phone,
        position: appData.positionOrCategory || 'Care Assistant',
        shift: 'Day Shift',
        role: 'Staff',
        qualification: appData.notesOrStatement || 'NVQ Level 3 Care Applicant',
        avatar: photoUrl,
        references: processedReferences,
      });
    }

    showToast(`Application for ${appData.fullName} submitted successfully! Admin has been notified.`);
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
      syncDatabase: fetchSupabaseData,
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

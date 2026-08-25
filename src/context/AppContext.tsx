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
import { supabase, ephemeralAuthClient, uploadToStorage } from '../lib/supabase';
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
  
  residents: Resident[];
  addResident: (resident: Omit<Resident, 'id' | 'admissionDate'>) => Promise<{ resident: Resident; relativeUser: User; tempPassword: string }>;
  updateResident: (id: string, updated: Partial<Resident>) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;
  
  staff: StaffMember[];
  addStaff: (staffMember: Omit<StaffMember, 'id' | 'joinDate' | 'assignedResidentsCount'>) => Promise<{ user: User; tempPassword: string }>;
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
  deleteEvent: (id: string) => Promise<void>;

  jobs: JobVacancy[];
  addJob: (job: Omit<JobVacancy, 'id'>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;

  galleryItems: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => Promise<void>;
  addMultipleGalleryItems: (items: Omit<GalleryItem, 'id'>[]) => Promise<void>;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to generate temporary memorable passwords
const generateTempPassword = (): string => {
  const words = ['Care', 'Hope', 'Grace', 'Heal', 'Safe', 'Joy'];
  const num = Math.floor(100 + Math.random() * 900);
  const randomWord = words[Math.floor(Math.random() * words.length)];
  return `@${randomWord}${num}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Users & Current Auth User
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('shh_users');
    if (!saved) return INITIAL_USERS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shh_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Database Collections
  const [residents, setResidents] = useState<Resident[]>(() => {
    const saved = localStorage.getItem('shh_residents');
    return saved ? JSON.parse(saved) : INITIAL_RESIDENTS;
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem('shh_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const saved = localStorage.getItem('shh_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SHIFTS;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('shh_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('shh_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
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
  // SUPABASE INITIAL DATA FETCH & REALTIME SYNC
  // ============================================================================
  const isFetchingRef = useRef(false);

  const fetchSupabaseData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Fetch Profiles / Users
      const { data: profileRows, error: profErr } = await supabase.from('profiles').select('*');
      if (!profErr && profileRows) {
        if (profileRows.length > 0) {
          const remoteUsers = profileRows.map(profileToUser);
          setUsers(prev => {
            const userMap = new Map<string, User>();
            INITIAL_USERS.forEach(u => userMap.set(u.email.toLowerCase(), u));
            prev.forEach(u => userMap.set(u.email.toLowerCase(), u));
            remoteUsers.forEach(u => userMap.set(u.email.toLowerCase(), u));
            return Array.from(userMap.values());
          });
        } else {
          // If profiles table in Supabase is empty, sync seeded initial accounts
          for (const u of INITIAL_USERS) {
            await supabase.from('profiles').upsert(userToProfile(u), { onConflict: 'email' });
          }
        }
      }

      // 2. Fetch Residents
      const { data: resRows, error: resErr } = await supabase.from('residents').select('*');
      if (!resErr && resRows && resRows.length > 0) {
        setResidents(resRows.map(residentFromRow));
      }

      // 3. Fetch Staff
      const { data: staffRows, error: staffErr } = await supabase.from('staff').select('*');
      if (!staffErr && staffRows && staffRows.length > 0) {
        setStaff(staffRows.map(staffFromRow));
      }

      // 4. Fetch Shifts
      const { data: shiftRows, error: shiftErr } = await supabase.from('shifts').select('*');
      if (!shiftErr && shiftRows && shiftRows.length > 0) {
        setShifts(shiftRows.map(shiftFromRow));
      }

      // 5. Fetch Messages
      const { data: msgRows, error: msgErr } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      if (!msgErr && msgRows && msgRows.length > 0) {
        setMessages(msgRows.map(messageFromRow));
      }

      // 6. Fetch Activity Logs
      const { data: logRows, error: logErr } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false });
      if (!logErr && logRows && logRows.length > 0) {
        setActivityLogs(logRows.map(activityLogFromRow));
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
            const localMatch = INITIAL_USERS.find(u => u.email.toLowerCase() === userEmail);
            const meta = session.user.user_metadata || {};
            const isAdmin = userEmail.includes('admin') || userEmail === 'director@samanthasappy.com' || userEmail === 'itopaprop@gmail.com';
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
          const localMatch = INITIAL_USERS.find(u => u.email.toLowerCase() === userEmail);
          const meta = session.user.user_metadata || {};
          const isAdmin = userEmail.includes('admin') || userEmail === 'director@samanthasappy.com' || userEmail === 'itopaprop@gmail.com';
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
            if (userProfile.role !== role) {
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

    // 2. Fetch from local state or direct lookup in Supabase 'profiles' table
    let targetUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    if (!targetUser) {
      try {
        const { data: profileRow } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (profileRow) {
          targetUser = profileToUser(profileRow);
          setUsers(prev => [...prev.filter(u => u.email.toLowerCase() !== cleanEmail), targetUser!]);
        }
      } catch (err) {
        console.warn('Direct profile lookup exception:', err);
      }
    }

    if (!targetUser) {
      showToast(`Login Failed: No registered account found for email '${email}'.`);
      return false;
    }

    // 3. Strict Role Enforcement check
    if (targetUser.role !== role) {
      showToast(`Access Denied: '${targetUser.email}' is registered as a ${targetUser.role} account. You cannot sign in through the ${role} portal.`);
      return false;
    }

    // 4. Validate Password against stored password, generated temp credentials, or role default passwords
    let expectedPassword = targetUser.password ? targetUser.password.trim() : '';
    const defaultRolePasswords: string[] = [
      'CareTeam@2025!',
      targetUser.role === 'Admin' ? '@samantha' : targetUser.role === 'Staff' ? '@staff123' : '@relative123'
    ];

    const normalizePass = (p: string) => p.replace(/^@+/, '').toLowerCase();

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

    // Grant Access and ensure profile in Supabase profiles table is updated
    setCurrentUser(targetUser);
    setCurrentPage('dashboard');
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
        const exists = prev.some(u => u.email.toLowerCase() === cleanEmail);
        return exists ? prev.map(u => u.email.toLowerCase() === cleanEmail ? newUser : u) : [...prev, newUser];
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
  // RESIDENTS MANAGEMENT
  // ============================================================================

  const addResident = async (residentData: Omit<Resident, 'id' | 'admissionDate'>) => {
    const tempPassword = generateTempPassword();
    const residentUUID = generateUUID();
    const relativeUUID = generateUUID();

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

    // Optimistic UI update
    setResidents(prev => [newResident, ...prev]);

    // 2. Create Relative Account
    const relativePhoneClean = residentData.emergencyContact.phone ? residentData.emergencyContact.phone.replace(/[^0-9]/g, '') : `${Date.now()}`;
    const relativeEmail = `${relativePhoneClean}@relative.samanthasappy.com`;
    let effectiveRelativeUUID = relativeUUID;

    // Register user in Supabase Auth without affecting active admin session
    try {
      const { data: authSignupData, error: authSignupError } = await ephemeralAuthClient.auth.signUp({
        email: relativeEmail.toLowerCase(),
        password: tempPassword,
        options: {
          data: {
            name: residentData.emergencyContact.name || 'Relative of ' + newResident.fullName,
            role: 'Resident Relative',
            relationship: residentData.emergencyContact.relationship || 'Next of Kin',
            phone: residentData.emergencyContact.phone || '+234 706 933 2193',
          }
        }
      });
      if (authSignupError) {
        console.warn('Supabase Auth relative signUp returned error:', authSignupError.message, authSignupError);
      } else if (authSignupData?.user?.id && isValidUUID(authSignupData.user.id)) {
        effectiveRelativeUUID = authSignupData.user.id;
        console.log('Successfully registered relative in Supabase Auth:', authSignupData.user.id);
      }
    } catch (authErr) {
      console.warn('Supabase Auth relative registration notice:', authErr);
    }

    const newRelativeUser: User = {
      id: effectiveRelativeUUID,
      name: residentData.emergencyContact.name || 'Relative of ' + newResident.fullName,
      email: relativeEmail.toLowerCase(),
      phone: residentData.emergencyContact.phone || '+234 706 933 2193',
      role: 'Resident Relative',
      relationship: residentData.emergencyContact.relationship || 'Next of Kin',
      residentLinkedId: newResident.id,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      password: tempPassword,
    };
    setUsers(prev => [...prev, newRelativeUser]);

    // Save to Supabase (residents table and profiles table)
    try {
      const resRow = residentToRow(newResident);
      const { data: inserted, error: resErr } = await supabase
        .from('residents')
        .insert([resRow])
        .select()
        .single();
      
      if (resErr) {
        if (resErr.code === 'PGRST205' || resErr.code === '42P01') {
          console.warn('Note: "residents" table does not exist in Supabase yet. Resident stored in local state. (Run supabase/schema.sql in Supabase SQL editor)');
        } else {
          console.warn('Supabase resident insert notice:', resErr.message);
        }
      } else if (inserted) {
        newResident.id = inserted.id;
        newRelativeUser.residentLinkedId = inserted.id;
      }

      const profRow = userToProfile(newRelativeUser);
      const { error: profErr } = await supabase
        .from('profiles')
        .upsert(profRow, { onConflict: 'email' });
      
      if (profErr) {
        if (profErr.code === 'PGRST205' || profErr.code === '42P01') {
          console.warn('Note: "profiles" table does not exist in Supabase yet. Profile stored in local state.');
        } else {
          console.warn('Supabase relative profile upsert notice:', profErr.message);
        }
      }
    } catch (err) {
      console.warn('Supabase resident insert exception:', err);
    }

    // 3. Dispatch Welcome Message
    const welcomeMsg: Message = {
      id: generateUUID(),
      senderId: currentUser?.id || 'usr-admin-1',
      senderName: currentUser?.name || 'Managing Director',
      senderRole: 'Admin',
      receiverId: newRelativeUser.id,
      receiverName: newRelativeUser.name,
      receiverRole: 'Resident Relative',
      subject: `🎉 Family Care Portal Access for ${newResident.fullName}`,
      content: `Dear ${newRelativeUser.name},\n\nYour relative ${newResident.fullName} has been registered into Samanthasappy Home Care. An account has been created for you to track care updates, view health vitals, and communicate with caregivers.\n\nYour Portal Login Credentials:\n- Username (Registered Email): ${newRelativeUser.email}\n- Temporary Password: ${tempPassword}\n- Linked Resident: ${newResident.fullName}\n\nPlease log in to access your family care dashboard.\n\nWarm regards,\nSamanthasappy Home Administration`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setMessages(prev => [welcomeMsg, ...prev]);
    try {
      await supabase.from('messages').insert([messageToRow(welcomeMsg)]);
    } catch (err) {
      console.warn('Supabase message insert notice:', err);
    }

    // 4. Log Activity
    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'New Resident & Relative Account Registered',
      description: `Added ${newResident.fullName}. Relative credentials created for ${newRelativeUser.email}.`,
      category: 'Admission',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    try {
      await supabase.from('activity_logs').insert([activityLogToRow(newLog)]);
    } catch (err) {
      console.warn('Supabase log insert notice:', err);
    }

    showToast(`Resident ${newResident.fullName} & Relative account registered.`);
    return { resident: newResident, relativeUser: newRelativeUser, tempPassword };
  };

  const updateResident = async (id: string, updated: Partial<Resident>) => {
    setResidents(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    try {
      await supabase.from('residents').update(residentToRow(updated)).eq('id', id);
    } catch (err) {
      console.warn('Supabase resident update notice:', err);
    }
    showToast('Resident details updated.');
  };

  const deleteResident = async (id: string) => {
    const target = residents.find(r => r.id === id);
    setResidents(prev => prev.filter(r => r.id !== id));
    try {
      await supabase.from('residents').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase resident delete notice:', err);
    }
    if (target) {
      showToast(`Removed resident ${target.fullName}.`);
    }
  };

  // ============================================================================
  // STAFF MANAGEMENT
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
    let effectiveStaffUUID = staffUUID;

    // Register user in Supabase Auth without affecting active admin session
    try {
      const { data: authSignupData, error: authSignupError } = await ephemeralAuthClient.auth.signUp({
        email: cleanEmail,
        password: tempPassword,
        options: {
          data: {
            name: staffData.name,
            role: 'Staff',
            position: staffData.position,
            phone: staffData.phone || '',
            avatar: avatarUrl,
          }
        }
      });
      if (authSignupError) {
        console.warn('Supabase Auth signUp returned error:', authSignupError.message, authSignupError);
      } else if (authSignupData?.user?.id && isValidUUID(authSignupData.user.id)) {
        effectiveStaffUUID = authSignupData.user.id;
        console.log('Successfully registered user in Supabase Auth:', authSignupData.user.id);
      }
    } catch (authErr) {
      console.warn('Supabase Auth staff registration notice:', authErr);
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

    // Save to Supabase (staff table and profiles table)
    try {
      const staffRow = staffToRow(newStaff);
      const { data: insertedStaff, error: staffErr } = await supabase
        .from('staff')
        .insert([staffRow])
        .select()
        .single();
      
      if (staffErr) {
        if (staffErr.code === 'PGRST205' || staffErr.code === '42P01') {
          console.warn('Note: "staff" table does not exist in Supabase yet. Staff member stored in local state. (Run supabase/schema.sql in Supabase SQL editor)');
        } else {
          console.warn('Supabase staff insert notice:', staffErr.message);
        }
      } else if (insertedStaff) {
        newStaff.id = insertedStaff.id;
        newUser.id = insertedStaff.id;
      }

      const profileRow = userToProfile(newUser);
      const { error: profErr } = await supabase
        .from('profiles')
        .upsert(profileRow, { onConflict: 'email' });
      
      if (profErr) {
        if (profErr.code === 'PGRST205' || profErr.code === '42P01') {
          console.warn('Note: "profiles" table does not exist in Supabase yet. Profile stored in local state.');
        } else {
          console.warn('Supabase profile upsert notice:', profErr.message);
        }
      }
    } catch (err) {
      console.warn('Supabase staff insert notice:', err);
    }

    // Welcome Message
    const welcomeMsg: Message = {
      id: generateUUID(),
      senderId: currentUser?.id || 'usr-admin-1',
      senderName: currentUser?.name || 'Managing Director',
      senderRole: 'Admin',
      receiverId: newUser.id,
      receiverName: newUser.name,
      receiverRole: 'Staff',
      subject: '🎉 Welcome to Samanthasappy Home - Staff Account Login Credentials',
      content: `Hello ${newUser.name},\n\nWelcome to the Samanthasappy Home Care Team! Your official staff portal account has been registered.\n\nYour Login Credentials:\n- Username (Login Email): ${newUser.email}\n- Temporary Password: ${tempPassword}\n- Access Role: Staff (${newStaff.position})\n\nPlease keep these credentials secure and change your password upon your first login.\n\nWarm regards,\nSamanthasappy Home Administration`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setMessages(prev => [welcomeMsg, ...prev]);
    try {
      await supabase.from('messages').insert([messageToRow(welcomeMsg)]);
    } catch (err) {
      console.warn('Supabase message insert notice:', err);
    }

    const newLog: ActivityLog = {
      id: generateUUID(),
      title: 'New Staff Member Registered & Credentials Dispatched',
      description: `Registered ${newStaff.name} as ${newStaff.position} (${newUser.email}).`,
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

    showToast(`Staff member ${newStaff.name} registered and saved to Supabase.`);
    return { user: newUser, tempPassword };
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
    }

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
    setStaff(prev => prev.filter(s => s.id !== id));
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      await supabase.from('staff').delete().eq('id', id);
      await supabase.from('profiles').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase staff delete notice:', err);
    }
    showToast('Staff member removed.');
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

    // 2. Upload reference/guarantor documents
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
      : [{ id: 'usr-admin-1', name: 'Managing Director', role: 'Admin' as UserRole }];

    const refsFormatted = processedReferences
      .map((r, idx) => `• Reference ${idx + 1}: ${r.name || 'N/A'} (${r.relationship || 'N/A'})\n  Phone: ${r.phone || 'N/A'} | Email: ${r.email || 'N/A'}${r.photoUrl ? ' | [Document Photo Attached]' : ''}`)
      .join('\n\n');

    const adminMessages: Message[] = adminTargets.map(admin => ({
      id: generateUUID(),
      senderId: 'usr-system',
      senderName: 'Care Application Portal',
      senderRole: 'Admin',
      receiverId: admin.id,
      receiverName: admin.name,
      receiverRole: 'Admin',
      subject: `📥 NEW CARE APPLICATION: ${appData.fullName} (${appData.type === 'caregiver' ? 'Caregiver Applicant' : 'Resident Admission Request'})`,
      content: `A new ${appData.type === 'caregiver' ? 'Caregiver Employment Application' : 'Resident Care Admission Application'} has been submitted through the web portal.\n\nAPPLICANT FULL DETAILS:\n• Full Name: ${appData.fullName}\n• Email: ${appData.email}\n• Phone: ${appData.phone}\n• Care Category / Position: ${appData.positionOrCategory}\n${appData.sponsorName ? `• Sponsor / Next of Kin: ${appData.sponsorName}\n` : ''}${appData.notesOrStatement ? `• Medical / Qualification Notes: ${appData.notesOrStatement}\n` : ''}${photoUrl ? '• Applicant Photo: Attached\n' : ''}\n\nATTACHED REFERENCES & GUARANTOR DOCUMENTS:\n${refsFormatted || 'None attached'}\n\nSubmitted on: ${createdAt}`,
      attachmentUrl: photoUrl || processedReferences[0]?.photoUrl,
      attachmentName: photoUrl ? `${appData.fullName.replace(/\s+/g, '_')}_ID.jpg` : undefined,
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
      deleteEvent,
      jobs,
      addJob,
      deleteJob,
      galleryItems,
      addGalleryItem,
      addMultipleGalleryItems,
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

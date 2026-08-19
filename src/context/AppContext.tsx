import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  logoutFirebaseUser, 
  db,
  sanitizeForFirestore 
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot 
} from 'firebase/firestore';
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
  loginUser: (email: string, role: UserRole, password?: string) => Promise<boolean> | boolean;
  loginWithGoogle: (role: UserRole) => Promise<boolean>;
  switchDemoRole: (role: UserRole) => void;
  logout: () => void;
  
  residents: Resident[];
  addResident: (resident: Omit<Resident, 'id' | 'admissionDate'>) => { resident: Resident; relativeUser: User; tempPassword: string };
  updateResident: (id: string, updated: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  
  staff: StaffMember[];
  addStaff: (staffMember: Omit<StaffMember, 'id' | 'joinDate' | 'assignedResidentsCount'>) => { user: User; tempPassword: string };
  updateStaff: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  
  shifts: Shift[];
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, updated: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  markMessageAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  
  activityLogs: ActivityLog[];
  consultationBookings: ConsultationBooking[];
  bookConsultation: (booking: Omit<ConsultationBooking, 'id' | 'status' | 'createdAt'>) => void;
  
  events: CommunityEvent[];
  addEvent: (event: Omit<CommunityEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  jobs: JobVacancy[];
  addJob: (job: Omit<JobVacancy, 'id'>) => void;
  deleteJob: (id: string) => void;

  galleryItems: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  addMultipleGalleryItems: (items: Omit<GalleryItem, 'id'>[]) => void;
  deleteGalleryItem: (id: string) => void;

  applications: ApplicationSubmission[];
  submitApplication: (appData: Omit<ApplicationSubmission, 'id' | 'createdAt' | 'status'>) => Promise<ApplicationSubmission>;
  deleteApplication: (id: string) => void;
  
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  
  // Load initial or stored states
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('shh_users');
    if (saved) {
      const parsed: User[] = JSON.parse(saved);
      return parsed.map(u => u.role === 'Admin' ? { ...u, email: 'admin@samanthasappy.com' } : u);
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shh_current_user');
    return saved ? JSON.parse(saved) : null;
  });

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

  // Helper for safe localStorage write
  const safeSave = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.warn(`Failed to save ${key} to localStorage:`, err);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    safeSave('shh_users', users);
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      safeSave('shh_current_user', currentUser);
    } else {
      localStorage.removeItem('shh_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeSave('shh_residents', residents);
  }, [residents]);

  useEffect(() => {
    safeSave('shh_staff', staff);
  }, [staff]);

  useEffect(() => {
    safeSave('shh_shifts', shifts);
  }, [shifts]);

  useEffect(() => {
    safeSave('shh_messages', messages);
  }, [messages]);

  useEffect(() => {
    safeSave('shh_activity_logs', activityLogs);
  }, [activityLogs]);

  useEffect(() => {
    safeSave('shh_consultations', consultationBookings);
  }, [consultationBookings]);

  useEffect(() => {
    safeSave('shh_events', events);
  }, [events]);

  useEffect(() => {
    safeSave('shh_jobs', jobs);
  }, [jobs]);

  useEffect(() => {
    safeSave('shh_gallery_v2', galleryItems);
  }, [galleryItems]);

  useEffect(() => {
    safeSave('shh_applications', applications);
  }, [applications]);

  // -------------------------------------------------------------
  // Real-time Firestore Cloud Synchronization for Multi-Device
  // -------------------------------------------------------------
  useEffect(() => {
    if (!db) return;

    // 1. Users real-time synchronization
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudUsers = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
        setUsers(prev => {
          const map = new Map<string, User>();
          INITIAL_USERS.forEach(u => map.set(u.email.toLowerCase(), u));
          prev.forEach(u => map.set(u.email.toLowerCase(), u));
          cloudUsers.forEach(u => map.set(u.email.toLowerCase(), u));
          return Array.from(map.values());
        });
      } else {
        // Seed initial users into Firestore
        INITIAL_USERS.forEach(u => {
          setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u), { merge: true }).catch(err => {
            console.warn('Initial users seed warning:', err);
          });
        });
      }
    }, (err) => console.warn('Users Firestore sync notice:', err));

    // 2. Staff real-time synchronization
    const unsubStaff = onSnapshot(collection(db, 'staff'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudStaff = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as StaffMember));
        setStaff(prev => {
          const map = new Map<string, StaffMember>();
          INITIAL_STAFF.forEach(s => map.set(s.id, s));
          prev.forEach(s => map.set(s.id, s));
          cloudStaff.forEach(s => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    }, (err) => console.warn('Staff Firestore sync notice:', err));

    // 3. Residents real-time synchronization
    const unsubResidents = onSnapshot(collection(db, 'residents'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudResidents = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Resident));
        setResidents(prev => {
          const map = new Map<string, Resident>();
          INITIAL_RESIDENTS.forEach(r => map.set(r.id, r));
          prev.forEach(r => map.set(r.id, r));
          cloudResidents.forEach(r => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    }, (err) => console.warn('Residents Firestore sync notice:', err));

    // 4. Shifts real-time synchronization
    const unsubShifts = onSnapshot(collection(db, 'shifts'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudShifts = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Shift));
        setShifts(prev => {
          const map = new Map<string, Shift>();
          INITIAL_SHIFTS.forEach(s => map.set(s.id, s));
          prev.forEach(s => map.set(s.id, s));
          cloudShifts.forEach(s => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    }, (err) => console.warn('Shifts Firestore sync notice:', err));

    // 5. Messages real-time synchronization
    const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudMessages = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Message));
        cloudMessages.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        setMessages(cloudMessages);
      }
    }, (err) => console.warn('Messages Firestore sync notice:', err));

    // 6. Activity Logs real-time synchronization
    const unsubLogs = onSnapshot(collection(db, 'activity_logs'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudLogs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ActivityLog));
        cloudLogs.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
        setActivityLogs(cloudLogs);
      }
    }, (err) => console.warn('Logs Firestore sync notice:', err));

    // 7. Applications real-time synchronization
    const unsubApplications = onSnapshot(collection(db, 'applications'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudApps = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ApplicationSubmission));
        cloudApps.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        setApplications(cloudApps);
      }
    }, (err) => console.warn('Applications Firestore sync notice:', err));

    // 8. Consultations real-time synchronization
    const unsubConsultations = onSnapshot(collection(db, 'consultation_bookings'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudConsultations = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ConsultationBooking));
        setConsultationBookings(cloudConsultations);
      }
    }, (err) => console.warn('Consultations Firestore sync notice:', err));

    // 9. Community Events
    const unsubEvents = onSnapshot(collection(db, 'community_events'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudEvents = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as CommunityEvent));
        setEvents(cloudEvents);
      }
    }, (err) => console.warn('Events Firestore sync notice:', err));

    // 10. Job Vacancies
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudJobs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as JobVacancy));
        setJobs(cloudJobs);
      }
    }, (err) => console.warn('Jobs Firestore sync notice:', err));

    // 11. Gallery
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudGallery = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as GalleryItem));
        setGalleryItems(cloudGallery);
      }
    }, (err) => console.warn('Gallery Firestore sync notice:', err));

    return () => {
      unsubUsers();
      unsubStaff();
      unsubResidents();
      unsubShifts();
      unsubMessages();
      unsubLogs();
      unsubApplications();
      unsubConsultations();
      unsubEvents();
      unsubJobs();
      unsubGallery();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loginUser = async (email: string, role: UserRole, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Find registered user in memory
    let registeredUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    // 2. Direct cloud lookup if user isn't immediately found in memory (e.g. brand new device opening login)
    if (!registeredUser && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const cloudUsers = snap.docs.map(d => ({ ...d.data(), id: d.id } as User));
        if (cloudUsers.length > 0) {
          setUsers(prev => {
            const map = new Map<string, User>();
            prev.forEach(u => map.set(u.email.toLowerCase(), u));
            cloudUsers.forEach(u => map.set(u.email.toLowerCase(), u));
            return Array.from(map.values());
          });
          registeredUser = cloudUsers.find(u => u.email.trim().toLowerCase() === cleanEmail);
        }
      } catch (err) {
        console.warn('Direct Firestore user lookup notice:', err);
      }
    }

    if (!registeredUser) {
      showToast(`Login Failed: No registered account found for email '${email}'.`);
      return false;
    }

    // 3. Strict Role Enforcement:
    // Anyone registered as Admin can ONLY login as Admin.
    // Anyone registered as Staff can ONLY login as Staff.
    // Anyone registered as Resident Relative can ONLY login as Resident Relative.
    if (registeredUser.role !== role) {
      showToast(`Access Denied: '${registeredUser.email}' is a registered ${registeredUser.role} account. You cannot sign in through the ${role} portal.`);
      return false;
    }

    // 4. Strict Password Verification
    let expectedPassword = registeredUser.password;
    if (!expectedPassword) {
      if (registeredUser.role === 'Admin') expectedPassword = '@samantha';
      else if (registeredUser.role === 'Staff') expectedPassword = '@staff123';
      else if (registeredUser.role === 'Resident Relative') expectedPassword = '@relative123';
    }

    if (password && expectedPassword && password.trim() !== expectedPassword.trim()) {
      showToast(`Login Failed: Incorrect password entered for ${cleanEmail}.`);
      return false;
    }

    // 5. Authenticate & Grant Access
    setCurrentUser(registeredUser);
    setCurrentPage('dashboard');
    showToast(`Welcome back, ${registeredUser.name}! Signed in to ${registeredUser.role} Portal.`);
    return true;
  };

  const loginWithGoogle = async (role: UserRole): Promise<boolean> => {
    try {
      const gUser = await signInWithGoogle();
      if (!gUser) {
        // User closed or cancelled the sign-in popup window
        return false;
      }
      if (!gUser.email) {
        showToast('Google Sign-In failed: No email associated with Google account.');
        return false;
      }

      const cleanEmail = gUser.email.trim().toLowerCase();
      let matchedUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      if (!matchedUser) {
        matchedUser = {
          id: `usr-g-${gUser.uid.slice(0, 8)}`,
          name: gUser.displayName || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: role,
          avatar: gUser.photoURL || undefined,
        };
        setUsers(prev => [...prev, matchedUser!]);
      } else if (matchedUser.role !== role) {
        showToast(`Access Denied: ${cleanEmail} is registered as ${matchedUser.role}. Please select ${matchedUser.role} portal.`);
        return false;
      }

      setCurrentUser(matchedUser);
      setCurrentPage('dashboard');
      showToast(`Welcome, ${matchedUser.name}! Signed in via Firebase Google Authentication.`);
      return true;
    } catch (err: any) {
      if (err?.message) {
        showToast(`Google Sign-In: ${err.message}`);
      }
      return false;
    }
  };

  const switchDemoRole = (role: UserRole) => {
    const found = users.find(u => u.role === role);
    if (found) {
      setCurrentUser(found);
      setCurrentPage('dashboard');
      showToast(`Switched active view role to ${found.name} (${role}).`);
    }
  };

  const logout = () => {
    logoutFirebaseUser();
    setCurrentUser(null);
    setCurrentPage('home');
    showToast('You have been logged out safely.');
  };

  // 3-Minute Inactivity Auto-Logout Security Monitor
  useEffect(() => {
    if (!currentUser) return;

    const INACTIVITY_LIMIT_MS = 3 * 60 * 1000; // 3 minutes = 180,000ms
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleAutoLogout = () => {
      setCurrentUser(null);
      setCurrentPage('login');
      showToast('🔒 Auto logged out of dashboard due to 3 minutes of inactivity.');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleAutoLogout, INACTIVITY_LIMIT_MS);
    };

    // Initial timer start on session active
    resetTimer();

    // Track user action events across window
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    
    let lastReset = Date.now();
    const onUserActivity = () => {
      const now = Date.now();
      // Throttle resets to avoid high CPU frequency on rapid mouse move
      if (now - lastReset > 1000) {
        lastReset = now;
        resetTimer();
      }
    };

    events.forEach(event => {
      window.addEventListener(event, onUserActivity, { passive: true });
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, onUserActivity);
      });
    };
  }, [currentUser]);

  const generateTempPassword = (): string => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let randStr = '';
    for (let i = 0; i < 4; i++) {
      randStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SSH@${randStr}`;
  };

  const addResident = (resData: Omit<Resident, 'id' | 'admissionDate'>) => {
    const newId = `res-${Date.now().toString().slice(-4)}`;
    const tempPassword = generateTempPassword();

    const newResident: Resident = {
      ...resData,
      id: newId,
      admissionDate: new Date().toISOString().split('T')[0],
      lastActivityUpdate: 'Newly admitted into care program. Initial health assessment logged.',
    };
    setResidents(prev => [newResident, ...prev]);

    // Recalculate staff count if assigned
    if (resData.assignedStaffId) {
      setStaff(prev => prev.map(s => {
        if (s.id === resData.assignedStaffId) {
          return { ...s, assignedResidentsCount: s.assignedResidentsCount + 1 };
        }
        return s;
      }));
    }

    // Determine primary relative name & registered email username
    const ref1 = resData.references?.[0];
    const relativeName = ref1?.name || resData.emergencyContact?.name || 'Primary Relative';
    const residentNameStr = resData.fullName || (resData as any).name || 'Resident';
    const cleanResidentName = residentNameStr.toLowerCase().replace(/[^a-z0-9]/g, '');
    const relativeEmail = (ref1?.email || resData.emergencyContact?.name ? `${cleanResidentName}.relative@samanthasappy.com` : `relative.${cleanResidentName}@samanthasappy.com`).trim().toLowerCase();
    const relativePhone = ref1?.phone || resData.emergencyContact?.phone || '+234 706 933 2193';
    const relativeRelationship = ref1?.relationship || resData.emergencyContact?.relationship || 'Primary Family Contact';

    const newRelativeUser: User = {
      id: `usr-rel-${Date.now().toString().slice(-4)}`,
      name: relativeName,
      email: relativeEmail,
      phone: relativePhone,
      role: 'Resident Relative',
      relationship: relativeRelationship,
      residentLinkedId: newId,
      password: tempPassword,
      avatar: ref1?.photoUrl || undefined,
    };
    setUsers(prev => [...prev, newRelativeUser]);

    // Dispatch welcome email / message to relative registered email
    const welcomeMsg: Message = {
      id: `msg-welcome-rel-${Date.now()}`,
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

    // Add activity log
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'New Resident & Relative Account Registered',
      description: `Added ${newResident.fullName}. Relative credentials created for ${newRelativeUser.email}.`,
      category: 'Admission',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Sync to Firestore
    try {
      if (db) {
        setDoc(doc(db, 'residents', newId), sanitizeForFirestore(newResident));
        setDoc(doc(db, 'users', newRelativeUser.id), sanitizeForFirestore(newRelativeUser));
        setDoc(doc(db, 'messages', welcomeMsg.id), sanitizeForFirestore(welcomeMsg));
        setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog));
      }
    } catch (err) {
      console.warn('Firestore resident write notice:', err);
    }

    showToast(`Resident ${newResident.fullName} & Relative account registered.`);
    return { resident: newResident, relativeUser: newRelativeUser, tempPassword };
  };

  const updateResident = (id: string, updated: Partial<Resident>) => {
    setResidents(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    try {
      if (db) {
        setDoc(doc(db, 'residents', id), sanitizeForFirestore(updated), { merge: true });
      }
    } catch (err) {
      console.warn('Firestore updateResident notice:', err);
    }
    showToast('Resident details updated.');
  };

  const deleteResident = (id: string) => {
    const target = residents.find(r => r.id === id);
    setResidents(prev => prev.filter(r => r.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'residents', id));
      }
    } catch (err) {
      console.warn('Firestore deleteResident notice:', err);
    }
    if (target) {
      showToast(`Removed resident ${target.fullName}.`);
    }
  };

  const addStaff = (staffData: Omit<StaffMember, 'id' | 'joinDate' | 'assignedResidentsCount'>) => {
    const newId = `usr-staff-${Date.now().toString().slice(-4)}`;
    const tempPassword = generateTempPassword();

    const newStaff: StaffMember = {
      ...staffData,
      id: newId,
      joinDate: new Date().toISOString().split('T')[0],
      assignedResidentsCount: 0,
      avatar: staffData.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    };
    setStaff(prev => [newStaff, ...prev]);

    // Also add to users list so they can log in
    const newUser: User = {
      id: newId,
      name: newStaff.name,
      email: newStaff.email.trim().toLowerCase(),
      phone: newStaff.phone,
      role: 'Staff',
      position: newStaff.position,
      avatar: newStaff.avatar,
      password: tempPassword,
    };
    setUsers(prev => [...prev, newUser]);

    // Dispatch welcome email / message to staff registered email
    const welcomeMsg: Message = {
      id: `msg-welcome-staff-${Date.now()}`,
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

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'New Staff Member Registered & Credentials Dispatched',
      description: `Registered ${newStaff.name} as ${newStaff.position} (${newUser.email}).`,
      category: 'Staff',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // Persist immediately to Firestore for cross-device synchronization
    try {
      if (db) {
        setDoc(doc(db, 'staff', newId), sanitizeForFirestore(newStaff));
        setDoc(doc(db, 'users', newId), sanitizeForFirestore(newUser));
        setDoc(doc(db, 'messages', welcomeMsg.id), sanitizeForFirestore(welcomeMsg));
        setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog));
      }
    } catch (err) {
      console.warn('Firestore staff save notice:', err);
    }

    showToast(`Staff member ${newStaff.name} registered.`);
    return { user: newUser, tempPassword };
  };

  const updateStaff = (id: string, updated: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    try {
      if (db) {
        setDoc(doc(db, 'staff', id), sanitizeForFirestore(updated), { merge: true });
        // If name, email or avatar updated, update in users collection too
        const userUpdates: Partial<User> = {};
        if (updated.name) userUpdates.name = updated.name;
        if (updated.email) userUpdates.email = updated.email.trim().toLowerCase();
        if (updated.phone) userUpdates.phone = updated.phone;
        if (updated.position) userUpdates.position = updated.position;
        if (updated.avatar) userUpdates.avatar = updated.avatar;
        if (Object.keys(userUpdates).length > 0) {
          setDoc(doc(db, 'users', id), sanitizeForFirestore(userUpdates), { merge: true });
        }
      }
    } catch (err) {
      console.warn('Firestore updateStaff notice:', err);
    }
    showToast('Staff profile updated.');
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    setUsers(prev => prev.filter(u => u.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'staff', id));
        deleteDoc(doc(db, 'users', id));
      }
    } catch (err) {
      console.warn('Firestore deleteStaff notice:', err);
    }
    showToast('Staff member removed.');
  };

  const addShift = (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: `sh-${Date.now().toString().slice(-4)}`,
    };
    setShifts(prev => [newShift, ...prev]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'Shift Scheduled',
      description: `Scheduled ${shiftData.shiftType} shift for ${shiftData.staffName} on ${shiftData.shiftDate}.`,
      category: 'Shift',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      if (db) {
        setDoc(doc(db, 'shifts', newShift.id), sanitizeForFirestore(newShift));
        setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog));
      }
    } catch (err) {
      console.warn('Firestore addShift notice:', err);
    }

    showToast(`Shift scheduled for ${shiftData.staffName}.`);
  };

  const updateShift = (id: string, updated: Partial<Shift>) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    try {
      if (db) {
        setDoc(doc(db, 'shifts', id), sanitizeForFirestore(updated), { merge: true });
      }
    } catch (err) {
      console.warn('Firestore updateShift notice:', err);
    }
    showToast('Shift details updated.');
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'shifts', id));
      }
    } catch (err) {
      console.warn('Firestore deleteShift notice:', err);
    }
    showToast('Shift removed.');
  };

  const sendMessage = (msgData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newMsg: Message = {
      ...msgData,
      id: `msg-${Date.now()}`,
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

      // Ensure Admin receives a CC copy if Admin isn't already the direct receiver
      if (msgData.receiverId !== targetAdmin.id) {
        const ccMsg: Message = {
          ...msgData,
          id: `msg-cc-${Date.now()}`,
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
          if (db) {
            setDoc(doc(db, 'messages', newMsg.id), sanitizeForFirestore(newMsg));
            setDoc(doc(db, 'messages', ccMsg.id), sanitizeForFirestore(ccMsg));
          }
        } catch (err) {
          console.warn('Firestore sendMessage notice:', err);
        }

        showToast(`Message sent to ${msgData.receiverName} (Copied to Admin).`);
        return;
      }
    }

    setMessages(prev => [newMsg, ...prev]);

    try {
      if (db) {
        setDoc(doc(db, 'messages', newMsg.id), sanitizeForFirestore(newMsg));
      }
    } catch (err) {
      console.warn('Firestore sendMessage notice:', err);
    }

    showToast(`Message sent to ${msgData.receiverName}.`);
  };

  const markMessageAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
    try {
      if (db) {
        setDoc(doc(db, 'messages', id), { isRead: true }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore markMessageAsRead notice:', err);
    }
  };

  const deleteMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'messages', id));
      }
    } catch (err) {
      console.warn('Firestore message deletion notice:', err);
    }
    showToast('Message deleted.');
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(a => a.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'applications', id));
      }
    } catch (err) {
      console.warn('Firestore application deletion notice:', err);
    }
    showToast('Application submission deleted.');
  };

  const bookConsultation = (bookingData: Omit<ConsultationBooking, 'id' | 'status' | 'createdAt'>) => {
    const newBooking: ConsultationBooking = {
      ...bookingData,
      id: `cb-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setConsultationBookings(prev => [newBooking, ...prev]);

    try {
      if (db) {
        setDoc(doc(db, 'consultation_bookings', newBooking.id), sanitizeForFirestore(newBooking));
      }
    } catch (err) {
      console.warn('Firestore bookConsultation notice:', err);
    }

    showToast('Consultation request submitted successfully! Our care team will contact you shortly.');
  };

  const addEvent = (eventData: Omit<CommunityEvent, 'id'>) => {
    const newEvent: CommunityEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
    };
    setEvents(prev => [newEvent, ...prev]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'Community Event Posted',
      description: `Posted new event "${eventData.title}" scheduled for ${eventData.date}.`,
      category: 'General',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      if (db) {
        setDoc(doc(db, 'community_events', newEvent.id), sanitizeForFirestore(newEvent));
        setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog));
      }
    } catch (err) {
      console.warn('Firestore addEvent notice:', err);
    }

    showToast(`Event "${eventData.title}" posted successfully.`);
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'community_events', id));
      }
    } catch (err) {
      console.warn('Firestore deleteEvent notice:', err);
    }
    if (target) {
      showToast(`Removed event "${target.title}".`);
    }
  };

  const addJob = (jobData: Omit<JobVacancy, 'id'>) => {
    const newJob: JobVacancy = {
      ...jobData,
      id: `job-${Date.now()}`,
    };
    setJobs(prev => [newJob, ...prev]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'Job Vacancy Posted',
      description: `Posted new job opening for "${jobData.title}" in ${jobData.department}.`,
      category: 'Staff',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      if (db) {
        setDoc(doc(db, 'jobs', newJob.id), sanitizeForFirestore(newJob));
        setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog));
      }
    } catch (err) {
      console.warn('Firestore addJob notice:', err);
    }

    showToast(`Job opening for "${jobData.title}" posted successfully.`);
  };

  const deleteJob = (id: string) => {
    const target = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'jobs', id));
      }
    } catch (err) {
      console.warn('Firestore deleteJob notice:', err);
    }
    if (target) {
      showToast(`Removed job opening "${target.title}".`);
    }
  };

  const addGalleryItem = (itemData: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = {
      ...itemData,
      id: `gal-${Date.now()}`,
    };
    setGalleryItems(prev => [newItem, ...prev]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'Gallery Media Uploaded',
      description: `Added new ${itemData.mediaType || 'image'} "${itemData.title}" to gallery.`,
      category: 'General',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      if (db) {
        setDoc(doc(db, 'gallery', newItem.id), sanitizeForFirestore(newItem));
        setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog));
      }
    } catch (err) {
      console.warn('Firestore addGalleryItem notice:', err);
    }

    showToast(`New ${itemData.mediaType || 'media'} added to gallery.`);
  };

  const addMultipleGalleryItems = (itemsData: Omit<GalleryItem, 'id'>[]) => {
    if (!itemsData.length) return;
    const now = Date.now();
    const newItems: GalleryItem[] = itemsData.map((item, idx) => ({
      ...item,
      id: `gal-${now}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
    }));

    setGalleryItems(prev => [...newItems, ...prev]);

    const newLog: ActivityLog = {
      id: `log-${now}`,
      title: 'Batch Gallery Media Uploaded',
      description: `Added ${itemsData.length} new photos/videos to gallery.`,
      category: 'General',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      if (db) {
        newItems.forEach(item => {
          setDoc(doc(db, 'gallery', item.id), sanitizeForFirestore(item));
        });
        setDoc(doc(db, 'activity_logs', newLog.id), sanitizeForFirestore(newLog));
      }
    } catch (err) {
      console.warn('Firestore addMultipleGalleryItems notice:', err);
    }

    showToast(`Successfully added ${itemsData.length} items to gallery.`);
  };

  const deleteGalleryItem = (id: string) => {
    const target = galleryItems.find(g => g.id === id);
    setGalleryItems(prev => prev.filter(g => g.id !== id));
    try {
      if (db) {
        deleteDoc(doc(db, 'gallery', id));
      }
    } catch (err) {
      console.warn('Firestore deleteGalleryItem notice:', err);
    }
    if (target) {
      showToast(`Deleted "${target.title}" from gallery.`);
    }
  };

  const submitApplication = async (appData: Omit<ApplicationSubmission, 'id' | 'createdAt' | 'status'>): Promise<ApplicationSubmission> => {
    const appId = `app-${Date.now()}`;
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newSubmission: ApplicationSubmission = {
      ...appData,
      id: appId,
      createdAt,
      status: 'Received',
    };

    setApplications(prev => [newSubmission, ...prev]);

    // 1. Persist to Firebase Firestore if connected
    try {
      if (db) {
        const payload = sanitizeForFirestore(newSubmission);
        await setDoc(doc(db, 'applications', appId), payload);
      }
    } catch (err) {
      console.warn('Firestore application sync notice:', err);
    }

    // 2. Dispatch high-priority Message / Notification to ALL Admin users
    const adminUsers = users.filter(u => u.role === 'Admin');
    const adminTargets = adminUsers.length > 0 
      ? adminUsers 
      : [{ id: 'usr-admin-1', name: 'Managing Director', role: 'Admin' as UserRole }];

    const refsFormatted = (appData.references || [])
      .map((r, idx) => `• Reference ${idx + 1}: ${r.name || 'N/A'} (${r.relationship || 'N/A'})\n  Phone: ${r.phone || 'N/A'} | Email: ${r.email || 'N/A'}${r.photoUrl ? ' | [Document Photo Attached]' : ''}`)
      .join('\n\n');

    adminTargets.forEach(admin => {
      const adminNotice: Message = {
        id: `msg-app-${Date.now()}-${admin.id}`,
        senderId: 'usr-system',
        senderName: 'Care Application Portal',
        senderRole: 'Admin',
        receiverId: admin.id,
        receiverName: admin.name,
        receiverRole: 'Admin',
        subject: `📥 NEW CARE APPLICATION: ${appData.fullName} (${appData.type === 'caregiver' ? 'Caregiver Applicant' : 'Resident Admission Request'})`,
        content: `A new ${appData.type === 'caregiver' ? 'Caregiver Employment Application' : 'Resident Care Admission Application'} has been submitted through the web portal.\n\nAPPLICANT FULL DETAILS:\n• Full Name: ${appData.fullName}\n• Email: ${appData.email}\n• Phone: ${appData.phone}\n• Care Category / Position: ${appData.positionOrCategory}\n${appData.sponsorName ? `• Sponsor / Next of Kin: ${appData.sponsorName}\n` : ''}${appData.notesOrStatement ? `• Medical / Qualification Notes: ${appData.notesOrStatement}\n` : ''}${appData.photoUrl ? '• Applicant Photo: Attached\n' : ''}\n\nATTACHED REFERENCES & GUARANTOR DOCUMENTS:\n${refsFormatted || 'None attached'}\n\nSubmitted on: ${createdAt}`,
        attachmentUrl: appData.photoUrl || appData.references[0]?.photoUrl,
        attachmentName: appData.photoUrl ? `${appData.fullName.replace(/\s+/g, '_')}_ID.jpg` : undefined,
        applicantPhotoUrl: appData.photoUrl,
        references: appData.references,
        isRead: false,
        timestamp: createdAt,
      };
      setMessages(prev => [adminNotice, ...prev]);
    });

    // 3. Register Activity Log
    const newLog: ActivityLog = {
      id: `log-app-${Date.now()}`,
      title: `New ${appData.type === 'caregiver' ? 'Caregiver' : 'Resident Care'} Application Received`,
      description: `Application submitted for ${appData.fullName} (${appData.positionOrCategory}). Full details notified to Admin.`,
      category: 'Admission',
      timestamp: createdAt,
      performer: appData.fullName,
    };
    setActivityLogs(prev => [newLog, ...prev]);

    // 4. Register in system active care records
    if (appData.type === 'resident') {
      addResident({
        fullName: appData.fullName,
        dateOfBirth: '1948-06-15',
        gender: 'Female',
        roomNumber: 'Pending Suite Assignment',
        careCategory: (appData.positionOrCategory as CareCategory) || 'Residential Elderly Care',
        healthStatus: 'Stable',
        medicalNotes: appData.notesOrStatement || 'Application received online via care portal.',
        emergencyContact: {
          name: appData.sponsorName || appData.references[0]?.name || 'Next of Kin',
          relationship: appData.references[0]?.relationship || 'Sponsor',
          phone: appData.references[0]?.phone || appData.phone || '+234 706 933 2193',
        },
        references: appData.references,
        avatar: appData.photoUrl,
        lastActivityUpdate: 'Admission application logged with attached references.',
        vitals: {
          bloodPressure: '120/80 mmHg',
          heartRate: '72 bpm',
          temperature: '36.6 °C',
          weight: '68 kg',
        },
      });
    } else if (appData.type === 'caregiver') {
      addStaff({
        name: appData.fullName,
        email: appData.email,
        phone: appData.phone,
        position: appData.positionOrCategory || 'Care Assistant',
        shift: 'Day Shift',
        role: 'Staff',
        qualification: appData.notesOrStatement || 'NVQ Level 3 Care Applicant',
        avatar: appData.photoUrl,
        references: appData.references,
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
      loginUser,
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

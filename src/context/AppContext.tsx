import React, { createContext, useContext, useState, useEffect } from 'react';
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
  GalleryItem
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
  loginUser: (email: string, role: UserRole, password?: string) => boolean;
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
    const saved = localStorage.getItem('shh_gallery');
    return saved ? JSON.parse(saved) : INITIAL_GALLERY;
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
    safeSave('shh_gallery', galleryItems);
  }, [galleryItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loginUser = (email: string, role: UserRole, password?: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    
    // 1. Find registered user by email
    const registeredUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

    if (!registeredUser) {
      showToast(`Login Failed: No registered account found for email '${email}'.`);
      return false;
    }

    // 2. Strict Role Enforcement:
    // Anyone registered as Admin can ONLY login as Admin.
    // Anyone registered as Staff can ONLY login as Staff.
    // Anyone registered as Resident Relative can ONLY login as Resident Relative.
    if (registeredUser.role !== role) {
      showToast(`Access Denied: '${registeredUser.email}' is a registered ${registeredUser.role} account. You cannot sign in through the ${role} portal.`);
      return false;
    }

    // 3. Strict Password Verification
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

    // 4. Authenticate & Grant Access
    setCurrentUser(registeredUser);
    setCurrentPage('dashboard');
    showToast(`Welcome back, ${registeredUser.name}! Signed in to ${registeredUser.role} Portal.`);
    return true;
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
    setCurrentUser(null);
    setCurrentPage('home');
    showToast('You have been logged out safely.');
  };

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
    const relativeName = ref1?.name || resData.emergencyContact.name || 'Primary Relative';
    const cleanResidentName = resData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const relativeEmail = (ref1?.email || resData.emergencyContact.name ? `${cleanResidentName}.relative@samanthasappy.com` : `relative.${cleanResidentName}@samanthasappy.com`).trim().toLowerCase();
    const relativePhone = ref1?.phone || resData.emergencyContact.phone || '+234 706 933 2193';
    const relativeRelationship = ref1?.relationship || resData.emergencyContact.relationship || 'Primary Family Contact';

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
    showToast(`Resident ${newResident.fullName} & Relative account registered.`);

    return { resident: newResident, relativeUser: newRelativeUser, tempPassword };
  };

  const updateResident = (id: string, updated: Partial<Resident>) => {
    setResidents(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
    showToast('Resident details updated.');
  };

  const deleteResident = (id: string) => {
    const target = residents.find(r => r.id === id);
    setResidents(prev => prev.filter(r => r.id !== id));
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
    showToast(`Staff member ${newStaff.name} registered.`);

    return { user: newUser, tempPassword };
  };

  const updateStaff = (id: string, updated: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast('Staff profile updated.');
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
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
    showToast(`Shift scheduled for ${shiftData.staffName}.`);
  };

  const updateShift = (id: string, updated: Partial<Shift>) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
    showToast('Shift details updated.');
  };

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
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
        showToast(`Message sent to ${msgData.receiverName} (Copied to Admin).`);
        return;
      }
    }

    setMessages(prev => [newMsg, ...prev]);
    showToast(`Message sent to ${msgData.receiverName}.`);
  };

  const markMessageAsRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const bookConsultation = (bookingData: Omit<ConsultationBooking, 'id' | 'status' | 'createdAt'>) => {
    const newBooking: ConsultationBooking = {
      ...bookingData,
      id: `cb-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setConsultationBookings(prev => [newBooking, ...prev]);
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
    showToast(`Event "${eventData.title}" posted successfully.`);
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
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
    showToast(`Job opening for "${jobData.title}" posted successfully.`);
  };

  const deleteJob = (id: string) => {
    const target = jobs.find(j => j.id === id);
    setJobs(prev => prev.filter(j => j.id !== id));
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
    showToast(`Successfully added ${itemsData.length} items to gallery.`);
  };

  const deleteGalleryItem = (id: string) => {
    const target = galleryItems.find(g => g.id === id);
    setGalleryItems(prev => prev.filter(g => g.id !== id));
    if (target) {
      showToast(`Deleted "${target.title}" from gallery.`);
    }
  };

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      currentUser,
      users,
      loginUser,
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

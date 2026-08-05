import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Resident, 
  StaffMember, 
  Shift, 
  Message, 
  ActivityLog, 
  ConsultationBooking 
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_STAFF, 
  INITIAL_RESIDENTS, 
  INITIAL_SHIFTS, 
  INITIAL_MESSAGES, 
  INITIAL_ACTIVITY_LOGS 
} from '../data/initialData';

export type PageView = 
  | 'home' 
  | 'about' 
  | 'services' 
  | 'facilities' 
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
  loginUser: (email: string, role: UserRole) => boolean;
  switchDemoRole: (role: UserRole) => void;
  logout: () => void;
  
  residents: Resident[];
  addResident: (resident: Omit<Resident, 'id' | 'admissionDate'>) => void;
  updateResident: (id: string, updated: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  
  staff: StaffMember[];
  addStaff: (staffMember: Omit<StaffMember, 'id' | 'joinDate' | 'assignedResidentsCount'>) => void;
  updateStaff: (id: string, updated: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  
  shifts: Shift[];
  addShift: (shift: Omit<Shift, 'id'>) => void;
  deleteShift: (id: string) => void;
  
  messages: Message[];
  sendMessage: (msg: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => void;
  markMessageAsRead: (id: string) => void;
  
  activityLogs: ActivityLog[];
  consultationBookings: ConsultationBooking[];
  bookConsultation: (booking: Omit<ConsultationBooking, 'id' | 'status' | 'createdAt'>) => void;
  
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
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('shh_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default logged in as Admin for full experience preview
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

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('shh_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('shh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('shh_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('shh_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('shh_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('shh_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('shh_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('shh_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('shh_consultations', JSON.stringify(consultationBookings));
  }, [consultationBookings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loginUser = (email: string, role: UserRole): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (found) {
      setCurrentUser(found);
      setCurrentPage('dashboard');
      showToast(`Welcome back, ${found.name}! Logged in as ${found.role}.`);
      return true;
    }
    // If not found in exact email, find any user with that role or create on-the-fly
    const roleUser = users.find(u => u.role === role);
    if (roleUser) {
      setCurrentUser(roleUser);
      setCurrentPage('dashboard');
      showToast(`Logged in as ${roleUser.name} (${roleUser.role}).`);
      return true;
    }
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

  const logout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    showToast('You have been logged out safely.');
  };

  const addResident = (resData: Omit<Resident, 'id' | 'admissionDate'>) => {
    const newId = `res-${Date.now().toString().slice(-4)}`;
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

    // Add activity log
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'New Resident Added',
      description: `Added ${newResident.fullName} under category ${newResident.careCategory}.`,
      category: 'Admission',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    showToast(`Resident ${newResident.fullName} added successfully.`);
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
      email: newStaff.email,
      phone: newStaff.phone,
      role: 'Staff',
      position: newStaff.position,
      avatar: newStaff.avatar,
    };
    setUsers(prev => [...prev, newUser]);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      title: 'New Staff Member Registered',
      description: `Registered ${newStaff.name} as ${newStaff.position}.`,
      category: 'Staff',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      performer: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System Admin',
    };
    setActivityLogs(prev => [newLog, ...prev]);
    showToast(`Staff member ${newStaff.name} registered.`);
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

  const deleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    showToast('Shift removed.');
  };

  const sendMessage = (msgData: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const newMsg: Message = {
      ...msgData,
      id: `msg-${Date.now()}`,
      isRead: false,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
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

  return (
    <AppContext.Provider value={{
      currentPage,
      setCurrentPage,
      currentUser,
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
      deleteShift,
      messages,
      sendMessage,
      markMessageAsRead,
      activityLogs,
      consultationBookings,
      bookConsultation,
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

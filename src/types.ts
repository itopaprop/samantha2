export type UserRole = 'Admin' | 'Staff' | 'Resident Relative';

export type CareCategory = 
  | 'Residential Elderly Care' 
  | 'Dementia Support' 
  | 'Child Care Services' 
  | 'Daily Living Assistance' 
  | 'Domiciliary Care' 
  | 'Vulnerable Adult Support' 
  | 'Medication Support' 
  | 'Recreational Activities'
  | 'weekend/short stay care'
  | 'Home assistance'
  | 'Maids'
  | 'Hospital care'
  | 'Children short stay & dancing club';

export interface Reference {
  name: string;
  relationship: string;
  organisation?: string;
  phone: string;
  email?: string;
  photoUrl?: string;
}

export interface ApplicationDocument {
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  position?: string; // For staff
  relationship?: string; // For relative (e.g., "Son", "Daughter")
  residentLinkedId?: string; // For relative
}

export interface Resident {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  roomNumber: string;
  careCategory: CareCategory;
  assignedStaffId?: string;
  assignedStaffName?: string;
  medicalNotes: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  admissionDate: string;
  healthStatus: 'Excellent' | 'Stable' | 'Requires Monitoring' | 'Critical Attention';
  lastActivityUpdate: string;
  avatar?: string;
  references?: Reference[];
  vitals?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  shift: string;
  role: 'Staff' | 'Admin';
  joinDate: string;
  qualification: string;
  assignedResidentsCount: number;
  avatar?: string;
  references?: Reference[];
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: 'Morning' | 'Afternoon' | 'Night' | '24-Hour Coverage';
  location: string;
  notes?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId: string;
  receiverName: string;
  receiverRole: UserRole;
  subject: string;
  content: string;
  attachmentName?: string;
  attachmentUrl?: string;
  applicantPhotoUrl?: string;
  references?: Reference[];
  formType?: 'contact_inquiry' | 'roofing_quote' | string;
  fullName?: string;
  email?: string;
  phone?: string;
  stateLocation?: string;
  roofType?: string;
  projectScope?: string;
  estimatedSize?: string;
  message?: string;
  createdAt?: string;
  isRead: boolean;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  title: string;
  description: string;
  category: 'Admission' | 'Staff' | 'Shift' | 'Medical' | 'General';
  timestamp: string;
  performer: string;
}

export interface JobVacancy {
  id: string;
  title: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  department: string;
  location: string;
  description: string;
  requirements: string[];
}

export interface TrainingProgram {
  id: string;
  title: string;
  duration: string;
  certification: string;
  description: string;
  modules: string[];
}

export interface Facility {
  id: string;
  name: string;
  category: 'Resident Rooms' | "Children's Activity Areas" | 'Dining Areas' | 'Medical Rooms' | 'Recreation Areas' | 'Garden Spaces' | 'Therapy Rooms' | 'Visitor Areas' | 'Security & Safety';
  description: string;
  image: string;
  features: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Elderly Care Activities' | "Children's Activities" | 'Training Sessions' | 'Events' | 'Facility Photos' | 'Family Visitations';
  imageUrl: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video';
  description: string;
  date: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  category: 'Community Celebration' | 'Health & Wellness' | 'Family & Resident Gathering' | 'Educational & Workshop' | 'Cultural & Arts';
  imageUrl?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  organizer?: string;
}

export interface ApplicationSubmission {
  id: string;
  type: 'caregiver' | 'resident';
  fullName: string;
  email: string;
  phone: string;
  // Section 1 – Personal Information (Caregiver & Resident)
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  whatsappNumber?: string;
  residentialAddress?: string;
  cityState?: string;
  nationality?: string;
  // Resident Section 2 – Care Information
  careTypeRequired?: 'Short-term care' | 'Long-term care' | 'Respite care' | 'Rehabilitation / recovery care' | string;
  reasonForAdmission?: string;
  existingMedicalConditions?: string;
  currentMedications?: string;
  specialCareRequirements?: string;
  mobilityStatus?: string;
  // Resident Section 3 – Next of Kin / Emergency Contact
  nextOfKinName?: string;
  nextOfKinRelationship?: string;
  nextOfKinPhone?: string;
  nextOfKinAltPhone?: string;
  nextOfKinEmail?: string;
  // Resident Section 4 – Admission Consent
  consentInfoAccurate?: boolean;
  consentContactPermitted?: boolean;
  applicantGuardianName?: string;
  applicantSignature?: string;
  consentDate?: string;
  // Resident Section 5 – Administrative Section (Staff Only - hidden from applicants)
  admissionId?: string;
  admissionDate?: string;
  admissionStatus?: 'Pending' | 'Approved' | 'Rejected';
  assignedStaffId?: string;
  assignedStaffName?: string;
  staffNotes?: string;
  // Caregiver Section 2 – Educational Background
  highestQualification?: string;
  institutionName?: string;
  courseOfStudy?: string;
  graduationYear?: string;
  professionalQualifications?: string;
  relevantCertifications?: string;
  // Caregiver Section 3 – Work Experience
  hasPreviousCareExperience?: 'Yes' | 'No' | string;
  previousEmployer?: string;
  previousJobTitle?: string;
  yearsOfExperience?: string;
  previousResponsibilities?: string;
  reasonForLeaving?: string;
  // Resident & WhatsApp Notification Metadata
  applicantName?: string;
  applicantWhatsApp?: string;
  whatsappConsent?: boolean;
  formType?: string;
  // Caregiver Section 4 – Document Uploads
  photoUrl?: string;
  cvUrl?: string;
  cvName?: string;
  documents?: {
    passportPhoto?: ApplicationDocument;
    cv?: ApplicationDocument;
    educationalCertificates?: ApplicationDocument;
    professionalCertificates?: ApplicationDocument;
    trainingCertificates?: ApplicationDocument;
    validId?: ApplicationDocument;
  };
  receiptUrl?: string;
  receiptName?: string;
  positionOrCategory: string;
  notesOrStatement?: string;
  sponsorName?: string;
  references: Reference[];
  createdAt: string;
  status: 'pending' | 'Received' | 'Under Review' | 'Approved' | 'Declined';
}

export interface ConsultationBooking {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  serviceInterest: string;
  notes?: string;
  formType?: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  createdAt: string;
}

import { 
  User, 
  Resident, 
  StaffMember, 
  Shift, 
  Message, 
  ActivityLog, 
  ConsultationBooking, 
  CommunityEvent, 
  JobVacancy, 
  GalleryItem, 
  ApplicationSubmission 
} from '../types';

// ============================================================================
// UUID HELPERS
// ============================================================================

export function isValidUUID(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// CONVERTERS: Supabase DB Row (snake_case) <---> App TypeScript Model (camelCase)
// ============================================================================

export function profileToUser(row: any): User {
  return {
    id: row.id,
    name: row.name || row.email?.split('@')[0] || 'User',
    email: row.email || '',
    phone: row.phone || '',
    role: row.role || 'Staff',
    position: row.position || undefined,
    relationship: row.relationship || undefined,
    residentLinkedId: row.resident_linked_id || undefined,
    avatar: row.avatar || undefined,
    password: row.password || undefined,
  };
}

export function userToProfile(user: User): any {
  const profile: any = {
    email: user.email.toLowerCase().trim(),
    name: user.name,
    phone: user.phone || null,
    role: user.role,
    position: user.position || null,
    relationship: user.relationship || null,
    resident_linked_id: user.residentLinkedId || null,
    avatar: user.avatar || null,
    password: user.password || null,
    updated_at: new Date().toISOString(),
  };
  if (isValidUUID(user.id)) {
    profile.id = user.id;
  }
  return profile;
}

export function residentFromRow(row: any): Resident {
  return {
    id: row.id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender || 'Other',
    roomNumber: row.room_number || '',
    careCategory: row.care_category,
    assignedStaffId: row.assigned_staff_id || undefined,
    assignedStaffName: row.assigned_staff_name || undefined,
    medicalNotes: row.medical_notes || '',
    emergencyContact: row.emergency_contact || { name: '', relationship: '', phone: '' },
    admissionDate: row.admission_date || '',
    healthStatus: row.health_status || 'Stable',
    lastActivityUpdate: row.last_activity_update || '',
    avatar: row.avatar || undefined,
    references: row.references || [],
    vitals: row.vitals || undefined,
  };
}

export function residentToRow(r: Partial<Resident>): any {
  const row: any = {};
  if (r.id && isValidUUID(r.id)) row.id = r.id;
  if (r.fullName !== undefined) row.full_name = r.fullName;
  if (r.dateOfBirth !== undefined) row.date_of_birth = r.dateOfBirth;
  if (r.gender !== undefined) row.gender = r.gender;
  if (r.roomNumber !== undefined) row.room_number = r.roomNumber;
  if (r.careCategory !== undefined) row.care_category = r.careCategory;
  if (r.assignedStaffId !== undefined) row.assigned_staff_id = r.assignedStaffId;
  if (r.assignedStaffName !== undefined) row.assigned_staff_name = r.assignedStaffName;
  if (r.medicalNotes !== undefined) row.medical_notes = r.medicalNotes;
  if (r.emergencyContact !== undefined) row.emergency_contact = r.emergencyContact;
  if (r.admissionDate !== undefined) row.admission_date = r.admissionDate;
  if (r.healthStatus !== undefined) row.health_status = r.healthStatus;
  if (r.lastActivityUpdate !== undefined) row.last_activity_update = r.lastActivityUpdate;
  if (r.avatar !== undefined) row.avatar = r.avatar;
  if (r.references !== undefined) row.references = r.references;
  if (r.vitals !== undefined) row.vitals = r.vitals;
  row.updated_at = new Date().toISOString();
  return row;
}

export function staffFromRow(row: any): StaffMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    position: row.position,
    shift: row.shift || 'Day Shift',
    role: row.role || 'Staff',
    joinDate: row.join_date || '',
    qualification: row.qualification || '',
    assignedResidentsCount: row.assigned_residents_count || 0,
    avatar: row.avatar || undefined,
    references: row.references || [],
  };
}

export function staffToRow(s: Partial<StaffMember>): any {
  const row: any = {};
  if (s.id && isValidUUID(s.id)) row.id = s.id;
  if (s.name !== undefined) row.name = s.name;
  if (s.email !== undefined) row.email = s.email.toLowerCase().trim();
  if (s.phone !== undefined) row.phone = s.phone;
  if (s.position !== undefined) row.position = s.position;
  if (s.shift !== undefined) row.shift = s.shift;
  if (s.role !== undefined) row.role = s.role;
  if (s.joinDate !== undefined) row.join_date = s.joinDate;
  if (s.qualification !== undefined) row.qualification = s.qualification;
  if (s.assignedResidentsCount !== undefined) row.assigned_residents_count = s.assignedResidentsCount;
  if (s.avatar !== undefined) row.avatar = s.avatar;
  if (s.references !== undefined) row.references = s.references;
  row.updated_at = new Date().toISOString();
  return row;
}

export function shiftFromRow(row: any): Shift {
  return {
    id: row.id,
    staffId: row.staff_id,
    staffName: row.staff_name,
    shiftDate: row.shift_date,
    startTime: row.start_time,
    endTime: row.end_time,
    shiftType: row.shift_type,
    location: row.location || 'Main Facility',
    notes: row.notes || undefined,
  };
}

export function shiftToRow(s: Partial<Shift>): any {
  const row: any = {};
  if (s.id && isValidUUID(s.id)) row.id = s.id;
  if (s.staffId !== undefined) row.staff_id = s.staffId;
  if (s.staffName !== undefined) row.staff_name = s.staffName;
  if (s.shiftDate !== undefined) row.shift_date = s.shiftDate;
  if (s.startTime !== undefined) row.start_time = s.startTime;
  if (s.endTime !== undefined) row.end_time = s.endTime;
  if (s.shiftType !== undefined) row.shift_type = s.shiftType;
  if (s.location !== undefined) row.location = s.location;
  if (s.notes !== undefined) row.notes = s.notes;
  row.updated_at = new Date().toISOString();
  return row;
}

export function messageFromRow(row: any): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    senderRole: row.sender_role,
    receiverId: row.receiver_id,
    receiverName: row.receiver_name,
    receiverRole: row.receiver_role,
    subject: row.subject,
    content: row.content,
    attachmentName: row.attachment_name || undefined,
    attachmentUrl: row.attachment_url || undefined,
    applicantPhotoUrl: row.applicant_photo_url || undefined,
    references: row.references || undefined,
    isRead: row.is_read || false,
    timestamp: row.timestamp || new Date().toISOString().replace('T', ' ').slice(0, 16),
  };
}

export function messageToRow(m: Partial<Message>): any {
  const row: any = {};
  if (m.id && isValidUUID(m.id)) row.id = m.id;
  if (m.senderId !== undefined) row.sender_id = m.senderId;
  if (m.senderName !== undefined) row.sender_name = m.senderName;
  if (m.senderRole !== undefined) row.sender_role = m.senderRole;
  if (m.receiverId !== undefined) row.receiver_id = m.receiverId;
  if (m.receiverName !== undefined) row.receiver_name = m.receiverName;
  if (m.receiverRole !== undefined) row.receiver_role = m.receiverRole;
  if (m.subject !== undefined) row.subject = m.subject;
  if (m.content !== undefined) row.content = m.content;
  if (m.attachmentName !== undefined) row.attachment_name = m.attachmentName;
  if (m.attachmentUrl !== undefined) row.attachment_url = m.attachmentUrl;
  if (m.applicantPhotoUrl !== undefined) row.applicant_photo_url = m.applicantPhotoUrl;
  if (m.references !== undefined) row.references = m.references;
  if (m.isRead !== undefined) row.is_read = m.isRead;
  if (m.timestamp !== undefined) row.timestamp = m.timestamp;
  return row;
}

export function activityLogFromRow(row: any): ActivityLog {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category || 'General',
    timestamp: row.timestamp,
    performer: row.performer,
  };
}

export function activityLogToRow(log: Partial<ActivityLog>): any {
  const row: any = {
    title: log.title,
    description: log.description,
    category: log.category || 'General',
    timestamp: log.timestamp,
    performer: log.performer,
  };
  if (log.id && isValidUUID(log.id)) {
    row.id = log.id;
  }
  return row;
}

export function eventFromRow(row: any): CommunityEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time || undefined,
    location: row.location,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url || undefined,
    status: row.status || 'Upcoming',
    organizer: row.organizer || undefined,
  };
}

export function eventToRow(e: Partial<CommunityEvent>): any {
  const row: any = {};
  if (e.id && isValidUUID(e.id)) row.id = e.id;
  if (e.title !== undefined) row.title = e.title;
  if (e.date !== undefined) row.date = e.date;
  if (e.time !== undefined) row.time = e.time;
  if (e.location !== undefined) row.location = e.location;
  if (e.description !== undefined) row.description = e.description;
  if (e.category !== undefined) row.category = e.category;
  if (e.imageUrl !== undefined) row.image_url = e.imageUrl;
  if (e.status !== undefined) row.status = e.status;
  if (e.organizer !== undefined) row.organizer = e.organizer;
  return row;
}

export function jobFromRow(row: any): JobVacancy {
  return {
    id: row.id,
    title: row.title,
    type: row.type || 'Full-time',
    department: row.department,
    location: row.location,
    description: row.description,
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
  };
}

export function jobToRow(j: Partial<JobVacancy>): any {
  const row: any = {};
  if (j.id && isValidUUID(j.id)) row.id = j.id;
  if (j.title !== undefined) row.title = j.title;
  if (j.type !== undefined) row.type = j.type;
  if (j.department !== undefined) row.department = j.department;
  if (j.location !== undefined) row.location = j.location;
  if (j.description !== undefined) row.description = j.description;
  if (j.requirements !== undefined) row.requirements = j.requirements;
  return row;
}

export function galleryFromRow(row: any): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    imageUrl: row.image_url,
    videoUrl: row.video_url || undefined,
    mediaType: row.media_type || 'image',
    description: row.description || '',
    date: row.date || '',
  };
}

export function galleryToRow(g: Partial<GalleryItem>): any {
  const row: any = {};
  if (g.id && isValidUUID(g.id)) row.id = g.id;
  if (g.title !== undefined) row.title = g.title;
  if (g.category !== undefined) row.category = g.category;
  if (g.imageUrl !== undefined) row.image_url = g.imageUrl;
  if (g.videoUrl !== undefined) row.video_url = g.videoUrl;
  if (g.mediaType !== undefined) row.media_type = g.mediaType;
  if (g.description !== undefined) row.description = g.description;
  if (g.date !== undefined) row.date = g.date;
  return row;
}

export function applicationFromRow(row: any): ApplicationSubmission {
  return {
    id: row.id,
    type: row.type,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    photoUrl: row.photo_url || undefined,
    receiptUrl: row.receipt_url || undefined,
    receiptName: row.receipt_name || undefined,
    positionOrCategory: row.position_or_category,
    notesOrStatement: row.notes_or_statement || undefined,
    sponsorName: row.sponsor_name || undefined,
    references: row.references || [],
    createdAt: row.created_at || new Date().toISOString().replace('T', ' ').slice(0, 16),
    status: row.status || 'Received',
  };
}

export function applicationToRow(a: Partial<ApplicationSubmission>): any {
  const row: any = {};
  if (a.id && isValidUUID(a.id)) row.id = a.id;
  if (a.type !== undefined) row.type = a.type;
  if (a.fullName !== undefined) row.full_name = a.fullName;
  if (a.email !== undefined) row.email = a.email.toLowerCase().trim();
  if (a.phone !== undefined) row.phone = a.phone;
  if (a.photoUrl !== undefined) row.photo_url = a.photoUrl;
  if (a.receiptUrl !== undefined) row.receipt_url = a.receiptUrl;
  if (a.receiptName !== undefined) row.receipt_name = a.receiptName;
  if (a.positionOrCategory !== undefined) row.position_or_category = a.positionOrCategory;
  if (a.notesOrStatement !== undefined) row.notes_or_statement = a.notesOrStatement;
  if (a.sponsorName !== undefined) row.sponsor_name = a.sponsorName;
  if (a.references !== undefined) row.references = a.references;
  if (a.status !== undefined) row.status = a.status;
  return row;
}

export function consultationFromRow(row: any): ConsultationBooking {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    serviceInterest: row.service_interest,
    notes: row.notes || undefined,
    status: row.status || 'Pending',
    createdAt: row.created_at || new Date().toISOString().split('T')[0],
  };
}

export function consultationToRow(c: Partial<ConsultationBooking>): any {
  const row: any = {};
  if (c.id && isValidUUID(c.id)) row.id = c.id;
  if (c.fullName !== undefined) row.full_name = c.fullName;
  if (c.email !== undefined) row.email = c.email.toLowerCase().trim();
  if (c.phone !== undefined) row.phone = c.phone;
  if (c.preferredDate !== undefined) row.preferred_date = c.preferredDate;
  if (c.preferredTime !== undefined) row.preferred_time = c.preferredTime;
  if (c.serviceInterest !== undefined) row.service_interest = c.serviceInterest;
  if (c.notes !== undefined) row.notes = c.notes;
  if (c.status !== undefined) row.status = c.status;
  return row;
}

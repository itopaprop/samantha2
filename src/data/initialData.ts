import { 
  User, 
  Resident, 
  StaffMember, 
  Shift, 
  Message, 
  ActivityLog, 
  Facility, 
  GalleryItem, 
  JobVacancy, 
  TrainingProgram 
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Folashade Sonyaolu',
    email: 'admin@samanthasappyhome.com',
    phone: '+2347069332193',
    role: 'Admin',
    position: 'Managing Director & Head of Care (LLB, QaAA)',
    avatar: 'https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X=s1600',
  },
  {
    id: 'usr-staff-1',
    name: 'Sarah Jenkins, RN',
    email: 's.jenkins@samanthasappyhome.com',
    phone: '+44 20 7946 0884',
    role: 'Staff',
    position: 'Senior Nurse & Care Lead',
    avatar: 'https://images.unsplash.com/photo-1594824813566-7885a397738c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'usr-staff-2',
    name: 'Marcus Vance',
    email: 'm.vance@samanthasappyhome.com',
    phone: '+44 20 7946 0411',
    role: 'Staff',
    position: 'Dementia Care Specialist',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'usr-relative-1',
    name: 'David Miller',
    email: 'david.miller@example.com',
    phone: '+44 7700 900421',
    role: 'Resident Relative',
    relationship: 'Son of Eleanor Miller',
    residentLinkedId: 'res-101',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'usr-relative-2',
    name: 'Rebecca Wright',
    email: 'rebecca.w@example.com',
    phone: '+44 7700 900812',
    role: 'Resident Relative',
    relationship: 'Daughter of Thomas Wright',
    residentLinkedId: 'res-102',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  }
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'usr-staff-1',
    name: 'Sarah Jenkins, RN',
    email: 's.jenkins@samanthasappyhome.com',
    phone: '+44 20 7946 0884',
    position: 'Senior Nurse & Care Lead',
    shift: 'Morning (07:00 - 15:30)',
    role: 'Staff',
    joinDate: '2022-03-15',
    qualification: 'BSc Nursing, Certified Dementia Practitioner',
    assignedResidentsCount: 2,
    avatar: 'https://images.unsplash.com/photo-1594824813566-7885a397738c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'usr-staff-2',
    name: 'Marcus Vance',
    email: 'm.vance@samanthasappyhome.com',
    phone: '+44 20 7946 0411',
    position: 'Dementia Care Specialist',
    shift: 'Afternoon (14:30 - 22:30)',
    role: 'Staff',
    joinDate: '2023-01-10',
    qualification: 'NVQ Level 4 Healthcare, Memory Support Certified',
    assignedResidentsCount: 2,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'usr-staff-3',
    name: 'Emily Watson',
    email: 'e.watson@samanthasappyhome.com',
    phone: '+44 20 7946 0773',
    position: 'Child Development Educator',
    shift: 'Day Shift (08:00 - 16:30)',
    role: 'Staff',
    joinDate: '2023-06-01',
    qualification: 'BA Early Childhood Education, Pediatric First Aid',
    assignedResidentsCount: 1,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'usr-staff-4',
    name: 'Robert Taylor',
    email: 'r.taylor@samanthasappyhome.com',
    phone: '+44 20 7946 0399',
    position: 'Domiciliary Care Assistant',
    shift: 'Flexible Visits (08:00 - 20:00)',
    role: 'Staff',
    joinDate: '2024-02-18',
    qualification: 'NVQ Level 3 Health & Social Care',
    assignedResidentsCount: 2,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  }
];

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'res-101',
    fullName: 'Eleanor Miller',
    dateOfBirth: '1942-05-14',
    gender: 'Female',
    roomNumber: 'Suite 104 - Willow Wing',
    careCategory: 'Dementia Support',
    assignedStaffId: 'usr-staff-1',
    assignedStaffName: 'Sarah Jenkins, RN',
    medicalNotes: 'Mild Alzheimer’s progression. Requires gentle morning orientation and daily guided walk. Low sodium diet.',
    emergencyContact: {
      name: 'David Miller',
      relationship: 'Son',
      phone: '+44 7700 900421',
    },
    admissionDate: '2023-04-12',
    healthStatus: 'Stable',
    lastActivityUpdate: 'Participated in morning music therapy and completed light garden walk with Nurse Sarah.',
    vitals: {
      bloodPressure: '122/78 mmHg',
      heartRate: '72 bpm',
      temperature: '36.6 °C',
      weight: '64 kg',
    }
  },
  {
    id: 'res-102',
    fullName: 'Thomas Wright',
    dateOfBirth: '1938-11-22',
    gender: 'Male',
    roomNumber: 'Suite 208 - Rosewood Wing',
    careCategory: 'Residential Elderly Care',
    assignedStaffId: 'usr-staff-1',
    assignedStaffName: 'Sarah Jenkins, RN',
    medicalNotes: 'Post-stroke mobility recovery. Uses walker. Daily physiotherapy exercises at 11:00 AM.',
    emergencyContact: {
      name: 'Rebecca Wright',
      relationship: 'Daughter',
      phone: '+44 7700 900812',
    },
    admissionDate: '2023-09-01',
    healthStatus: 'Excellent',
    lastActivityUpdate: 'Enjoyed afternoon chess game in the lounge and completed 20-minute walker physio session.',
    vitals: {
      bloodPressure: '128/82 mmHg',
      heartRate: '68 bpm',
      temperature: '36.5 °C',
      weight: '78 kg',
    }
  },
  {
    id: 'res-103',
    fullName: 'Arthur Pendelton',
    dateOfBirth: '1945-03-08',
    gender: 'Male',
    roomNumber: 'Domiciliary Care Client - Home Visit',
    careCategory: 'Domiciliary Care',
    assignedStaffId: 'usr-staff-4',
    assignedStaffName: 'Robert Taylor',
    medicalNotes: 'Requires twice daily home visits for medication administration and meal preparation assistance.',
    emergencyContact: {
      name: 'Helen Pendelton',
      relationship: 'Wife',
      phone: '+44 7700 900334',
    },
    admissionDate: '2024-01-15',
    healthStatus: 'Stable',
    lastActivityUpdate: 'Morning medication visit completed successfully. Meal prepped for lunch.',
    vitals: {
      bloodPressure: '130/85 mmHg',
      heartRate: '74 bpm',
      temperature: '36.7 °C',
      weight: '72 kg',
    }
  },
  {
    id: 'res-104',
    fullName: 'Clara & Leo Bennett (Siblings)',
    dateOfBirth: '2020-08-19',
    gender: 'Female',
    roomNumber: 'Day Care Sunshine Room',
    careCategory: 'Child Care Services',
    assignedStaffId: 'usr-staff-3',
    assignedStaffName: 'Emily Watson',
    medicalNotes: 'No allergies. Clara loves story hour; Leo enjoys sensory play blocks. Snack time at 10:30 AM.',
    emergencyContact: {
      name: 'Jessica Bennett',
      relationship: 'Mother',
      phone: '+44 7700 900998',
    },
    admissionDate: '2024-03-01',
    healthStatus: 'Excellent',
    lastActivityUpdate: 'Completed interactive puppet show session and painted watercolor rainbows.',
    vitals: {
      bloodPressure: 'N/A',
      heartRate: '95 bpm',
      temperature: '36.6 °C',
      weight: '16 kg',
    }
  },
  {
    id: 'res-105',
    fullName: 'Sophia Lee',
    dateOfBirth: '2001-09-04',
    gender: 'Female',
    roomNumber: 'Caregiver Training Center - Room B',
    careCategory: 'Student Caregiver',
    assignedStaffId: 'usr-staff-2',
    assignedStaffName: 'Marcus Vance',
    medicalNotes: 'Student Caregiver Trainee completing NVQ Level 3 practical residency module in eldercare & safeguarding.',
    emergencyContact: {
      name: 'David Lee',
      relationship: 'Father',
      phone: '+44 7700 900551',
    },
    admissionDate: '2024-05-10',
    healthStatus: 'Excellent',
    lastActivityUpdate: 'Passed Dementia Awareness practical simulation with distinction score.',
  },
  {
    id: 'res-106',
    fullName: 'George Harris',
    dateOfBirth: '1950-01-30',
    gender: 'Male',
    roomNumber: 'Suite 112 - Meadow Wing',
    careCategory: 'Vulnerable Adult Support',
    assignedStaffId: 'usr-staff-2',
    assignedStaffName: 'Marcus Vance',
    medicalNotes: 'Supported daily living for sensory impairment. Prefers structured routines and quiet reading corner.',
    emergencyContact: {
      name: 'Claire Harris',
      relationship: 'Sister',
      phone: '+44 7700 900662',
    },
    admissionDate: '2024-02-01',
    healthStatus: 'Requires Monitoring',
    lastActivityUpdate: 'Attended audio-book listening circle and expressed great satisfaction with dinner menu.',
    vitals: {
      bloodPressure: '135/88 mmHg',
      heartRate: '76 bpm',
      temperature: '36.8 °C',
      weight: '80 kg',
    }
  }
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'sh-101',
    staffId: 'usr-staff-1',
    staffName: 'Sarah Jenkins, RN',
    shiftDate: '2026-08-02',
    startTime: '07:00',
    endTime: '15:30',
    shiftType: 'Morning',
    location: 'Willow Wing & Main Medical Station',
    notes: 'Morning vitals check, medication rounds, and supervising physiotherapy appointments.'
  },
  {
    id: 'sh-102',
    staffId: 'usr-staff-2',
    staffName: 'Marcus Vance',
    shiftDate: '2026-08-02',
    startTime: '14:30',
    endTime: '22:30',
    shiftType: 'Afternoon',
    location: 'Memory Care Hub - Rosewood Wing',
    notes: 'Evening sensory activities, supper assistance, and family visitation coordination.'
  },
  {
    id: 'sh-103',
    staffId: 'usr-staff-3',
    staffName: 'Emily Watson',
    shiftDate: '2026-08-02',
    startTime: '08:00',
    endTime: '16:30',
    shiftType: 'Morning',
    location: "Children's Sunshine Learning Suite",
    notes: 'Early childhood cognitive games, garden play hour, and lunch meal supervision.'
  },
  {
    id: 'sh-104',
    staffId: 'usr-staff-4',
    staffName: 'Robert Taylor',
    shiftDate: '2026-08-03',
    startTime: '08:00',
    endTime: '18:00',
    shiftType: 'Morning',
    location: 'Domiciliary Care Circuit - West District',
    notes: 'Home visits for Mr. Pendelton and Mrs. Abernathy.'
  }
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-101',
    senderId: 'usr-staff-1',
    senderName: 'Sarah Jenkins, RN',
    senderRole: 'Staff',
    receiverId: 'usr-relative-1',
    receiverName: 'David Miller',
    receiverRole: 'Resident Relative',
    subject: 'Eleanor’s Weekly Health & Activity Progress',
    content: 'Hello David, Eleanor had a splendid week! Her blood pressure is steady at 122/78 mmHg. She thoroughly enjoyed our garden music session today and asked after you. Please feel free to join us for tea on Thursday afternoon!',
    isRead: false,
    timestamp: '2026-08-02 08:30',
  },
  {
    id: 'msg-102',
    senderId: 'usr-relative-1',
    senderName: 'David Miller',
    senderRole: 'Resident Relative',
    receiverId: 'usr-admin-1',
    receiverName: 'Samantha Itopa',
    receiverRole: 'Admin',
    subject: 'Thank You & Weekend Visit Request',
    content: 'Dear Samantha, thank you and Nurse Sarah for the stellar care given to my mother. I would like to confirm if I can bring her favorite homemade sugar-free treats during my Sunday visit.',
    isRead: true,
    timestamp: '2026-08-01 16:45',
  },
  {
    id: 'msg-103',
    senderId: 'usr-admin-1',
    senderName: 'Samantha Itopa',
    senderRole: 'Admin',
    receiverId: 'usr-staff-1',
    receiverName: 'Sarah Jenkins, RN',
    receiverRole: 'Staff',
    subject: 'Staff Shift Roster Update & New Trainee Induction',
    content: 'Hi Sarah, please review the upcoming shift schedule for next week. Trainee Sophia Lee will be shadowing your morning rounds on Wednesday.',
    isRead: true,
    timestamp: '2026-07-31 09:15',
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    title: 'New Resident Admission',
    description: 'Sophia Lee registered into Student Caregiver practical track.',
    category: 'Admission',
    timestamp: '2026-08-02 08:15',
    performer: 'Samantha Itopa (Admin)',
  },
  {
    id: 'log-2',
    title: 'Vital Signs Recorded',
    description: 'Nurse Sarah recorded normal vitals for Eleanor Miller (BP 122/78).',
    category: 'Medical',
    timestamp: '2026-08-02 07:45',
    performer: 'Sarah Jenkins, RN',
  },
  {
    id: 'log-3',
    title: 'Shift Rotation Assigned',
    description: 'Marcus Vance assigned to Afternoon Shift in Memory Care Hub.',
    category: 'Shift',
    timestamp: '2026-08-01 14:00',
    performer: 'Samantha Itopa (Admin)',
  }
];

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'fac-1',
    name: 'Private & Shared Resident Suites',
    category: 'Resident Rooms',
    description: 'Elegantly furnished, climate-controlled single and double suites with emergency call buttons, ergonomic profiling beds, en-suite bathrooms, and natural garden views.',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    features: ['24/7 Nurse Call System', '24/7 Standard Monitored Security', 'En-Suite Accessibility Bathroom', 'Orthopedic Profiling Bed', 'Smart TV & Family Video Call Hub', 'Individual Climate Control']
  },
  {
    id: 'fac-2',
    name: 'Sunshine Early Learning & Childcare Hub',
    category: "Children's Activity Areas",
    description: 'Bright, safe, soft-padded play spaces equipped with Montessori learning materials, sensory play corners, outdoor play park access, and quiet nap zones.',
    image: 'https://lh3.googleusercontent.com/d/1g1uL5JpRXuHV9hmLRdjmTuCVSk2xdhPX',
    features: ['24/7 Standard Monitored Security', 'Montessori Educational Toys', 'Soft Impact Flooring', 'CCTV Safeguarded Playrooms', 'Quiet Reading & Rest Nook', 'Creative Arts & Crafts Bay']
  },
  {
    id: 'fac-3',
    name: 'Grand Dining Hall & Culinary Suite',
    category: 'Dining Areas',
    description: 'Spacious dining room offering chef-prepared, dietitian-approved meals tailored to individual dietary needs, texture modifications, and cultural preferences.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    features: ['Fresh Farm-to-Table Meals', 'Dietitian Tailored Menus', 'Hydration Stations', 'Private Family Dining Room', 'Specialized Assistance Utensils']
  },
  {
    id: 'fac-4',
    name: '24/7 On-Site Medical & Care Station',
    category: 'Medical Rooms',
    description: 'Fully equipped clinical room for medication administration, routine health checks, wound management, and emergency response coordination.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    features: ['Automated Medication Dispensing', 'Oxygen & Vital Monitors', 'Private Doctor Consultation Room', 'Tele-health Video Suite', 'First Aid Response Hub']
  },
  {
    id: 'fac-5',
    name: 'Multisensory & Memory Recreation Lounge',
    category: 'Recreation Areas',
    description: 'Therapeutic lounge featuring Snoezelen multi-sensory light tech, acoustic piano, board games, library, and interactive memory reflection stations.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    features: ['Snoezelen Light Therapy', 'Acoustic Piano & Audio Hub', 'Classic Board Games & Books', 'Weekly Cinema Screenings', 'Memory Photo Wall']
  },
  {
    id: 'fac-6',
    name: 'Sensory Botanical Courtyard & Raised Beds',
    category: 'Garden Spaces',
    description: 'Wheelchair-accessible serene outdoor gardens featuring fragrant lavender pathways, raised vegetable beds, shaded seating gazebos, and bird bath sanctuaries.',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
    features: ['Wheelchair Smooth Paths', 'Raised Gardening Beds', 'Shaded Gazebos & Benches', 'Sensory Herbal Flora', 'Secure Enclosed Perimeter']
  },
  {
    id: 'fac-7',
    name: 'Physical Rehabilitation & Wellness Studio',
    category: 'Therapy Rooms',
    description: 'Dedicated space for mobility exercises, gait retraining, gentle yoga, massage therapy, and hydro-assisted relaxation equipment.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    features: ['Parallel Mobility Bars', 'Low-Impact Exercise Bikes', 'Hydrotherapy Foot Baths', 'Ergonomic Stretch Mats', 'Certified Physio Support']
  },
  {
    id: 'fac-9',
    name: '24/7 Standard Monitored Security',
    category: 'Security & Safety',
    description: 'Comprehensive 24/7 standard monitored security with round-the-clock CCTV surveillance, gated access control, emergency alert response, and trained security personnel for complete peace of mind.',
    image: 'https://cdn.pixabay.com/photo/2016/01/22/16/42/cctv-1144371_1280.jpg',
    features: ['24/7 Standard Monitored Security', 'CCTV Perimeter & Corridor Coverage', 'Gated Access Control & Entry Logs', 'Emergency Rapid Response Protocol', '24/7 Uniformed Security Staff']
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Morning Garden Music & Singalong',
    category: 'Elderly Care Activities',
    imageUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    description: 'Residents enjoying live acoustic guitar and singing classic favorite songs in our sunny courtyard.',
    date: 'July 28, 2026'
  },
  {
    id: 'gal-2',
    title: 'Montessori Storytime & Clay Sculpting',
    category: "Children's Activities",
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    description: 'Our early learners exploring hands-on clay art and interactive storytelling with Miss Emily.',
    date: 'July 25, 2026'
  },
  {
    id: 'gal-3',
    title: 'Staff Dementia Safeguarding Workshop',
    category: 'Training Sessions',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    description: 'Caregivers participating in specialized communication and memory-support practical training.',
    date: 'July 18, 2026'
  },
  {
    id: 'gal-4',
    title: 'Annual Family Summer Tea & Barbecue',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    description: 'Bringing residents, children, staff, and family relatives together for our joyous annual garden party.',
    date: 'July 10, 2026'
  },
  {
    id: 'gal-5',
    title: 'Sunlit Willow Wing Suite Interior',
    category: 'Facility Photos',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    description: 'A glimpse inside one of our newly refurbished private residential suites.',
    date: 'June 30, 2026'
  },
  {
    id: 'gal-6',
    title: 'Grandparents & Grandchildren Reunion Afternoon',
    category: 'Family Visitations',
    imageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
    description: 'Heartwarming family visitation moment in the hospitality parlor with afternoon tea.',
    date: 'June 22, 2026'
  }
];

export const INITIAL_JOB_VACANCIES: JobVacancy[] = [
  {
    id: 'job-1',
    title: 'Senior Care Assistant',
    type: 'Full-time',
    department: 'Residential Elderly Care',
    location: "Samanthasappy Home, Main Campus",
    description: 'We are seeking an empathetic, qualified Senior Care Assistant to lead daily care routines, administer medication safely, and foster a warm home environment.',
    requirements: ['NVQ Level 3 in Health & Social Care or equivalent', 'Minimum 2 years experience in elderly care', 'Valid First Aid and Safeguarding certification', 'Excellent compassionate communication skills']
  },
  {
    id: 'job-2',
    title: 'Registered Nurse (RN)',
    type: 'Full-time',
    department: 'Medical Services',
    location: "Samanthasappy Home, Main Campus",
    description: 'Join our dedicated nursing team providing clinical leadership, health monitoring, and personalized care planning for our elderly residents.',
    requirements: ['Current Active Nursing License (NMC / State Board)', 'Strong clinical assessment & wound care skills', 'Passion for geriatric and rehabilitative care', 'Ability to work shift rotations']
  },
  {
    id: 'job-3',
    title: 'Early Years Child Care Assistant',
    type: 'Full-time',
    department: 'Child Care Services',
    location: "Samanthasappy Home, Sunshine Suite",
    description: 'Supervise and nurture young children in our bright daycare center, creating engaging educational activities and ensuring safety.',
    requirements: ['Early Years Educator qualification (Level 2/3)', 'Pediatric First Aid certified', 'DBS / Enhanced Background Clearance', 'Enthusiastic and creative approach to child development']
  },
  {
    id: 'job-4',
    title: 'Domiciliary Care Worker',
    type: 'Part-time',
    department: 'Community Care Services',
    location: 'Local Community Visits',
    description: 'Provide essential daily living support, companionship, and medication reminders to clients in their own private homes.',
    requirements: ['Care Certificate or willingness to complete training', 'Valid driving license and reliable vehicle', 'Compassionate nature and dependability']
  }
];

export const INITIAL_TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'train-1',
    title: 'Professional Caregiver Certification (NVQ Level 2/3 Prep)',
    duration: '6 Weeks (Full-time / Hybrid)',
    certification: 'CPD Certified Diploma in Professional Caregiving',
    description: 'Comprehensive foundational training covering personal care, infection control, dignified communication, and patient positioning.',
    modules: ['Introduction to Health & Social Care', 'Personal Care & Hygiene Standard', 'Infection Prevention & Control', 'Emergency First Aid & CPR', 'Dignity & Privacy in Care']
  },
  {
    id: 'train-2',
    title: 'Specialized Dementia Care & Memory Support Mastery',
    duration: '3 Weeks (Specialist Module)',
    certification: 'Certified Dementia Support Specialist',
    description: 'Advanced clinical course focused on understanding dementia types, managing behavioral changes, sensory therapy, and family guidance.',
    modules: ['Neurobiology of Memory Loss', 'Validation & De-escalation Techniques', 'Reminiscence & Sensory Therapy', 'Nutrition & Hydration Support', 'Family Communication Strategies']
  },
  {
    id: 'train-3',
    title: 'Child Protection, Safeguarding & Early Childhood Development',
    duration: '4 Weeks (Practical Workshop)',
    certification: 'Child Safeguarding & Development Level 3',
    description: 'Essential training for childcare professionals emphasizing child safety laws, mandatory reporting, age-appropriate learning, and pediatric response.',
    modules: ['Child Development Milestones (0-8 yrs)', 'Safeguarding & Protection Protocols', 'Pediatric First Aid & Emergency Care', 'Montessori Play Integration', 'Parent Communication']
  }
];

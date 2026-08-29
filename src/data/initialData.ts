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
  TrainingProgram,
  CommunityEvent
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Folasade Sanyaolu',
    email: 'samanthasappy@gmail.com',
    password: '@samantha',
    phone: '+2347069332193',
    role: 'Admin',
    position: 'Managing Director & Head of Care (LLB, QaAA)',
    avatar: 'https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X=s1600',
  },
  {
    id: 'usr-admin-2',
    name: 'Folasade Sanyaolu',
    email: 'itopaprop@gmail.com',
    password: '@samantha',
    phone: '+2347069332193',
    role: 'Admin',
    position: 'Managing Director & Administrator',
    avatar: 'https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X=s1600',
  }
];

export const INITIAL_STAFF: StaffMember[] = [];

export const INITIAL_RESIDENTS: Resident[] = [];

export const INITIAL_SHIFTS: Shift[] = [];

export const INITIAL_MESSAGES: Message[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

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
    title: 'Samanthasappy Home Facility Overview & Courtyard',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/188SUz7vn8g4onfYwfXcvCiRPm72eIkIe',
    description: 'A welcoming view of our modern home environment, landscaped grounds, and serene outdoor courtyards.',
    date: 'August 2026'
  },
  {
    id: 'gal-2',
    title: 'Senior Wellness & Morning Mobility Practice',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1UQzN-VvtPPsTRRB1EXztN--XDDWFOI41',
    description: 'Residents participating in gentle morning physical therapy and mobility exercises with trained staff.',
    date: 'August 2026'
  },
  {
    id: 'gal-3',
    title: 'Early Childhood Montessori Learning Corner',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1IUyDVnE3DYD_t_9MwqHwZ3sCduy2QR5O',
    description: 'Interactive early learning session featuring tactile educational games and creative exploration.',
    date: 'August 2026'
  },
  {
    id: 'gal-4',
    title: 'Caregiver Mentorship & Clinical Skills Workshop',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1VsO4bsLJYDmqrcq4fF-bSCrQ8WC9bO8k',
    description: 'Hands-on training session for nurse trainees and caregivers in medical protocols and resident care.',
    date: 'August 2026'
  },
  {
    id: 'gal-5',
    title: 'Intergenerational Music & Storytelling Afternoon',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1gkDmKJX_xRuLrHFkgDgn3OKa-rrzOpP6',
    description: 'A lively cultural celebration bringing together residents, young learners, and care staff.',
    date: 'August 2026'
  },
  {
    id: 'gal-6',
    title: 'Family Visitation Lounge & Reception',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1oMKybb-tiOmw2ZD9e02sigUIglF8VXE-',
    description: 'Warm, private hospitality parlor for families visiting their loved ones at Samanthasappy Home.',
    date: 'August 2026'
  },
  {
    id: 'gal-7',
    title: 'Senior Recreational Games & Cognitive Engagement',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1i3GJTwkmGi7WdLfTx_XjJ42hliC3NFFi',
    description: 'Fun memory exercises, board games, and group social interaction tailored for senior cognitive health.',
    date: 'July 2026'
  },
  {
    id: 'gal-8',
    title: 'Children Outdoor Play Park & Sunshine Activities',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1cwXoj6JmP6lKVqZxsUgtqBpMo8mm5pud',
    description: 'Outdoor physical development and group games in our safe, soft-impact playground.',
    date: 'July 2026'
  },
  {
    id: 'gal-9',
    title: 'Emergency Nursing & First Aid Response Demo',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1dI1sSsI692kFuoAhyDg4WgPfvOjyYUK7',
    description: 'Regular staff drills covering emergency triage, vital sign assessment, and safeguarding protocols.',
    date: 'July 2026'
  },
  {
    id: 'gal-10',
    title: 'Resident Dining Hall & Chef-Prepared Nutrition',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1w6G7q5mbHmjWOhDMbYhVJEg6zda_Jw7X',
    description: 'Nutritious, dietary-balanced meal service served in our spacious, sunlit dining hall.',
    date: 'July 2026'
  },
  {
    id: 'gal-11',
    title: 'Grandparents Day Celebration & Cultural Dance',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1rPyM8MqDWmtjnTksAUpa_AgnAr3NDuvo',
    description: 'Joyful family celebration showcasing resident talents, traditional music, and refreshments.',
    date: 'July 2026'
  },
  {
    id: 'gal-12',
    title: 'Specialist Memory Care & Dementia Support Group',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1QdWxgriykS5mFoAyeMO5t5v8fuDjLO6w',
    description: 'Compassionate multi-sensory therapy and gentle guided memory exercises with certified nurses.',
    date: 'July 2026'
  },
  {
    id: 'gal-13',
    title: 'Child Art Exploration & Finger Painting Workshop',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1gyNHSz3Ytxnhz4nbusrvUruduKaZuB5H',
    description: 'Nurturing creativity and fine motor skills through guided arts, crafts, and color mixing.',
    date: 'July 2026'
  },
  {
    id: 'gal-14',
    title: 'Private Resident Suite Interior & Living Area',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Zm9tHwe0Pnlg6HYrvchnPJieYgwJ_Shw',
    description: 'Comfortable, fully furnished private room with climate control and 24/7 emergency call response.',
    date: 'July 2026'
  },
  {
    id: 'gal-15',
    title: 'Afternoon Tea & Family Conversation Session',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1WeBZuvPv4hvDTC8-lrcwbVapDx8-C3WU',
    description: 'Loved ones gathering over tea and snacks in our dedicated indoor visitor parlors.',
    date: 'July 2026'
  },
  {
    id: 'gal-16',
    title: 'Staff Ethics, Compassion & Hygiene Orientation',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/10jp2vAsPiE7WzK9GVSAz6vrVcaRyyykq',
    description: 'Comprehensive staff development focused on dignity in care, safety hygiene, and patient rights.',
    date: 'July 2026'
  },
  {
    id: 'gal-17',
    title: 'Outdoor Garden Stroll & Horticulture Therapy',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1GktuTKVoc6LbLqdR-YD2zeq3H7hgGOgM',
    description: 'Relaxing walks through lush green pathways, promoting physical activity and fresh air.',
    date: 'June 2026'
  },
  {
    id: 'gal-18',
    title: 'Children Early Literacy & Phonetics Reading Hour',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1JsntuyG5e-ZhDPfgN9cNe8dCuR8Yd1jZ',
    description: 'Interactive group reading sessions designed to expand vocabulary and build confidence.',
    date: 'June 2026'
  },
  {
    id: 'gal-19',
    title: 'Annual Staff Appreciation & Excellence Awards',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1athE0jBl59aoj8cKYScUd-9zppMOP0_P',
    description: 'Recognizing outstanding dedication, compassion, and healthcare excellence among our team.',
    date: 'June 2026'
  },
  {
    id: 'gal-20',
    title: 'Hydrotherapy & Physiotherapy Exercise Room',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/12mV_7thuxWPoXXJrzpfrCxOWQaHRpUIZ',
    description: 'State-of-the-art rehabilitation equipment assisting seniors in regaining strength and balance.',
    date: 'June 2026'
  },
  {
    id: 'gal-21',
    title: 'Weekend Family Picnic & Outdoor Games',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1hK2RhjOfvhsficKOpIoXOfu0ZOCiwXea',
    description: 'Families enjoying quality bonding time in our spacious, gated garden pavilion.',
    date: 'June 2026'
  },
  {
    id: 'gal-22',
    title: 'Senior Group Crafts & Knitting Circle',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1vwQtDeic9odcUHtuPwE18WsmAjIKnl31',
    description: 'Creative handcrafts, loom weaving, and social conversation among senior residents.',
    date: 'June 2026'
  },
  {
    id: 'gal-23',
    title: 'Music Movement & Rhythmic Exercise for Kids',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1TpRvbgHsXooDjCCGMlQ4AL33nXHpVD1k',
    description: 'Active musical games encouraging motor skills coordination and teamwork.',
    date: 'June 2026'
  },
  {
    id: 'gal-24',
    title: 'Caregiver Medication Safety & Administration Class',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1geuoNYnUzfXcWxt0Qzus1UhdgoZFNgRG',
    description: 'Instruction on precise dosage management, chart documentation, and safety checks.',
    date: 'June 2026'
  },
  {
    id: 'gal-25',
    title: 'Holiday Festival & Community Social Gathering',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1OcpwXbVFEZVI__nREFJhRSMpQlJ-Y7xq',
    description: 'Seasonal holiday feast with live musical performances and festive decor across campus.',
    date: 'May 2026'
  },
  {
    id: 'gal-26',
    title: 'Quiet Reflection Lounge & Reading Nook',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1WOPu-fz5Oh3MhDk1Pv9S7NlGbs-BIvjZ',
    description: 'Peaceful library corner stocked with books, magazines, and comfortable armchairs.',
    date: 'May 2026'
  },
  {
    id: 'gal-27',
    title: 'Multi-Generational Story Hour with Seniors & Kids',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Fp--30DGbbs1KuUOPKxvUbBR8ciB_8BE',
    description: 'Heartwarming moments as resident elders read favorite children stories to early learners.',
    date: 'May 2026'
  },
  {
    id: 'gal-28',
    title: 'Sensory Soft Play Zone for Toddlers',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1r-C3w-IK2n6Db6ucUj0hnkNLRCPGTkcO',
    description: 'Safe, padded environment equipped with tactile toys and developmental play structures.',
    date: 'May 2026'
  },
  {
    id: 'gal-29',
    title: 'Infection Prevention & Clinical Sanitation Seminar',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1zvsGjb9c6ynucciVfnTJ_Oyf9i4t8kI4',
    description: 'Professional development seminar on maintaining hospital-grade hygiene standards.',
    date: 'May 2026'
  },
  {
    id: 'gal-30',
    title: 'Birthday Celebration & Cake Cutting Party',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1egGa6HcNQRFS2gCqd_vEtODSVGVsqX0n',
    description: 'Celebrating resident milestones surrounded by family members, friends, and care staff.',
    date: 'May 2026'
  },
  {
    id: 'gal-31',
    title: 'Landscape Architecture & Courtyard Security Entry',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/14nqoXxWdV5yGzxdAMJJGawM6DlEhis5B',
    description: 'Gated entrance with 24/7 monitored access control ensuring resident safety.',
    date: 'May 2026'
  },
  {
    id: 'gal-32',
    title: 'Senior Yoga & Guided Breathing Meditation',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Kb46PG0O3WG4MAM_FbmEZN_Rq7CeHx_E',
    description: 'Gentle chair yoga and breathing exercises tailored for joint health and stress relief.',
    date: 'April 2026'
  },
  {
    id: 'gal-33',
    title: 'Montessori Building Blocks & STEM Discovery',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1F0vjwxV8fl_aVlbsxbyh7_etL3skAMHz',
    description: 'Children problem-solving with geometric blocks and interactive learning kits.',
    date: 'April 2026'
  },
  {
    id: 'gal-34',
    title: 'First Aid Triage & Rapid Medical Response Training',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1oq1khP8Wp8Pic84V0niMX73oejF5Hd54',
    description: 'Interactive simulations training staff on quick action during medical emergencies.',
    date: 'April 2026'
  },
  {
    id: 'gal-35',
    title: 'Spring Garden Concert & Acoustic Guitar Live Performance',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1BFs2pnTE1aMsQiqwkfONuYixuSTbP42I',
    description: 'Outdoor musical entertainment bringing joy and classic melodies to our residents.',
    date: 'April 2026'
  },
  {
    id: 'gal-36',
    title: 'Nurse Station & Central Health Monitoring Desk',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1ekdtjQQrUNSOgum5yzn139oWzyr7iZI2',
    description: 'Modern nursing workstation equipped with digital health log systems for patient care.',
    date: 'April 2026'
  },
  {
    id: 'gal-37',
    title: 'Family Reunion Luncheon in Private Dining Room',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1wWFBI9C6lWQtgB271q8os33-c9xnP_lE',
    description: 'Reservable private dining space for special family gatherings and anniversaries.',
    date: 'April 2026'
  },
  {
    id: 'gal-38',
    title: 'Elderly Gardening & Flower Potting Activity',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1-94tBlqIJ1w6S4bKsNbb08bAJlD1_oaH',
    description: 'Therapeutic gardening sessions where residents plant flowers and care for herbs.',
    date: 'March 2026'
  },
  {
    id: 'gal-39',
    title: 'Child Clay Modeling & Sculpture Corner',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1BV8TrtbP1XrM8FXSVrkIv4cu0Yno9l-E',
    description: 'Expressive sculpture play developing hand dexterity and imaginative thinking.',
    date: 'March 2026'
  },
  {
    id: 'gal-40',
    title: 'Caregiver Communication & Empathy Leadership',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1owyN23346eZv4FXog92pL1OXgqT0mMub',
    description: 'Interactive group discussions on empathetic patient interaction and family care liaison.',
    date: 'March 2026'
  },
  {
    id: 'gal-41',
    title: 'Community Wellness Fair & Free Health Checks',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1hgoHqwGoYMq1ovpDZkEbUGMD-aeZmje7',
    description: 'Health awareness outreach providing blood pressure checks, consultations, and advice.',
    date: 'March 2026'
  },
  {
    id: 'gal-42',
    title: 'Outdoor Relaxation Veranda & Sun Lounge',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/10Zi8YtHhQ8P7_T4vZ4fhKLgXW0PvSh1c',
    description: 'Shaded outdoor sitting area providing fresh air and scenic views of the gardens.',
    date: 'March 2026'
  },
  {
    id: 'gal-43',
    title: 'Generational Legacy Story Recording & Interviews',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1V4dvHGyT03J5-j8H06d9jB0oibYFqBTE',
    description: 'Families recording life stories and audio memories with resident elders for posterity.',
    date: 'March 2026'
  },
  {
    id: 'gal-44',
    title: 'Senior Board Game Tournament & Social Afternoon',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1bZ56OnQxRkfofJbn8cdqMLci-kAkRuFq',
    description: 'Friendly chess, scrabble, and card matches in our active social lounge.',
    date: 'February 2026'
  },
  {
    id: 'gal-45',
    title: 'Children Outdoor Sandbox & Nature Exploration',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1dIeHVBPJ_Z4qUvErtJW6EDAV-ZyV8y-X',
    description: 'Tactile nature play and outdoor sandbox building under attentive teacher supervision.',
    date: 'February 2026'
  },
  {
    id: 'gal-46',
    title: 'Senior Care Triage & Geriatric Specialization',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1rHS5-a3oQQbL_WkTp6F2HYVbTI5glKmU',
    description: 'Advanced training modules on specialized geriatric nursing and palliative care best practices.',
    date: 'February 2026'
  },
  {
    id: 'gal-47',
    title: 'Cultural Heritage Day & Traditional Dress Celebration',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1KPJRjN0DnFhariN-GuoklTm1wfdKrWxt',
    description: 'Honoring diverse cultural traditions through attire, traditional dishes, and story sharing.',
    date: 'February 2026'
  },
  {
    id: 'gal-48',
    title: 'Hydro-Massage Bath & Assisted Personal Care Suite',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/11p53xpUyve6WOSqE0dh7ZdP83DA3eqDT',
    description: 'Private, accessible personal hygiene suite equipped with therapeutic hydro-massage tubs.',
    date: 'February 2026'
  },
  {
    id: 'gal-49',
    title: 'Weekend Family Coffee & Pastry Hour',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1SF6vIa-X76O9Ql4cWurHYB4hkXSSNGBs',
    description: 'Complimentary barista drinks and fresh baked treats enjoyed during weekend visitations.',
    date: 'February 2026'
  },
  {
    id: 'gal-50',
    title: 'Aromatherapy & Sensory Relaxation Session',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1Sa-FJmIK-vSS-AavY9veDG1j2nHDfZuP',
    description: 'Calming sensory rooms featuring soft lighting, essential oils, and soothing background soundscapes.',
    date: 'January 2026'
  },
  {
    id: 'gal-51',
    title: 'Early Childhood Puppet Theater & Story Presentation',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1GHBN-_0xBEU-4ogNON9BoiYYAMN0JDaY',
    description: 'Engaging puppet shows fostering imagination, emotional expression, and social skills.',
    date: 'January 2026'
  },
  {
    id: 'gal-52',
    title: 'Caregiver Mental Health & Well-being Peer Workshop',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1rz70fT6ODlrFuZg1o_uEHGRToMe0-x9X',
    description: 'Supportive group sessions empowering our care staff with stress management and wellness tools.',
    date: 'January 2026'
  },
  {
    id: 'gal-53',
    title: 'New Year Gratitude Gathering & Staff Choir',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1A2xXi-V0vd7I8OF3i8kNB0bNPxOFrz9Z',
    description: 'Welcoming the new year with inspirational choir singing and community meal sharing.',
    date: 'January 2026'
  },
  {
    id: 'gal-54',
    title: 'Main Facility Courtyard Architecture & Garden Paths',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1URoOPnpXUQJP-AL5F0sMO_JKD8bJIzjB',
    description: 'Wheelchair-accessible paved walking loops surrounding beautiful flower beds and shade trees.',
    date: 'January 2026'
  },
  {
    id: 'gal-55',
    title: 'Grandparent & Grandchild Portrait Photography Day',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1THYgelC50fsdBryHTaOYX5XTo5yvIsbM',
    description: 'Professional memory portraits gifted to families during special visitation days.',
    date: 'January 2026'
  },
  {
    id: 'gal-56',
    title: 'Senior Choir Practice & Sing-Along Group',
    category: 'Elderly Care Activities',
    imageUrl: 'https://lh3.googleusercontent.com/d/1zmf99tplaxw1HSMSjAwGKpC8osO6DoE1',
    description: 'Residents lifting their voices together in weekly vocal rehearsals and classic songs.',
    date: 'December 2025'
  },
  {
    id: 'gal-57',
    title: 'Children Holiday Crafting & Ornament Decorating',
    category: "Children's Activities",
    imageUrl: 'https://lh3.googleusercontent.com/d/1ev-LsTh8ugNqZ4EeX9USoRWvD0_-YLFj',
    description: 'Festive craft making where kids create handmade cards and decorations for resident suites.',
    date: 'December 2025'
  },
  {
    id: 'gal-58',
    title: 'Certified Caregiver Graduation Ceremony',
    category: 'Training Sessions',
    imageUrl: 'https://lh3.googleusercontent.com/d/1v1Fme3l1bn97Jsb3S5Y07EC3d3mYwNsM',
    description: 'Celebrating trainees completing their formal health & social care certification program.',
    date: 'December 2025'
  },
  {
    id: 'gal-59',
    title: 'End of Year Carol Night & Candlelight Vigil',
    category: 'Events',
    imageUrl: 'https://lh3.googleusercontent.com/d/1hUAhj5rvR8qbU-7eOT-0QQnmBdHBWlyR',
    description: 'A magical evening of candlelight carols, warmth, and fellowship across our community.',
    date: 'December 2025'
  },
  {
    id: 'gal-60',
    title: 'Comfort Suite Living Room & Family Seating',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1NlEsd_NNlIwyjV99iy_evmIWxGiC_jVM',
    description: 'Elegantly appointed residential suites designed for safety, warmth, and independence.',
    date: 'December 2025'
  },
  {
    id: 'gal-61',
    title: 'Multi-Generational Holiday Feast & Gift Exchange',
    category: 'Family Visitations',
    imageUrl: 'https://lh3.googleusercontent.com/d/1kky0d5Xb-CMTZkBf040SjKVng-Q34W6S',
    description: 'Joyous holiday dinner bringing families together with delicious festive meals.',
    date: 'December 2025'
  },
  {
    id: 'gal-62',
    title: 'Sunlit Solarium & Afternoon Conversation Lounge',
    category: 'Facility Photos',
    imageUrl: 'https://lh3.googleusercontent.com/d/1LsO6iwSRQt128hY8x9mrW_n4hMVALWGm',
    description: 'Bright glass-enclosed solarium ideal for social visits, afternoon tea, and peaceful rest.',
    date: 'December 2025'
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

export const INITIAL_COMMUNITY_EVENTS: CommunityEvent[] = [];

import { OrganogramNode, WorkforceNode } from '../types/organogram';

export const seniorBoardNode: OrganogramNode = {
  id: 'board-01',
  title: 'Senior Management Board',
  department: 'EXECUTIVE GOVERNANCE',
  employeeName: '',
  description: 'Oversees strategic growth, regulatory compliance, quality assurance, and ethical care governance across all facilities.',
  colorType: 'board',
  iconName: 'Building2',
  level: 0,
  contactEmail: 'board@samanthasappyhome.com',
  phone: '+234 706 933 2193',
  children: [
    {
      id: 'ceo-01',
      title: 'Chief Executive Officer (CEO)',
      department: 'EXECUTIVE LEADERSHIP',
      employeeName: 'Folasade Sanyaolu, LLB, QAA',
      description: 'Provides overall strategic vision, executive operational command, legal compliance, and international standard benchmarks.',
      colorType: 'purple-gradient',
      iconName: 'Briefcase',
      level: 1,
      contactEmail: 'ceo@samanthasappyhome.com',
      phone: '+234 706 933 2193',
      children: [
        {
          id: 'gcm-01',
          title: 'General Care Manager',
          department: 'OPERATIONAL COMMAND',
          employeeName: '',
          description: 'Directs daily clinical operations, staffing allocations, resident care quality, and inter-departmental synergy.',
          colorType: 'royal-blue',
          iconName: 'Clipboard',
          level: 2,
          contactEmail: 'gcm@samanthasappyhome.com',
          phone: '+234 708 969 9883',
          children: [
            // Level 2 Side-by-Side: Finance & Internal Auditor
            {
              id: 'fin-01',
              title: 'Finance Accountant',
              department: 'FINANCE & PAYROLL',
              employeeName: '',
              description: 'Manages financial auditing, resident billing, payroll processing, and budget resource optimization.',
              colorType: 'emerald',
              iconName: 'Wallet',
              level: 3,
              contactEmail: 'finance@samanthasappyhome.com',
              phone: '+234 814 047 7119'
            },
            {
              id: 'aud-01',
              title: 'Internal Auditor',
              department: 'RISK & COMPLIANCE',
              employeeName: '',
              description: 'Conducts independent risk assessments, inventory controls, and financial integrity checks.',
              colorType: 'teal',
              iconName: 'ShieldCheck',
              level: 3,
              contactEmail: 'auditor@samanthasappyhome.com',
              phone: '+234 706 933 2193'
            },
            // Level 3 Side-by-Side: Assistant Manager & Head Supervisor
            {
              id: 'am-01',
              title: 'Assistant Manager',
              department: 'ADMINISTRATION',
              employeeName: '',
              description: 'Assists in medical policy execution, family relations, staff scheduling, and facility logistics.',
              colorType: 'indigo',
              iconName: 'ClipboardList',
              level: 3,
              contactEmail: 'assistant.mgr@samanthasappyhome.com',
              phone: '+234 708 969 9883'
            },
            {
              id: 'hs-01',
              title: 'Head Supervisor',
              department: 'CARE SUPERVISION',
              employeeName: '',
              description: 'Leads shift supervisors, oversees patient care routines, and enforces resident safeguarding protocols.',
              colorType: 'purple',
              iconName: 'UserCog',
              level: 3,
              contactEmail: 'head.supervisor@samanthasappyhome.com',
              phone: '+234 814 047 7119'
            },
            // Supervisor Level (4 Cards)
            {
              id: 'sup-cook',
              title: 'Supervisor Cook',
              department: 'CULINARY & NUTRITION',
              employeeName: '',
              description: 'Oversees kitchen hygiene, therapeutic resident dietary plans, and gourmet meal prep.',
              colorType: 'orange',
              iconName: 'ChefHat',
              level: 4,
              contactEmail: 'kitchen@samanthasappyhome.com'
            },
            {
              id: 'sup-caregiver',
              title: 'Supervisor Caregiver',
              department: 'ELDERLY & CHILD CARE',
              employeeName: '',
              description: 'Supervises personal care routines, dementia assistance, and child daycare activities.',
              colorType: 'rose',
              iconName: 'HeartHandshake',
              level: 4,
              contactEmail: 'care.sup@samanthasappyhome.com'
            },
            {
              id: 'sup-cleaner',
              title: 'Supervisor Cleaner',
              department: 'SANITATION & HYGIENE',
              employeeName: '',
              description: 'Ensures hospital-grade sterilization, suite cleanliness, and laundry environmental hygiene.',
              colorType: 'cyan',
              iconName: 'Sparkles',
              level: 4,
              contactEmail: 'hygiene@samanthasappyhome.com'
            },
            {
              id: 'sup-security',
              title: 'Supervisor Security',
              department: 'SAFETY & PROTECTIVE SERVICES',
              employeeName: '',
              description: 'Coordinates 24/7 access control, CCTV monitoring, and visitor security protocols.',
              colorType: 'blue',
              iconName: 'Shield',
              level: 4,
              contactEmail: 'security@samanthasappyhome.com'
            }
          ]
        }
      ]
    }
  ]
};

export const fieldWorkforceData: WorkforceNode[] = [
  {
    id: 'wf-drivers',
    title: 'Drivers',
    department: 'Mobility & Logistics Fleet',
    description: 'Licensed emergency ambulance drivers & resident transportation operators.',
    iconName: 'Car',
    count: 8,
    colorType: 'amber'
  },
  {
    id: 'wf-caregivers',
    title: 'Caregivers',
    department: 'Direct Personal & Memory Care',
    description: 'Certified 24/7 bedside nursing aides, dementia specialists & childcare assistants.',
    iconName: 'HeartHandshake',
    count: 32,
    colorType: 'rose'
  },
  {
    id: 'wf-maids',
    title: 'Maids',
    department: 'Suite Maintenance & Laundry',
    description: 'Dedicated room stewards ensuring spotless linens, wardrobe care & suite tidiness.',
    iconName: 'Sparkles',
    count: 14,
    colorType: 'cyan'
  },
  {
    id: 'wf-security',
    title: 'Security Officers',
    department: 'Perimeter Defense & Access Control',
    description: 'Uniformed security guards maintaining 24/7 physical safety & entry logging.',
    iconName: 'Shield',
    count: 12,
    colorType: 'blue'
  },
  {
    id: 'wf-cooks',
    title: 'Cooks',
    department: 'Culinary & Specialized Diets',
    description: 'Nutritional chefs preparing balanced meals tailored to medical dietary needs.',
    iconName: 'ChefHat',
    count: 10,
    colorType: 'amber'
  },
  {
    id: 'wf-housekeepers',
    title: 'Housekeepers',
    department: 'Facility Environmental Sanitation',
    description: 'Facility hygiene technicians managing deep cleaning, waste disposal & sterilization.',
    iconName: 'Home',
    count: 16,
    colorType: 'indigo'
  }
];

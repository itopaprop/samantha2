export interface OrganogramNode {
  id: string;
  title: string;
  department: string;
  employeeName: string;
  description: string;
  colorType: 'purple-gradient' | 'royal-blue' | 'emerald' | 'teal' | 'indigo' | 'purple' | 'orange' | 'rose' | 'cyan' | 'blue' | 'board';
  iconName: string;
  level: number;
  contactEmail?: string;
  phone?: string;
  children?: OrganogramNode[];
}

export interface WorkforceNode {
  id: string;
  title: string;
  department: string;
  description: string;
  iconName: string;
  count: number;
  colorType: 'blue' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'indigo';
}

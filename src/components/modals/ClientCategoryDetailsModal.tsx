import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Heart, 
  ShieldAlert, 
  Brain, 
  Home, 
  Activity, 
  Phone, 
  Mail, 
  FileText, 
  Edit, 
  Eye, 
  Search, 
  Calendar,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react';
import { Resident, CareCategory } from '../../types';

export type CategoryDetailType = 'dementia' | 'domiciliary' | 'daily' | 'vulnerable';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categoryType: CategoryDetailType | null;
  residents: Resident[];
  onSelectResident: (resident: Resident) => void;
  onEditResident: (resident: Resident) => void;
  onAddNewResident: (presetCategory: CareCategory) => void;
  onFilterTable?: (categoryFilter: string) => void;
}

interface CategoryConfig {
  key: CategoryDetailType;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  presetCategory: CareCategory;
  filterFn: (r: Resident) => boolean;
  theme: {
    color: string;
    bgBadge: string;
    textBadge: string;
    borderBadge: string;
    iconBg: string;
    iconColor: string;
    cardBorderHover: string;
    accentBtn: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
}

const CATEGORY_CONFIGS: Record<CategoryDetailType, CategoryConfig> = {
  dementia: {
    key: 'dementia',
    title: 'Dementia Support Clients',
    badge: 'Memory & Cognitive Care',
    tagline: 'Specialist Memory Care & Cognitive Support',
    description: 'Specialized 24/7 memory care program tailored for clients living with Alzheimer’s, vascular dementia, and cognitive changes. Care plans focus on sensory engagement, cognitive maintenance, safe routines, reminiscence therapy, and compassionate behavioral support by trained dementia champions.',
    presetCategory: 'Dementia Support',
    filterFn: (r) => r.careCategory === 'Dementia Support',
    theme: {
      color: 'purple',
      bgBadge: 'bg-purple-100',
      textBadge: 'text-purple-800',
      borderBadge: 'border-purple-200',
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      cardBorderHover: 'hover:border-purple-300',
      accentBtn: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    icon: Brain,
    highlights: [
      'Specialist Cognitive & Memory Stimulation',
      'Sensory Calming & Reminiscence Therapy',
      'Predictable Routine & Safety Monitoring',
      'Assigned Dementia Key Workers & Family Support'
    ]
  },
  domiciliary: {
    key: 'domiciliary',
    title: 'Domiciliary Care Clients',
    badge: 'Community & Home Visits',
    tagline: 'Community Home Visits & Independent Living Support',
    description: 'Visiting care specialists delivering compassionate personal care, medication prompts, meal preparation, housekeeping, and companionship directly to clients in their private homes or supported living flats across the community.',
    presetCategory: 'Domiciliary Care',
    filterFn: (r) => r.careCategory === 'Domiciliary Care' || r.careCategory === 'Home assistance',
    theme: {
      color: 'amber',
      bgBadge: 'bg-amber-100',
      textBadge: 'text-amber-800',
      borderBadge: 'border-amber-200',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      cardBorderHover: 'hover:border-amber-300',
      accentBtn: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    icon: Home,
    highlights: [
      'Scheduled Home Living Visits & Welfare Check-ins',
      'Personal Hygiene, Bathing & Dressing Support',
      'Medication Administration & Prompting',
      'Nutritious Meal Preparation & Light Housekeeping'
    ]
  },
  daily: {
    key: 'daily',
    title: 'Daily Care Clients',
    badge: 'Full Living Assistance',
    tagline: 'Full Living Assistance & Residential Care',
    description: 'Comprehensive day-to-day living assistance for seniors residing in our residential care suites. Features full mobility support, nutritional dining, vital health monitoring, social enrichment, and 24/7 dedicated nursing oversight.',
    presetCategory: 'Daily Living Assistance',
    filterFn: (r) => r.careCategory === 'Daily Living Assistance' || r.careCategory === 'Residential Elderly Care',
    theme: {
      color: 'emerald',
      bgBadge: 'bg-emerald-100',
      textBadge: 'text-emerald-800',
      borderBadge: 'border-emerald-200',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      cardBorderHover: 'hover:border-emerald-300',
      accentBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    },
    icon: Activity,
    highlights: [
      'Full Daily Living & Personal Care Assistance',
      'Nutritional Meal Plans & Dietary Oversight',
      'Mobility, Transfer & Postural Support',
      '24/7 On-Site Nurse Supervision & Social Activities'
    ]
  },
  vulnerable: {
    key: 'vulnerable',
    title: 'Vulnerable Adult Clients',
    badge: 'Safeguarding & Sensory Care',
    tagline: 'Special Sensory Support & Safeguarding Oversight',
    description: 'Specialized safeguarding, trauma-informed care, and sensory integration support for vulnerable adults. Includes custom calming protocols, multi-disciplinary team coordination, tailored communication tools, and proactive welfare monitoring.',
    presetCategory: 'Vulnerable Adult Support',
    filterFn: (r) => r.careCategory === 'Vulnerable Adult Support',
    theme: {
      color: 'rose',
      bgBadge: 'bg-rose-100',
      textBadge: 'text-rose-800',
      borderBadge: 'border-rose-200',
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      cardBorderHover: 'hover:border-rose-300',
      accentBtn: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    icon: ShieldAlert,
    highlights: [
      'High-Attention Safeguarding Protocols',
      'Custom Sensory Calming & Comfort Suites',
      'Multi-Disciplinary Welfare Coordination',
      'Individualized Emotional & Mental Well-being Plans'
    ]
  }
};

export const ClientCategoryDetailsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categoryType,
  residents,
  onSelectResident,
  onEditResident,
  onAddNewResident,
  onFilterTable
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen || !categoryType) return null;

  const config = CATEGORY_CONFIGS[categoryType];
  if (!config) return null;

  const Icon = config.icon;
  const categoryResidents = residents.filter(config.filterFn);

  const filteredResidents = categoryResidents.filter(r => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = String(r.fullName || (r as any).name || '').toLowerCase();
    const room = String(r.roomNumber || '').toLowerCase();
    const contact = String(r.emergencyContact?.name || '').toLowerCase();
    const staff = String(r.assignedStaffName || '').toLowerCase();
    return name.includes(q) || room.includes(q) || contact.includes(q) || staff.includes(q);
  });

  const handleApplyFilter = () => {
    if (onFilterTable) {
      if (categoryType === 'dementia') onFilterTable('Dementia Support');
      else if (categoryType === 'domiciliary') onFilterTable('Domiciliary Care');
      else if (categoryType === 'daily') onFilterTable('Daily Living Assistance');
      else if (categoryType === 'vulnerable') onFilterTable('Vulnerable Adult Support');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-details-title"
      >
        {/* Modal Top Header */}
        <div className="p-6 sm:p-7 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl ${config.theme.iconBg} ${config.theme.iconColor} flex items-center justify-center shadow-xs shrink-0 border ${config.theme.borderBadge}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.theme.bgBadge} ${config.theme.textBadge} ${config.theme.borderBadge}`}>
                    {config.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Live Client Care Registry
                  </span>
                </div>
                <h2 id="category-details-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {config.title}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {config.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  onAddNewResident(config.presetCategory);
                  onClose();
                }}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${config.theme.accentBtn}`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Register Client</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics & Overview Banner */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total In Program</div>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{categoryResidents.length}</div>
              <div className="text-[11px] text-slate-500 font-medium">Registered Clients</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Staff</div>
              <div className="text-2xl font-black text-teal-700 mt-0.5">
                {new Set(categoryResidents.map(r => r.assignedStaffName || r.assignedStaffId).filter(Boolean)).size}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Active Key Workers</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Family Contacts</div>
              <div className="text-2xl font-black text-blue-700 mt-0.5">
                {categoryResidents.filter(r => r.emergencyContact?.email || r.emergencyContact?.phone).length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Verified Relatives</div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitoring Status</div>
              <div className="text-2xl font-black text-amber-700 mt-0.5">
                {categoryResidents.filter(r => r.healthStatus === 'Critical Attention' || r.healthStatus === 'Requires Monitoring').length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">Priority Attention</div>
            </div>
          </div>

          {/* Service Care Description */}
          <div className="mt-4 p-3.5 bg-slate-100/70 rounded-2xl border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Care Program Overview: </span>
                <span>{config.description}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls & Search */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${config.title.toLowerCase()} by name, room, staff...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
              title="Show only this category on the main residents dashboard"
            >
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <span>Filter Main Table</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAddNewResident(config.presetCategory);
                onClose();
              }}
              className={`sm:hidden inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold shadow-xs ${config.theme.accentBtn}`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Clients List Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-4 bg-slate-50/50">
          {categoryResidents.length === 0 ? (
            <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className={`w-16 h-16 rounded-3xl ${config.theme.iconBg} ${config.theme.iconColor} mx-auto flex items-center justify-center border ${config.theme.borderBadge}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  No clients currently assigned to {config.title}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When new residents or home care clients are admitted with the <span className="font-semibold text-slate-700">{config.badge}</span> service plan, they will be listed here with quick access to their care files and emergency contacts.
                </p>
              </div>

              {/* Highlights List */}
              <div className="max-w-md mx-auto text-left bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-xs space-y-2">
                <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Standard Protocol Coverage:</div>
                {config.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    onAddNewResident(config.presetCategory);
                    onClose();
                  }}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer ${config.theme.accentBtn}`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register First {config.presetCategory} Client</span>
                </button>
              </div>
            </div>
          ) : filteredResidents.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No clients found matching "<span className="font-semibold text-slate-700">{search}</span>".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResidents.map((res) => {
                const avatarUrl = res.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80';
                const statusColor = 
                  res.healthStatus === 'Critical Attention' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                  res.healthStatus === 'Requires Monitoring' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  res.healthStatus === 'Stable' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  'bg-blue-100 text-blue-800 border-blue-200';

                return (
                  <div 
                    key={res.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Avatar + Name + Status */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={avatarUrl}
                          alt={res.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-xs shrink-0 ring-2 ring-amber-100"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {res.fullName}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${statusColor}`}>
                              {res.healthStatus || 'Active'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {res.roomNumber ? `Suite / Location: ${res.roomNumber}` : 'Community / Domiciliary Client'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                            {res.dateOfBirth && <span>DOB: {res.dateOfBirth}</span>}
                            {res.gender && <span>• {res.gender}</span>}
                            {res.admissionDate && <span>• Admitted: {res.admissionDate}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Info Pills */}
                      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Key Worker / Staff</div>
                          <div className="font-bold text-slate-800 truncate">
                            {res.assignedStaffName || 'Assigned to General Care Team'}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Primary Relative</div>
                          <div className="font-bold text-slate-800 truncate">
                            {res.emergencyContact?.name ? `${res.emergencyContact.name} (${res.emergencyContact.relationship || 'Next of kin'})` : 'Family relative on file'}
                          </div>
                        </div>
                      </div>

                      {/* Relative Contact Info */}
                      {res.emergencyContact && (res.emergencyContact.phone || res.emergencyContact.email) && (
                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-slate-600 font-medium px-1 flex-wrap">
                          {res.emergencyContact.phone && (
                            <a 
                              href={`tel:${res.emergencyContact.phone}`} 
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-amber-700 transition-colors"
                              title="Call Primary Relative"
                            >
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{res.emergencyContact.phone}</span>
                            </a>
                          )}
                          {res.emergencyContact.email && (
                            <a 
                              href={`mailto:${res.emergencyContact.email}`} 
                              className="inline-flex items-center gap-1 text-slate-600 hover:text-amber-700 transition-colors truncate max-w-[200px]"
                              title="Email Primary Relative"
                            >
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{res.emergencyContact.email}</span>
                            </a>
                          )}
                        </div>
                      )}

                      {/* Medical Notes Snippet */}
                      {res.medicalNotes && (
                        <div className="mt-3 text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100/60 line-clamp-2">
                          <span className="font-bold text-amber-900">Care Note: </span>
                          <span>{res.medicalNotes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectResident(res);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Profile</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onEditResident(res);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-200"
                          title="Edit client records"
                        >
                          <Edit className="w-3.5 h-3.5 text-slate-600" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredResidents.length}</span> of {categoryResidents.length} {config.title.toLowerCase()}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onAddNewResident(config.presetCategory);
                onClose();
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${config.theme.accentBtn}`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

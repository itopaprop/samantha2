import React from 'react';
import { OrganogramNode } from '../../types/organogram';
import { 
  Briefcase, 
  Users, 
  Clipboard, 
  Wallet, 
  ShieldCheck, 
  ClipboardList, 
  UserCog, 
  ChefHat, 
  HeartHandshake, 
  Sparkles, 
  Shield, 
  Car, 
  Home, 
  Building2,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';

interface OrganizationCardProps {
  node: OrganogramNode;
  isHighlighted?: boolean;
  isFilteredOut?: boolean;
  onSelect: (node: OrganogramNode) => void;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({
  node,
  isHighlighted = false,
  isFilteredOut = false,
  onSelect
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'Clipboard': return <Clipboard className="w-4 h-4" />;
      case 'Wallet': return <Wallet className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'ClipboardList': return <ClipboardList className="w-4 h-4" />;
      case 'UserCog': return <UserCog className="w-4 h-4" />;
      case 'ChefHat': return <ChefHat className="w-4 h-4" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Shield': return <Shield className="w-4 h-4" />;
      case 'Car': return <Car className="w-4 h-4" />;
      case 'Home': return <Home className="w-4 h-4" />;
      case 'Building2': return <Building2 className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  // Map requested colors
  const getColorClasses = (type: OrganogramNode['colorType']) => {
    switch (type) {
      case 'purple-gradient':
        return {
          cardBg: 'bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 text-white shadow-purple-900/25 border-purple-500/40',
          badgeBg: 'bg-white/20 text-purple-100 border-white/30',
          titleColor: 'text-white',
          nameColor: 'text-purple-200',
          descColor: 'text-purple-100/90',
          accentBorder: 'ring-purple-400'
        };
      case 'royal-blue':
        return {
          cardBg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-blue-900/20 border-blue-400/40',
          badgeBg: 'bg-white/20 text-blue-100 border-white/30',
          titleColor: 'text-white',
          nameColor: 'text-blue-200',
          descColor: 'text-blue-100/90',
          accentBorder: 'ring-blue-400'
        };
      case 'emerald':
        return {
          cardBg: 'bg-white border-emerald-300 text-slate-800 shadow-emerald-500/10 hover:border-emerald-500',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          titleColor: 'text-emerald-950 font-black',
          nameColor: 'text-emerald-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-emerald-400'
        };
      case 'teal':
        return {
          cardBg: 'bg-white border-teal-300 text-slate-800 shadow-teal-500/10 hover:border-teal-500',
          badgeBg: 'bg-teal-100 text-teal-800 border-teal-200',
          titleColor: 'text-teal-950 font-black',
          nameColor: 'text-teal-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-teal-400'
        };
      case 'indigo':
        return {
          cardBg: 'bg-white border-indigo-300 text-slate-800 shadow-indigo-500/10 hover:border-indigo-500',
          badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          titleColor: 'text-indigo-950 font-black',
          nameColor: 'text-indigo-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-indigo-400'
        };
      case 'purple':
        return {
          cardBg: 'bg-white border-purple-300 text-slate-800 shadow-purple-500/10 hover:border-purple-500',
          badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
          titleColor: 'text-purple-950 font-black',
          nameColor: 'text-purple-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-purple-400'
        };
      case 'orange':
        return {
          cardBg: 'bg-white border-amber-300 text-slate-800 shadow-amber-500/10 hover:border-amber-500',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          titleColor: 'text-amber-950 font-black',
          nameColor: 'text-amber-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-amber-400'
        };
      case 'rose':
        return {
          cardBg: 'bg-white border-rose-300 text-slate-800 shadow-rose-500/10 hover:border-rose-500',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          titleColor: 'text-rose-950 font-black',
          nameColor: 'text-rose-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-rose-400'
        };
      case 'cyan':
        return {
          cardBg: 'bg-white border-cyan-300 text-slate-800 shadow-cyan-500/10 hover:border-cyan-500',
          badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-200',
          titleColor: 'text-cyan-950 font-black',
          nameColor: 'text-cyan-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-cyan-400'
        };
      case 'blue':
        return {
          cardBg: 'bg-white border-sky-300 text-slate-800 shadow-sky-500/10 hover:border-sky-500',
          badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
          titleColor: 'text-sky-950 font-black',
          nameColor: 'text-sky-700 font-bold',
          descColor: 'text-slate-600',
          accentBorder: 'ring-sky-400'
        };
      case 'board':
      default:
        return {
          cardBg: 'bg-slate-900 text-white border-slate-700 shadow-slate-900/30',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          titleColor: 'text-white',
          nameColor: 'text-amber-400',
          descColor: 'text-slate-300',
          accentBorder: 'ring-amber-400'
        };
    }
  };

  const style = getColorClasses(node.colorType);

  return (
    <div
      onClick={() => onSelect(node)}
      className={`relative w-full max-w-[280px] sm:max-w-[300px] rounded-[20px] p-5 border transition-all duration-300 cursor-pointer backdrop-blur-md select-none group flex flex-col justify-between ${
        style.cardBg
      } ${
        isFilteredOut ? 'opacity-30 grayscale blur-[0.5px]' : 'opacity-100 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.02]'
      } ${
        isHighlighted ? `ring-4 ${style.accentBorder} shadow-2xl scale-[1.03]` : ''
      }`}
    >
      <div>
        {/* Top Header Row: Icon Badge & Category Label */}
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl flex items-center justify-center border ${style.badgeBg} shadow-xs`}>
            {getIcon(node.iconName)}
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-100/10 border border-slate-200/20">
            {node.department}
          </span>
        </div>

        {/* Position Title */}
        <h3 className={`text-base sm:text-lg font-extrabold tracking-tight leading-snug mb-1 ${style.titleColor}`}>
          {node.title}
        </h3>

        {/* Employee Name */}
        {node.employeeName ? (
          <div className={`text-xs sm:text-sm font-bold tracking-wide mb-2.5 ${style.nameColor}`}>
            {node.employeeName}
          </div>
        ) : null}

        {/* Description */}
        <p className={`text-xs leading-relaxed line-clamp-2 ${style.descColor}`}>
          {node.description}
        </p>
      </div>
    </div>
  );
};

import React from 'react';
import { WorkforceNode } from '../../types/organogram';
import { 
  Car, 
  HeartHandshake, 
  Sparkles, 
  Shield, 
  ChefHat, 
  Home, 
  Users,
  ChevronRight
} from 'lucide-react';

interface BottomWorkforceProps {
  workforce: WorkforceNode[];
  onSelectWorkforce?: (item: WorkforceNode) => void;
}

export const BottomWorkforce: React.FC<BottomWorkforceProps> = ({ 
  workforce, 
  onSelectWorkforce 
}) => {

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Car': return <Car className="w-5 h-5 text-amber-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-5 h-5 text-rose-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-cyan-600" />;
      case 'Shield': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'ChefHat': return <ChefHat className="w-5 h-5 text-amber-600" />;
      case 'Home': return <Home className="w-5 h-5 text-indigo-600" />;
      default: return <Users className="w-5 h-5 text-slate-600" />;
    }
  };

  const getBadgeBg = (colorType: WorkforceNode['colorType']) => {
    switch (colorType) {
      case 'amber': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'rose': return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'cyan': return 'bg-cyan-100 text-cyan-900 border-cyan-200';
      case 'blue': return 'bg-sky-100 text-sky-900 border-sky-200';
      case 'indigo': return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      default: return 'bg-slate-100 text-slate-900 border-slate-200';
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6 relative overflow-hidden">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Operational Field Workforce Division
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Field Staff Teams & Support Specialists
          </h3>
        </div>
        <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200">
          <Users className="w-4 h-4 text-sky-600" />
          <span>Total Staff Strength: 88 Active Members</span>
        </div>
      </div>

      {/* 6 Horizontal Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {workforce.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectWorkforce && onSelectWorkforce(item)}
            className="bg-slate-50/80 hover:bg-white border border-slate-200/80 hover:border-sky-300 rounded-2xl p-4 transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 cursor-pointer flex flex-col justify-between group space-y-3"
          >
            <div>
              {/* Header: Icon + Count */}
              <div className="flex items-center justify-between mb-2">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs group-hover:scale-110 transition-transform">
                  {getIcon(item.iconName)}
                </div>
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${getBadgeBg(item.colorType)}`}>
                  {item.count} Staff
                </span>
              </div>

              {/* Title & Department */}
              <h4 className="font-extrabold text-slate-900 text-base group-hover:text-sky-700 transition-colors">
                {item.title}
              </h4>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {item.department}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

import React from 'react';

interface VerticalConnectorProps {
  height?: number;
  label?: string;
}

export const VerticalConnector: React.FC<VerticalConnectorProps> = ({ height = 36, label }) => {
  return (
    <div className="flex flex-col items-center justify-center my-1 w-full relative">
      <svg 
        width="2" 
        height={height} 
        className="text-slate-300 overflow-visible transition-all duration-500 animate-in fade-in"
      >
        <line 
          x1="1" 
          y1="0" 
          x2="1" 
          y2={height} 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="4 2"
          className="animate-pulse"
        />
        {/* Subtle dot at center */}
        <circle cx="1" cy={height / 2} r="3" className="fill-sky-500" />
      </svg>
      {label && (
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200 my-0.5 shadow-xs">
          {label}
        </span>
      )}
    </div>
  );
};

interface BranchConnectorProps {
  cols?: number;
}

export const BranchConnector: React.FC<BranchConnectorProps> = ({ cols = 2 }) => {
  return (
    <div className="w-full flex flex-col items-center my-1 relative max-w-4xl mx-auto">
      {/* Top vertical stem */}
      <div className="w-0.5 h-6 bg-gradient-to-b from-slate-300 to-sky-400"></div>

      {/* Horizontal connector bar across columns */}
      <div className="w-3/4 sm:w-4/5 h-0.5 bg-sky-400 relative rounded-full">
        <div className="absolute inset-0 bg-sky-400/50 blur-[2px]"></div>
      </div>

      {/* Vertical stems down to children */}
      <div className="w-3/4 sm:w-4/5 flex justify-between">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-0.5 h-6 bg-gradient-to-b from-sky-400 to-slate-300"></div>
            <div className="w-2 h-2 rounded-full bg-sky-500 shadow-xs"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

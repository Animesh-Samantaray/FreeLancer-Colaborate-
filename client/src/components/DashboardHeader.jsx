import React from "react";

const DashboardHeader = ({ title, description, badge, action }) => {
  return (
    <div className="glass-card border border-white/10 p-8 rounded-3xl relative overflow-hidden">
      <div className="absolute -right-16 top-0 h-56 w-56 rounded-full bg-[#6366F1]/10 blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {badge && (
            <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#6366F1] mb-1">
              {badge}
            </p>
          )}
          <h1 className="text-3xl font-bold text-white font-display">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-400 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};

export default DashboardHeader;
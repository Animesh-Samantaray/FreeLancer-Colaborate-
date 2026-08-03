import React from "react";

const StatsCard = ({ title, value, subtitle, icon, accent = "from-[#6366F1] to-[#3B82F6]" }) => {
  return (
    <div className="glass-card rounded-3xl border border-white/10 p-6 relative overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-medium">{title}</p>
          <h2 className="mt-3 text-3xl font-extrabold text-white font-display">{value}</h2>
        </div>
        {icon && (
          <div className={`rounded-2xl bg-gradient-to-br ${accent} p-3.5 text-white shadow-lg`}>
            {icon}
          </div>
        )}
      </div>
      {subtitle && <p className="mt-4 text-xs text-gray-400 font-medium">{subtitle}</p>}
    </div>
  );
};

export default StatsCard;

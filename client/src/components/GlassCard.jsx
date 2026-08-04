import React from "react";

const GlassCard = ({ children, className = "", hover = true, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 border border-white/10 rounded-3xl transition-all duration-300 ${
        hover ? "hover:border-[#6366F1]/30 hover:bg-white/[0.05] hover:shadow-xl hover:shadow-[#6366F1]/5" : ""
      } ${onClick ? "cursor-pointer active:scale-[0.99]" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;

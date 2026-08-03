import React from "react";

const RoleCard = ({ role, title, description, icon, isSelected, onClick, accentColor = "indigo" }) => {
  const isSelectedStyle = isSelected
    ? accentColor === "red"
      ? "border-red-500 bg-red-500/20 ring-1 ring-red-500/30"
      : "border-indigo-500 bg-indigo-500/20 ring-1 ring-indigo-500/30"
    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-3 sm:p-4 border transition-all duration-300 text-left w-full ${isSelectedStyle}`}
    >
      <div className="text-2xl mb-1.5">{icon}</div>
      <div className="font-bold text-white text-sm">{title}</div>
      {description && <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{description}</p>}
    </button>
  );
};

export default RoleCard;

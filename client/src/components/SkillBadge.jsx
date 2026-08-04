import React from "react";

const SkillBadge = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md transition hover:border-[#6366F1]/30 hover:bg-[#6366F1]/10">
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 text-gray-400 hover:text-red-400 focus:outline-none"
        >
          &times;
        </button>
      )}
    </span>
  );
};

export default SkillBadge;

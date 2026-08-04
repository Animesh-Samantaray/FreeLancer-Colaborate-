import React from "react";

const Input = ({
  label,
  icon,
  type = "text",
  rows = 4,
  options = [],
  className = "",
  error,
  ...props
}) => {
  const isTextArea = type === "textarea";
  const isSelect = type === "select";

  return (
    <label className="block text-sm text-gray-300 w-full">
      {label && (
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          {label}
        </span>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-3.5 text-gray-500 z-10">
            {icon}
          </span>
        )}

        {isTextArea ? (
          <textarea
            rows={rows}
            className={`glass-input w-full rounded-2xl py-3 pr-4 text-sm text-white transition placeholder-gray-500 focus:border-[#6366F1] ${
              icon ? "pl-12" : "pl-4"
            } ${error ? "border-red-500/50" : ""} ${className}`}
            {...props}
          />
        ) : isSelect ? (
          <select
            className={`glass-input w-full rounded-2xl py-3 pr-4 text-sm text-white transition focus:border-[#6366F1] bg-[#0F172A] ${
              icon ? "pl-12" : "pl-4"
            } ${error ? "border-red-500/50" : ""} ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-[#0F172A] text-white">
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className={`glass-input w-full rounded-2xl py-3 pr-4 text-sm text-white transition placeholder-gray-500 focus:border-[#6366F1] ${
              icon ? "pl-12" : "pl-4"
            } ${error ? "border-red-500/50" : ""} ${className}`}
            {...props}
          />
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </label>
  );
};

export default Input;

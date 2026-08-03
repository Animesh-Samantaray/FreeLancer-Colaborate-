const Input = ({ label, icon, className = "", ...props }) => {
  return (
    <label className="block text-sm text-gray-300">
      {label && <span className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-gray-400">{label}</span>}
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>}
        <input
          className={`glass-input w-full rounded-2xl py-3 pr-4 text-sm text-white transition focus:border-[#6366F1] ${icon ? "pl-12" : "pl-4"} ${className}`}
          {...props}
        />
      </div>
    </label>
  );
};

export default Input;

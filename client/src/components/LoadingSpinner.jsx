const LoadingSpinner = ({ size = "md", label = "Loading..." }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };
  const iconClass = sizeClasses[size] || (typeof size === "number" ? "w-8 h-8" : sizeClasses.md);

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center text-gray-400 py-6">
      <svg className={`animate-spin ${iconClass} text-[#6366F1]`} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
    </div>
  );
};

export default LoadingSpinner;

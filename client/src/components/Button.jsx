import React from "react";
import { CgSpinner } from "react-icons/cg";

const Button = ({
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
  children,
  icon,
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/30 hover:brightness-110",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500/80 shadow-lg shadow-red-500/20",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ${
        isDisabled
          ? "opacity-50 cursor-not-allowed pointer-events-none"
          : "active:scale-[0.98]"
      } ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <CgSpinner className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

export default Button;

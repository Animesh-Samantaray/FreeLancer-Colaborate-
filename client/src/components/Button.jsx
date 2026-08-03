const Button = ({ type = "button", variant = "primary", className = "", children, ...props }) => {
  const variants = {
    primary: "bg-gradient-to-r from-[#6366F1] to-[#3B82F6] text-white shadow-lg shadow-[#6366F1]/20 hover:shadow-[#6366F1]/30",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    ghost: "bg-transparent text-white hover:bg-white/5",
    danger: "bg-red-500/90 text-white hover:bg-red-500/80",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition duration-300 active:scale-[0.98] ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

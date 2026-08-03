const EmptyState = ({ title, description, action }) => {
  return (
    <div className="glass-card border border-white/10 rounded-3xl p-10 text-center max-w-2xl mx-auto">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/5 text-[#6366F1] shadow-inner shadow-[#6366F1]/10">
        <span className="text-3xl">✨</span>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-gray-400 mb-6 leading-relaxed">{description}</p>
      {action && <div className="flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;

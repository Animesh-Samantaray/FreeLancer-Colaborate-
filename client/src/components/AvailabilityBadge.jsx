import React from "react";

const AvailabilityBadge = ({ availability = "Available" }) => {
  const isAvailable = availability.toLowerCase() === "available";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider border backdrop-blur-md ${
        isAvailable
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-sm shadow-emerald-500/10"
          : "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm shadow-amber-500/10"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isAvailable ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
        }`}
      />
      {availability}
    </span>
  );
};

export default AvailabilityBadge;

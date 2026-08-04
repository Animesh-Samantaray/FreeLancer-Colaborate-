import React from "react";

export const CardSkeleton = () => (
  <div className="glass-card rounded-3xl border border-white/10 p-6 animate-pulse space-y-4">
    <div className="flex items-center justify-between">
      <div className="h-4 bg-white/10 rounded w-1/3" />
      <div className="h-10 w-10 bg-white/10 rounded-2xl" />
    </div>
    <div className="h-8 bg-white/10 rounded w-1/2" />
    <div className="h-3 bg-white/10 rounded w-2/3" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="glass-card rounded-3xl border border-white/10 p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-white/10" />
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="h-6 bg-white/10 rounded w-1/3 mx-auto sm:mx-0" />
          <div className="h-4 bg-white/10 rounded w-1/4 mx-auto sm:mx-0" />
          <div className="h-3 bg-white/10 rounded w-1/2 mx-auto sm:mx-0" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export const DirectorySkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="glass-card rounded-3xl border border-white/10 p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        </div>
        <div className="h-12 bg-white/10 rounded" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-8 bg-white/10 rounded-2xl w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

const SkeletonLoader = ({ type = "profile" }) => {
  if (type === "card") return <CardSkeleton />;
  if (type === "directory") return <DirectorySkeleton />;
  return <ProfileSkeleton />;
};

export default SkeletonLoader;

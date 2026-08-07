import React from "react";
import { FiArrowLeft, FiFolder, FiUsers, FiCheckCircle, FiShield } from "react-icons/fi";

const getRoleBadge = (role) => {
  const r = (role || "freelancer").toLowerCase();
  if (r === "client") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (r === "admin") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
};

const ChatHeader = ({ conversation, onBack, currentUserId }) => {
  if (!conversation) return null;

  const projectTitle = conversation.project?.title || "Project Chat";
  const projectStatus = conversation.project?.status || "Active";
  const participants = conversation.participants || [];

  return (
    <div className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
      {/* Left: Mobile Back Button + Project Title & Status */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition cursor-pointer"
            title="Back to conversations"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 p-0.5 shadow-md shadow-indigo-500/10 shrink-0 hidden sm:flex items-center justify-center text-white">
          <FiFolder className="w-5 h-5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-display text-white truncate">
              {projectTitle}
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden xs:inline-block">
              {projectStatus}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>{participants.length} Project Participants</span>
          </p>
        </div>
      </div>

      {/* Right: Participant Avatars and Badges */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar max-w-[45%] justify-end">
        {participants.map((p) => {
          const isMe = (p._id || p.id) === currentUserId;
          return (
            <div
              key={p._id || p.id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0"
              title={`${p.fullName} (${p.role || "Participant"})`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-[10px] font-bold text-white flex items-center justify-center uppercase shrink-0">
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  p.fullName?.[0] || "U"
                )}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[11px] font-semibold text-white leading-none truncate max-w-[90px]">
                  {p.fullName?.split(" ")[0]} {isMe && "(You)"}
                </p>
                <span className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${getRoleBadge(p.role)}`}>
                  {p.role}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatHeader;

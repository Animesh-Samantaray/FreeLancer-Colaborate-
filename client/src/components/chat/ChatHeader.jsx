import React from "react";
import { FiArrowLeft, FiFolder, FiUsers, FiMessageSquare, FiGrid, FiImage } from "react-icons/fi";

const getRoleBadge = (role) => {
  const r = (role || "freelancer").toLowerCase();
  if (r === "client") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (r === "admin") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
};

const ChatHeader = ({
  conversation,
  onBack,
  onToggleChatsList,
  currentUserId,
  activeTab = "chat",
  setActiveTab,
  mediaCount = 0,
}) => {
  if (!conversation) return null;

  const projectTitle = conversation.project?.title || "Project Chat";
  const projectStatus = conversation.project?.status || "Active";
  const participants = conversation.participants || [];

  return (
    <div className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="xl:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition cursor-pointer"
            title="Back to conversations"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
        )}

        {onToggleChatsList && (
          <button
            onClick={onToggleChatsList}
            className="xl:hidden p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 transition cursor-pointer flex items-center justify-center shrink-0"
            title="View chats list"
          >
            <FiMessageSquare className="w-5 h-5" />
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

      <div className="flex items-center gap-3">
        {setActiveTab && (
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => setActiveTab("chat")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "chat"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FiMessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === "media"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FiImage className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Media</span>
              {mediaCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                  {mediaCount}
                </span>
              )}
            </button>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5 overflow-x-auto custom-scrollbar max-w-[200px] justify-end">
          {participants.map((p) => {
            const isMe = (p._id || p.id) === currentUserId;
            return (
              <div
                key={p._id || p.id}
                className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white/5 border border-white/10 shrink-0"
                title={`${p.fullName} (${p.role || "Participant"})`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-[9px] font-bold text-white flex items-center justify-center uppercase shrink-0">
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;

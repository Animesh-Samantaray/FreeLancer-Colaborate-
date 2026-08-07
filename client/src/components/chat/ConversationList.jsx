import React, { useState } from "react";
import { FiSearch, FiMessageSquare, FiFolder, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";

// Formats timestamp nicely for list view
const formatListTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "short" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

// Status Badge styling helper
const getStatusBadge = (status) => {
  const s = (status || "In Progress").toLowerCase();
  if (s.includes("completed")) {
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  }
  if (s.includes("review") || s.includes("pending")) {
    return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
  return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
};

const ConversationList = ({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  loading = false,
  currentUserId,
  unreadsMap = {},
  lastMessagesMap = {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((c) => {
    const projectTitle = c.project?.title || "Project Chat";
    const matchProject = projectTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchParticipant = c.participants?.some((p) =>
      p.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchProject || matchParticipant;
  });

  // Sort conversations dynamically by latest activity timestamp (most recent on top)
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const lastMsgA = lastMessagesMap[a._id] || a.lastMessage;
    const lastMsgB = lastMessagesMap[b._id] || b.lastMessage;
    const timeA = new Date(lastMsgA?.createdAt || a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(lastMsgB?.createdAt || b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  return (
    <div className="flex flex-col h-full bg-[#0B1120]/90 border-r border-white/10 select-none">
      {/* Header & Search */}
      <div className="p-4 border-b border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <FiMessageSquare className="text-indigo-400" /> Project Chats
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-300">
            {conversations.length}
          </span>
        </div>

        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects or team..."
            className="w-full bg-[#09090B] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white/2 border border-white/5 space-y-2 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-white/10 rounded-md" />
                <div className="h-3 w-12 bg-white/10 rounded-md" />
              </div>
              <div className="h-3 w-40 bg-white/5 rounded-md" />
            </div>
          ))
        ) : filteredConversations.length === 0 ? (
          // Empty State
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
              <FiFolder className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-white">
              {searchTerm ? "No matching chats found" : "No project chats yet"}
            </p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
              {searchTerm
                ? "Try searching for a different project title or participant name."
                : "You will see chats here once you participate in an active project."}
            </p>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const isSelected = conv._id === selectedConversationId;
            const projectTitle = conv.project?.title || "Project Conversation";
            const projectStatus = conv.project?.status || "Active";
            const lastMsgObj = lastMessagesMap[conv._id] || conv.lastMessage;
            const unreadCount = unreadsMap[conv._id] || 0;

            const participants = conv.participants || [];
            const otherParticipants = participants.filter((p) => (p._id || p.id) !== currentUserId);
            const displayAvatars = (otherParticipants.length > 0 ? otherParticipants : participants).slice(0, 3);

            return (
              <div
                key={conv._id}
                onClick={() => onSelectConversation(conv)}
                className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-600/20 to-blue-600/10 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                    : "bg-white/2 border-white/5 hover:bg-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-white truncate group-hover:text-indigo-300 transition">
                      {projectTitle}
                    </span>
                    <span
                      className={`text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ${getStatusBadge(
                        projectStatus
                      )} shrink-0`}
                    >
                      {projectStatus}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400 font-medium shrink-0">
                    {formatListTime(lastMsgObj?.createdAt || conv.updatedAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Last message preview */}
                  <p className="text-xs text-gray-400 truncate flex-1 leading-normal">
                    {lastMsgObj ? (
                      <span className="truncate">
                        <strong className="text-gray-300 font-medium">
                          {lastMsgObj.sender?.fullName?.split(" ")[0] || "User"}:{" "}
                        </strong>
                        {lastMsgObj.message}
                      </span>
                    ) : (
                      <span className="italic text-gray-500">Tap to open project chat</span>
                    )}
                  </p>

                  {/* Right side: Unread Badge or Avatars */}
                  <div className="flex items-center gap-2 shrink-0">
                    {unreadCount > 0 && (
                      <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shadow-md shadow-indigo-500/30 animate-pulse">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}

                    {/* Participant Avatar Stack */}
                    <div className="flex -space-x-2 overflow-hidden">
                      {displayAvatars.map((p, idx) => (
                        <div
                          key={p._id || idx}
                          title={`${p.fullName} (${p.role || "Member"})`}
                          className="inline-block h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 ring-2 ring-[#0B1120] text-[9px] font-bold text-white flex items-center justify-center uppercase shadow-sm"
                        >
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
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ConversationList;

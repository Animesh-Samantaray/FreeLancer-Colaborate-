import React, { useEffect, useRef } from "react";
import { FiCheck, FiCheckCircle, FiTrash2, FiClock, FiShield, FiSmile } from "react-icons/fi";

// Formats message timestamp: e.g., "10:42 AM"
const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Formats date separators: e.g., "Today", "Yesterday", "Monday, August 5, 2026"
const formatDateSeparator = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  
  const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffDays = Math.round((nowDate - dDate) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: "long" });
  }
  return d.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
};

// Role badge styling
const getRoleBadge = (role) => {
  const r = (role || "freelancer").toLowerCase();
  if (r === "client") return "bg-purple-500/10 text-purple-400 border-purple-500/20";
  if (r === "admin") return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
};

const MessageList = ({
  messages = [],
  currentUserId,
  userRole,
  onDeleteMessage,
  loading = false,
  participants = [],
}) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom when messages list updates
  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-end gap-3 ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            {i % 2 === 0 && <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />}
            <div
              className={`h-12 rounded-2xl bg-white/5 border border-white/10 animate-pulse ${
                i % 2 === 0 ? "w-56" : "w-64"
              }`}
            />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 select-none">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-xl shadow-indigo-500/5">
          <FiSmile className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white font-display">Start the Project Conversation</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-sm">
          Send a message below to collaborate in real-time with team members and project stakeholders.
        </p>
      </div>
    );
  }

  // Process messages into date groups and sender clusters
  let lastDateStr = null;

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
    >
      {messages.map((msg, index) => {
        const msgDateStr = formatDateSeparator(msg.createdAt);
        const showDateSeparator = msgDateStr !== lastDateStr;
        if (showDateSeparator) {
          lastDateStr = msgDateStr;
        }

        const senderId = typeof msg.sender === "object" ? msg.sender?._id || msg.sender?.id : msg.sender;
        const isOutgoing = senderId?.toString() === currentUserId?.toString();

        // Sender details
        const senderObj =
          typeof msg.sender === "object"
            ? msg.sender
            : participants.find((p) => (p._id || p.id)?.toString() === senderId?.toString()) || {};
        
        const senderName = senderObj.fullName || "User";
        const senderRole = senderObj.role || "Member";
        const senderAvatar = senderObj.avatar;

        // Group consecutive messages from same sender within 5 mins
        const prevMsg = messages[index - 1];
        const prevSenderId = prevMsg
          ? typeof prevMsg.sender === "object"
            ? prevMsg.sender?._id || prevMsg.sender?.id
            : prevMsg.sender
          : null;
        
        const timeDiffMins = prevMsg
          ? (new Date(msg.createdAt) - new Date(prevMsg.createdAt)) / (1000 * 60)
          : 999;
          
        const isConsecutive = prevSenderId?.toString() === senderId?.toString() && timeDiffMins < 5 && !showDateSeparator;

        // Check if can delete (own message or admin)
        const canDelete = isOutgoing || userRole === "admin";

        // Read status check: read if readBy has other participants
        const isReadByOthers = Array.isArray(msg.readBy) && msg.readBy.some((id) => id?.toString() !== currentUserId?.toString());

        return (
          <React.Fragment key={msg._id || index}>
            {/* Date Separator */}
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 rounded-full bg-[#1E293B]/80 border border-white/10 text-[10px] font-semibold text-gray-400 shadow-sm backdrop-blur-md">
                  {msgDateStr}
                </span>
              </div>
            )}

            {/* Message Row */}
            <div
              className={`group flex items-end gap-2.5 ${
                isOutgoing ? "justify-end" : "justify-start"
              } ${isConsecutive ? "mt-1" : "mt-3"}`}
            >
              {/* Incoming Avatar (Only show on first message of consecutive cluster) */}
              {!isOutgoing && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 text-xs font-bold text-white flex items-center justify-center uppercase shrink-0 shadow-sm">
                  {!isConsecutive && (
                    senderAvatar ? (
                      <img
                        src={senderAvatar}
                        alt={senderName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      senderName[0] || "U"
                    )
                  )}
                </div>
              )}

              {/* Message Bubble container */}
              <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isOutgoing ? "items-end" : "items-start"}`}>
                {/* Sender Name & Role Pill (if not consecutive and incoming) */}
                {!isOutgoing && !isConsecutive && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-xs font-semibold text-gray-300">{senderName}</span>
                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(senderRole)}`}>
                      {senderRole}
                    </span>
                  </div>
                )}

                <div className="relative group/bubble flex items-center gap-2">
                  {/* Delete button action on hover */}
                  {canDelete && (
                    <button
                      onClick={() => onDeleteMessage && onDeleteMessage(msg._id)}
                      className={`opacity-0 group-hover/bubble:opacity-100 p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 transition transform hover:scale-105 cursor-pointer ${
                        isOutgoing ? "order-first" : "order-last"
                      }`}
                      title="Delete Message"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-2.5 text-xs leading-relaxed break-words rounded-2xl shadow-md transition ${
                      isOutgoing
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs border border-indigo-500/30 shadow-indigo-600/10"
                        : "bg-[#1E293B]/90 text-gray-100 rounded-bl-xs border border-white/10 backdrop-blur-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-sans">{msg.message}</p>

                    {/* Bottom Metadata: Time & Read Ticks */}
                    <div
                      className={`flex items-center gap-1 mt-1 text-[9px] ${
                        isOutgoing ? "text-indigo-200 justify-end" : "text-gray-400 justify-start"
                      }`}
                    >
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {isOutgoing && (
                        <span title={isReadByOthers ? "Read by participants" : "Delivered"}>
                          {isReadByOthers ? (
                            <span className="text-cyan-300 font-bold">✓✓</span>
                          ) : (
                            <span className="text-indigo-300">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

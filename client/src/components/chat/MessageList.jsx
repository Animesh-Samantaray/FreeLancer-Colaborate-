import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiClock,
  FiShield,
  FiSmile,
  FiFileText,
  FiFilm,
  FiDownload,
  FiExternalLink,
  FiEye,
  FiPaperclip,
  FiFolder,
} from "react-icons/fi";

const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const getDocumentInfo = (mimeType, originalName = "") => {
  const mime = (mimeType || "").toLowerCase();
  const ext = originalName.split(".").pop().toLowerCase();
  
  if (mime === "application/pdf" || ext === "pdf") {
    return {
      type: "PDF Document",
      icon: "pdf",
      color: "from-rose-500/20 to-red-600/10 border-red-500/30 text-red-400 bg-red-950/20",
      previewable: true,
      label: "Open"
    };
  }
  if (mime === "text/plain" || ext === "txt") {
    return {
      type: "Text File",
      icon: "text",
      color: "from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-300 bg-slate-950/20",
      previewable: true,
      label: "Open"
    };
  }
  if (mime === "application/msword" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || ext === "doc" || ext === "docx") {
    return {
      type: "Word Document",
      icon: "word",
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400 bg-blue-950/20",
      previewable: false,
      label: "Download"
    };
  }
  if (mime === "application/vnd.ms-excel" || mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || ext === "xls" || ext === "xlsx") {
    return {
      type: "Excel Spreadsheet",
      icon: "excel",
      color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400 bg-emerald-950/20",
      previewable: false,
      label: "Download"
    };
  }
  if (mime === "application/vnd.ms-powerpoint" || mime === "application/vnd.openxmlformats-officedocument.presentationml.presentation" || ext === "ppt" || ext === "pptx") {
    return {
      type: "PowerPoint",
      icon: "powerpoint",
      color: "from-amber-500/20 to-orange-600/10 border-orange-500/30 text-orange-400 bg-orange-950/20",
      previewable: false,
      label: "Download"
    };
  }
  if (mime === "application/zip" || mime === "application/x-zip-compressed" || ext === "zip" || ext === "rar" || ext === "7z") {
    return {
      type: "Archive",
      icon: "zip",
      color: "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-400 bg-yellow-950/20",
      previewable: false,
      label: "Download"
    };
  }
  
  // Default/Fallback
  return {
    type: ext ? `${ext.toUpperCase()} File` : "Document",
    icon: "generic",
    color: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400 bg-indigo-950/20",
    previewable: false,
    label: "Download"
  };
};

const getIconComponent = (iconType) => {
  switch (iconType) {
    case "pdf":
    case "text":
    case "word":
    case "excel":
    case "powerpoint":
      return <FiFileText className="w-5 h-5" />;
    case "zip":
      return <FiFolder className="w-5 h-5" />;
    default:
      return <FiPaperclip className="w-5 h-5" />;
  }
};

// Helper definitions
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
  onViewAttachment,
  loading = false,
  participants = [],
}) => {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const downloadAttachment = async (attachment, messageId) => {
    if (!attachment || !attachment.url) {
      toast.error("Unable to download this file. Invalid URL.");
      return;
    }

    if (messageId) {
      if (downloadingIds.has(messageId)) return;
      setDownloadingIds((prev) => new Set([...prev, messageId]));
    }

    try {
      const res = await fetch(attachment.url, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
      });
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = attachment.originalName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn("Blob fetch download failed, using fallback tab-based download:", err);
      const link = document.createElement("a");
      link.href = attachment.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = attachment.originalName || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      if (messageId) {
        setDownloadingIds((prev) => {
          const next = new Set(prev);
          next.delete(messageId);
          return next;
        });
      }
    }
  };

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
          Send a message or share files below to collaborate in real-time with team members.
        </p>
      </div>
    );
  }

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

        const senderObj =
          typeof msg.sender === "object"
            ? msg.sender
            : participants.find((p) => (p._id || p.id)?.toString() === senderId?.toString()) || {};

        const senderName = senderObj.fullName || "User";
        const senderRole = senderObj.role || "Member";
        const senderAvatar = senderObj.avatar;

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

        const canDelete = isOutgoing || userRole === "admin";
        const isReadByOthers = Array.isArray(msg.readBy) && msg.readBy.some((id) => id?.toString() !== currentUserId?.toString());

        const attachment = msg.attachment;
        const mime = attachment?.mimeType || "";
        const isImage = mime.startsWith("image/");
        const isVideo = mime.startsWith("video/");
        const isPdf = mime === "application/pdf";

        return (
          <React.Fragment key={msg._id || index}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-4">
                <span className="px-3 py-1 rounded-full bg-[#1E293B]/80 border border-white/10 text-[10px] font-semibold text-gray-400 shadow-sm backdrop-blur-md">
                  {msgDateStr}
                </span>
              </div>
            )}

            <div
              id={`msg-${msg._id}`}
              className={`group flex items-end gap-2.5 ${
                isOutgoing ? "justify-end" : "justify-start"
              } ${isConsecutive ? "mt-1" : "mt-3"}`}
            >
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

              <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isOutgoing ? "items-end" : "items-start"}`}>
                {!isOutgoing && !isConsecutive && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-xs font-semibold text-gray-300">{senderName}</span>
                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(senderRole)}`}>
                      {senderRole}
                    </span>
                  </div>
                )}

                <div className="relative group/bubble flex items-center gap-2">
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

                  <div
                    className={`p-3 text-xs leading-relaxed break-words rounded-2xl shadow-md transition ${
                      isOutgoing
                        ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-xs border border-indigo-500/30 shadow-indigo-600/10"
                        : "bg-[#1E293B]/90 text-gray-100 rounded-bl-xs border border-white/10 backdrop-blur-md"
                    }`}
                  >
                    {attachment && attachment.url && (
                      <div className="mb-2">
                        {isImage && (
                          <div className="relative rounded-xl overflow-hidden max-w-full xs:max-w-xs sm:max-w-sm max-h-72 border border-white/10 group/img shadow-md bg-black/30">
                            <img
                              src={attachment.url}
                              alt={attachment.originalName || "Attached Image"}
                              className="max-h-72 w-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewAttachment && onViewAttachment(attachment, senderName, msg.createdAt);
                                }}
                                className="p-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium text-xs flex items-center gap-1 cursor-pointer"
                                title="Zoom preview"
                              >
                                <FiEye className="w-4 h-4" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadAttachment(attachment, msg._id);
                                }}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1 cursor-pointer border border-white/25"
                                title="Download original file"
                              >
                                {downloadingIds.has(msg._id) ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiDownload className="w-4 h-4" />
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {isVideo && (
                          <div className="relative rounded-xl overflow-hidden max-w-full xs:max-w-xs sm:max-w-sm border border-white/10 shadow-md bg-black/40 flex flex-col gap-2">
                            <video
                              src={attachment.url}
                              controls
                              preload="metadata"
                              className="max-h-64 w-full rounded-xl"
                            />
                            <div className="px-3 pb-3 flex items-center justify-between gap-3">
                              <span className="text-[10px] text-gray-400 truncate max-w-[60%]">
                                {attachment.originalName}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadAttachment(attachment, msg._id);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 text-[10px] font-semibold transition cursor-pointer flex items-center gap-1.5"
                              >
                                {downloadingIds.has(msg._id) ? (
                                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiDownload className="w-3.5 h-3.5" />
                                )}
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {!isImage && !isVideo && (() => {
                          const docInfo = getDocumentInfo(attachment.mimeType, attachment.originalName);
                          const isDownloading = downloadingIds.has(msg._id);
                          return (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadAttachment(attachment, msg._id);
                              }}
                              className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 w-full xs:w-[280px] sm:w-[320px] hover:bg-black/60 hover:border-white/20 transition cursor-pointer select-none"
                              title={`Click to download ${attachment.originalName || "file"}`}
                            >
                              <div className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${docInfo.color} flex items-center justify-center shrink-0 border`}>
                                {getIconComponent(docInfo.icon)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white truncate" title={attachment.originalName}>
                                  {attachment.originalName || "Document"}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                                  <span>{formatFileSize(attachment.size)}</span>
                                  <span>•</span>
                                  <span className="truncate">{docInfo.type}</span>
                                </div>
                              </div>
                              <button
                                disabled={isDownloading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadAttachment(attachment, msg._id);
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition shrink-0"
                                title="Download"
                              >
                                {isDownloading ? (
                                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiDownload className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {msg.message && (
                      <p className="whitespace-pre-wrap font-sans">{msg.message}</p>
                    )}

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

import React, { useState, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  FiGrid,
  FiImage,
  FiFilm,
  FiFileText,
  FiFolder,
  FiExternalLink,
  FiMessageSquare,
  FiDownload,
  FiPlay,
  FiUser,
  FiClock,
  FiPaperclip,
} from "react-icons/fi";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
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



const MediaGallery = ({ messages = [], onSelectMedia, onJumpToMessage }) => {
  const [activeCategory, setActiveCategory] = useState("all");
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

  const mediaItems = useMemo(() => {
    return messages
      .filter((m) => m && m.attachment && m.attachment.url)
      .map((m) => {
        const senderObj = typeof m.sender === "object" ? m.sender : {};
        return {
          id: m._id,
          messageId: m._id,
          attachment: m.attachment,
          senderName: senderObj.fullName || "User",
          senderAvatar: senderObj.avatar,
          createdAt: m.createdAt,
          messageText: m.message,
          rawMessage: m,
        };
      })
      .reverse();
  }, [messages]);

  const counts = useMemo(() => {
    let photos = 0;
    let videos = 0;
    let documents = 0;

    mediaItems.forEach((item) => {
      const mime = item.attachment.mimeType || "";
      if (mime.startsWith("image/")) photos++;
      else if (mime.startsWith("video/")) videos++;
      else documents++;
    });

    return { all: photos + videos, photos, videos, documents };
  }, [mediaItems]);

  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      const mime = item.attachment.mimeType || "";
      if (activeCategory === "photos") return mime.startsWith("image/");
      if (activeCategory === "videos") return mime.startsWith("video/");
      if (activeCategory === "documents")
        return !mime.startsWith("image/") && !mime.startsWith("video/");
      // 'all' represents all photos and videos
      return mime.startsWith("image/") || mime.startsWith("video/");
    });
  }, [mediaItems, activeCategory]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090B] overflow-hidden">
      <div className="px-6 py-3 border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-md flex items-center justify-between gap-4 overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "all"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            <FiGrid className="w-3.5 h-3.5" />
            <span>All</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("photos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "photos"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            <FiImage className="w-3.5 h-3.5" />
            <span>Photos</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.photos}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("videos")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "videos"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            <FiFilm className="w-3.5 h-3.5" />
            <span>Videos</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.videos}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("documents")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeCategory === "documents"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
            }`}
          >
            <FiFileText className="w-3.5 h-3.5" />
            <span>Documents</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
              {counts.documents}
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 select-none">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 mb-4">
              <FiFolder className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white font-display">No Shared Media Found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Files, images, and documents shared in this project conversation will automatically appear here.
            </p>
          </div>
        ) : activeCategory === "documents" ? (
          <div className="space-y-3 max-w-4xl mx-auto">
            {filteredItems.map((item, idx) => {
              const docInfo = getDocumentInfo(item.attachment.mimeType, item.attachment.originalName);
              const isDownloading = downloadingIds.has(item.id);
              return (
                <div
                  key={item.id || idx}
                  onClick={() => {
                    downloadAttachment(item.attachment, item.id);
                  }}
                  className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition flex items-center justify-between gap-4 shadow-md cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${docInfo.color} flex items-center justify-center text-xl shrink-0 border`}>
                      {getIconComponent(docInfo.icon)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition">
                        {item.attachment.originalName || "Document"}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 mt-1">
                        <span>{formatFileSize(item.attachment.size)}</span>
                        <span>•</span>
                        <span>{docInfo.type}</span>
                        <span>•</span>
                        <span>Shared by {item.senderName}</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      disabled={isDownloading}
                      onClick={() => downloadAttachment(item.attachment, item.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      title="Download file"
                    >
                      {isDownloading ? (
                        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiDownload className="w-3.5 h-3.5" />
                      )}
                      <span>Download</span>
                    </button>

                    {onJumpToMessage && (
                      <button
                        onClick={() => onJumpToMessage(item.messageId)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition cursor-pointer"
                        title="Jump to message"
                      >
                        <FiMessageSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredItems.map((item, idx) => {
              const mime = item.attachment.mimeType || "";
              const isImage = mime.startsWith("image/");
              const isVideo = mime.startsWith("video/");

              return (
                <div
                  key={item.id || idx}
                  onClick={() => onSelectMedia && onSelectMedia(item.attachment, item.senderName, item.createdAt, idx, filteredItems)}
                  className="group relative aspect-square rounded-2xl bg-black/40 border border-white/10 overflow-hidden cursor-pointer shadow-md hover:border-indigo-500/50 transition transform hover:-translate-y-0.5"
                >
                  {isImage && (
                    <img
                      src={item.attachment.url}
                      alt={item.attachment.originalName || "Media"}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}

                  {isVideo && (
                    <div className="relative w-full h-full bg-black/80 flex items-center justify-center">
                      <video
                        src={item.attachment.url}
                        className="w-full h-full object-cover opacity-60"
                        preload="metadata"
                      />
                      <div className="absolute w-10 h-10 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                        <FiPlay className="w-5 h-5 ml-0.5" />
                      </div>
                    </div>
                  )}

                  {!isImage && !isVideo && (
                    <div className="w-full h-full p-4 bg-gradient-to-br from-indigo-950/40 to-slate-900 flex flex-col items-center justify-center text-center">
                      <FiFileText className="w-8 h-8 text-indigo-400 mb-2" />
                      <p className="text-[10px] font-semibold text-white truncate max-w-full">
                        {item.attachment.originalName}
                      </p>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-end">
                    <p className="text-[10px] font-bold text-white truncate">
                      {item.attachment.originalName}
                    </p>
                    <p className="text-[9px] text-gray-300 truncate">
                      {item.senderName} • {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaGallery;

import React, { useState, useMemo } from "react";
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

const MediaGallery = ({ messages = [], onSelectMedia, onJumpToMessage }) => {
  const [activeCategory, setActiveCategory] = useState("all");

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

    return { all: mediaItems.length, photos, videos, documents };
  }, [mediaItems]);

  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      const mime = item.attachment.mimeType || "";
      if (activeCategory === "photos") return mime.startsWith("image/");
      if (activeCategory === "videos") return mime.startsWith("video/");
      if (activeCategory === "documents")
        return !mime.startsWith("image/") && !mime.startsWith("video/");
      return true;
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
            {filteredItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-white/10 transition flex items-center justify-between gap-4 shadow-md"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl shrink-0">
                    <FiFileText />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition">
                      {item.attachment.originalName || "Document"}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                      <span>{formatFileSize(item.attachment.size)}</span>
                      <span>• {item.senderName}</span>
                      <span>• {formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectMedia && onSelectMedia(item.attachment, item.senderName, item.createdAt, idx, filteredItems)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <FiExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
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
            ))}
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

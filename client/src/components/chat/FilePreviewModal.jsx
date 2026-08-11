import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  FiX,
  FiDownload,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiFileText,
  FiFilm,
  FiImage,
  FiUser,
  FiClock,
  FiZoomIn,
  FiZoomOut,
} from "react-icons/fi";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const FilePreviewModal = ({
  attachment,
  senderName,
  createdAt,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
}) => {
  const [zoomed, setZoomed] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAttachment = async () => {
    if (!attachment || !attachment.url) {
      toast.error("Unable to download this file. Invalid URL.");
      return;
    }

    if (isDownloading) return;
    setIsDownloading(true);

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
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!attachment || !attachment.url) return null;

  const mime = attachment.mimeType || "";
  const isImage = mime.startsWith("image/");
  const isVideo = mime.startsWith("video/");
  const isPdf = mime === "application/pdf";

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#0B1120] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0F172A]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              {isImage ? <FiImage className="w-5 h-5" /> : isVideo ? <FiFilm className="w-5 h-5" /> : <FiFileText className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate max-w-md font-display">
                {attachment.originalName || "Attachment"}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-0.5">
                {senderName && (
                  <span className="flex items-center gap-1">
                    <FiUser className="w-3 h-3 text-indigo-400" />
                    <span>{senderName}</span>
                  </span>
                )}
                {formattedDate && (
                  <span className="flex items-center gap-1">
                    <FiClock className="w-3 h-3 text-indigo-400" />
                    <span>{formattedDate}</span>
                  </span>
                )}
                <span>• {formatFileSize(attachment.size)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isImage && (
              <button
                onClick={() => setZoomed((prev) => !prev)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition cursor-pointer"
                title={zoomed ? "Zoom out" : "Zoom in"}
              >
                {zoomed ? <FiZoomOut className="w-4 h-4" /> : <FiZoomIn className="w-4 h-4" />}
              </button>
            )}

            <button
              disabled={isDownloading}
              onClick={(e) => {
                e.stopPropagation();
                downloadAttachment();
              }}
              className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Download original file"
            >
              {isDownloading ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiDownload className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isDownloading ? "Downloading..." : "Download"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
              title="Close viewer"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-[#09090B] flex items-center justify-center p-4 overflow-auto custom-scrollbar">
          {hasPrev && onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 shadow-xl transition transform hover:scale-110 cursor-pointer"
              title="Previous file"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
          )}

          {hasNext && onNext && (
            <button
              onClick={onNext}
              className="absolute right-4 z-20 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/10 shadow-xl transition transform hover:scale-110 cursor-pointer"
              title="Next file"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          )}

          {isImage && (
            <div className={`flex items-center justify-center transition-all duration-300 ${zoomed ? "scale-125 cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in"}`} onClick={() => setZoomed((prev) => !prev)}>
              <img
                src={attachment.url}
                alt={attachment.originalName || "Preview"}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
          )}

          {isVideo && (
            <div className="w-full max-w-4xl max-h-[75vh] flex items-center justify-center">
              <video
                src={attachment.url}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl"
              />
            </div>
          )}

          {!isImage && !isVideo && (
            <div className="p-8 max-w-md w-full rounded-3xl bg-white/5 border border-white/10 text-center flex flex-col items-center shadow-2xl">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600/20 to-blue-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl mb-4 shadow-xl shadow-indigo-500/10">
                <FiFileText />
              </div>
              <h4 className="text-base font-bold text-white mb-1 font-display break-all">
                {attachment.originalName || "Document"}
              </h4>
              <p className="text-xs text-gray-400 mb-6">
                {formatFileSize(attachment.size)} • {mime || "Unknown format"}
              </p>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiExternalLink className="w-4 h-4" />
                <span>Open / Download Document</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;

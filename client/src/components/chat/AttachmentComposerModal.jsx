import React, { useState, useEffect } from "react";
import { FiX, FiSend, FiFileText, FiFilm, FiImage, FiPaperclip } from "react-icons/fi";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const AttachmentComposerModal = ({
  file,
  onClose,
  onSend,
  uploading = false,
  uploadProgress = 0,
}) => {
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) return;
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  if (!file) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (uploading) return;
    onSend(caption);
  };

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isPdf = file.type === "application/pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0B1120]">
          <div className="flex items-center gap-2">
            <FiPaperclip className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white font-display">Send Attachment</h3>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4 flex flex-col items-center justify-center bg-[#09090B]">
          {isImage && previewUrl && (
            <div className="relative max-h-64 w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-white/10">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-h-64 max-w-full object-contain rounded-2xl"
              />
            </div>
          )}

          {isVideo && previewUrl && (
            <div className="relative max-h-64 w-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 border border-white/10">
              <video
                src={previewUrl}
                controls
                className="max-h-64 max-w-full rounded-2xl"
              />
            </div>
          )}

          {!isImage && !isVideo && (
            <div className="w-full p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 text-2xl">
                {isPdf ? <FiFileText /> : <FiPaperclip />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                <p className="text-xs text-gray-400 mt-1">{formatFileSize(file.size)} • {file.type || "Document"}</p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 truncate max-w-full text-center font-mono">
            {file.name} ({formatFileSize(file.size)})
          </p>

          {uploading && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-semibold text-indigo-300">
                <span>Uploading file...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 bg-[#0B1120] flex items-center gap-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={uploading}
            placeholder="Add an optional caption message..."
            className="flex-1 bg-[#09090B] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
          />

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/20 transition transform active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <FiSend className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AttachmentComposerModal;

import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiSmile, FiPaperclip, FiImage, FiFileText, FiFolder, FiX, FiFilm } from "react-icons/fi";
import { toast } from "react-hot-toast";
import EmojiPickerPopover from "./EmojiPickerPopover";

const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "text/plain",
];

const MessageComposer = ({ onSendMessage, disabled = false, uploading = false }) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [acceptType, setAcceptType] = useState("*/*");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachMenuRef = useRef(null);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !selectedFile) || disabled || isUploading) return;

    try {
      if (selectedFile) {
        setIsUploading(true);
        setUploadProgress(0);

        await onSendMessage(trimmed, selectedFile, (progress) => {
          setUploadProgress(progress);
        });

        setSelectedFile(null);
      } else {
        await onSendMessage(trimmed);
      }
      setText("");
      setShowEmojiPicker(false);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      console.error("Composer submit error:", err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const triggerFileInput = (accept) => {
    setAcceptType(accept);
    setShowAttachMenu(false);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, 50);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 50 MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.type && !allowedMimeTypes.includes(file.type)) {
      toast.error("This file type is not supported.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="sticky bottom-0 z-30 bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/10 p-3 sm:p-4">
      {selectedFile && (
        <div className="mb-3 max-w-6xl mx-auto p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 relative overflow-hidden animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0">
            {selectedFile.type.startsWith("image/") ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt={selectedFile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : selectedFile.type.startsWith("video/") ? (
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 text-xl">
                <FiFilm className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 text-xl">
                <FiFileText className="w-5 h-5" />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || "Document"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUploading && (
              <div className="flex flex-col items-end gap-1 mr-2">
                <span className="text-[10px] font-semibold text-indigo-400">Uploading {uploadProgress}%</span>
                <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              disabled={isUploading}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition disabled:opacity-50 cursor-pointer"
              title="Remove attachment"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptType}
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-6xl mx-auto">
        <EmojiPickerPopover
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={handleSelectEmoji}
        />

        <div className="relative" ref={attachMenuRef}>
          {showAttachMenu && (
            <div className="absolute bottom-14 left-0 z-40 w-52 bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl p-2 space-y-1 animate-fadeIn">
              <button
                type="button"
                onClick={() => triggerFileInput("image/*,video/*")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-gray-200 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <FiImage className="w-4 h-4" />
                </div>
                <span>Photos & Videos</span>
              </button>

              <button
                type="button"
                onClick={() => triggerFileInput(".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-gray-200 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FiFileText className="w-4 h-4" />
                </div>
                <span>Documents</span>
              </button>

              <button
                type="button"
                onClick={() => triggerFileInput("*/*")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold text-gray-200 transition cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <FiFolder className="w-4 h-4" />
                </div>
                <span>Other files</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setShowAttachMenu((prev) => !prev);
              setShowEmojiPicker(false);
            }}
            disabled={disabled || isUploading}
            className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
              showAttachMenu
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10"
            }`}
            title="Attach file"
          >
            <FiPaperclip className="w-5 h-5" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker((prev) => !prev);
            setShowAttachMenu(false);
          }}
          disabled={disabled || isUploading}
          className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
            showEmojiPicker
              ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
              : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10"
          }`}
          title="Add Emoji"
        >
          <FiSmile className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled || isUploading}
            placeholder="Write a message... (Press Enter to send, Shift+Enter for new line)"
            className="w-full bg-[#09090B] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none max-h-32 custom-scrollbar disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={(!text.trim() && !selectedFile) || disabled || isUploading}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:opacity-40 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/20 transition transform hover:scale-[1.03] active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
          title="Send Message"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;

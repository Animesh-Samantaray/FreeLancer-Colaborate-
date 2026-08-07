import React, { useState, useRef, useEffect } from "react";
import { FiSend, FiSmile } from "react-icons/fi";
import EmojiPickerPopover from "./EmojiPickerPopover";

const MessageComposer = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  // Auto focus on mount or when disabled finishes
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText("");
    setShowEmojiPicker(false);

    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
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
    // Auto grow height up to max
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div className="sticky bottom-0 z-30 bg-[#0F172A]/95 backdrop-blur-xl border-t border-white/10 p-3 sm:p-4">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 max-w-6xl mx-auto">
        {/* Emoji Selector Popover */}
        <EmojiPickerPopover
          isOpen={showEmojiPicker}
          onClose={() => setShowEmojiPicker(false)}
          onSelectEmoji={handleSelectEmoji}
        />

        {/* Emoji Trigger Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={`p-2.5 rounded-xl border transition cursor-pointer shrink-0 ${
            showEmojiPicker
              ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
              : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/10"
          }`}
          title="Add Emoji"
        >
          <FiSmile className="w-5 h-5" />
        </button>

        {/* Flexible Auto-expanding Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Write a message... (Press Enter to send, Shift+Enter for new line)"
            className="w-full bg-[#09090B] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none max-h-32 custom-scrollbar disabled:opacity-50"
          />
        </div>

        {/* Primary Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
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

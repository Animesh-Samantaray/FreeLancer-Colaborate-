import React, { useState, useEffect, useRef } from "react";
import { FiSmile, FiX } from "react-icons/fi";

const EMOJI_CATEGORIES = [
  {
    name: "Popular",
    emojis: ["👍", "❤️", "😊", "🔥", "🚀", "🎉", "👏", "🙌", "✅", "💯"],
  },
  {
    name: "Smileys",
    emojis: ["😃", "😂", "😅", "😇", "😍", "🤩", "😎", "🤔", "🧐", "😏", "🥳", "😭", "😤", "😴"],
  },
  {
    name: "Gestures",
    emojis: ["👋", "✋", "👌", "✌️", "🤞", "🤝", "💪", "👊", "🙏", "👀", "✍️"],
  },
  {
    name: "Work & Tech",
    emojis: ["💻", "📱", "📊", "📁", "✏️", "📌", "💡", "⚡", "🎯", "🏆", "⏳", "🔔"],
  },
];

const EmojiPickerPopover = ({ onSelectEmoji, isOpen, onClose }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-14 left-0 z-50 w-72 sm:w-80 rounded-2xl border border-white/15 bg-[#0F172A]/95 backdrop-blur-2xl p-3 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 px-1">
        <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          <FiSmile className="text-indigo-400" /> Choose Emoji
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {EMOJI_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-1 px-1">
              {cat.name}
            </p>
            <div className="grid grid-cols-7 gap-1">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelectEmoji(emoji);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg rounded-xl hover:bg-white/15 hover:scale-125 transition transform cursor-pointer active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPickerPopover;

import React, { useState, useEffect, useRef } from "react";
import { FiSmile, FiX, FiSearch } from "react-icons/fi";

const EMOJI_CATEGORIES = [
  {
    name: "Popular",
    emojis: ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "🎉", "🚀", "👏", "🙌", "✅", "💯", "⭐", "💡"],
  },
  {
    name: "Smileys & Expressions",
    emojis: ["😃", "😅", "😇", "😍", "🤩", "😎", "🤔", "🧐", "😏", "🥳", "😭", "😤", "😴", "😡", "🤯", "🙈", "😜", "🙄", "😳", "🤪", "😷"],
  },
  {
    name: "Gestures & Hands",
    emojis: ["👋", "✋", "👌", "✌️", "🤞", "🤝", "💪", "👊", "👀", "✍️", "👈", "👉", "👆", "👇", "🤜", "🤛"],
  },
  {
    name: "Work & Tech",
    emojis: ["💻", "📱", "📊", "📁", "✏️", "📌", "⚡", "🎯", "🏆", "⏳", "🔔", "✨", "💔", "💬", "🔒", "🔑", "⚠️", "❌"],
  },
  {
    name: "Fun & Objects",
    emojis: ["🍕", "☕", "🍺", "🎈", "🎁", "⚽", "🎮", "🎵", "🎨", "🌺", "🌸", "🍀", "🐶", "🐱", "🐼", "🦁"],
  },
];

const EmojiPickerPopover = ({ onSelectEmoji, isOpen, onClose }) => {
  const popoverRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

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

  const filteredCategories = EMOJI_CATEGORIES.map((cat) => {
    if (!searchTerm.trim()) return cat;
    const filteredEmojis = cat.emojis.filter((emoji) => emoji.includes(searchTerm.trim()));
    return { ...cat, emojis: filteredEmojis };
  }).filter((cat) => cat.emojis.length > 0);

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
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative mb-2.5">
        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
        <input
          type="text"
          placeholder="Search emoji..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500/50 transition"
        />
      </div>

      <div className="max-h-56 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
        {filteredCategories.map((cat) => (
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
        {filteredCategories.length === 0 && (
          <div className="py-6 text-center text-xs text-gray-400">
            No emojis found
          </div>
        )}
      </div>
    </div>
  );
};

export default EmojiPickerPopover;


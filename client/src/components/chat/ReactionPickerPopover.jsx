import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiSearch, FiX, FiSmile, FiArrowLeft } from "react-icons/fi";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ALL_EMOJI_CATEGORIES = [
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
    name: "Work & Symbols",
    emojis: ["💻", "📱", "📊", "📁", "✏️", "📌", "⚡", "🎯", "🏆", "⏳", "🔔", "✨", "💔", "💬", "🔒", "🔑", "⚠️", "❌"],
  },
  {
    name: "Fun & Objects",
    emojis: ["🍕", "☕", "🍺", "🎈", "🎁", "⚽", "🎮", "🎵", "🎨", "🌺", "🌸", "🍀", "🐶", "🐱", "🐼", "🦁"],
  },
];

const ReactionPickerPopover = ({ onSelectEmoji, isOpen, onClose, isOutgoing }) => {
  const popoverRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDownward, setOpenDownward] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsExpanded(false);
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && popoverRef.current) {
      const parent = popoverRef.current.parentElement;
      const targetRect = parent ? parent.getBoundingClientRect() : popoverRef.current.getBoundingClientRect();
      const scrollContainer = popoverRef.current.closest(".overflow-y-auto");
      
      let spaceAbove = targetRect.top;
      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        spaceAbove = targetRect.top - containerRect.top;
      }

      const requiredSpace = isExpanded ? 300 : 50;
      if (spaceAbove < requiredSpace) {
        setOpenDownward(true);
      } else {
        setOpenDownward(false);
      }
    }
  }, [isOpen, isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCategories = ALL_EMOJI_CATEGORIES.map((cat) => {
    if (!searchTerm.trim()) return cat;
    const filteredEmojis = cat.emojis.filter((emoji) => emoji.includes(searchTerm.trim()));
    return { ...cat, emojis: filteredEmojis };
  }).filter((cat) => cat.emojis.length > 0);

  if (!isExpanded) {
    return (
      <div
        ref={popoverRef}
        className={`absolute z-40 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full border border-white/20 bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150 select-none ${
          openDownward ? "top-full mt-2" : "-top-12"
        } ${isOutgoing ? "right-0" : "left-0"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectEmoji(emoji);
              onClose();
            }}
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg rounded-full hover:bg-white/20 hover:scale-125 active:scale-95 transition transform cursor-pointer"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
        <div className="w-[1px] h-5 bg-white/20 mx-0.5" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-300 hover:text-white rounded-full hover:bg-white/20 hover:scale-110 active:scale-95 transition transform cursor-pointer"
          title="More emojis"
        >
          <FiPlus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={popoverRef}
      className={`absolute z-50 w-72 sm:w-80 rounded-2xl border border-white/20 bg-[#0F172A]/95 backdrop-blur-2xl p-3 shadow-2xl shadow-black/90 animate-in fade-in zoom-in-95 duration-150 select-none ${
        openDownward ? "top-full mt-2" : "bottom-full mb-2"
      } ${isOutgoing ? "right-0" : "left-0"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2 px-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(false);
          }}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-xs"
          title="Back to quick reactions"
        >
          <FiArrowLeft className="w-3.5 h-3.5" />
          <span>Quick</span>
        </button>
        <span className="text-xs font-semibold text-gray-200 flex items-center gap-1.5">
          <FiSmile className="text-indigo-400" /> React to message
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
          title="Close"
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

      <div className="max-h-48 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEmoji(emoji);
                    onClose();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-lg rounded-xl hover:bg-white/20 hover:scale-125 transition transform cursor-pointer active:scale-95"
                  title={`React with ${emoji}`}
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

export default ReactionPickerPopover;


import React, { useEffect, useRef } from "react";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ReactionPickerPopover = ({ onSelectEmoji, isOpen, onClose, isOutgoing }) => {
  const popoverRef = useRef(null);

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

  return (
    <div
      ref={popoverRef}
      className={`absolute -top-12 z-40 flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full border border-white/20 bg-[#0F172A]/95 backdrop-blur-xl shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-150 select-none ${
        isOutgoing ? "right-0" : "left-0"
      }`}
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
    </div>
  );
};

export default ReactionPickerPopover;

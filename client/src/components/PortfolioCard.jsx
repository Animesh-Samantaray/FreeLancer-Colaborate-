import React from "react";
import { FiExternalLink, FiFolder, FiTrash2 } from "react-icons/fi";

const PortfolioCard = ({ title, link, onRemove, editable = false }) => {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all duration-300 hover:border-[#6366F1]/40 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-[#6366F1]/10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1]/20 to-[#3B82F6]/20 flex items-center justify-center text-[#6366F1] border border-white/10 group-hover:scale-105 transition">
            <FiFolder className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white line-clamp-1">{title || "Untitled Project"}</h4>
            {link && (
              <a
                href={link.startsWith("http") ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-[#3B82F6] flex items-center gap-1 mt-0.5 transition line-clamp-1"
              >
                <span>Visit Project</span>
                <FiExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {editable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
            title="Remove Project"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PortfolioCard;

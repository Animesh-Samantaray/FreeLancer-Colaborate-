import React, { useState } from "react";
import { getBadgeConfig } from "../../config/badgeConfig";

const BadgeEmblem = ({ badgeKey, size = "md", customTitle, customImage }) => {
  const [imageError, setImageError] = useState(false);
  const config = getBadgeConfig(badgeKey);

  const Icon = config.icon;
  const imagePath = customImage || `/src/assets/badges/${config.assetName}`;

  const sizeClasses = {
    sm: "w-10 h-10 text-base",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
    xl: "w-32 h-32 text-5xl",
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;

  if (!imageError && config.assetName) {
    return (
      <div className={`relative flex items-center justify-center ${containerSize} shrink-0`}>
        <img
          src={imagePath}
          alt={customTitle || config.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-contain filter drop-shadow-lg transition-transform duration-300 hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient} ${containerSize} shrink-0 p-3 shadow-lg border border-white/20 transition-all duration-300 hover:scale-105`}
      style={{
        boxShadow: `0 0 20px ${config.bgGlow}`,
      }}
    >
      <div className="absolute inset-0.5 rounded-xl bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
        <Icon className="text-white drop-shadow-md" />
      </div>
    </div>
  );
};

export default BadgeEmblem;

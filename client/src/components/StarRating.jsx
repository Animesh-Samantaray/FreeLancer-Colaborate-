import React, { useState } from "react";
import { FiStar } from "react-icons/fi";

const StarRating = ({
  rating = 0,
  maxStars = 5,
  interactive = false,
  onRatingChange = () => {},
  size = "w-5 h-5",
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const currentDisplay = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= Math.round(currentDisplay);

        return (
          <button
            key={index}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-transform duration-150 ${
              interactive
                ? "cursor-pointer hover:scale-110 focus:outline-none"
                : "cursor-default"
            }`}
            aria-label={`${starValue} Star${starValue > 1 ? "s" : ""}`}
          >
            <FiStar
              className={`${size} ${
                isFilled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-500 hover:text-amber-300"
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;

import { Star, StarHalf } from "lucide-react";
import { getStarArray } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  count?: number;
}

export default function StarRating({ rating, size = "md", showValue = true, count }: StarRatingProps) {
  const stars = getStarArray(rating);
  const sizeMap = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const textMap = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {stars.map((star, i) => {
          if (star === "full") return <Star key={i} className={`${iconSize} fill-amber-400 text-amber-400`} />;
          if (star === "half") return <StarHalf key={i} className={`${iconSize} fill-amber-400 text-amber-400`} />;
          return <Star key={i} className={`${iconSize} text-gray-200`} />;
        })}
      </div>
      {showValue && (
        <span className={`${textMap[size]} font-medium text-foreground ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className={`${textMap[size]} text-muted-foreground`}>
          ({count})
        </span>
      )}
    </div>
  );
}

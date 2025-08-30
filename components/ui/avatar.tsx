import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  fallback?: React.ReactNode;
  size?: number;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, fallback, children, size = 40, ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false);

    const getInitials = (fullName: string) => {
      if (!fullName) return "U";
      const words = fullName.trim().split(" ");
      
      if (words.length === 1) {
        return words[0][0].toUpperCase();
      } else if (words.length === 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      } else if (words.length >= 3) {
        return (words[0][0] + words[2][0]).toUpperCase();
      }
      
      return "U";
    };

    const shouldShowImage = src && !imageError && src.trim() !== "";
    const fallbackContent = fallback || (name ? getInitials(name) : children) || "U";

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden rounded-full bg-muted",
          className
        )}
        style={{ width: size, height: size }}
        {...props}
      >
        {shouldShowImage ? (
          <Image
            src={src}
            alt={alt || name || "Avatar"}
            width={size}
            height={size}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="flex items-center justify-center h-full w-full text-sm font-medium text-muted-foreground select-none">
            {fallbackContent}
          </span>
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar }

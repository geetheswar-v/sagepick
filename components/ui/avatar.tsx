import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

interface AvatarImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof Image>,
  AvatarImageProps
>(({ className, alt, src, width = 40, height = 40, ...props }, ref) => {
  if (!src || src.trim() === "") {
    return null;
  }

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
})
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
}

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  AvatarFallbackProps
>(({ className, name, children, ...props }, ref) => {
  const getInitials = (fullName: string) => {
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

  const displayText = name ? getInitials(name) : children;

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-medium",
        className
      )}
      {...props}
    >
      {displayText}
    </div>
  );
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }

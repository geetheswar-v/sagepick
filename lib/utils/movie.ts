// Movie utility functions

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type ImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

/**
 * Get full TMDB image URL
 * @param path - Image path from API (e.g., "/path/to/image.jpg")
 * @param size - Image size (default: 'w500')
 * @returns Full image URL or placeholder
 */
export function getImageUrl(
  path?: string | null,
  size: ImageSize = "w500"
): string {
  if (!path) {
    // Return a data URL with a gradient placeholder
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzMzMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxMTEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0idXJsKCNnKSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+";
  }
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * Get poster URL with appropriate size
 */
export function getPosterUrl(
  posterPath?: string | null,
  size: ImageSize = "w342"
): string {
  return getImageUrl(posterPath, size);
}

/**
 * Get backdrop URL with appropriate size
 */
export function getBackdropUrl(
  backdropPath?: string | null,
  size: ImageSize = "w780"
): string {
  return getImageUrl(backdropPath, size);
}

/**
 * Format release date
 */
export function formatReleaseDate(dateString?: string): string {
  if (!dateString) return "TBA";

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/**
 * Get year from release date
 */
export function getYear(dateString?: string): string {
  if (!dateString) return "TBA";
  return new Date(dateString).getFullYear().toString();
}

/**
 * Format runtime (minutes to hours and minutes)
 */
export function formatRuntime(minutes?: number): string {
  if (!minutes) return "Unknown";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Format rating percentage
 */
export function formatRatingPercentage(rating?: number): string {
  if (!rating) return "NR";
  return `${Math.round(rating * 10)}%`;
}

/**
 * Get rating color class
 */
export function getRatingColor(rating?: number): string {
  if (!rating) return "text-muted-foreground";

  if (rating >= 7.5) return "text-green-500";
  if (rating >= 6.0) return "text-yellow-500";
  return "text-red-500";
}

/**
 * Format number with commas
 */
export function formatNumber(num?: number): string {
  if (!num) return "N/A";
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format currency
 */
export function formatCurrency(amount?: number): string {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get watchlist status label
 */
export function getWatchlistStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLAN_TO_WATCH: "Plan to Watch",
    WATCHING: "Watching",
    COMPLETED: "Completed",
    ON_HOLD: "On Hold",
    DROPPED: "Dropped",
  };
  return labels[status] || status;
}

/**
 * Get watchlist status color
 */
export function getWatchlistStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PLAN_TO_WATCH: "bg-blue-500",
    WATCHING: "bg-green-500",
    COMPLETED: "bg-purple-500",
    ON_HOLD: "bg-yellow-500",
    DROPPED: "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

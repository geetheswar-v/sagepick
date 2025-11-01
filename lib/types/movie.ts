// Types based on Core Service API responses

export interface Genre {
  id: number;
  name: string;
}

export interface Keyword {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  original_title?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  original_language?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
  adult?: boolean;
  genres?: Genre[];
  keywords?: Keyword[];
}

export interface MovieDetail extends Movie {
  genres: Genre[];
  keywords: Keyword[];
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface MoviesResponse {
  data: Movie[];
  pagination: PaginationInfo;
}

export interface Category {
  key: string;
  name: string;
}

export interface MovieStats {
  total_movies: number;
  total_genres: number;
  total_keywords: number;
  adult_movies: number;
  non_adult_movies: number;
}

// User-Movie Relationship Types
export type WatchlistStatus =
  | "PLAN_TO_WATCH"
  | "WATCHING"
  | "COMPLETED"
  | "ON_HOLD"
  | "DROPPED";

export interface UserMovieRating {
  id: number;
  userId: string;
  tmdbId: number;
  rating: number;
  review?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWatchlist {
  id: number;
  userId: string;
  tmdbId: number;
  status: WatchlistStatus;
  progress?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFavorite {
  id: number;
  userId: string;
  tmdbId: number;
  createdAt: Date;
}

// Combined types for UI
export interface MovieWithUserData extends Movie {
  userRating?: UserMovieRating;
  watchlistStatus?: UserWatchlist;
  isFavorite?: boolean;
}

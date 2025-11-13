// Types based on Core Service API responses

export interface Genre {
  id: number;
  name: string;
}

export interface Keyword {
  id: number;
  name: string;
}

// MovieListItem - used in paginated responses (discover, search, movies list)
export interface Movie {
  id: number; // Internal database ID (movie_id)
  tmdb_id: number; // TMDB ID (for reference)
  title: string;
  overview: string | null;
  backdrop_path: string | null;
  poster_path: string | null;
  adult: boolean;
  popularity: number;
  vote_average: number;
  release_date: string | null;
}

// MovieFullDetail - used in single movie detail responses
export interface MovieDetail {
  id: number;
  tmdb_id: number;
  title: string;
  original_title: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  original_language: string;
  release_date: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime: number | null;
  budget: number | null;
  revenue: number | null;
  status: string | null;
  adult: boolean;
  genres: Genre[];
  keywords: Keyword[];
}

// RankedMovieItem - used in cold-start recommendation responses
export interface RankedMovie extends Movie {
  rank_score: number;
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

export interface RankedMoviesResponse {
  data: RankedMovie[];
  pagination: PaginationInfo;
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
  movieId: number; // Changed from tmdbId to movieId
  rating: number;
  review?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWatchlist {
  id: number;
  userId: string;
  movieId: number; // Changed from tmdbId to movieId
  status: WatchlistStatus;
  progress?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFavorite {
  id: number;
  userId: string;
  movieId: number; // Changed from tmdbId to movieId
  createdAt: Date;
}

// Combined types for UI
export interface MovieWithUserData extends Movie {
  userRating?: UserMovieRating;
  watchlistStatus?: UserWatchlist;
  isFavorite?: boolean;
}

// Cold Start Preferences Input
export interface ColdStartPreferences {
  genre_ids: number[];
  languages: string[];
  release_year_ranges: ("modern" | "recent" | "classic" | "retro" | "all")[];
  keywords?: string[];
}

// Discovery/Search Filter Parameters
export interface DiscoverParams {
  page?: number;
  per_page?: number;
  with_genres?: string; // comma-separated genre IDs
  without_genres?: string;
  with_keywords?: string;
  without_keywords?: string;
  language?: string;
  region?: string;
  release_year?: number;
  release_date_gte?: string; // YYYY-MM-DD
  release_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  include_adult?: boolean;
  sort_by?: string;
}

export interface SearchParams {
  query: string;
  page?: number;
  per_page?: number;
  include_adult?: boolean;
  year?: number;
  min_rating?: number;
  with_genres?: string;
  language?: string;
}

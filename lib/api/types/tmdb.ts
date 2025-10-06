// Base interfaces
export interface PaginationParams {
  page?: number;
}

export interface TMDBImage {
  aspect_ratio: number;
  height: number;
  iso_639_1?: string;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path?: string;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBMovie {
  id: number;
  imdb_id?: string;
  adult: boolean;
  backdrop_path?: string;
  belongs_to_collection?: unknown;
  budget?: number;
  genres?: TMDBGenre[]; // Only available in detailed requests
  genre_ids: number[]; // Always available in list endpoints
  homepage?: string;
  original_language: string;
  original_title: string;
  overview?: string;
  popularity: number;
  poster_path?: string;
  production_companies?: TMDBProductionCompany[]; // Only in detailed requests
  production_countries?: TMDBProductionCountry[]; // Only in detailed requests
  release_date: string;
  revenue?: number;
  runtime?: number;
  spoken_languages?: TMDBSpokenLanguage[]; // Only in detailed requests
  status?: string;
  tagline?: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  origin_country?: string[];
}

export interface TMDBTVShow {
  id: number;
  adult: boolean;
  backdrop_path?: string;
  created_by?: unknown[];
  episode_run_time?: number[];
  first_air_date: string;
  genres?: TMDBGenre[]; // Only available in detailed requests
  genre_ids: number[]; // Always available in list endpoints
  homepage?: string;
  in_production?: boolean;
  languages?: string[];
  last_air_date?: string;
  last_episode_to_air?: unknown;
  name: string;
  next_episode_to_air?: unknown;
  networks?: unknown[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview?: string;
  popularity: number;
  poster_path?: string;
  production_companies?: TMDBProductionCompany[];
  production_countries?: TMDBProductionCountry[];
  seasons?: unknown[];
  spoken_languages?: TMDBSpokenLanguage[];
  status?: string;
  tagline?: string;
  type?: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

// Search parameters
export interface MovieSearchParams extends PaginationParams {
  query?: string;
  include_adult?: boolean;
  region?: string;
  year?: number;
  primary_release_year?: number;
  with_genres?: string;
  without_genres?: string;
  with_original_language?: string;
  with_origin_country?: string;
  sort_by?:
    | "popularity.desc"
    | "popularity.asc"
    | "release_date.desc"
    | "release_date.asc"
    | "vote_average.desc"
    | "vote_average.asc";
  certification_country?: string;
  certification?: string;
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "release_date.gte"?: string;
  "release_date.lte"?: string;
}

export interface TVSearchParams extends PaginationParams {
  query?: string;
  include_adult?: boolean;
  first_air_date_year?: number;
  with_genres?: string;
  without_genres?: string;
  with_original_language?: string;
  with_origin_country?: string;
  sort_by?:
    | "popularity.desc"
    | "popularity.asc"
    | "first_air_date.desc"
    | "first_air_date.asc"
    | "vote_average.desc"
    | "vote_average.asc";
  "vote_average.gte"?: number;
  "vote_average.lte"?: number;
  "first_air_date.gte"?: string;
  "first_air_date.lte"?: string;
}

export interface MovieItem {
  id: number;
  providerId: string; // TMDB id normalized as string
  mediaType: "MOVIE";
  providerType: "TMDB";
  title: string; // English title or original title
  alt_titles: string[]; // Original title, translated titles
  synopsis: string;
  score_by_imdb: number; // vote_average from TMDB
  score: number; // Normalized score value for media table
  cover_image: string; // Poster image URL
  backdrop_image: string; // Backdrop image URL
  status: string;
  year: number;
  genres: string[]; // Genre names resolved from genre_ids
  countries: string[];
  languages: string[];
  popularity: number;
  adult: boolean;
}

export interface TVItem {
  id: number;
  providerId: string; // TMDB id normalized as string
  mediaType: "TV";
  providerType: "TMDB";
  title: string; // English name or original name
  alt_titles: string[]; // Original name, translated names
  synopsis: string;
  score_by_imdb: number; // vote_average from TMDB
  score: number; // Normalized score value for media table
  cover_image: string; // Poster image URL
  backdrop_image: string; // Backdrop image URL
  status: string;
  first_air_year: number;
  genres: string[]; // Genre names resolved from genre_ids
  countries: string[];
  languages: string[];
  popularity: number;
  adult: boolean;
}

// Base interfaces for Jikan API
export interface PaginationParams {
  limit?: number;
  page?: number;
}

export interface OrderParams {
  [key: string]: "asc" | "desc";
}

export interface AnimeImages {
  jpg: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
  webp: {
    image_url: string;
    small_image_url: string;
    large_image_url: string;
  };
}

export interface AnimeTrailer {
  youtube_id?: string;
  url?: string;
  embed_url?: string;
}

export interface AnimeTitle {
  type: string;
  title: string;
}

export interface AnimeGenre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeStudio {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface AnimeProducer {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface JikanAnime {
  mal_id: number;
  url: string;
  images: AnimeImages;
  trailer?: AnimeTrailer;
  approved: boolean;
  titles: AnimeTitle[];
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms: string[];
  type:
    | "TV"
    | "Movie"
    | "OVA"
    | "Special"
    | "ONA"
    | "Music"
    | "CM"
    | "PV"
    | "TV Special";
  source: string;
  episodes?: number;
  status: "Finished Airing" | "Currently Airing" | "Not yet aired";
  airing: boolean;
  aired: {
    from?: string;
    to?: string;
    prop: {
      from: { day?: number; month?: number; year?: number };
      to: { day?: number; month?: number; year?: number };
    };
    string: string;
  };
  duration: string;
  rating: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  synopsis?: string;
  background?: string;
  season?: "spring" | "summer" | "fall" | "winter";
  year?: number;
  broadcast?: {
    day?: string;
    time?: string;
    timezone?: string;
    string: string;
  };
  producers: AnimeProducer[];
  licensors: AnimeProducer[];
  studios: AnimeStudio[];
  genres: AnimeGenre[];
  explicit_genres: AnimeGenre[];
  themes: AnimeGenre[];
  demographics: AnimeGenre[];
}

export interface JikanAnimeResponse {
  data: JikanAnime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export interface AnimeSearchParams extends PaginationParams {
  q?: string;
  type?:
    | "tv"
    | "movie"
    | "ova"
    | "special"
    | "ona"
    | "music"
    | "cm"
    | "pv"
    | "tv_special";
  score?: number;
  min_score?: number;
  max_score?: number;
  status?: "airing" | "complete" | "upcoming";
  rating?: "g" | "pg" | "pg13" | "r17" | "r" | "rx";
  sfw?: boolean;
  genres?: string;
  genres_exclude?: string;
  order_by?:
    | "mal_id"
    | "title"
    | "start_date"
    | "end_date"
    | "episodes"
    | "score"
    | "scored_by"
    | "rank"
    | "popularity"
    | "members"
    | "favorites";
  sort?: "desc" | "asc";
  letter?: string;
  producers?: string;
  start_date?: string;
  end_date?: string;
  unapproved?: boolean;
}

export interface AnimeItem {
  id: number;
  title: string; // Always English, fallback to title
  synopsis: string;
  alt_titles: string[]; // All synonyms and their own language titles
  score_by_mal: number;
  cover_image: string; // large_jpg or large_webp
  backdrop_image: string;
  anime_type: string; // TV, ONA, Special, Movie, etc.
  episodes?: number;
  genres: string[];
  tags: string[]; // Themes and demographics combined
  year?: number;
  status: string;
  rating: string;
  duration: string;
  studios: string[];
  season?: string;
  airing: boolean;
  airing_from?: string; // Start date
  airing_to?: string; // End date
  adult: boolean; // Based on rating (R+/Rx = adult)
}

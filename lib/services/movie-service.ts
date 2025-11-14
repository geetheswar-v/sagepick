// Core Service API client
import type {
  MovieDetail,
  MoviesResponse,
  RankedMoviesResponse,
  Genre,
  MovieStats,
  DiscoverParams,
  SearchParams,
  ColdStartPreferences,
} from "@/lib/types/movie";

const CORE_SERVICE_URL =
  process.env.CORE_SERVICE_URL || "https://core.sagepick.in";
const BEARER_TOKEN = process.env.CORE_SERVICE_BEARER_TOKEN || "";

const API_BASE = `${CORE_SERVICE_URL}/api/v1`;

// Fetch wrapper with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${BEARER_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    next: {
      revalidate: 3600, // Cache for 1 hour by default
      ...options.next,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
  }

  return response.json();
}

// ===========================================
// CORE ENDPOINTS
// ===========================================

/**
 * Get paginated list of movies with basic filtering
 */
export async function getMovies(
  params?: SearchParams
): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/movies${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return fetchWithAuth(url);
}

/**
 * Get movie details by internal movie ID
 */
export async function getMovieById(movieId: number): Promise<MovieDetail> {
  const url = `${API_BASE}/movies/${movieId}`;
  return fetchWithAuth(url);
}

/**
 * Get movie statistics
 */
export async function getMovieStats(): Promise<MovieStats> {
  const url = `${API_BASE}/movies/stats`;
  return fetchWithAuth(url);
}

// ===========================================
// DISCOVERY & SEARCH ENDPOINTS
// ===========================================

/**
 * Get all available genres
 */
export async function getGenres(): Promise<Genre[]> {
  const url = `${API_BASE}/genres`;
  return fetchWithAuth(url);
}

/**
 * Discover movies with extensive filtering (uses TMDB API + auto-sync)
 */
export async function discoverMovies(
  params?: DiscoverParams
): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/discover${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return fetchWithAuth(url);
}

/**
 * Search movies in local database (fast, no TMDB API calls)
 */
export async function searchMovies(
  params: SearchParams
): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE}/search?${queryParams.toString()}`;
  return fetchWithAuth(url);
}

/**
 * Search movies from TMDB (slower, auto-inserts to database)
 */
export async function searchMoviesTMDB(
  params: SearchParams
): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${API_BASE}/search/tmdb?${queryParams.toString()}`;
  return fetchWithAuth(url);
}

// ===========================================
// RECOMMENDATIONS ENDPOINTS
// ===========================================

/**
 * Get cold-start recommendations based on user preferences
 * Ideal for new users with 0-14 interactions
 */
export async function getColdStartRecommendations(
  preferences: ColdStartPreferences,
  params?: {
    page?: number;
    per_page?: number;
    include_adult?: boolean;
  }
): Promise<RankedMoviesResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/recommendations/cold-start${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  return fetchWithAuth(url, {
    method: "POST",
    body: JSON.stringify(preferences),
  });
}

// ===========================================
// CONVENIENCE FUNCTIONS
// ===========================================

/**
 * Get trending movies (sorted by popularity)
 */
export async function getTrendingMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return discoverMovies({
    page,
    per_page: perPage,
    sort_by: "popularity.desc",
    vote_count_gte: 100, // Ensure quality
  });
}

/**
 * Get top rated movies
 */
export async function getTopRatedMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return discoverMovies({
    page,
    per_page: perPage,
    sort_by: "vote_average.desc",
    vote_count_gte: 500, // Ensure enough votes
  });
}

/**
 * Get recently released movies
 */
export async function getRecentMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  const currentDate = new Date().toISOString().split("T")[0];
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return discoverMovies({
    page,
    per_page: perPage,
    release_date_gte: sixMonthsAgo,
    release_date_lte: currentDate,
    sort_by: "release_date.desc",
  });
}

/**
 * Get movies by specific genre IDs with quality filters
 */
export async function getMoviesByGenre(
  genreIds: number[],
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return discoverMovies({
    page,
    per_page: perPage,
    with_genres: genreIds.join(","),
    sort_by: "popularity.desc",
    vote_count_gte: 100, // Ensure popular movies
    vote_average_gte: 6.0, // Minimum quality
  });
}

/**
 * Get movies by language with quality filters
 */
export async function getMoviesByLanguage(
  language: string,
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return discoverMovies({
    page,
    per_page: perPage,
    language,
    sort_by: "popularity.desc",
    vote_count_gte: 50, // Ensure movies have enough votes
    vote_average_gte: 6.0, // Minimum rating of 6.0
  });
}

/**
 * Get Bollywood movies (Hindi language)
 */
export async function getBollywoodMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return getMoviesByLanguage("hi", page, perPage);
}

/**
 * Get Hollywood movies (English language)
 */
export async function getHollywoodMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return getMoviesByLanguage("en", page, perPage);
}

/**
 * Get movies by language with relaxed quality filters
 * Use this for regional languages that might have fewer highly-rated movies
 */
export async function getMoviesByLanguageRelaxed(
  language: string,
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return discoverMovies({
    page,
    per_page: perPage,
    language,
    sort_by: "popularity.desc",
    vote_count_gte: 20, // More relaxed - at least 20 votes
    vote_average_gte: 5.5, // More relaxed - minimum 5.5 rating
  });
}

/**
 * Get movies by genre and language combination with smart quality filters
 */
export async function getMoviesByGenreAndLanguage(
  genreIds: number[],
  language: string,
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  // Use relaxed filters for regional content
  const voteThreshold = ["hi", "en"].includes(language) ? 100 : 30;
  const ratingThreshold = ["hi", "en"].includes(language) ? 6.5 : 6.0;

  return discoverMovies({
    page,
    per_page: perPage,
    with_genres: genreIds.join(","),
    language,
    sort_by: "popularity.desc",
    vote_count_gte: voteThreshold,
    vote_average_gte: ratingThreshold,
  });
}

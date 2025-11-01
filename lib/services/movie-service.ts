// Core Service API client
import type {
  MovieDetail,
  MoviesResponse,
  Genre,
  Category,
  MovieStats,
} from "@/lib/types/movie";

const CORE_SERVICE_URL =
  process.env.CORE_SERVICE_URL || "http://localhost:8000";
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

// Movies Endpoints

export async function getMovies(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  genre?: string;
  exclude_genre?: string;
  min_popularity?: number;
  adult?: boolean;
}): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/movies/?${queryParams.toString()}`;
  return fetchWithAuth(url);
}

export async function getMovieById(movieId: number): Promise<MovieDetail> {
  const url = `${API_BASE}/movies/${movieId}`;
  return fetchWithAuth(url);
}

export async function getMovieByTmdbId(tmdbId: number): Promise<MovieDetail> {
  const url = `${API_BASE}/movies/tmdb/${tmdbId}`;
  return fetchWithAuth(url);
}

export async function getMovieStats(): Promise<MovieStats> {
  const url = `${API_BASE}/movies/stats`;
  return fetchWithAuth(url);
}

// Discovery Endpoints

export async function getGenres(): Promise<Genre[]> {
  const url = `${API_BASE}/genres`;
  return fetchWithAuth(url);
}

export async function getCategories(): Promise<Category[]> {
  const url = `${API_BASE}/categories`;
  return fetchWithAuth(url);
}

export async function getMoviesByCategory(
  category: string,
  params?: {
    page?: number;
    per_page?: number;
  }
): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/category/${category}?${queryParams.toString()}`;
  return fetchWithAuth(url);
}

export async function discoverMovies(params?: {
  page?: number;
  per_page?: number;
  with_genres?: string;
  without_genres?: string;
  with_keywords?: string;
  without_keywords?: string;
  language?: string;
  region?: string;
  release_year?: number;
  release_date_gte?: string;
  release_date_lte?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  include_adult?: boolean;
  sort_by?: string;
}): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/discover?${queryParams.toString()}`;
  return fetchWithAuth(url);
}

export async function searchMovies(
  query: string,
  params?: {
    page?: number;
    per_page?: number;
    include_adult?: boolean;
  }
): Promise<MoviesResponse> {
  const queryParams = new URLSearchParams({ query });

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_BASE}/search?${queryParams.toString()}`;
  return fetchWithAuth(url);
}

// Convenience functions for common queries

export async function getTrendingMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return getMoviesByCategory("trending", { page, per_page: perPage });
}

export async function getPopularMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return getMoviesByCategory("popular", { page, per_page: perPage });
}

export async function getTopRatedMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return getMoviesByCategory("top_rated", { page, per_page: perPage });
}

export async function getBollywoodMovies(
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return getMoviesByCategory("bollywood", { page, per_page: perPage });
}

export async function getMoviesByGenre(
  genreName: string,
  page = 1,
  perPage = 20
): Promise<MoviesResponse> {
  return getMovies({ genre: genreName, page, per_page: perPage });
}

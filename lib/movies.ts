// TMDB API Types
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
  vote_count: number;
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  adult: boolean;
  origin_country: string[];
  original_language: string;
  original_name: string;
  popularity: number;
  vote_count: number;
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

if (!process.env.TMDB_BEARER_TOKEN) {
  throw new Error("TMDB_BEARER_TOKEN is not set in environment variables");
}

const headers = {
  Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  "Content-Type": "application/json",
};

export const getImageUrl = (
  path: string | null,
  size: string = "w500"
): string | null => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

async function fetchTMDB<T>(endpoint: string): Promise<T> {
  const url = `${TMDB_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} - ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    throw error;
  }
}

// API Functions

// Trending Movies (by day)
export async function getTrendingMovies(): Promise<Movie[]> {
  const response = await fetchTMDB<TMDBResponse<Movie>>("/trending/movie/day");
  return response.results.slice(0, 10);
}

// 2. Popular Movies
export async function getPopularMovies(): Promise<Movie[]> {
  const response = await fetchTMDB<TMDBResponse<Movie>>("/movie/popular");
  return response.results.slice(0, 10);
}

// 3. Movies in Theaters (Now Playing)
export async function getMoviesInTheaters(): Promise<Movie[]> {
  const response = await fetchTMDB<TMDBResponse<Movie>>("/movie/now_playing");
  return response.results.slice(0, 10);
}

// 4. Trending TV Shows (by day)
export async function getTrendingTVShows(): Promise<TVShow[]> {
  const response = await fetchTMDB<TMDBResponse<TVShow>>("/trending/tv/day");
  return response.results.slice(0, 10);
}

// Get movie details by ID
export async function getMovieDetails(movieId: number): Promise<Movie> {
  return await fetchTMDB<Movie>(`/movie/${movieId}`);
}

// Get TV show details by ID
export async function getTVShowDetails(showId: number): Promise<TVShow> {
  return await fetchTMDB<TVShow>(`/tv/${showId}`);
}

// Search movies
export async function searchMovies(
  query: string,
  page: number = 1
): Promise<TMDBResponse<Movie>> {
  const encodedQuery = encodeURIComponent(query);
  return await fetchTMDB<TMDBResponse<Movie>>(
    `/search/movie?query=${encodedQuery}&page=${page}`
  );
}

// Search TV shows
export async function searchTVShows(
  query: string,
  page: number = 1
): Promise<TMDBResponse<TVShow>> {
  const encodedQuery = encodeURIComponent(query);
  return await fetchTMDB<TMDBResponse<TVShow>>(
    `/search/tv?query=${encodedQuery}&page=${page}`
  );
}

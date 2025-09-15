import { ApiClient } from "./base";
import {
  MovieSearchParams,
  TVSearchParams,
  TMDBMovie,
  TMDBTVShow,
  MovieItem,
  TVItem,
  PaginationParams,
  TMDBResponse,
  TMDBGenre,
} from "./types/tmdb";

export class TmdbApiClient {
  private readonly client: ApiClient;
  private readonly IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
  private genreMap: Map<number, string> = new Map();
  private genresInitialized: boolean = false;

  constructor() {
    this.client = new ApiClient({
      baseUrl: "https://api.themoviedb.org/3",
      headers: {
        Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
      },
    });
  }

  private async initializeGenres(): Promise<void> {
    if (this.genresInitialized) return;

    try {
      // Fetch both movie and TV genres in parallel
      const [movieGenresResponse, tvGenresResponse] = await Promise.all([
        this.client.get<{ genres: TMDBGenre[] }>(
          "/genre/movie/list?language=en-US"
        ),
        this.client.get<{ genres: TMDBGenre[] }>(
          "/genre/tv/list?language=en-US"
        ),
      ]);

      // Build the genre map from both responses
      [...movieGenresResponse.genres, ...tvGenresResponse.genres].forEach(
        (genre) => {
          this.genreMap.set(genre.id, genre.name);
        }
      );

      this.genresInitialized = true;
    } catch (error) {
      console.error("Failed to initialize TMDB genres:", error);
      // Don't throw - we'll handle missing genres gracefully
    }
  }

  private async resolveGenres(
    genreIds?: number[],
    genreObjects?: TMDBGenre[]
  ): Promise<string[]> {
    // If we have full genre objects (detailed response), use them directly
    if (genreObjects && genreObjects.length > 0) {
      return genreObjects.map((genre) => genre.name);
    }

    // Otherwise, resolve from genre_ids using our mapper
    if (genreIds && genreIds.length > 0) {
      await this.initializeGenres();
      return genreIds.map(
        (id) => this.genreMap.get(id) || `Unknown Genre ${id}`
      );
    }

    return [];
  }

  private buildQueryParams(params: Record<string, unknown>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams;
  }

  private async transformMovie(movie: TMDBMovie): Promise<MovieItem> {
    const altTitles: string[] = [];
    if (movie.original_title !== movie.title) {
      altTitles.push(movie.original_title);
    }

    // Resolve genres using our mapper
    const genres = await this.resolveGenres(movie.genre_ids, movie.genres);

    const coverImage = movie.poster_path
      ? `${this.IMAGE_BASE_URL}${movie.poster_path}`
      : "";

    return {
      id: movie.id,
      title: movie.title, // TMDB returns localized title based on language param
      alt_titles: altTitles,
      synopsis: movie.overview || "",
      score_by_imdb: movie.vote_average,
      cover_image: coverImage,
      backdrop_image: movie.backdrop_path
        ? `${this.IMAGE_BASE_URL}${movie.backdrop_path}`
        : coverImage, // Fallback to cover if no backdrop
      status: movie.status || "Unknown",
      year: new Date(movie.release_date || "").getFullYear() || 0,
      genres: genres,
      runtime: movie.runtime,
      countries:
        movie.production_countries?.map((country) => country.name) || [],
      languages: movie.spoken_languages?.map((lang) => lang.english_name) || [],
      popularity: movie.popularity,
      adult: movie.adult,
    };
  }

  private async transformTVShow(show: TMDBTVShow): Promise<TVItem> {
    const altTitles: string[] = [];
    if (show.original_name !== show.name) {
      altTitles.push(show.original_name);
    }

    // Resolve genres using our mapper
    const genres = await this.resolveGenres(show.genre_ids, show.genres);

    const coverImage = show.poster_path
      ? `${this.IMAGE_BASE_URL}${show.poster_path}`
      : "";

    return {
      id: show.id,
      title: show.name, // TMDB returns localized name based on language param
      alt_titles: altTitles,
      synopsis: show.overview || "",
      score_by_imdb: show.vote_average,
      cover_image: coverImage,
      backdrop_image: show.backdrop_path
        ? `${this.IMAGE_BASE_URL}${show.backdrop_path}`
        : coverImage, // Fallback to cover image
      status: show.status || "Unknown",
      first_air_year: new Date(show.first_air_date || "").getFullYear() || 0,
      last_air_year: show.last_air_date
        ? new Date(show.last_air_date).getFullYear()
        : undefined,
      genres: genres,
      episode_count: show.number_of_episodes || 0,
      season_count: show.number_of_seasons || 0,
      countries:
        show.production_countries?.map((country) => country.name) || [],
      languages: show.spoken_languages?.map((lang) => lang.english_name) || [],
      popularity: show.popularity,
      show_type: show.type || "Unknown",
      adult: show.adult,
    };
  }

  // MOVIE ENDPOINTS

  // 1. Trending Movies (by week)
  async getTrendingMovies(params: PaginationParams = {}): Promise<MovieItem[]> {
    const queryParams = this.buildQueryParams({
      page: params.page || 1,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBMovie>>(
      `/trending/movie/week?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((movie) => this.transformMovie(movie))
    );
  }

  // 2. Popular Movies
  async getPopularMovies(params: PaginationParams = {}): Promise<MovieItem[]> {
    const queryParams = this.buildQueryParams({
      page: params.page || 1,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBMovie>>(
      `/movie/popular?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((movie) => this.transformMovie(movie))
    );
  }

  // 3. Top Rated Movies
  async getTopRatedMovies(params: PaginationParams = {}): Promise<MovieItem[]> {
    const queryParams = this.buildQueryParams({
      page: params.page || 1,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBMovie>>(
      `/movie/top_rated?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((movie) => this.transformMovie(movie))
    );
  }

  // 4. Upcoming Movies
  async getUpcomingMovies(params: PaginationParams = {}): Promise<MovieItem[]> {
    const queryParams = this.buildQueryParams({
      page: params.page || 1,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBMovie>>(
      `/movie/upcoming?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((movie) => this.transformMovie(movie))
    );
  }

  // 5. Movies by Language/Country
  async getMoviesByOrigin(
    originCountry: string,
    language?: string,
    params: PaginationParams = {}
  ): Promise<MovieItem[]> {
    const searchParams: MovieSearchParams = {
      page: params.page || 1,
      with_origin_country: originCountry,
      with_original_language: language,
      sort_by: "popularity.desc",
    };

    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBMovie>>(
      `/discover/movie?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((movie) => this.transformMovie(movie))
    );
  }

  // 6. Bollywood Movies (India, Hindi)
  async getBollywoodMovies(
    params: PaginationParams = {}
  ): Promise<MovieItem[]> {
    return this.getMoviesByOrigin("IN", "hi", params);
  }

  // 7. Hollywood Movies (US, English)
  async getHollywoodMovies(
    params: PaginationParams = {}
  ): Promise<MovieItem[]> {
    return this.getMoviesByOrigin("US", "en", params);
  }

  // TV SERIES ENDPOINTS

  // 8. Trending TV Shows
  async getTrendingTVShows(params: PaginationParams = {}): Promise<TVItem[]> {
    const queryParams = this.buildQueryParams({
      page: params.page || 1,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/trending/tv/week?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // 9. Popular TV Shows
  async getPopularTVShows(params: PaginationParams = {}): Promise<TVItem[]> {
    const queryParams = this.buildQueryParams({
      page: params.page || 1,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/tv/popular?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // 10. Top Rated TV Shows
  async getTopRatedTVShows(params: PaginationParams = {}): Promise<TVItem[]> {
    const queryParams = this.buildQueryParams({
      page: params.page || 1,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/tv/top_rated?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // 11. K-Dramas (Korean TV Shows)
  async getKDramas(params: PaginationParams = {}): Promise<TVItem[]> {
    const searchParams: TVSearchParams = {
      page: params.page || 1,
      with_origin_country: "KR",
      with_original_language: "ko",
      sort_by: "popularity.desc",
    };

    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/discover/tv?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // 12. C-Dramas (Chinese TV Shows)
  async getCDramas(params: PaginationParams = {}): Promise<TVItem[]> {
    const searchParams: TVSearchParams = {
      page: params.page || 1,
      with_origin_country: "CN",
      with_original_language: "zh",
      sort_by: "popularity.desc",
    };

    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/discover/tv?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // 13. J-Dramas (Japanese TV Shows)
  async getJDramas(params: PaginationParams = {}): Promise<TVItem[]> {
    const searchParams: TVSearchParams = {
      page: params.page || 1,
      with_origin_country: "JP",
      with_original_language: "ja",
      sort_by: "popularity.desc",
    };

    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/discover/tv?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // 14. Thai Dramas
  async getThaiDramas(params: PaginationParams = {}): Promise<TVItem[]> {
    const searchParams: TVSearchParams = {
      page: params.page || 1,
      with_origin_country: "TH",
      with_original_language: "th",
      sort_by: "popularity.desc",
    };

    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/discover/tv?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // 15. Indian TV Shows (Hindi)
  async getIndianTVShows(params: PaginationParams = {}): Promise<TVItem[]> {
    const searchParams: TVSearchParams = {
      page: params.page || 1,
      with_origin_country: "IN",
      with_original_language: "hi",
      sort_by: "popularity.desc",
    };

    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      `/discover/tv?${queryParams.toString()}`
    );
    return Promise.all(
      response.results.map((show) => this.transformTVShow(show))
    );
  }

  // SEARCH ENDPOINTS

  // 16. Advanced Movie Search
  async searchMovies(searchParams: MovieSearchParams): Promise<{
    items: MovieItem[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_results: number;
    };
  }> {
    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBMovie>>(
      searchParams.query
        ? `/search/movie?${queryParams.toString()}`
        : `/discover/movie?${queryParams.toString()}`
    );

    return {
      items: await Promise.all(
        response.results.map((movie) => this.transformMovie(movie))
      ),
      pagination: {
        current_page: response.page,
        total_pages: response.total_pages,
        total_results: response.total_results,
      },
    };
  }

  // 17. Advanced TV Search
  async searchTVShows(searchParams: TVSearchParams): Promise<{
    items: TVItem[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_results: number;
    };
  }> {
    const queryParams = this.buildQueryParams({
      ...searchParams,
      language: "en-US",
    });

    const response = await this.client.get<TMDBResponse<TMDBTVShow>>(
      searchParams.query
        ? `/search/tv?${queryParams.toString()}`
        : `/discover/tv?${queryParams.toString()}`
    );

    return {
      items: await Promise.all(
        response.results.map((show) => this.transformTVShow(show))
      ),
      pagination: {
        current_page: response.page,
        total_pages: response.total_pages,
        total_results: response.total_results,
      },
    };
  }

  // HELPER METHODS

  // Get movie genres
  async getMovieGenres(): Promise<TMDBGenre[]> {
    const response = await this.client.get<{ genres: TMDBGenre[] }>(
      "/genre/movie/list?language=en-US"
    );
    return response.genres;
  }

  // Get TV genres
  async getTVGenres(): Promise<TMDBGenre[]> {
    const response = await this.client.get<{ genres: TMDBGenre[] }>(
      "/genre/tv/list?language=en-US"
    );
    return response.genres;
  }

  // Get movie by ID
  async getMovieById(id: number): Promise<MovieItem> {
    const response = await this.client.get<TMDBMovie>(
      `/movie/${id}?language=en-US`
    );
    return await this.transformMovie(response);
  }

  // Get TV show by ID
  async getTVShowById(id: number): Promise<TVItem> {
    const response = await this.client.get<TMDBTVShow>(
      `/tv/${id}?language=en-US`
    );
    return await this.transformTVShow(response);
  }
}

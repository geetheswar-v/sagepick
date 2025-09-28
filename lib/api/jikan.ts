import { ApiClient } from "./base";
import {
  AnimeSearchParams,
  JikanAnime,
  AnimeItem,
  PaginationParams,
  JikanAnimeResponse,
  AnimeGenre,
} from "./types/jikan";

export class JikanAnimeApiClient {
  private readonly client: ApiClient;

  constructor() {
    this.client = new ApiClient({ baseUrl: "https://api.jikan.moe/v4" });
  }

  private buildQueryParams(params: AnimeSearchParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    // Handle simple parameters
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.q) searchParams.append("q", params.q);
    if (params.type) searchParams.append("type", params.type);
    if (params.score) searchParams.append("score", params.score.toString());
    if (params.min_score)
      searchParams.append("min_score", params.min_score.toString());
    if (params.max_score)
      searchParams.append("max_score", params.max_score.toString());
    if (params.status) searchParams.append("status", params.status);
    if (params.rating) searchParams.append("rating", params.rating);
    if (params.sfw !== undefined)
      searchParams.append("sfw", params.sfw.toString());
    if (params.genres) searchParams.append("genres", params.genres);
    if (params.genres_exclude)
      searchParams.append("genres_exclude", params.genres_exclude);
    if (params.order_by) searchParams.append("order_by", params.order_by);
    if (params.sort) searchParams.append("sort", params.sort);
    if (params.letter) searchParams.append("letter", params.letter);
    if (params.producers) searchParams.append("producers", params.producers);
    if (params.start_date) searchParams.append("start_date", params.start_date);
    if (params.end_date) searchParams.append("end_date", params.end_date);
    if (params.unapproved) searchParams.append("unapproved", "true");

    return searchParams;
  }

  private transformAnime(anime: JikanAnime): AnimeItem {
    // Get all alternative titles
    const altTitles: string[] = [];
    if (anime.title_japanese && anime.title_japanese !== anime.title) {
      altTitles.push(anime.title_japanese);
    }
    altTitles.push(...anime.title_synonyms);
    anime.titles.forEach((titleObj) => {
      if (
        titleObj.title !== anime.title &&
        !altTitles.includes(titleObj.title)
      ) {
        altTitles.push(titleObj.title);
      }
    });

    // Combine themes and demographics into tags
    const tags: string[] = [];
    anime.themes.forEach((theme) => tags.push(theme.name));
    anime.demographics.forEach((demo) => tags.push(demo.name));

    // Determine if adult based on rating (R+, Rx)
    const isAdult =
      anime.rating &&
      (anime.rating.includes("R+") || anime.rating.includes("Rx"));

    const coverImage =
      anime.images.jpg.large_image_url ||
      anime.images.webp.large_image_url ||
      "";

    return {
      id: anime.mal_id,
      providerId: anime.mal_id.toString(),
      mediaType: "ANIME",
      providerType: "JIKAN",
      title: anime.title_english || anime.title, // Always English, fallback to title
      synopsis: anime.synopsis || "",
      alt_titles: altTitles,
      score_by_mal: anime.score || 0,
      score: anime.score || 0,
      cover_image: coverImage,
      backdrop_image: coverImage, // Fallback to cover since Jikan doesn't have backdrop
      anime_type: anime.type,
      episodes: anime.episodes,
      genres: anime.genres.map((genre) => genre.name),
      tags: tags,
      year: anime.year,
      status: anime.status,
      rating: anime.rating,
      duration: anime.duration,
      studios: anime.studios.map((studio) => studio.name),
      season: anime.season,
      airing: anime.airing,
      airing_from: anime.aired.from || undefined,
      airing_to: anime.aired.to || undefined,
      popularity: anime.popularity,
      members: anime.members,
      adult: !!isAdult,
    };
  }

  // 1. Get Top Anime (Already present in Jikan)
  async getTopAnime(
    params: PaginationParams & { type?: string; filter?: string } = {}
  ): Promise<AnimeItem[]> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.type) queryParams.append("type", params.type);
    if (params.filter) queryParams.append("filter", params.filter);

    const response = await this.client.get<JikanAnimeResponse>(
      `/top/anime?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }

  // 2. Get Popular Anime (using popularity order)
  async getPopularAnime(params: PaginationParams = {}): Promise<AnimeItem[]> {
    const searchParams: AnimeSearchParams = {
      limit: params.limit || 25,
      page: params.page || 1,
      order_by: "popularity",
      sort: "asc", // Lower popularity number = more popular
      sfw: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<JikanAnimeResponse>(
      `/anime?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }

  // 3. Get Trending Anime (currently airing, ordered by members/popularity)
  async getTrendingAnime(params: PaginationParams = {}): Promise<AnimeItem[]> {
    const searchParams: AnimeSearchParams = {
      limit: params.limit || 25,
      page: params.page || 1,
      status: "airing",
      order_by: "members",
      sort: "desc",
      sfw: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<JikanAnimeResponse>(
      `/anime?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }

  // 4. Get Popular Anime Movies
  async getPopularAnimeMovies(
    params: PaginationParams = {}
  ): Promise<AnimeItem[]> {
    const searchParams: AnimeSearchParams = {
      limit: params.limit || 25,
      page: params.page || 1,
      type: "movie",
      order_by: "popularity",
      sort: "asc",
      sfw: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<JikanAnimeResponse>(
      `/anime?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }

  // 5. Get Seasonal Anime (Current season)
  async getSeasonalAnime(
    year?: number,
    season?: "spring" | "summer" | "fall" | "winter",
    params: PaginationParams = {}
  ): Promise<AnimeItem[]> {
    const currentDate = new Date();
    const currentYear = year || currentDate.getFullYear();
    const currentSeason = season || this.getCurrentSeason();

    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await this.client.get<JikanAnimeResponse>(
      `/seasons/${currentYear}/${currentSeason}?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }

  // 6. Get Upcoming Anime
  async getUpcomingAnime(params: PaginationParams = {}): Promise<AnimeItem[]> {
    const searchParams: AnimeSearchParams = {
      limit: params.limit || 25,
      page: params.page || 1,
      status: "upcoming",
      order_by: "members",
      sort: "desc",
      sfw: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<JikanAnimeResponse>(
      `/anime?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }

  // 7. Advanced Search with Pagination
  async searchAnime(searchParams: AnimeSearchParams): Promise<{
    items: AnimeItem[];
    pagination: { current_page: number; has_next_page: boolean; total: number };
  }> {
    const defaultParams: AnimeSearchParams = {
      limit: 25,
      page: 1,
      sfw: true,
      ...searchParams,
    };

    const queryParams = this.buildQueryParams(defaultParams);
    const response = await this.client.get<JikanAnimeResponse>(
      `/anime?${queryParams.toString()}`
    );

    return {
      items: response.data.map((anime) => this.transformAnime(anime)),
      pagination: {
        current_page: response.pagination.current_page,
        has_next_page: response.pagination.has_next_page,
        total: response.pagination.items.total,
      },
    };
  }

  // 8. Get Anime by Genre
  async getAnimeByGenre(
    genreId: number,
    params: PaginationParams = {}
  ): Promise<AnimeItem[]> {
    const searchParams: AnimeSearchParams = {
      limit: params.limit || 25,
      page: params.page || 1,
      genres: genreId.toString(),
      order_by: "score",
      sort: "desc",
      sfw: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<JikanAnimeResponse>(
      `/anime?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }

  // 9. Get Random Anime
  async getRandomAnime(): Promise<AnimeItem> {
    const response = await this.client.get<{ data: JikanAnime }>(
      "/random/anime"
    );
    return this.transformAnime(response.data);
  }

  // Helper Methods

  // Get all available genres
  async getGenres(): Promise<AnimeGenre[]> {
    const response = await this.client.get<{ data: AnimeGenre[] }>(
      "/genres/anime"
    );
    return response.data;
  }

  // Get current season
  private getCurrentSeason(): "spring" | "summer" | "fall" | "winter" {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  }

  // Get next season
  private getNextSeason(): {
    year: number;
    season: "spring" | "summer" | "fall" | "winter";
  } {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (currentMonth >= 2 && currentMonth <= 4)
      return { year: currentYear, season: "summer" };
    if (currentMonth >= 5 && currentMonth <= 7)
      return { year: currentYear, season: "fall" };
    if (currentMonth >= 8 && currentMonth <= 10)
      return { year: currentYear, season: "winter" };
    return { year: currentYear + 1, season: "spring" };
  }

  // Get next season anime
  async getNextSeasonAnime(
    params: PaginationParams = {}
  ): Promise<AnimeItem[]> {
    const { year, season } = this.getNextSeason();
    return this.getSeasonalAnime(year, season, params);
  }

  // Get anime by specific ID
  async getAnimeById(id: number): Promise<AnimeItem> {
    const response = await this.client.get<{ data: JikanAnime }>(
      `/anime/${id}`
    );
    return this.transformAnime(response.data);
  }

  // Get top anime by type
  async getTopAnimeByType(
    type: "tv" | "movie" | "ova" | "special" | "ona",
    params: PaginationParams = {}
  ): Promise<AnimeItem[]> {
    return this.getTopAnime({ ...params, type });
  }

  // Get trending anime by score
  async getTrendingByScore(
    params: PaginationParams = {}
  ): Promise<AnimeItem[]> {
    const searchParams: AnimeSearchParams = {
      limit: params.limit || 25,
      page: params.page || 1,
      order_by: "score",
      sort: "desc",
      min_score: 7.5, // High-rated anime
      status: "airing",
      sfw: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<JikanAnimeResponse>(
      `/anime?${queryParams.toString()}`
    );
    return response.data.map((anime) => this.transformAnime(anime));
  }
}

import { ApiClient } from "./base";
import {
  SearchParams,
  Manga,
  MangaItem,
  PaginationParams,
  MangaResponse,
  Tag,
  CoverArtRelationship,
} from "./types/mangadex";

export class MangaDexApiClient {
  private readonly client: ApiClient;
  private readonly COVER_BASE_URL = "https://uploads.mangadex.org/covers";

  constructor() {
    this.client = new ApiClient({ baseUrl: "https://api.mangadex.org" });
  }

  private buildQueryParams(params: SearchParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    // Handle simple parameters
    if (params.limit) searchParams.append("limit", params.limit.toString());
    if (params.offset) searchParams.append("offset", params.offset.toString());
    if (params.title) searchParams.append("title", params.title);
    if (params.year) searchParams.append("year", params.year.toString());

    // Handle array parameters (MangaDex API expects multiple params for arrays)
    if (params.authors) {
      params.authors.forEach((author) =>
        searchParams.append("authors[]", author)
      );
    }
    if (params.artists) {
      params.artists.forEach((artist) =>
        searchParams.append("artists[]", artist)
      );
    }
    if (params.includedTags) {
      params.includedTags.forEach((tag) =>
        searchParams.append("includedTags[]", tag)
      );
    }
    if (params.excludedTags) {
      params.excludedTags.forEach((tag) =>
        searchParams.append("excludedTags[]", tag)
      );
    }
    if (params.status) {
      params.status.forEach((status) =>
        searchParams.append("status[]", status)
      );
    }
    if (params.publicationDemographic) {
      params.publicationDemographic.forEach((demo) =>
        searchParams.append("publicationDemographic[]", demo)
      );
    }
    if (params.contentRating) {
      params.contentRating.forEach((rating) =>
        searchParams.append("contentRating[]", rating)
      );
    }
    if (params.includes) {
      params.includes.forEach((include) =>
        searchParams.append("includes[]", include)
      );
    }

    // Handle originalLanguage array parameters
    if (params.originalLanguage) {
      params.originalLanguage.forEach((lang) =>
        searchParams.append("originalLanguage[]", lang)
      );
    }

    // Handle order parameters
    if (params.order) {
      Object.entries(params.order).forEach(([key, value]) => {
        searchParams.append(`order[${key}]`, value);
      });
    }

    // Handle boolean parameters
    if (params.hasAvailableChapters !== undefined) {
      searchParams.append(
        "hasAvailableChapters",
        params.hasAvailableChapters.toString()
      );
    }

    return searchParams;
  }

  private extractCoverImage(manga: Manga): string | undefined {
    const coverRelation = manga.relationships.find(
      (rel) => rel.type === "cover_art"
    ) as CoverArtRelationship | undefined;
    if (coverRelation?.attributes?.fileName) {
      return `${this.COVER_BASE_URL}/${manga.id}/${coverRelation.attributes.fileName}.512.jpg`;
    }
    return undefined;
  }

  private transformManga(manga: Manga): MangaItem {
    // Helper function to get the first available string from title/description object
    const getFirstString = (obj: { [language: string]: string }): string => {
      return Object.values(obj)[0] || "";
    };

    // Extract all alternative titles
    const altTitles: string[] = [];

    const mainTitle =
      manga.attributes.title.en || getFirstString(manga.attributes.title);
    Object.values(manga.attributes.title).forEach((title) => {
      if (title !== mainTitle && !altTitles.includes(title)) {
        altTitles.push(title);
      }
    });

    // Add titles from altTitles array
    manga.attributes.altTitles.forEach((titleObj) => {
      Object.values(titleObj).forEach((title) => {
        if (title !== mainTitle && !altTitles.includes(title)) {
          altTitles.push(title);
        }
      });
    });

    // Separate genres and tags based on tag group
    const genres: string[] = [];
    const tags: string[] = [];

    manga.attributes.tags.forEach((tag) => {
      const tagName =
        tag.attributes.name.en ||
        getFirstString(tag.attributes.name) ||
        "Unknown Tag";
      if (tag.attributes.group === "genre") {
        genres.push(tagName);
      } else {
        tags.push(tagName);
      }
    });

    // Determine if adult based on content rating
    const isAdult =
      manga.attributes.contentRating === "erotica" ||
      manga.attributes.contentRating === "pornographic";

    const coverImg = this.extractCoverImage(manga);

    return {
      id: manga.id,
      title: mainTitle || "Unknown Title",
      alt_titles: altTitles,
      synopsis:
        manga.attributes.description.en ||
        getFirstString(manga.attributes.description) ||
        "",
      cover_image: coverImg,
      backdrop_image: coverImg,
      genres: genres,
      tags: tags,
      status: manga.attributes.status,
      year: manga.attributes.year,
      rating: manga.attributes.contentRating,
      publication_demographic: manga.attributes.publicationDemographic,
      last_chapter: manga.attributes.lastChapter,
      last_volume: manga.attributes.lastVolume,
      adult: isAdult,
    };
  }

  // 1. Popular Manga (Japanese only)
  async getPopularManga(params: PaginationParams = {}): Promise<MangaItem[]> {
    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { followedCount: "desc" },
      contentRating: ["safe", "suggestive"],
      originalLanguage: ["ja"], // Only Japanese
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }

  // 2. Popular Manhwa (Korean only)
  async getPopularManhwa(params: PaginationParams = {}): Promise<MangaItem[]> {
    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { followedCount: "desc" },
      contentRating: ["safe", "suggestive"],
      originalLanguage: ["ko"], // Only Korean
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }

  // 3. Popular Manhua (Chinese only)
  async getPopularManhua(params: PaginationParams = {}): Promise<MangaItem[]> {
    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { followedCount: "desc" },
      contentRating: ["safe", "suggestive"],
      originalLanguage: ["zh", "zh-hk"], // Chinese variants
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }

  // 4. Trending (Recently Updated - All languages)
  async getTrendingManga(params: PaginationParams = {}): Promise<MangaItem[]> {
    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { latestUploadedChapter: "desc" },
      contentRating: ["safe", "suggestive"],
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }

  // 5. Highly Followed Manga (Since no rating parameter exists)
  async getTopRatedManga(params: PaginationParams = {}): Promise<MangaItem[]> {
    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { followedCount: "desc" }, // Use followedCount as proxy for "rating"
      contentRating: ["safe", "suggestive"],
      originalLanguage: ["ja"], // Only Japanese
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
      // Add publication demographic filter for quality
      publicationDemographic: ["shounen", "seinen", "shoujo", "josei"],
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }

  // 6. Highly Followed Manhwa
  async getTopRatedManhwa(params: PaginationParams = {}): Promise<MangaItem[]> {
    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { followedCount: "desc" },
      contentRating: ["safe", "suggestive"],
      originalLanguage: ["ko"], // Only Korean
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }

  // 7. Highly Followed Manhua
  async getTopRatedManhua(params: PaginationParams = {}): Promise<MangaItem[]> {
    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { followedCount: "desc" },
      contentRating: ["safe", "suggestive"],
      originalLanguage: ["zh", "zh-hk"], // Chinese variants
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }

  // 8. Advanced Search with Pagination
  async searchManga(
    searchParams: SearchParams
  ): Promise<{ items: MangaItem[]; total: number; hasMore: boolean }> {
    const defaultParams: SearchParams = {
      limit: 20,
      offset: 0,
      contentRating: ["safe", "suggestive"],
      includes: ["cover_art", "tag", "author", "artist"],
      hasAvailableChapters: true,
      ...searchParams,
    };

    const queryParams = this.buildQueryParams(defaultParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );

    return {
      items: response.data.map((manga) => this.transformManga(manga)),
      total: response.total,
      hasMore:
        (defaultParams.offset || 0) + (defaultParams.limit || 20) <
        response.total,
    };
  }

  // Helper method to get tags for filtering
  async getTags(): Promise<Tag[]> {
    const response = await this.client.get<{ data: Tag[] }>("/manga/tag");
    return response.data;
  }

  // Get recent popular manga by language with time filter
  async getRecentPopularByLanguage(
    language: "ja" | "ko" | "zh",
    params: PaginationParams = {}
  ): Promise<MangaItem[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const searchParams: SearchParams = {
      limit: params.limit || 20,
      offset: params.offset || 0,
      order: { followedCount: "desc" },
      contentRating: ["safe", "suggestive"],
      originalLanguage: language === "zh" ? ["zh", "zh-hk"] : [language],
      includes: ["cover_art", "tag"],
      hasAvailableChapters: true,
      createdAtSince: thirtyDaysAgo.toISOString(),
    };

    const queryParams = this.buildQueryParams(searchParams);
    const response = await this.client.get<MangaResponse>(
      `/manga?${queryParams.toString()}`
    );
    return response.data.map((manga) => this.transformManga(manga));
  }
}

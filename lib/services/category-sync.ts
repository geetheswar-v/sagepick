import { prisma } from "@/lib/prisma";
import { TmdbApiClient } from "@/lib/api/tmdb";
import { JikanAnimeApiClient } from "@/lib/api/jikan";
import { MangaDexApiClient } from "@/lib/api/mangadex";
import { JobLogger } from "./job-logger";
import { SYNC_CONFIG } from "@/lib/config/sync-config";
import { RateLimitHelper } from "@/lib/utils/rate-limit";
import { SyncJobType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { insertMedia } from "./media-upsert";
import type { ExternalMediaItem } from "./media-upsert";

export class CategorySyncService {
  private tmdbClient: TmdbApiClient;
  private jikanClient: JikanAnimeApiClient;
  private mangaDexClient: MangaDexApiClient;

  constructor() {
    this.tmdbClient = new TmdbApiClient();
    this.jikanClient = new JikanAnimeApiClient();
    this.mangaDexClient = new MangaDexApiClient();
  }

  async syncTrending(): Promise<{
    success: boolean;
    jobId: string;
    error?: string;
  }> {
    const logger = await JobLogger.createJob(SyncJobType.TRENDING_SYNC);

    try {
      await logger.info("Starting trending sync");

      // Fetch data with smart rate limiting
      // await RateLimitHelper.checkRateLimit("TMDB");
      // const movies = await this.tmdbClient.getTrendingMovies({ page: 1 });

      // await RateLimitHelper.checkRateLimit("TMDB");
      // const tv = await this.tmdbClient.getTrendingTVShows({ page: 1 });

      // await RateLimitHelper.checkRateLimit("JIKAN");
      // const anime = await this.jikanClient.getTrendingAnime({ page: 1 });

      // await RateLimitHelper.checkRateLimit("JIKAN");
      // const animeMovies = await this.jikanClient.getPopularAnimeMovies({
      //   page: 1,
      // });

      // await RateLimitHelper.checkRateLimit("MANGADEX");
      // const manga = await this.mangaDexClient.getTrendingManga({ limit: 25 });

      await RateLimitHelper.checkRateLimit("MANGADEX");
      const manhwa = await this.mangaDexClient.getPopularManhwa({ limit: 25 });

      // await RateLimitHelper.checkRateLimit("MANGADEX");
      // const manhua = await this.mangaDexClient.getPopularManhua({ limit: 25 });
      const limit = SYNC_CONFIG.ITEMS_PER_CATEGORY;

      // Update categories sequentially to avoid database conflicts
      // await this.updateCategory(
      //   "trending_movies",
      //   movies.slice(0, limit),
      //   logger
      // );
      // await this.updateCategory("trending_tv", tv.slice(0, limit), logger);
      // await this.updateCategory(
      //   "trending_anime",
      //   anime.slice(0, limit),
      //   logger
      // );
      // await this.updateCategory(
      //   "trending_anime_movies",
      //   animeMovies.slice(0, limit),
      //   logger
      // );
      // await this.updateCategory(
      //   "trending_manga",
      //   manga.slice(0, limit),
      //   logger
      // );
      await this.updateCategory(
        "trending_manhwa",
        manhwa.slice(0, limit),
        logger
      );
      // await this.updateCategory(
      //   "trending_manhua",
      //   manhua.slice(0, limit),
      //   logger
      // );

      await logger.completeJob(true);
      return { success: true, jobId: logger.getJobId() };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await logger.completeJob(false, errorMsg);
      return { success: false, jobId: logger.getJobId(), error: errorMsg };
    }
  }

  async syncPopular(): Promise<{
    success: boolean;
    jobId: string;
    error?: string;
  }> {
    const logger = await JobLogger.createJob(SyncJobType.POPULAR_SYNC);

    try {
      await logger.info("Starting popular sync");

      // Execute API calls sequentially with delays to avoid rate limits
      await logger.info("Fetching popular movies...");
      const movies = await this.tmdbClient.getPopularMovies({ page: 1 });
      await RateLimitHelper.delay(SYNC_CONFIG.RATE_LIMITS.TMDB.window);

      await logger.info("Fetching popular TV shows...");
      const tv = await this.tmdbClient.getPopularTVShows({ page: 1 });
      await RateLimitHelper.delay(SYNC_CONFIG.RATE_LIMITS.JIKAN.window);

      await logger.info("Fetching popular anime...");
      const anime = await this.jikanClient.getPopularAnime({ page: 1 });
      await RateLimitHelper.delay(SYNC_CONFIG.RATE_LIMITS.JIKAN.window);

      await logger.info("Fetching popular anime movies...");
      const animeMovies = await this.jikanClient.getPopularAnimeMovies({
        page: 1,
      });
      await RateLimitHelper.delay(SYNC_CONFIG.RATE_LIMITS.MANGADEX.window);

      await logger.info("Fetching popular manga...");
      const manga = await this.mangaDexClient.getPopularManga({ limit: 25 });
      await RateLimitHelper.delay(SYNC_CONFIG.RATE_LIMITS.MANGADEX.window);

      await logger.info("Fetching popular manhwa...");
      const manhwa = await this.mangaDexClient.getPopularManhwa({ limit: 25 });
      await RateLimitHelper.delay(SYNC_CONFIG.RATE_LIMITS.MANGADEX.window);

      await logger.info("Fetching popular manhua...");
      const manhua = await this.mangaDexClient.getPopularManhua({ limit: 25 });

      const limit = SYNC_CONFIG.ITEMS_PER_CATEGORY;

      // Update categories sequentially to avoid database conflicts
      await this.updateCategory(
        "popular_movies",
        movies.slice(0, limit),
        logger
      );
      await this.updateCategory("popular_tv", tv.slice(0, limit), logger);
      await this.updateCategory("popular_anime", anime.slice(0, limit), logger);
      await this.updateCategory(
        "popular_anime_movies",
        animeMovies.slice(0, limit),
        logger
      );
      await this.updateCategory("popular_manga", manga.slice(0, limit), logger);
      await this.updateCategory(
        "popular_manhwa",
        manhwa.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "popular_manhua",
        manhua.slice(0, limit),
        logger
      );

      await logger.completeJob(true);
      return { success: true, jobId: logger.getJobId() };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await logger.completeJob(false, errorMsg);
      return { success: false, jobId: logger.getJobId(), error: errorMsg };
    }
  }

  async syncTopRated(): Promise<{
    success: boolean;
    jobId: string;
    error?: string;
  }> {
    const logger = await JobLogger.createJob(SyncJobType.TOP_RATED_SYNC);

    try {
      await logger.info("Starting top rated sync");

      // Fetch data with smart rate limiting
      await RateLimitHelper.checkRateLimit("TMDB");
      const movies = await this.tmdbClient.getTopRatedMovies({ page: 1 });

      await RateLimitHelper.checkRateLimit("TMDB");
      const tv = await this.tmdbClient.getTopRatedTVShows({ page: 1 });

      await RateLimitHelper.checkRateLimit("JIKAN");
      const anime = await this.jikanClient.getTopAnime({ page: 1 });

      await RateLimitHelper.checkRateLimit("JIKAN");
      const animeMovies = await this.jikanClient.getTopAnimeByType("movie", {
        page: 1,
      });

      await RateLimitHelper.checkRateLimit("JIKAN");
      const currentSeason = await this.jikanClient.getSeasonalAnime();

      await RateLimitHelper.checkRateLimit("MANGADEX");
      const manga = await this.mangaDexClient.getTopRatedManga({ limit: 25 });

      await RateLimitHelper.checkRateLimit("MANGADEX");
      const manhwa = await this.mangaDexClient.getTopRatedManhwa({ limit: 25 });

      await RateLimitHelper.checkRateLimit("MANGADEX");
      const manhua = await this.mangaDexClient.getTopRatedManhua({ limit: 25 });

      const limit = SYNC_CONFIG.ITEMS_PER_CATEGORY;

      // Update categories sequentially
      await this.updateCategory(
        "top_rated_movies",
        movies.slice(0, limit),
        logger
      );
      await this.updateCategory("top_rated_tv", tv.slice(0, limit), logger);
      await this.updateCategory(
        "top_rated_anime",
        anime.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "top_rated_anime_movies",
        animeMovies.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "current_season_anime",
        currentSeason.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "top_rated_manga",
        manga.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "top_rated_manhwa",
        manhwa.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "top_rated_manhua",
        manhua.slice(0, limit),
        logger
      );

      await logger.completeJob(true);
      return { success: true, jobId: logger.getJobId() };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await logger.completeJob(false, errorMsg);
      return { success: false, jobId: logger.getJobId(), error: errorMsg };
    }
  }

  async syncDramas(): Promise<{
    success: boolean;
    jobId: string;
    error?: string;
  }> {
    const logger = await JobLogger.createJob(SyncJobType.DRAMAS_SYNC);

    try {
      await logger.info("Starting dramas sync");

      // Fetch dramas with smart rate limiting (all TMDB)
      await RateLimitHelper.checkRateLimit("TMDB");
      const kdramas = await this.tmdbClient.getKDramas({ page: 1 });

      await RateLimitHelper.checkRateLimit("TMDB");
      const cdramas = await this.tmdbClient.getCDramas({ page: 1 });

      await RateLimitHelper.checkRateLimit("TMDB");
      const jdramas = await this.tmdbClient.getJDramas({ page: 1 });

      await RateLimitHelper.checkRateLimit("TMDB");
      const thaiDramas = await this.tmdbClient.getThaiDramas({ page: 1 });

      await RateLimitHelper.checkRateLimit("TMDB");
      const indianTV = await this.tmdbClient.getIndianTVShows({ page: 1 });

      const limit = SYNC_CONFIG.ITEMS_PER_CATEGORY;

      // Update categories sequentially
      await this.updateCategory(
        "popular_kdrama",
        kdramas.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "popular_cdrama",
        cdramas.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "popular_jdrama",
        jdramas.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "popular_thai_drama",
        thaiDramas.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "popular_indian_tv",
        indianTV.slice(0, limit),
        logger
      );

      await logger.completeJob(true);
      return { success: true, jobId: logger.getJobId() };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await logger.completeJob(false, errorMsg);
      return { success: false, jobId: logger.getJobId(), error: errorMsg };
    }
  }

  async syncUpcoming(): Promise<{
    success: boolean;
    jobId: string;
    error?: string;
  }> {
    const logger = await JobLogger.createJob(SyncJobType.UPCOMING_SYNC);

    try {
      await logger.info("Starting upcoming sync");

      // Fetch upcoming content with smart rate limiting
      await RateLimitHelper.checkRateLimit("TMDB");
      const upcomingMovies = await this.tmdbClient.getUpcomingMovies({
        page: 1,
      });

      await RateLimitHelper.checkRateLimit("TMDB");
      const inTheaters = await this.tmdbClient.getNowPlayingMovies({ page: 1 });

      await RateLimitHelper.checkRateLimit("JIKAN");
      const upcomingAnime = await this.jikanClient.getUpcomingAnime({
        page: 1,
      });

      await RateLimitHelper.checkRateLimit("JIKAN");
      const nextSeasonAnime = await this.jikanClient.getNextSeasonAnime({
        page: 1,
      });

      const limit = SYNC_CONFIG.ITEMS_PER_CATEGORY;

      // Update categories sequentially
      await this.updateCategory(
        "upcoming_movies",
        upcomingMovies.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "in_theaters_movies",
        inTheaters.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "upcoming_anime",
        upcomingAnime.slice(0, limit),
        logger
      );
      await this.updateCategory(
        "next_season_anime",
        nextSeasonAnime.slice(0, limit),
        logger
      );

      await logger.completeJob(true);
      return { success: true, jobId: logger.getJobId() };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await logger.completeJob(false, errorMsg);
      return { success: false, jobId: logger.getJobId(), error: errorMsg };
    }
  }

  private async updateCategory(
    categoryTitle: string,
    items: ExternalMediaItem[],
    logger: JobLogger
  ) {
    await logger.info(
      `Updating category: ${categoryTitle} with ${items.length} items`
    );

    // Clear existing category entries
    await prisma.mediaCategory.deleteMany({
      where: { category_title: categoryTitle },
    });

    // Process items in batches for better performance
    const categoryEntries = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const media = await insertMedia(item);
        categoryEntries.push({
          media_id: media.id,
          category_title: categoryTitle,
          position: i + 1,
        });
      } catch (error) {
        const providerId = (item as { providerId?: string }).providerId;
        const title = (item as { title?: string }).title;
        const details: Prisma.InputJsonObject = {
          error: error instanceof Error ? error.message : "Unknown error",
          ...(providerId ? { providerId } : {}),
          ...(title ? { title } : {}),
        };

        await logger.warn(
          `Failed inserting media for ${categoryTitle} at position ${i + 1}`,
          details
        );
      }
    }

    // Bulk insert category entries
    if (categoryEntries.length > 0) {
      await prisma.mediaCategory.createMany({
        data: categoryEntries,
      });
    }

    await logger.info(
      `Updated ${categoryTitle} with ${categoryEntries.length} items`
    );
  }
}

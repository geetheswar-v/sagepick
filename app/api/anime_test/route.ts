import { JikanAnimeApiClient } from "@/lib/api/jikan";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testType = searchParams.get("test") || "all";

  const client = new JikanAnimeApiClient();
  const results: Record<string, unknown> = {};

  try {
    console.log(`Testing Jikan API - Test Type: ${testType}`);

    if (testType === "all" || testType === "top-anime") {
      console.log("Testing Top Anime...");
      results.topAnime = await client.getTopAnime({ limit: 5 });
    }

    if (testType === "all" || testType === "popular-anime") {
      console.log("Testing Popular Anime...");
      results.popularAnime = await client.getPopularAnime({ limit: 5 });
    }

    // Wait for a moment to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (testType === "all" || testType === "trending-anime") {
      console.log("Testing Trending Anime...");
      results.trendingAnime = await client.getTrendingAnime({ limit: 5 });
    }

    if (testType === "all" || testType === "popular-movies") {
      console.log("Testing Popular Anime Movies...");
      results.popularMovies = await client.getPopularAnimeMovies({ limit: 5 });
    }

    // Wait for a moment to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (testType === "all" || testType === "seasonal") {
      console.log("Testing Seasonal Anime...");
      results.seasonal = await client.getSeasonalAnime(undefined, undefined, {
        limit: 5,
      });
    }

    if (testType === "all" || testType === "upcoming") {
      console.log("Testing Upcoming Anime...");
      results.upcoming = await client.getUpcomingAnime({ limit: 5 });
    }

    // Wait for a moment to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (testType === "all" || testType === "trending-by-score") {
      console.log("Testing Trending by Score...");
      results.trendingByScore = await client.getTrendingByScore({ limit: 5 });
    }

    if (testType === "all" || testType === "search") {
      console.log("Testing Search...");
      const query = searchParams.get("query") || "naruto";
      results.search = await client.searchAnime({
        q: query,
        limit: 3,
      });
    }

    // Wait for a moment to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (testType === "all" || testType === "genres") {
      console.log("Testing Genres...");
      const allGenres = await client.getGenres();
      results.genres = {
        total: allGenres.length,
        sample: allGenres.slice(0, 10).map((genre) => ({
          id: genre.mal_id,
          name: genre.name,
          type: genre.type,
        })),
      };
    }

    if (testType === "all" || testType === "random") {
      console.log("Testing Random Anime...");
      results.random = await client.getRandomAnime();
    }

    // Wait for a moment to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (testType === "all" || testType === "by-genre") {
      console.log("Testing Anime by Genre (Action - ID: 1)...");
      results.byGenre = await client.getAnimeByGenre(1, { limit: 3 });
    }

    if (testType === "all" || testType === "by-type") {
      console.log("Testing Top Anime by Type (TV)...");
      results.byType = await client.getTopAnimeByType("tv", { limit: 3 });
    }

    // Wait for a moment to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (testType === "all" || testType === "by-id") {
      console.log("Testing Get Anime by ID (Death Note - ID: 1535)...");
      const animeId = parseInt(searchParams.get("id") || "1535");
      results.byId = await client.getAnimeById(animeId);
    }

    return NextResponse.json({
      success: true,
      message: `Jikan API test completed successfully`,
      testType,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("API Test Failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        testType,
        timestamp: new Date().toISOString(),
        results,
      },
      { status: 500 }
    );
  }
}

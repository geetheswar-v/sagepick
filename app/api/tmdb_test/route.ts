import { TmdbApiClient } from "@/lib/api/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testType = searchParams.get("test") || "all";

  const client = new TmdbApiClient();
  const results: Record<string, unknown> = {};

  try {
    console.log(`Testing TMDB API - Test Type: ${testType}`);

    // MOVIE TESTS
    if (testType === "all" || testType === "trending-movies") {
      console.log("Testing Trending Movies...");
      results.trendingMovies = await client.getTrendingMovies({ page: 1 });
    }

    if (testType === "all" || testType === "popular-movies") {
      console.log("Testing Popular Movies...");
      results.popularMovies = await client.getPopularMovies({ page: 1 });
    }

    if (testType === "all" || testType === "top-rated-movies") {
      console.log("Testing Top Rated Movies...");
      results.topRatedMovies = await client.getTopRatedMovies({ page: 1 });
    }

    if (testType === "all" || testType === "upcoming-movies") {
      console.log("Testing Upcoming Movies...");
      results.upcomingMovies = await client.getUpcomingMovies({ page: 1 });
    }

    if (testType === "all" || testType === "bollywood-movies") {
      console.log("Testing Bollywood Movies...");
      results.bollywoodMovies = await client.getBollywoodMovies({ page: 1 });
    }

    if (testType === "all" || testType === "hollywood-movies") {
      console.log("Testing Hollywood Movies...");
      results.hollywoodMovies = await client.getHollywoodMovies({ page: 1 });
    }

    if (testType === "all" || testType === "asian-movies") {
      console.log("Testing Asian Movies...");
      results.asianMovies = await client.getAsianMovies({ page: 1 });
    }

    // TV SHOW TESTS
    if (testType === "all" || testType === "trending-tv") {
      console.log("Testing Trending TV Shows...");
      results.trendingTVShows = await client.getTrendingTVShows({ page: 1 });
    }

    if (testType === "all" || testType === "popular-tv") {
      console.log("Testing Popular TV Shows...");
      results.popularTVShows = await client.getPopularTVShows({ page: 1 });
    }

    if (testType === "all" || testType === "top-rated-tv") {
      console.log("Testing Top Rated TV Shows...");
      results.topRatedTVShows = await client.getTopRatedTVShows({ page: 1 });
    }

    if (testType === "all" || testType === "k-dramas") {
      console.log("Testing K-Dramas...");
      results.kDramas = await client.getKDramas({ page: 1 });
    }

    if (testType === "all" || testType === "c-dramas") {
      console.log("Testing C-Dramas...");
      results.cDramas = await client.getCDramas({ page: 1 });
    }

    if (testType === "all" || testType === "j-dramas") {
      console.log("Testing J-Dramas...");
      results.jDramas = await client.getJDramas({ page: 1 });
    }

    if (testType === "all" || testType === "thai-dramas") {
      console.log("Testing Thai Dramas...");
      results.thaiDramas = await client.getThaiDramas({ page: 1 });
    }

    if (testType === "all" || testType === "indian-tv") {
      console.log("Testing Indian TV Shows...");
      results.indianTVShows = await client.getIndianTVShows({ page: 1 });
    }

    if (testType === "all" || testType === "asian-dramas") {
      console.log("Testing Asian Dramas...");
      results.asianDramas = await client.getAsianDramas({ page: 1 });
    }

    // SEARCH TESTS
    if (testType === "all" || testType === "search-movies") {
      console.log("Testing Movie Search...");
      const query = searchParams.get("query") || "avengers";
      results.movieSearch = await client.searchMovies({
        query: query,
        page: 1,
      });
    }

    if (testType === "all" || testType === "search-tv") {
      console.log("Testing TV Search...");
      const query = searchParams.get("query") || "breaking bad";
      results.tvSearch = await client.searchTVShows({
        query: query,
        page: 1,
      });
    }

    // GENRE TESTS
    if (testType === "all" || testType === "movie-genres") {
      console.log("Testing Movie Genres...");
      results.movieGenres = await client.getMovieGenres();
    }

    if (testType === "all" || testType === "tv-genres") {
      console.log("Testing TV Genres...");
      results.tvGenres = await client.getTVGenres();
    }

    // INDIVIDUAL ITEM TESTS
    if (testType === "all" || testType === "movie-by-id") {
      console.log("Testing Get Movie by ID (The Dark Knight - ID: 155)...");
      const movieId = parseInt(searchParams.get("id") || "155");
      results.movieById = await client.getMovieById(movieId);
    }

    if (testType === "all" || testType === "tv-by-id") {
      console.log("Testing Get TV Show by ID (Breaking Bad - ID: 1396)...");
      const tvId = parseInt(searchParams.get("id") || "1396");
      results.tvById = await client.getTVShowById(tvId);
    }

    return NextResponse.json({
      success: true,
      message: `TMDB API test completed successfully`,
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

import { MangaDexApiClient } from "@/lib/api/mangadex";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testType = searchParams.get("test") || "all";

  const client = new MangaDexApiClient();
  const results: Record<string, unknown> = {};

  try {
    console.log(`Testing MangaDx API - Test Type: ${testType}`);

    if (testType === "all" || testType === "popular-manga") {
      console.log("Testing Popular Manga...");
      results.popularManga = await client.getPopularManga();
    }

    if (testType === "all" || testType === "popular-manhwa") {
      console.log("Testing Popular Manhwa...");
      results.popularManhwa = await client.getPopularManhwa();
    }

    if (testType === "all" || testType === "popular-manhua") {
      console.log("Testing Popular Manhua...");
      results.popularManhua = await client.getPopularManhua();
    }

    if (testType === "all" || testType === "trending") {
      console.log("Testing Trending Manga...");
      results.trending = await client.getTrendingManga();
    }

    if (testType === "all" || testType === "top-rated-manga") {
      console.log("Testing Top Rated Manga...");
      results.topRatedManga = await client.getTopRatedManga();
    }

    if (testType === "all" || testType === "top-rated-manhwa") {
      console.log("Testing Top Rated Manhwa...");
      results.topRatedManhwa = await client.getTopRatedManhwa();
    }

    if (testType === "all" || testType === "top-rated-manhua") {
      console.log("Testing Top Rated Manhua...");
      results.topRatedManhua = await client.getTopRatedManhua();
    }

    if (testType === "all" || testType === "search") {
      console.log("Testing Search...");
      const query = searchParams.get("query") || "naruto";
      results.search = await client.searchManga({
        title: query,
        limit: 3,
      });
    }

    if (testType === "all" || testType === "tags") {
      console.log("Testing Tags...");
      const allTags = await client.getTags();
      results.tags = {
        total: allTags.length,
        sample: allTags.slice(0, 10).map((tag) => ({
          id: tag.id,
          name: tag.attributes.name.en || Object.values(tag.attributes.name)[0],
          group: tag.attributes.group,
        })),
      };
    }

    return NextResponse.json({
      success: true,
      message: `MangaDx API test completed successfully`,
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

import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/services/movie-service";
import type { SearchParams } from "@/lib/types/movie";

function parseSearchParams(url: URL): SearchParams {
  const params = url.searchParams;
  const toNumber = (value: string | null) =>
    value !== null && value !== "" ? Number(value) : undefined;

  const toBoolean = (value: string | null) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return undefined;
  };

  return {
    query: params.get("query") ?? "*",
    page: toNumber(params.get("page")),
    per_page: toNumber(params.get("per_page")),
    include_adult: toBoolean(params.get("include_adult")),
    year: toNumber(params.get("year")),
    min_rating: toNumber(params.get("min_rating")),
    with_genres: params.get("with_genres") ?? undefined,
    language: params.get("language") ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const params = parseSearchParams(url);
    const data = await searchMovies(params);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Proxy /api/search error:", error);
    return NextResponse.json(
      { message: "Failed to fetch search results" },
      { status: 500 }
    );
  }
}

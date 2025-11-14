"use client";

import { useState } from "react";
import { Sparkles, Search, Loader2, Route } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MovieCard, MovieCardSkeleton } from "@/components/movie/movie-card";
import { agentSearch, type AgentSearchResponse } from "@/lib/services/ai-service";
import { searchMoviesTMDB } from "@/lib/services/movie-service";
import type { Movie } from "@/lib/types/movie";
import { toast } from "@/lib/toast";

interface MovieLookupResult {
  movieName: string;
  tmdbResults: Movie[];
  error?: string;
}

const MAX_TMDB_RESULTS = 8;

const ROUTE_LABELS: Record<string, string> = {
  direct_answer: "Direct Answer",
  research: "Deep Research",
};

export default function AgentSearchPage() {
  const [query, setQuery] = useState("");
  const [agentResponse, setAgentResponse] = useState<AgentSearchResponse | null>(null);
  const [movieMatches, setMovieMatches] = useState<MovieLookupResult[]>([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [isMovieLookupLoading, setIsMovieLookupLoading] = useState(false);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleAgentSearch();
    }
  };

  const handleAgentSearch = async () => {
    if (!query.trim()) {
      toast.error("Please describe what you want to watch");
      return;
    }

    setIsAgentLoading(true);
    setIsMovieLookupLoading(false);
    setAgentResponse(null);
    setMovieMatches([]);

    try {
      const response = await agentSearch(query.trim());
      setAgentResponse(response);
      toast.success("Sagepick AI found some ideas. Pulling TMDB matches...");

      if (response.movies?.length) {
        void fetchTMDBMatches(response.movies);
      } else {
        toast.info("No explicit movie titles returned. Try refining your query.");
      }
    } catch (error) {
      console.error("Agent search failed", error);
      toast.error("Unable to reach Sagepick AI. Please try again later.");
    } finally {
      setIsAgentLoading(false);
    }
  };

  const fetchTMDBMatches = async (movieNames: string[]) => {
    setIsMovieLookupLoading(true);

    try {
      const results = await Promise.all(
        movieNames.map(async (movieName) => {
          try {
            const tmdb = await searchMoviesTMDB({
              query: movieName,
              page: 1,
              per_page: MAX_TMDB_RESULTS,
            });

            return {
              movieName,
              tmdbResults: tmdb.data,
            } satisfies MovieLookupResult;
          } catch (lookupError) {
            console.error(`TMDB lookup failed for ${movieName}`, lookupError);
            return {
              movieName,
              tmdbResults: [],
              error: "Could not fetch TMDB matches for this title",
            } satisfies MovieLookupResult;
          }
        })
      );

      setMovieMatches(results);
    } finally {
      setIsMovieLookupLoading(false);
    }
  };

  const isSearching = isAgentLoading || isMovieLookupLoading;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <header className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Agentic Search Lab
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold">Ask Sagepick AI</h1>
            <p className="text-muted-foreground max-w-2xl">
              Describe what you&apos;re in the mood for and let our hosted agent research the perfect picks. We&apos;ll automatically sync TMDB results so you can jump straight into detailed movie pages.
            </p>
          </div>
        </header>

        <section className="rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/75 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Feel-good sci-fi adventure with found family vibes"
                className="h-12 text-base"
              />
            </div>
            <Button onClick={handleAgentSearch} disabled={isSearching} className="h-12 gap-2">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isSearching ? "Working..." : "Run Agent"}
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Powered by <span className="font-medium text-primary">ai.sagepick.in</span> agentic /search endpoint
          </p>
        </section>

        {agentResponse && (
          <section className="mt-10 space-y-4">
            <div className="rounded-2xl border bg-card/60 p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="gap-1">
                  <Route className="h-3.5 w-3.5" />
                  {ROUTE_LABELS[agentResponse.route_taken] ?? agentResponse.route_taken}
                </Badge>
                <Badge variant="outline">Confidence: {agentResponse.confidence}%</Badge>
                {typeof agentResponse.movies?.length === "number" && (
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {agentResponse.movies.length} suggested titles
                  </Badge>
                )}
              </div>
              <p className="text-lg leading-relaxed text-foreground">{agentResponse.answer}</p>

              {!!agentResponse.movies?.length && (
                <div className="flex flex-wrap gap-2">
                  {agentResponse.movies.map((movie) => (
                    <Badge key={movie} variant="secondary" className="border-dashed">
                      {movie}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {isMovieLookupLoading && (
          <section className="mt-10 space-y-6">
            <div className="rounded-2xl border bg-card/40 p-6">
              <p className="mb-6 text-sm font-medium text-muted-foreground">
                Fetching matches from /api/v1/search/tmdb...
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <MovieCardSkeleton key={index} />
                ))}
              </div>
            </div>
          </section>
        )}

        {movieMatches.length > 0 && (
          <section className="mt-10 space-y-8">
            {movieMatches.map((match) => (
              <div key={match.movieName} className="rounded-2xl border bg-card/60 p-6 shadow-sm space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-semibold">{match.movieName}</h2>
                    <Badge variant="secondary">AI suggested</Badge>
                  </div>
                  {match.error ? (
                    <p className="text-sm text-destructive">{match.error}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Showing top {Math.min(MAX_TMDB_RESULTS, match.tmdbResults.length)} TMDB matches.
                    </p>
                  )}
                </div>

                {!match.error && match.tmdbResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {match.tmdbResults.map((movie) => (
                      <MovieCard key={`tmdb-${match.movieName}-${movie.id}`} movie={movie} />
                    ))}
                  </div>
                ) : !match.error ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No TMDB matches at the moment.
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

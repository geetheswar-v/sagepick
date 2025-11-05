import { Suspense } from 'react';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserWatchlist } from '@/server/movie';
import { getMovieByTmdbId } from '@/lib/services/movie-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import type { WatchlistStatus } from '@/lib/types/movie';

async function WatchlistContent({ status }: { status?: WatchlistStatus }) {
  const watchlistResult = await getUserWatchlist(status);
  
  if (!watchlistResult.success || watchlistResult.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">
          {status ? `No movies in "${status.replace('_', ' ')}" status` : 'Your watchlist is empty'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Start adding movies to track what you want to watch!
        </p>
      </div>
    );
  }

  // Fetch movie details for all watchlist items
  const movies = await Promise.all(
    watchlistResult.data.map(async (item) => {
      try {
        return await getMovieByTmdbId(item.tmdbId);
      } catch {
        return null;
      }
    })
  );

  const validMovies = movies.filter((movie) => movie !== null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {validMovies.map((movie) => (
        <MovieCard key={movie.tmdb_id} movie={movie} />
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function WatchlistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">My Watchlist</h1>
          <p className="text-muted-foreground mt-2">
            Track and organize movies you want to watch
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 lg:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="PLAN_TO_WATCH">Plan to Watch</TabsTrigger>
            <TabsTrigger value="WATCHING">Watching</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="ON_HOLD">On Hold</TabsTrigger>
            <TabsTrigger value="DROPPED">Dropped</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="all">
              <Suspense fallback={<LoadingSkeleton />}>
                <WatchlistContent />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="PLAN_TO_WATCH">
              <Suspense fallback={<LoadingSkeleton />}>
                <WatchlistContent status="PLAN_TO_WATCH" />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="WATCHING">
              <Suspense fallback={<LoadingSkeleton />}>
                <WatchlistContent status="WATCHING" />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="COMPLETED">
              <Suspense fallback={<LoadingSkeleton />}>
                <WatchlistContent status="COMPLETED" />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="ON_HOLD">
              <Suspense fallback={<LoadingSkeleton />}>
                <WatchlistContent status="ON_HOLD" />
              </Suspense>
            </TabsContent>
            
            <TabsContent value="DROPPED">
              <Suspense fallback={<LoadingSkeleton />}>
                <WatchlistContent status="DROPPED" />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

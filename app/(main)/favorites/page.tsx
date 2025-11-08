import { Suspense } from 'react';
import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFavorites } from '@/server/movie';
import { hasCompletedOnboarding } from '@/server/user';
import { getMovieByTmdbId } from '@/lib/services/movie-service';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { Heart } from 'lucide-react';

async function FavoritesContent() {
  const favoritesResult = await getUserFavorites();
  
  if (!favoritesResult.success || favoritesResult.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">
          Your favorites list is empty
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Add movies you love to your favorites!
        </p>
      </div>
    );
  }

  // Fetch movie details for all favorites
  const movies = await Promise.all(
    favoritesResult.data.map(async (item) => {
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

export default async function FavoritesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Check onboarding status
  const { completed } = await hasCompletedOnboarding();
  if (!completed) {
    redirect('/onboarding');
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
            My Favorites
          </h1>
          <p className="text-muted-foreground mt-2">
            Movies you absolutely love
          </p>
        </div>

        <Suspense fallback={<LoadingSkeleton />}>
          <FavoritesContent />
        </Suspense>
      </div>
    </div>
  );
}

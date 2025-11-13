import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { headers } from 'next/headers';
import { getMovieById } from '@/lib/services/movie-service';
import { getUserMovieData } from '@/server/movie';
import { auth } from '@/lib/auth/auth';
import { Badge } from '@/components/ui/badge';
import { 
  getBackdropUrl, 
  getPosterUrl, 
  formatReleaseDate, 
  formatRuntime,
  formatCurrency,
  formatNumber,
  getRatingColor,
} from '@/lib/utils/movie';
import { MovieRating } from '@/components/movie/movie-rating';
import { WatchlistButton } from '@/components/movie/watchlist-button';
import { FavoriteButton } from '@/components/movie/favorite-button';

interface MoviePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    notFound();
  }

  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAuthenticated = !!session?.user;

  // Fetch movie data and user data in parallel (only fetch user data if authenticated)
  const [movie, userData] = await Promise.all([
    getMovieById(movieId).catch(() => null),
    isAuthenticated 
      ? getUserMovieData(movieId).catch(() => ({ 
          success: false, 
          data: { rating: null, watchlist: null, isFavorite: false } 
        }))
      : Promise.resolve({ 
          success: false, 
          data: { rating: null, watchlist: null, isFavorite: false } 
        }),
  ]);

  if (!movie) {
    notFound();
  }

  const backdropUrl = getBackdropUrl(movie.backdrop_path || movie.poster_path, 'original');
  const posterUrl = getPosterUrl(movie.poster_path, 'w500');
  const ratingColor = getRatingColor(movie.vote_average);

  return (
    <div className="min-h-screen">
      {/* Backdrop Image - Absolutely positioned, full viewport height */}
      <div className="fixed top-0 left-0 right-0 h-screen w-full -z-10">
        <Image
          src={backdropUrl}
          alt={movie.title}
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        
        {/* Gradient Overlays - Stronger gradients for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      {/* Hero Content Section - Accounts for header height */}
      <div className="relative w-full pt-14 sm:pt-16">
        <div className="min-h-[calc(85vh-3.5rem)] sm:min-h-[calc(85vh-4rem)] md:min-h-[calc(70vh-4rem)] flex items-end md:items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-0 w-full">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 lg:gap-12 max-w-7xl">
                {/* Poster - Now visible on all screen sizes */}
                <div className="flex-shrink-0 w-40 sm:w-48 md:w-56 lg:w-72">
                  <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <Image
                      src={posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, (max-width: 1024px) 224px, 288px"
                    />
                  </div>
                </div>

                {/* Movie Info - Side by side with poster on desktop */}
                <div className="flex flex-col justify-center space-y-3 sm:space-y-4 md:space-y-5 flex-1 max-w-3xl">
                  {/* Title and Original Title */}
                  <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                      {movie.title}
                    </h1>
                    {movie.original_title && movie.original_title !== movie.title && (
                      <p className="text-sm sm:text-base md:text-lg text-muted-foreground italic">
                        {movie.original_title}
                      </p>
                    )}
                  </div>

                  {/* Stats Bar */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm sm:text-base">
                    {movie.vote_average && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Star className={`h-5 w-5 sm:h-6 sm:w-6 ${ratingColor}`} fill="currentColor" />
                        <span className={`font-bold text-lg sm:text-xl ${ratingColor}`}>
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    {movie.release_date && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-medium">
                          {formatReleaseDate(movie.release_date)}
                        </span>
                      </>
                    )}
                    
                    {movie.runtime && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className="font-medium">{formatRuntime(movie.runtime)}</span>
                      </>
                    )}
                  </div>

                  {/* Genres */}
                  {movie.genres && movie.genres.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {movie.genres.map((genre) => (
                        <Badge key={genre.id} variant="secondary" className="text-xs sm:text-sm px-3 py-1">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Overview */}
                  {movie.overview && (
                    <p className="text-sm sm:text-base md:text-lg text-foreground/90 leading-relaxed line-clamp-3 md:line-clamp-4">
                      {movie.overview}
                    </p>
                  )}

                  {/* Action Buttons - Only show when user is authenticated */}
                  {isAuthenticated && (
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <MovieRating 
                        movieId={movieId}
                        initialRating={userData.data.rating}
                      />
                      <WatchlistButton 
                        movieId={movieId}
                        initialStatus={userData.data.watchlist}
                      />
                      <FavoriteButton 
                        movieId={movieId}
                        initialIsFavorite={userData.data.isFavorite}
                      />
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Detailed Information Section */}
      <div className="relative">
        {/* Gradient overlay for subtle background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background pointer-events-none" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Full Overview Section */}
            {movie.overview && (
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold">Overview</h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-4xl">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* Movie Details Section */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {/* Status */}
                {movie.status && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div className="text-base font-medium">{movie.status}</div>
                  </div>
                )}
                
                {/* Release Date */}
                {movie.release_date && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Release Date</div>
                    <div className="text-base font-medium">{formatReleaseDate(movie.release_date)}</div>
                  </div>
                )}
                
                {/* Runtime */}
                {movie.runtime && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Runtime</div>
                    <div className="text-base font-medium">{formatRuntime(movie.runtime)}</div>
                  </div>
                )}
                
                {/* Language */}
                {movie.original_language && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Original Language</div>
                    <div className="text-base font-medium uppercase">{movie.original_language}</div>
                  </div>
                )}
                
                {/* Budget */}
                {movie.budget && movie.budget > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Budget</div>
                    <div className="text-base font-medium">{formatCurrency(movie.budget)}</div>
                  </div>
                )}
                
                {/* Revenue */}
                {movie.revenue && movie.revenue > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Revenue</div>
                    <div className="text-base font-medium">{formatCurrency(movie.revenue)}</div>
                  </div>
                )}
                
                {/* Vote Count */}
                {movie.vote_count && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Total Votes</div>
                    <div className="text-base font-medium">{formatNumber(movie.vote_count)}</div>
                  </div>
                )}
                
                {/* Popularity */}
                {movie.popularity && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Popularity Score</div>
                    <div className="text-base font-medium">{movie.popularity.toFixed(1)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Keywords Section */}
            {movie.keywords && movie.keywords.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold">Keywords</h2>
                <div className="flex flex-wrap gap-2">
                  {movie.keywords.map((keyword) => (
                    <Badge key={keyword.id} variant="secondary" className="text-sm px-3 py-1.5">
                      {keyword.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

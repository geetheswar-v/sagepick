'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Info, ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { getBackdropUrl, truncateText, getYear, getRatingColor } from '@/lib/utils/movie';
import { toggleFavorite } from '@/server/movie';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { Movie } from '@/lib/types/movie';

interface HeroCarouselProps {
  movies: Movie[];
  isAuthenticated?: boolean;
  favoriteTmdbIds?: Set<number>;
}

export function HeroCarousel({ 
  movies, 
  isAuthenticated = false,
  favoriteTmdbIds = new Set()
}: HeroCarouselProps) {
  const [currentMovie, setCurrentMovie] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [favorites, setFavorites] = useState(favoriteTmdbIds);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }
    
    const currentTmdbId = movies[currentMovie].tmdb_id;
    setIsTogglingFavorite(true);
    
    try {
      const result = await toggleFavorite(currentTmdbId);
      if (result.success) {
        const newFavorites = new Set(favorites);
        if (favorites.has(currentTmdbId)) {
          newFavorites.delete(currentTmdbId);
        } else {
          newFavorites.add(currentTmdbId);
        }
        setFavorites(newFavorites);
        toast.success(result.message || 'Favorite updated');
      } else {
        toast.error(result.message || 'Failed to update favorite');
      }
    } catch {
      toast.error('Failed to update favorite');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch event handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    
    const difference = touchStartX.current - touchEndX.current;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        nextMovie();
      } else {
        prevMovie();
      }
    }
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (movies.length === 0) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMovie((prev) => (prev + 1) % movies.length);
        setIsTransitioning(false);
      }, 150);
    }, 5000);

    return () => clearInterval(timer);
  }, [movies.length]);

  const nextMovie = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMovie((prev) => (prev + 1) % movies.length);
      setIsTransitioning(false);
    }, 150);
  };

  const prevMovie = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMovie((prev) => (prev - 1 + movies.length) % movies.length);
      setIsTransitioning(false);
    }, 150);
  };

  if (movies.length === 0) {
    return <HeroCarouselSkeleton />;
  }

  const movie = movies[currentMovie];

  return (
    <div 
      ref={carouselRef}
      className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] xl:h-[85vh] w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with smooth transition */}
      <div className="absolute inset-0">
        {movies.map((movieItem, index) => {
          const url = getBackdropUrl(movieItem.backdrop_path || movieItem.poster_path, 'original');
          
          return (
            <Image
              key={movieItem.tmdb_id}
              src={url}
              alt={movieItem.title}
              fill
              className={`object-cover object-center transition-opacity duration-1000 ${
                index === currentMovie ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === 0}
              sizes="100vw"
              quality={90}
            />
          );
        })}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-b from-background/95 via-background/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 lg:h-48 bg-gradient-to-t from-background to-transparent" />

      {/* Navigation Arrows */}
      <button
        onClick={prevMovie}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/70 transition-colors duration-200 backdrop-blur-sm border border-border hidden md:block"
        aria-label="Previous movie"
      >
        <ChevronLeft className="h-6 w-6 text-foreground" />
      </button>

      <button
        onClick={nextMovie}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/70 transition-colors duration-200 backdrop-blur-sm border border-border hidden md:block"
        aria-label="Next movie"
      >
        <ChevronRight className="h-6 w-6 text-foreground" />
      </button>

      {/* Content */}
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 md:pb-0">
          <div 
            key={movie.tmdb_id} 
            className={`max-w-xl sm:max-w-2xl space-y-2 sm:space-y-3 lg:space-y-6 transition-all duration-700 ease-in-out ${
              isTransitioning ? 'opacity-50 transform translate-y-2' : 'opacity-100 transform translate-y-0'
            }`}
          >
            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
              {movie.title}
            </h1>

            {/* Movie Stats */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base">
              {movie.vote_average && (
                <div className="flex items-center gap-1.5">
                  <Star className={cn('h-4 w-4 sm:h-5 sm:w-5', getRatingColor(movie.vote_average))} fill="currentColor" />
                  <span className={cn('font-bold text-base sm:text-lg', getRatingColor(movie.vote_average))}>
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              )}
              {movie.release_date && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-medium text-foreground">{getYear(movie.release_date)}</span>
                </>
              )}
              <span className="border border-border px-2 py-0.5 text-xs text-muted-foreground">HD</span>
            </div>

            {/* Overview */}
            {movie.overview && (
              <p className="hidden sm:block lg:text-lg xl:text-xl text-foreground/90 leading-relaxed max-w-sm sm:max-w-md lg:max-w-xl line-clamp-2 sm:line-clamp-3 text-sm">
                {truncateText(movie.overview, 200)}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pt-1 sm:pt-2">
              <Button asChild size="lg">
                <Link href={`/movie/${movie.tmdb_id}`}>
                  <Info className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                  More Info
                </Link>
              </Button>

              {isAuthenticated && (
                <Button
                  variant="secondary"
                  size="lg"
                  className="border border-border"
                  onClick={handleFavoriteClick}
                  disabled={isTogglingFavorite}
                >
                  <Heart 
                    className={cn(
                      'h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2 transition-colors',
                      favorites.has(movie.tmdb_id) && 'fill-red-500 text-red-500'
                    )} 
                  />
                  {favorites.has(movie.tmdb_id) ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentMovie(index);
                setIsTransitioning(false);
              }, 150);
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentMovie
                ? 'w-6 sm:w-8 bg-foreground'
                : 'w-1.5 sm:w-2 bg-muted-foreground hover:bg-foreground/70'
            }`}
            aria-label={`Go to movie ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroCarouselSkeleton() {
  return (
    <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] xl:h-[85vh] w-full bg-muted animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-b from-background/90 via-background/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 lg:h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

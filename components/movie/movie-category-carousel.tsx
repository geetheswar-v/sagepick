'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { useRef } from 'react';
import type { Movie } from '@/lib/types/movie';

interface MovieCategoryCarouselProps {
  title: string;
  movies: Movie[];
  isLoading?: boolean;
  isAuthenticated?: boolean;
  favoriteTmdbIds?: Set<number>;
}

export function MovieCategoryCarousel({ 
  title, 
  movies, 
  isLoading = false,
  isAuthenticated = false,
  favoriteTmdbIds = new Set()
}: MovieCategoryCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    const newScrollPosition = 
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative space-y-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h2>
        
        {/* Navigation Buttons */}
        <div className="hidden md:flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Movies Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-[150px] sm:w-[180px] md:w-[200px] flex-shrink-0 snap-start">
              <MovieCardSkeleton />
            </div>
          ))
        ) : movies.length === 0 ? (
          // Empty state
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-muted-foreground">No movies found</p>
          </div>
        ) : (
          // Movie cards
          movies.map((movie) => (
            <div 
              key={movie.tmdb_id} 
              className="w-[150px] sm:w-[180px] md:w-[200px] flex-shrink-0 snap-start"
            >
              <MovieCard 
                movie={movie}
                isAuthenticated={isAuthenticated}
                isFavorite={favoriteTmdbIds.has(movie.tmdb_id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

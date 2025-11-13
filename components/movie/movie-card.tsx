'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPosterUrl, getRatingColor, getYear } from '@/lib/utils/movie';
import { toggleFavorite } from '@/server/movie';
import { toast } from '@/lib/toast';
import type { Movie } from '@/lib/types/movie';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  showRating?: boolean;
  isFavorite?: boolean;
  isAuthenticated?: boolean;
  className?: string;
}

export function MovieCard({ 
  movie, 
  showRating = true, 
  isFavorite = false,
  isAuthenticated = false,
  className 
}: MovieCardProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isLoading, setIsLoading] = useState(false);
  
  const posterUrl = getPosterUrl(movie.poster_path);
  const year = getYear(movie.release_date);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const ratingColor = getRatingColor(movie.vote_average);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await toggleFavorite(movie.id);
      if (result.success) {
        setFavorite(!favorite);
        toast.success(favorite ? 'Removed from favorites' : 'Added to favorites');
      } else {
        toast.error(result.message || 'Failed to update favorite');
      }
    } catch {
      toast.error('Failed to update favorite');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/movie/${movie.id}`}>
      <Card className={cn(
        'group overflow-hidden border-none bg-transparent transition-all duration-300 hover:scale-105',
        className
      )}>
        <CardContent className="p-0">
          {/* Poster Image */}
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            
            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            {/* Rating Badge */}
            {showRating && rating && (
              <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 backdrop-blur-sm">
                <Star className={cn('h-3 w-3', ratingColor)} fill="currentColor" />
                <span className={cn('text-xs font-semibold', ratingColor)}>
                  {rating}
                </span>
              </div>
            )}

            {/* Favorite Button - Only show when authenticated */}
            {isAuthenticated && (
              <div className="absolute top-2 left-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <button
                  onClick={handleFavoriteClick}
                  disabled={isLoading}
                  className="rounded-full bg-background/90 p-1.5 backdrop-blur-sm transition-colors hover:bg-background disabled:opacity-50"
                >
                  <Heart 
                    className={cn('h-4 w-4 transition-colors', favorite && 'fill-red-500 text-red-500')} 
                  />
                </button>
              </div>
            )}

            {/* Adult Content Badge */}
            {movie.adult && (
              <div className="absolute bottom-2 left-2">
                <Badge variant="destructive" className="text-xs">18+</Badge>
              </div>
            )}
          </div>

          {/* Movie Info */}
          <div className="mt-2 space-y-1 px-1">
            <h3 className="line-clamp-1 font-semibold text-sm leading-tight text-foreground transition-colors group-hover:text-primary">
              {movie.title}
            </h3>
            <p className="text-xs text-muted-foreground">{year}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Skeleton for loading state
export function MovieCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none bg-transparent">
      <CardContent className="p-0">
        <div className="aspect-[2/3] animate-pulse rounded-lg bg-muted" />
        <div className="mt-2 space-y-2 px-1">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie, PaginationInfo } from '@/lib/types/movie';

interface SearchResultsProps {
  movies: Movie[];
  pagination: PaginationInfo;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  isAuthenticated?: boolean;
  userFavorites?: number[];
}

export function SearchResults({
  movies,
  pagination,
  isLoading,
  onPageChange,
  isAuthenticated = false,
  userFavorites = [],
}: SearchResultsProps) {
  
  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-6xl">🎬</div>
        <h3 className="text-xl font-semibold mb-2">No movies found</h3>
        <p className="text-muted-foreground max-w-md">
          Try adjusting your search query or filters to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  const startItem = (pagination.page - 1) * pagination.per_page + 1;
  const endItem = Math.min(pagination.page * pagination.per_page, pagination.total_items);

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {startItem}-{endItem} of {pagination.total_items.toLocaleString()} movies
        </p>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            isAuthenticated={isAuthenticated}
            isFavorite={userFavorites.includes(movie.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.has_prev}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {/* First Page */}
            {pagination.page > 3 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(1)}
                  className="w-9"
                >
                  1
                </Button>
                {pagination.page > 4 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
              </>
            )}

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, pagination.total_pages) }).map((_, i) => {
              let pageNum: number;
              
              if (pagination.total_pages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.total_pages - 2) {
                pageNum = pagination.total_pages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              if (pageNum < 1 || pageNum > pagination.total_pages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              );
            })}

            {/* Last Page */}
            {pagination.page < pagination.total_pages - 2 && (
              <>
                {pagination.page < pagination.total_pages - 3 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.total_pages)}
                  className="w-9"
                >
                  {pagination.total_pages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.has_next}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

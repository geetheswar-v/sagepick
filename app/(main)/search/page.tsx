'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { SearchFiltersComponent, type SearchFilters } from '@/components/search/search-filters';
import { SearchResults } from '@/components/search/search-results';
import { TMDBSearch } from '@/components/search/tmdb-search';
import { searchMovies } from '@/lib/services/movie-service';
import { getUserFavorites } from '@/server/movie';
import { authClient } from '@/lib/auth/auth-client';
import { toast } from '@/lib/toast';
import type { Movie, PaginationInfo } from '@/lib/types/movie';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ genres: [] });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    per_page: 20,
    total_items: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userFavorites, setUserFavorites] = useState<number[]>([]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: session } = await authClient.getSession();
        setIsAuthenticated(!!session?.user);

        if (session?.user) {
          const favoritesResult = await getUserFavorites();
          if (favoritesResult.success && favoritesResult.data) {
            setUserFavorites(favoritesResult.data.map(f => f.movieId));
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, []);

  // Search movies
  const performSearch = useCallback(async (
    searchTerm: string,
    appliedFilters: SearchFilters,
    page: number
  ) => {
    setIsLoading(true);

    try {
      const searchParams: {
        query: string;
        page?: number;
        per_page?: number;
        with_genres?: string;
        language?: string;
        min_rating?: number;
        year?: number;
      } = {
        query: searchTerm.trim() || '*',
        page,
        per_page: 20,
      };

      if (appliedFilters.genres.length > 0) {
        searchParams.with_genres = appliedFilters.genres.join(',');
      }

      if (appliedFilters.language) {
        searchParams.language = appliedFilters.language;
      }

      if (appliedFilters.yearFrom) {
        searchParams.year = appliedFilters.yearFrom;
      }

      if (appliedFilters.ratingMin !== undefined) {
        searchParams.min_rating = appliedFilters.ratingMin;
      }

      const response = await searchMovies(searchParams);
      
      setMovies(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search movies. Please try again.');
      setMovies([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search submission
  const handleSearch = () => {
    setSearchQuery(query);
    performSearch(query, filters, 1);
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    performSearch(searchQuery, newFilters, 1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    performSearch(searchQuery, filters, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Initial load - show popular movies
  useEffect(() => {
    performSearch('', { genres: [] }, 1);
  }, [performSearch]);

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Search Movies</h1>
          <p className="text-muted-foreground">
            Discover movies from our extensive collection or search TMDB for more
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Search for movies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} className="gap-2">
              <SearchIcon className="h-4 w-4" />
              Search
            </Button>
          </div>
          <TMDBSearch 
            isAuthenticated={isAuthenticated}
            userFavorites={userFavorites}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <SearchFiltersComponent
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-3">
            <SearchResults
              movies={movies}
              pagination={pagination}
              isLoading={isLoading}
              onPageChange={handlePageChange}
              isAuthenticated={isAuthenticated}
              userFavorites={userFavorites}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

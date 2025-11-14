'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MovieCard, MovieCardSkeleton } from '@/components/movie/movie-card';
import { Search, Sparkles, AlertCircle } from 'lucide-react';
import { searchMoviesTMDB } from '@/lib/services/movie-service';
import { toast } from '@/lib/toast';
import type { Movie } from '@/lib/types/movie';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TMDBSearchProps {
  isAuthenticated?: boolean;
  userFavorites?: number[];
}

export function TMDBSearch({ isAuthenticated = false, userFavorites = [] }: TMDBSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await searchMoviesTMDB({
        query: query.trim(),
        page: 1,
        per_page: 20,
      });

      setResults(response.data);
      
      if (response.data.length === 0) {
        toast.info('No movies found on TMDB');
      } else {
        toast.success(`Found ${response.data.length} movies on TMDB`);
      }
    } catch (error) {
      console.error('TMDB search error:', error);
      toast.error('Failed to search TMDB. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Search TMDB
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Search TMDB Database
          </DialogTitle>
          <DialogDescription>
            Search for movies that aren&apos;t in our database yet. Movies will be automatically 
            added when you search.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="tmdb-search">Movie Title</Label>
            <div className="flex gap-2">
              <Input
                id="tmdb-search"
                type="text"
                placeholder="Enter movie title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !query.trim()}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="flex items-start gap-3 rounded-lg bg-blue-500/10 p-4 text-sm border border-blue-500/20">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-500">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Search for any movie from TMDB&apos;s extensive database</li>
                <li>Movies are automatically added to our database when found</li>
                <li>Once added, you can rate, add to watchlist, and mark as favorite</li>
                <li>Next time, these movies will show up in regular search</li>
              </ul>
            </div>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <MovieCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isSearching && hasSearched && (
            <div>
              {results.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Found {results.length} movies
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {results.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        isAuthenticated={isAuthenticated}
                        isFavorite={userFavorites.includes(movie.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 text-5xl">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">No movies found</h3>
                  <p className="text-muted-foreground max-w-md">
                    Try searching with a different title or check your spelling.
                  </p>
                </div>
              )}
            </div>
          )}

          {!isSearching && !hasSearched && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-20" />
              <p>Enter a movie title to search TMDB</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

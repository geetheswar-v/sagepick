'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, SlidersHorizontal } from 'lucide-react';
import { getGenres } from '@/lib/services/movie-service';
import type { Genre } from '@/lib/types/movie';
import { cn } from '@/lib/utils';

export interface SearchFilters {
  genres: number[];
  language?: string;
  yearFrom?: number;
  yearTo?: number;
  ratingMin?: number;
  ratingMax?: number;
  sortBy?: string;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'ml', label: 'Malayalam' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
  { value: 'title.asc', label: 'Title (A-Z)' },
];

const currentYear = new Date().getFullYear();
const YEAR_RANGE = Array.from({ length: 100 }, (_, i) => currentYear - i);

export function SearchFiltersComponent({ 
  filters, 
  onFiltersChange,
  className 
}: SearchFiltersProps) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresList = await getGenres();
        setGenres(genresList);
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleGenre = (genreId: number) => {
    const newGenres = localFilters.genres.includes(genreId)
      ? localFilters.genres.filter(id => id !== genreId)
      : [...localFilters.genres, genreId];
    
    setLocalFilters({ ...localFilters, genres: newGenres });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = { genres: [] };
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = 
    localFilters.genres.length > 0 || 
    localFilters.language || 
    localFilters.yearFrom || 
    localFilters.yearTo || 
    localFilters.ratingMin !== undefined || 
    localFilters.sortBy;

  return (
    <div className={cn('bg-card rounded-lg border border-border', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="md:hidden"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      {/* Filters Content */}
      <div className={cn(
        'space-y-6 p-4',
        !isExpanded && 'hidden md:block'
      )}>
        {/* Genres */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Genres</Label>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <Badge
                key={genre.id}
                variant={localFilters.genres.includes(genre.id) ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => toggleGenre(genre.id)}
              >
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Language</Label>
          <Select
            value={localFilters.language || 'all'}
            onValueChange={(value) => 
              setLocalFilters({ ...localFilters, language: value === 'all' ? undefined : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Languages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Release Year</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">From</Label>
              <Select
                value={localFilters.yearFrom?.toString() || 'any'}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, yearFrom: value === 'any' ? undefined : parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {YEAR_RANGE.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">To</Label>
              <Select
                value={localFilters.yearTo?.toString() || 'any'}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, yearTo: value === 'any' ? undefined : parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {YEAR_RANGE.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Rating Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            Rating Range: {localFilters.ratingMin || 0} - {localFilters.ratingMax || 10}
          </Label>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Minimum</Label>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={[localFilters.ratingMin || 0]}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, ratingMin: value[0] })
                }
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Maximum</Label>
              <Slider
                min={0}
                max={10}
                step={0.5}
                value={[localFilters.ratingMax || 10]}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, ratingMax: value[0] })
                }
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Sort By */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select
            value={localFilters.sortBy || 'popularity.desc'}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, sortBy: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          {hasActiveFilters && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

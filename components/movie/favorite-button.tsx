'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { addToFavorites, removeFromFavorites } from '@/server/movie';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  tmdbId: number;
  initialIsFavorite?: boolean;
}

export function FavoriteButton({ tmdbId, initialIsFavorite = false }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    setIsSubmitting(true);
    
    try {
      if (isFavorite) {
        const result = await removeFromFavorites(tmdbId);
        
        if (result.success) {
          toast.success('Removed from favorites');
          setIsFavorite(false);
        } else {
          toast.error(result.error || 'Failed to remove from favorites');
        }
      } else {
        const result = await addToFavorites(tmdbId);
        
        if (result.success) {
          toast.success('Added to favorites');
          setIsFavorite(true);
        } else {
          toast.error(result.error || 'Failed to add to favorites');
        }
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant={isFavorite ? 'default' : 'outline'}
      size="lg"
      onClick={handleToggle}
      disabled={isSubmitting}
      className={cn(
        isFavorite && 'bg-red-600 hover:bg-red-700 text-white',
      )}
    >
      <Heart 
        className="h-5 w-5 mr-2"
        fill={isFavorite ? 'currentColor' : 'none'}
      />
      {isFavorite ? 'Favorited' : 'Add to Favorites'}
    </Button>
  );
}

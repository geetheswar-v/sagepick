'use client';

import { useState } from 'react';
import { ListPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { addToWatchlist, removeFromWatchlist } from '@/server/movie';
import { getWatchlistStatusLabel, getWatchlistStatusColor } from '@/lib/utils/movie';
import type { UserWatchlist, WatchlistStatus } from '@/lib/types/movie';

interface WatchlistButtonProps {
  movieId: number;
  initialStatus?: UserWatchlist | null;
}

const watchlistStatuses: { value: WatchlistStatus; label: string }[] = [
  { value: 'PLAN_TO_WATCH', label: 'Plan to Watch' },
  { value: 'WATCHING', label: 'Watching' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'DROPPED', label: 'Dropped' },
];

export function WatchlistButton({ movieId, initialStatus }: WatchlistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = async (newStatus: WatchlistStatus) => {
    setIsSubmitting(true);
    
    try {
      const result = await addToWatchlist(movieId, newStatus);
      
      if (result.success) {
        toast.success(`Added to ${getWatchlistStatusLabel(newStatus)}`);
        setStatus(result.data);
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to update watchlist');
      }
    } catch {
      toast.error('An error occurred while updating watchlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await removeFromWatchlist(movieId);
      
      if (result.success) {
        toast.success('Removed from watchlist');
        setStatus(null);
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to remove from watchlist');
      }
    } catch {
      toast.error('An error occurred while removing from watchlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={status ? 'default' : 'outline'} size="lg" disabled={isSubmitting}>
          <ListPlus className="h-5 w-5 mr-2" />
          {status ? (
            <Badge className={getWatchlistStatusColor(status.status)} variant="secondary">
              {getWatchlistStatusLabel(status.status)}
            </Badge>
          ) : (
            'Add to Watchlist'
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {watchlistStatuses.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption.value}
            onClick={() => handleStatusChange(statusOption.value)}
            disabled={isSubmitting}
          >
            {status?.status === statusOption.value && (
              <Check className="h-4 w-4 mr-2" />
            )}
            {statusOption.label}
          </DropdownMenuItem>
        ))}
        {status && (
          <>
            <DropdownMenuItem
              onClick={handleRemove}
              disabled={isSubmitting}
              className="text-destructive"
            >
              Remove from Watchlist
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

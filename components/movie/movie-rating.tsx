'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { rateMovie, deleteRating } from '@/server/movie';
import type { UserMovieRating } from '@/lib/types/movie';

interface MovieRatingProps {
  movieId: number;
  initialRating?: UserMovieRating | null;
}

export function MovieRating({ movieId, initialRating }: MovieRatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number>(initialRating?.rating || 5);
  const [review, setReview] = useState(initialRating?.review || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(initialRating);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await rateMovie(movieId, rating, review || undefined);
      
      if (result.success) {
        toast.success('Rating submitted successfully!');
        setUserRating(result.data);
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to submit rating');
      }
    } catch (error) {
      toast.error('An error occurred while submitting your rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await deleteRating(movieId);
      
      if (result.success) {
        toast.success('Rating removed successfully!');
        setUserRating(null);
        setRating(5);
        setReview('');
        setIsOpen(false);
      } else {
        toast.error(result.error || 'Failed to remove rating');
      }
    } catch (error) {
      toast.error('An error occurred while removing your rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={userRating ? 'default' : 'outline'} size="lg">
          <Star 
            className="h-5 w-5 mr-2" 
            fill={userRating ? 'currentColor' : 'none'} 
          />
          {userRating ? `Your Rating: ${userRating.rating}/10` : 'Rate Movie'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate this Movie</DialogTitle>
          <DialogDescription>
            Share your rating and thoughts about this movie
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Rating Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="rating">Rating</Label>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground">/10</span>
              </div>
            </div>
            <Slider
              id="rating"
              min={0}
              max={10}
              step={0.5}
              value={[rating]}
              onValueChange={(value) => setRating(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Terrible</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Review (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {review.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {userRating && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Remove Rating
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

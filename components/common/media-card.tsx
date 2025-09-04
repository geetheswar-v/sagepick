'use client';

import Image from 'next/image';
import { Movie, TVShow, getImageUrl } from '@/lib/movies';
import { Star, Calendar } from 'lucide-react';
import { useState } from 'react';

interface MediaCardProps {
  item: Movie | TVShow;
  priority?: boolean;
}

function isMovie(item: Movie | TVShow): item is Movie {
  return 'title' in item;
}

export default function MediaCard({ item, priority = false }: MediaCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const title = isMovie(item) ? item.title : item.name;
  const releaseDate = isMovie(item) ? item.release_date : item.first_air_date;
  const posterUrl = getImageUrl(item.poster_path, 'w342');
  
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'TBA';
  const rating = Math.round(item.vote_average * 10) / 10;

  return (
    <div className="flex-shrink-0 w-48 group cursor-pointer">
      <div className="space-y-3">
        {/* Poster Image */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
          {posterUrl && !imageError ? (
            <Image
              src={posterUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="192px"
              priority={priority}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-muted-foreground text-center p-4">
                <div className="text-2xl mb-2">🎬</div>
                <div className="text-xs">No Image</div>
              </div>
            </div>
          )}
          
          {/* Rating Overlay */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {rating}
          </div>
        </div>

        {/* Media Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{year}</span>
            {isMovie(item) ? 
              <span className="bg-info border border-info-foreground text-info-foreground px-1.5 py-0.5 rounded text-xs">
                Movie
              </span>:
              <span className="bg-success border border-success-foreground text-success-foreground px-1.5 py-0.5 rounded text-xs">
                TV
              </span>}
          </div>
        </div>
      </div>
    </div>
  );
}

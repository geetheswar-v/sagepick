'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Movie, getImageUrl } from '@/lib/movies'

interface HeroBannerProps {
  movies: Movie[]
}

export default function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (movies.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [movies.length])

  const goToSlide = (index: number) => setCurrentIndex(index)
  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)

  // Touch handling
  const handleTouch = (startX: number, endX: number) => {
    const difference = startX - endX
    const threshold = 50
    
    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        nextSlide()
      } else {
        prevSlide()
      }
    }
  }

  if (movies.length === 0) {
    return (
      <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] xl:h-[85vh] w-full bg-muted animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-b from-background/90 via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 lg:h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    )
  }

  const currentMovie = movies[currentIndex]

  return (
    <div 
      className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] xl:h-[85vh] w-full overflow-hidden"
      onTouchStart={(e) => {
        const startX = e.touches[0].clientX
        const handleTouchEnd = (endEvent: TouchEvent) => {
          handleTouch(startX, endEvent.changedTouches[0].clientX)
          document.removeEventListener('touchend', handleTouchEnd)
        }
        document.addEventListener('touchend', handleTouchEnd)
      }}
    >
      {/* Background Images - Only current and next */}
      <div className="absolute inset-0">
        {[currentIndex, (currentIndex + 1) % movies.length].map((index) => {
          const movie = movies[index]
          const imageUrl = getImageUrl(movie.backdrop_path || movie.poster_path, 'original')
          
          return imageUrl ? (
            <Image
              key={movie.id}
              src={imageUrl}
              alt={movie.title}
              fill
              className={`object-cover object-center transition-opacity duration-1000 ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === currentIndex}
              sizes="100vw"
              quality={90}
            />
          ) : null
        })}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-b from-background/95 via-background/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 lg:h-48 bg-gradient-to-t from-background to-transparent" />

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/70 transition-colors duration-200 backdrop-blur-sm border border-border hidden md:block"
        aria-label="Previous movie"
      >
        <ChevronLeft className="h-6 w-6 text-foreground" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/70 transition-colors duration-200 backdrop-blur-sm border border-border hidden md:block"
        aria-label="Next movie"
      >
        <ChevronRight className="h-6 w-6 text-foreground" />
      </button>

      {/* Content */}
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 md:pb-0">
          <div className="max-w-xl sm:max-w-2xl space-y-2 sm:space-y-3 lg:space-y-6">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl max-md:text-xl font-bold text-foreground leading-tight">
              {currentMovie.title}
            </h1>

            {/* Movie Stats */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base text-muted-foreground">
              <span className="text-green-500 dark:text-green-400 font-semibold">
                {Math.round(currentMovie.vote_average * 10)}% Rating
              </span>
              <span>{new Date(currentMovie.release_date).getFullYear()}</span>
              <span className="border border-border px-1 text-xs text-muted-foreground">HD</span>
            </div>

            {/* Overview */}
            <p className="hidden sm:block lg:text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-sm sm:max-w-md lg:max-w-xl line-clamp-2 sm:line-clamp-3 text-sm">
              {currentMovie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 pt-1 sm:pt-2">
              <Button>
                <Play className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                Trailer
              </Button>

              <Button variant="secondary" className="border border-border">
                <Info className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                More Info
              </Button>
            </div>

            {/* Carousel Indicators */}
            <div className="flex gap-1.5 pt-3">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'w-6 sm:w-8 bg-foreground'
                      : 'w-1.5 sm:w-2 bg-muted-foreground hover:bg-foreground/70'
                  }`}
                  aria-label={`Go to movie ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

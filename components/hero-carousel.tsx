'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { Movie } from '@/lib/movies'

interface HeroCarouselProps {
  movies: Movie[]
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const [currentMovie, setCurrentMovie] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Touch event handlers for mobile gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!isMobile) return
    
    const difference = touchStartX.current - touchEndX.current
    const threshold = 50 // Minimum swipe distance
    
    if (Math.abs(difference) > threshold) {
      if (difference > 0) {
        // Swipe left - next movie
        nextMovie()
      } else {
        // Swipe right - previous movie
        prevMovie()
      }
    }
  }

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (movies.length === 0) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentMovie((prev) => (prev + 1) % movies.length)
        setIsTransitioning(false)
      }, 150)
    }, 5000)

    return () => clearInterval(timer)
  }, [movies.length])

  // Set loading to false once movies are loaded
  useEffect(() => {
    if (movies.length > 0) {
      setIsLoading(false)
    }
  }, [movies.length])

  const nextMovie = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentMovie((prev) => (prev + 1) % movies.length)
      setIsTransitioning(false)
    }, 150)
  }

  const prevMovie = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentMovie((prev) => (prev - 1 + movies.length) % movies.length)
      setIsTransitioning(false)
    }, 150)
  }

  if (isLoading || movies.length === 0) {
    return (
      <div className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] xl:h-[85vh] landscape-optimized w-full bg-muted animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-b from-background/90 via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 lg:h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    )
  }

  const movie = movies[currentMovie]

  return (
    <div 
      ref={carouselRef}
      className="relative h-[60vh] sm:h-[70vh] md:h-[80vh] xl:h-[85vh] landscape-optimized w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with smooth transition */}
      <div className="absolute inset-0">
        {movies.map((movieItem, index) => {
          const backdropUrl = movieItem.backdrop_path 
            ? `https://image.tmdb.org/t/p/original${movieItem.backdrop_path}`
            : `https://image.tmdb.org/t/p/original${movieItem.poster_path}`;
          
          return (
            <Image
              key={movieItem.id}
              src={backdropUrl}
              alt={movieItem.title}
              fill
              className={`object-cover object-center transition-opacity duration-1000 ${
                index === currentMovie ? 'opacity-100' : 'opacity-0'
              }`}
              priority={index === 0}
              sizes="100vw"
              quality={90}
            />
          );
        })}
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-b from-background/95 via-background/70 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 lg:h-48 bg-gradient-to-t from-background to-transparent" />

      {/* Navigation Arrows */}
      <button
        onClick={prevMovie}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/70 transition-colors duration-200 backdrop-blur-sm border border-border hidden md:block"
        aria-label="Previous movie"
      >
        <ChevronLeft className="h-6 w-6 text-foreground" />
      </button>

      <button
        onClick={nextMovie}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/50 hover:bg-background/70 transition-colors duration-200 backdrop-blur-sm border border-border hidden md:block"
        aria-label="Next movie"
      >
        <ChevronRight className="h-6 w-6 text-foreground" />
      </button>

      {/* Content */}
      <div className="absolute inset-0 flex items-end md:items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24 md:pb-0 mobile-landscape-content">
          <div key={movie.id} className={`max-w-xl sm:max-w-2xl space-y-2 sm:space-y-3 lg:space-y-6 transition-all duration-700 ease-in-out ${
            isTransitioning ? 'opacity-50 transform translate-y-2' : 'opacity-100 transform translate-y-0'
          }`}>
            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl xl:text-7xl mobile-landscape-title font-bold text-foreground leading-tight transition-all duration-700">
              {movie.title}
            </h1>

            {/* Movie Stats  */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm md:text-base text-muted-foreground transition-all duration-700">
              <span className="text-green-500 dark:text-green-400 font-semibold">
                {Math.round(movie.vote_average * 10)}% Rating
              </span>
              <span>{new Date(movie.release_date).getFullYear()}</span>
              <span className="border border-border px-1 text-xs text-muted-foreground">HD</span>
            </div>

            {/* Overview */}
            <p className="hidden sm:block md:block mobile-landscape-hide lg:text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-sm sm:max-w-md lg:max-w-xl line-clamp-2 sm:line-clamp-3 transition-all duration-700 text-sm">
              {movie.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 transition-all duration-700 pt-1 sm:pt-2">
              <Button>
                <Play className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                Trailer
              </Button>

              <Button
                variant="secondary"
                className="border border-border"
              >
                <Info className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-1 sm:mr-2" />
                More Info
              </Button>
            </div>

            {/* Carousel Indicators */}
            <div className="mobile-landscape-indicators flex gap-1.5 pt-3">
              {movies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true)
                    setTimeout(() => {
                      setCurrentMovie(index)
                      setIsTransitioning(false)
                    }, 150)
                  }}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentMovie
                      ? 'w-6 bg-foreground'
                      : 'w-1.5 bg-muted-foreground hover:bg-foreground/70'
                  }`}
                  aria-label={`Go to movie ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10 mobile-landscape-hide-indicators">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true)
              setTimeout(() => {
                setCurrentMovie(index)
                setIsTransitioning(false)
              }, 150)
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentMovie
                ? 'w-6 sm:w-8 bg-foreground'
                : 'w-1.5 sm:w-2 bg-muted-foreground hover:bg-foreground/70'
            }`}
            aria-label={`Go to movie ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
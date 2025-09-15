import { Suspense } from 'react';
import HeroBanner from '@/components/home/hero-banner';
import MediaSection from '@/components/home/media-section';
import { MediaSectionSkeleton } from '@/components/ui/media-skeleton';
import { getTrendingMovies, getPopularMovies, getMoviesInTheaters, getTrendingTVShows } from '@/lib/movies';

// Server components for each section
async function PopularMoviesSection() {
  const movies = await getPopularMovies();
  return <MediaSection title="Popular Movies" items={movies} />;
}

async function InTheatersSection() {
  const movies = await getMoviesInTheaters();
  return <MediaSection title="In Theaters" items={movies} />;
}

async function TrendingTVSection() {
  const tvShows = await getTrendingTVShows();
  return <MediaSection title="Trending TV Shows" items={tvShows} />;
}

export default async function HomePage() {
  const trendingMovies = await getTrendingMovies();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroBanner movies={trendingMovies} />
      
      {/* Main Media Sections */}
      <main className="relative -mt-16 lg:-mt-32 z-10 space-y-0">
        {/* Popular Movies */}
        <Suspense fallback={<MediaSectionSkeleton />}>
          <PopularMoviesSection />
        </Suspense>

        {/* In Theaters */}
        <Suspense fallback={<MediaSectionSkeleton />}>
          <InTheatersSection />
        </Suspense>

        {/* TV Shows */}
        <Suspense fallback={<MediaSectionSkeleton />}>
          <TrendingTVSection />
        </Suspense>
      </main>
    </div>
  );
}

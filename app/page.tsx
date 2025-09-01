import HeroCarousel from '@/components/hero-carousel';
import { getTrendingMovies } from '@/lib/movies';

export default async function Home() {
  const trendingMovies = await getTrendingMovies();

  return (
    <div className="min-h-screen">
      <HeroCarousel movies={trendingMovies} />
    </div>
  );
}

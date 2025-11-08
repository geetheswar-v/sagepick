import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HeroCarousel } from '@/components/movie/hero-carousel';
import { MovieCategoryCarousel } from '@/components/movie/movie-category-carousel';
import { auth } from '@/lib/auth/auth';
import { getUserFavorites } from '@/server/movie';
import { hasCompletedOnboarding } from '@/server/user';
import {
  getCategories,
  getMoviesByCategory,
} from '@/lib/services/movie-service';
import type { PaginationInfo } from '@/lib/types/movie';

const emptyResponse = { 
  data: [], 
  pagination: {} as PaginationInfo 
};

export default async function HomePage() {
  // Check authentication
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const isAuthenticated = !!session?.user;

  // Check onboarding status for authenticated users
  if (isAuthenticated) {
    const { completed } = await hasCompletedOnboarding();
    if (!completed) {
      redirect('/onboarding');
    }
  }
  
  // Fetch favorites if authenticated
  const favoritesData = isAuthenticated 
    ? await getUserFavorites().catch(() => ({ success: false, data: [] }))
    : { success: false, data: [] };
  
  const favoriteTmdbIds = new Set(
    favoritesData.data.map((fav) => fav.tmdbId)
  );

  // First, fetch categories to know what's available
  const [categories] = await Promise.all([
    getCategories().catch(() => []),
  ]);

  // Fetch hero carousel data from first category (prefer trending_day or trending_week)
  const heroCategory = categories.find(c => c.key === 'trending_day') 
    || categories.find(c => c.key === 'trending_week')
    || categories[0];
  
  const heroData = heroCategory 
    ? await getMoviesByCategory(heroCategory.key, { page: 1, per_page: 10 }).catch(() => emptyResponse)
    : emptyResponse;

  // Fetch movies for each category using the category key
  const categoryPromises = categories.map(category =>
    getMoviesByCategory(category.key, { page: 1, per_page: 20 }).catch(() => emptyResponse)
  );

  const [categoryData] = await Promise.all([
    Promise.all(categoryPromises)
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel 
        movies={heroData.data}
        isAuthenticated={isAuthenticated}
        favoriteTmdbIds={favoriteTmdbIds}
      />

      {/* Movie Categories */}
      <main className="relative -mt-16 lg:-mt-32 z-10 space-y-0">
        <div className="space-y-6 py-6">
          {/* Dynamic Categories from API */}
          {categories.map((category, index) => (
            <MovieCategoryCarousel
              key={category.key}
              title={category.name}
              movies={categoryData[index]?.data || []}
              isAuthenticated={isAuthenticated}
              favoriteTmdbIds={favoriteTmdbIds}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

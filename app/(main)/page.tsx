import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { HeroCarousel } from '@/components/movie/hero-carousel';
import { MovieCategoryCarousel } from '@/components/movie/movie-category-carousel';
import { auth } from '@/lib/auth/auth';
import { getUserFavorites } from '@/server/movie';
import { hasCompletedOnboarding, getUserPreferences } from '@/server/user';
import {
  getTrendingMovies,
  getTopRatedMovies,
  getBollywoodMovies,
  getHollywoodMovies,
  getMoviesByGenre,
  getMoviesByLanguage,
  getMoviesByLanguageRelaxed,
  getMoviesByGenreAndLanguage,
  getColdStartRecommendations,
  discoverMovies,
} from '@/lib/services/movie-service';
import type { PaginationInfo, MoviesResponse, RankedMoviesResponse } from '@/lib/types/movie';

const emptyResponse = { 
  data: [], 
  pagination: {} as PaginationInfo 
};

// Helper to get language name
const getLanguageName = (code: string): string => {
  const languageMap: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    te: "Telugu",
    ta: "Tamil",
    ml: "Malayalam",
    kn: "Kannada",
    es: "Spanish",
    fr: "French",
    de: "German",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
  };
  return languageMap[code] || code.toUpperCase();
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
  
  const favoriteMovieIds = new Set(
    favoritesData.data.map((fav) => fav.movieId)
  );

  // Get user preferences for personalized recommendations
  const preferences = isAuthenticated
    ? await getUserPreferences().then(res => res.data)
    : null;

  // Define dynamic categories based on user preferences
  const categories: Array<{ title: string; promise: Promise<MoviesResponse | RankedMoviesResponse> }> = [];

  // 1. Hero Section - Trending Movies
  const heroPromise = getTrendingMovies(1, 10).catch(() => emptyResponse);

  // 2. Personalized Recommendations (relaxed filtering for better results)
  if (preferences && preferences.completedOnboarding) {
    const yearRanges = preferences.releaseYearRanges.map((range: string) => 
      range.toLowerCase() as "modern" | "recent" | "classic" | "retro" | "all"
    );

    // If user selected "ALL" or multiple ranges, use a relaxed approach
    const useRelaxedRanges = yearRanges.includes("all") || yearRanges.length >= 3;

    categories.push({
      title: "Recommended For You",
      promise: getColdStartRecommendations({
        genre_ids: preferences.genreIds,
        languages: preferences.languages,
        release_year_ranges: useRelaxedRanges ? ["all"] : yearRanges,
        keywords: preferences.keywords?.slice(0, 3) || [], // Limit keywords to avoid over-filtering
      }, { per_page: 20, include_adult: false }).catch(() => emptyResponse)
    });
  }

  // 3. Trending Now
  categories.push({
    title: "Trending Now",
    promise: getTrendingMovies(1, 20).catch(() => emptyResponse)
  });

  // 4. Language-specific categories (based on user preferences)
  if (preferences && preferences.languages.length > 0) {
    preferences.languages.forEach(lang => {
      const languageName = getLanguageName(lang);
      
      // Use regular filters for Hindi/English, relaxed for others
      const isMainstream = ["hi", "en"].includes(lang);
      
      categories.push({
        title: `Popular ${languageName} Movies`,
        promise: isMainstream 
          ? getMoviesByLanguage(lang, 1, 20).catch(() => emptyResponse)
          : getMoviesByLanguageRelaxed(lang, 1, 20).catch(() => emptyResponse)
      });
    });
  } else {
    // Default language categories for non-authenticated users
    categories.push(
      {
        title: "Popular English Movies",
        promise: getHollywoodMovies(1, 20).catch(() => emptyResponse)
      },
      {
        title: "Popular Hindi Movies",
        promise: getBollywoodMovies(1, 20).catch(() => emptyResponse)
      }
    );
  }

  // 5. Top Rated (filtered by user's languages if available)
  if (preferences && preferences.languages.length > 0) {
    // Get top rated movies in each of user's selected languages
    preferences.languages.forEach(lang => {
      const languageName = getLanguageName(lang);
      categories.push({
        title: `Top Rated ${languageName} Movies`,
        promise: discoverMovies({
          page: 1,
          per_page: 20,
          language: lang,
          sort_by: "vote_average.desc",
          vote_count_gte: 100, // Ensure well-established ratings
          vote_average_gte: 6.0, // High quality only
        }).catch(() => emptyResponse)
      });
    });
  } else {
    // Default: Global top rated
    categories.push({
      title: "Top Rated of All Time",
      promise: getTopRatedMovies(1, 20).catch(() => emptyResponse)
    });
  }

  // 6. Recently Released (filtered by user's languages if available)
  const today = new Date();
  const threeMonthsAgo = new Date(today);
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  
  if (preferences && preferences.languages.length > 0) {
    // Get recently released movies in each of user's selected languages
    preferences.languages.forEach(lang => {
      const languageName = getLanguageName(lang);
      categories.push({
        title: `New ${languageName} Releases`,
        promise: discoverMovies({
          page: 1,
          per_page: 20,
          language: lang,
          release_date_gte: threeMonthsAgo.toISOString().split("T")[0],
          release_date_lte: today.toISOString().split("T")[0],
          sort_by: "release_date.desc",
          vote_count_gte: 5, // Relaxed for new releases
        }).catch(() => emptyResponse)
      });
    });
  } else {
    // Default: Global recently released
    categories.push({
      title: "Recently Released",
      promise: discoverMovies({
        page: 1,
        per_page: 20,
        release_date_gte: threeMonthsAgo.toISOString().split("T")[0],
        release_date_lte: today.toISOString().split("T")[0],
        sort_by: "release_date.desc",
        vote_count_gte: 10, // At least some votes
      }).catch(() => emptyResponse)
    });
  }

  // 7. Genre-based categories with mixed combinations (if user has preferences)
  if (preferences && preferences.genreIds.length >= 2) {
    // Single genre categories for top 2 genres
    const topGenres = preferences.genreIds.slice(0, 2);
    
    topGenres.forEach(genreId => {
      categories.push({
        title: "More You Might Like",
        promise: getMoviesByGenre([genreId], 1, 20).catch(() => emptyResponse)
      });
    });

    // Mixed genre combinations (2 genres at once)
    if (preferences.genreIds.length >= 2) {
      const genre1 = preferences.genreIds[0];
      const genre2 = preferences.genreIds[1];
      
      categories.push({
        title: "Perfect Genre Mix For You",
        promise: discoverMovies({
          page: 1,
          per_page: 20,
          with_genres: `${genre1},${genre2}`,
          sort_by: "popularity.desc",
          vote_count_gte: 50,
          vote_average_gte: 6.0, // Quality filter
        }).catch(() => emptyResponse)
      });
    }

    // Genre + Language combination for better personalization
    if (preferences.languages.length > 0) {
      const primaryLang = preferences.languages[0];
      const topTwoGenres = preferences.genreIds.slice(0, 2);
      const languageName = getLanguageName(primaryLang);
      
      categories.push({
        title: `Best ${languageName} Movies For You`,
        promise: getMoviesByGenreAndLanguage(topTwoGenres, primaryLang, 1, 20)
          .catch(() => emptyResponse)
      });
    }
  }

  // 8. Classic movies (if user prefers older movies)
  if (preferences && preferences.releaseYearRanges.some(r => 
    ["CLASSIC", "RETRO"].includes(r.toUpperCase())
  )) {
    categories.push({
      title: "Timeless Classics",
      promise: discoverMovies({
        page: 1,
        per_page: 20,
        release_date_lte: "2009-12-31",
        sort_by: "vote_average.desc",
        vote_count_gte: 1000, // Ensure well-known classics
      }).catch(() => emptyResponse)
    });
  }

  // Fetch hero data and all categories in parallel
  const [heroData, ...categoryData] = await Promise.all([
    heroPromise,
    ...categories.map(cat => cat.promise)
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel 
        movies={heroData.data}
        isAuthenticated={isAuthenticated}
        favoriteMovieIds={favoriteMovieIds}
      />

      {/* Movie Categories */}
      <main className="relative -mt-16 lg:-mt-32 z-10 space-y-0">
        <div className="space-y-6 py-6">
          {categories.map((category, index) => {
            const movies = categoryData[index]?.data || [];
            
            // Skip empty categories
            if (movies.length === 0) return null;

            return (
              <MovieCategoryCarousel
                key={`${category.title}-${index}`}
                title={category.title}
                movies={movies}
                isAuthenticated={isAuthenticated}
                favoriteMovieIds={favoriteMovieIds}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}

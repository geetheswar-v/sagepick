import {
  PrismaClient,
  ReleaseYearRange,
  WatchlistStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Core API Configuration
const CORE_API_BASE = "https://core.sagepick.in/api/v1";
const CORE_API_TOKEN = process.env.CORE_SERVICE_BEARER_TOKEN;

if (!CORE_API_TOKEN) {
  throw new Error(
    "CORE_API_TOKEN environment variable is required. Please set it in your .env file."
  );
}

// Movie interface from Core API
interface CoreMovie {
  id: number;
  tmdb_id: number;
  title: string;
  overview: string | null;
  backdrop_path: string | null;
  poster_path: string | null;
  adult: boolean;
  popularity: number;
  vote_average: number;
  release_date: string | null;
}

interface CoreMoviesResponse {
  data: CoreMovie[];
  pagination: {
    page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

// Fetch movies from Core API
async function fetchMoviesFromCore(
  params: Record<string, string | number | boolean | undefined>
): Promise<CoreMovie[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const url = `${CORE_API_BASE}/discover?${queryParams.toString()}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${CORE_API_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Core API error: ${response.statusText}`);
  }

  const data: CoreMoviesResponse = await response.json();
  return data.data;
}

// Fetch multiple pages of movies
async function fetchMultiplePages(
  params: Record<string, string | number | boolean | undefined>,
  maxPages: number = 5
): Promise<CoreMovie[]> {
  const allMovies: CoreMovie[] = [];

  for (let page = 1; page <= maxPages; page++) {
    console.log(`   Fetching page ${page}/${maxPages}...`);
    const movies = await fetchMoviesFromCore({ ...params, page, per_page: 20 });
    allMovies.push(...movies);

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return allMovies;
}

// User personas with realistic preference patterns
const USER_PERSONAS = [
  // Cluster 1: Hollywood Action/Sci-Fi Enthusiasts (15 users - highly similar)
  {
    cluster: "hollywood_action",
    count: 15,
    template: {
      genreIds: [28, 878, 53, 12, 14], // Action, Sci-Fi, Thriller, Adventure, Fantasy
      languages: ["en"],
      releaseYearRanges: [ReleaseYearRange.MODERN, ReleaseYearRange.RECENT],
      keywords: ["superhero", "space", "robots", "aliens", "dystopia"],
      fetchParams: {
        with_genres: "28,878,53",
        language: "en",
        vote_count_gte: 500,
        sort_by: "popularity.desc",
      },
      ratingBias: 0.85, // Very positive towards matching content
    },
  },
  // Cluster 2: Bollywood Drama/Romance Fans (15 users - highly similar)
  {
    cluster: "bollywood_drama",
    count: 15,
    template: {
      genreIds: [18, 10749, 35, 10402, 10751], // Drama, Romance, Comedy, Music, Family
      languages: ["hi", "en"],
      releaseYearRanges: [
        ReleaseYearRange.MODERN,
        ReleaseYearRange.RECENT,
        ReleaseYearRange.CLASSIC,
      ],
      keywords: ["family", "romance", "dance", "friendship", "wedding"],
      fetchParams: {
        with_genres: "18,10749,35",
        language: "hi",
        vote_count_gte: 20,
        sort_by: "popularity.desc",
      },
      ratingBias: 0.75,
    },
  },
  // Cluster 3: Telugu Action/Drama Lovers (8 users - moderately similar)
  {
    cluster: "telugu_action",
    count: 8,
    template: {
      genreIds: [28, 18, 53, 35], // Action, Drama, Thriller, Comedy
      languages: ["te", "hi", "en"],
      releaseYearRanges: [ReleaseYearRange.MODERN, ReleaseYearRange.RECENT],
      keywords: ["action", "mass", "family", "revenge", "comedy"],
      fetchParams: {
        with_genres: "28,18,53",
        language: "te",
        vote_count_gte: 15,
        sort_by: "popularity.desc",
      },
      ratingBias: 0.78,
    },
  },
  // Cluster 4: Tamil Cinema Enthusiasts (7 users - moderately similar)
  {
    cluster: "tamil_mixed",
    count: 7,
    template: {
      genreIds: [18, 28, 53, 80, 9648], // Drama, Action, Thriller, Crime, Mystery
      languages: ["ta", "te", "ml", "en"],
      releaseYearRanges: [
        ReleaseYearRange.MODERN,
        ReleaseYearRange.RECENT,
        ReleaseYearRange.CLASSIC,
      ],
      keywords: ["thriller", "drama", "action", "suspense", "family"],
      fetchParams: {
        with_genres: "18,28,53",
        language: "ta",
        vote_count_gte: 15,
        sort_by: "popularity.desc",
      },
      ratingBias: 0.7,
    },
  },
  // Cluster 5: Multi-language Content Explorers (5 users - lightly similar)
  {
    cluster: "multilingual_explorer",
    count: 5,
    template: {
      genreIds: [18, 35, 10749, 28, 14], // Drama, Comedy, Romance, Action, Fantasy
      languages: ["en", "hi", "te", "ta"],
      releaseYearRanges: [
        ReleaseYearRange.MODERN,
        ReleaseYearRange.RECENT,
        ReleaseYearRange.CLASSIC,
        ReleaseYearRange.ALL,
      ],
      keywords: ["international", "award-winning", "indie", "festival", "art"],
      fetchParams: {
        with_genres: "18,28",
        vote_count_gte: 100,
        sort_by: "vote_average.desc",
      },
      ratingBias: 0.65,
    },
  },
  // Cluster 6: Malayalam/Kannada Regional Cinema Fans (5 users - lightly similar)
  {
    cluster: "south_regional",
    count: 5,
    template: {
      genreIds: [18, 53, 80, 35, 10749], // Drama, Thriller, Crime, Comedy, Romance
      languages: ["ml", "kn", "te", "ta"],
      releaseYearRanges: [ReleaseYearRange.MODERN, ReleaseYearRange.RECENT],
      keywords: ["realistic", "thriller", "family", "social", "drama"],
      fetchParams: {
        with_genres: "18,53,80",
        language: "ml",
        vote_count_gte: 10,
        sort_by: "popularity.desc",
      },
      ratingBias: 0.72,
    },
  },
  // Cluster 7: Horror/Thriller Specialists (3 users - lightly similar)
  {
    cluster: "horror_thriller",
    count: 3,
    template: {
      genreIds: [27, 53, 9648, 878], // Horror, Thriller, Mystery, Sci-Fi
      languages: ["en", "hi", "te"],
      releaseYearRanges: [ReleaseYearRange.MODERN, ReleaseYearRange.RECENT],
      keywords: ["horror", "psychological", "supernatural", "suspense", "dark"],
      fetchParams: {
        with_genres: "27,53,9648",
        language: "en",
        vote_count_gte: 200,
        sort_by: "popularity.desc",
      },
      ratingBias: 0.68,
    },
  },
  // Cluster 8: Classic Cinema Buffs (2 users - lightly similar)
  {
    cluster: "classics",
    count: 2,
    template: {
      genreIds: [18, 36, 10752, 80, 10749], // Drama, History, War, Crime, Romance
      languages: ["en", "hi"],
      releaseYearRanges: [
        ReleaseYearRange.CLASSIC,
        ReleaseYearRange.RETRO,
        ReleaseYearRange.ALL,
      ],
      keywords: ["classic", "vintage", "timeless", "epic", "masterpiece"],
      fetchParams: {
        with_genres: "18,36",
        language: "en",
        release_date_lte: "2010-12-31",
        vote_count_gte: 1000,
        sort_by: "vote_average.desc",
      },
      ratingBias: 0.82,
    },
  },
];

// Helper function to add variation to arrays
function addVariation<T>(array: T[], variationRate: number = 0.3): T[] {
  if (array.length <= 1) return array;
  return array.filter(() => Math.random() > variationRate);
}

// Helper function to calculate rating based on preference match
function calculateRating(
  movie: CoreMovie,
  userPreferences: {
    genreIds: number[];
    languages: string[];
    releaseYearRanges: ReleaseYearRange[];
  },
  baseBias: number
): number {
  // Start with base movie quality (TMDB vote_average)
  const baseRating = movie.vote_average / 2; // Convert 0-10 to 0-5 scale

  // Calculate preference match score (0-1)
  let matchScore = 0;

  // Note: We can't check genre match without fetching full movie details
  // So we'll primarily rely on language and year for matching

  // Language match (worth 40% of match score)
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : null;

  // Year range match (worth 30% of match score)
  if (releaseYear) {
    const yearMatches = userPreferences.releaseYearRanges.some((range) => {
      if (range === ReleaseYearRange.MODERN) return releaseYear >= 2020;
      if (range === ReleaseYearRange.RECENT)
        return releaseYear >= 2010 && releaseYear < 2020;
      if (range === ReleaseYearRange.CLASSIC)
        return releaseYear >= 1990 && releaseYear < 2010;
      if (range === ReleaseYearRange.RETRO) return releaseYear < 1990;
      if (range === ReleaseYearRange.ALL) return true;
      return false;
    });
    if (yearMatches) matchScore += 0.3;
  } else if (userPreferences.releaseYearRanges.includes(ReleaseYearRange.ALL)) {
    matchScore += 0.3;
  }

  // Popularity factor (worth 30% of match score)
  // High popularity movies are more likely to be rated positively
  if (movie.popularity > 50) matchScore += 0.3;
  else if (movie.popularity > 20) matchScore += 0.2;
  else if (movie.popularity > 10) matchScore += 0.1;

  // Apply user's rating bias
  // If movie matches preferences well, rating increases
  // If movie doesn't match, rating decreases
  const biasedRating = baseRating * (1 + matchScore * baseBias);

  // Add some randomness for realism
  const variance = 0.5;
  const randomFactor = (Math.random() - 0.5) * variance;
  const finalRating = biasedRating + randomFactor;

  // Clamp to 1-10 scale and round to 0.5
  return Math.max(1, Math.min(10, Math.round(finalRating * 2) / 2));
}

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper function to hash password using bcrypt (same as better-auth)
async function hashPassword(password: string): Promise<string> {
  // Use bcrypt with salt rounds of 10 (same as better-auth default)
  return await bcrypt.hash(password, 10);
}

async function main() {
  console.log("🌱 Starting database seeding with Core API...\n");

  // Clear existing data
  console.log("🧹 Cleaning up existing data...");
  await prisma.userMovieRating.deleteMany();
  await prisma.userWatchlist.deleteMany();
  await prisma.userFavorite.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleanup complete\n");

  // Fetch movies for each cluster
  const clusterMovies: Map<string, CoreMovie[]> = new Map();

  console.log("🎬 Fetching movies from Core API for each cluster...\n");
  for (const persona of USER_PERSONAS) {
    console.log(`📥 Fetching movies for cluster: ${persona.cluster}`);
    try {
      // Fetch multiple pages to get enough movies (100 movies per cluster)
      const movies = await fetchMultiplePages(persona.template.fetchParams, 5);

      // Also fetch some general popular movies to mix in
      const popularMovies = await fetchMoviesFromCore({
        per_page: 20,
        sort_by: "popularity.desc",
        vote_count_gte: 500,
      });

      // Combine and deduplicate
      const combinedMovies = [...movies, ...popularMovies];
      const uniqueMovies = Array.from(
        new Map(combinedMovies.map((m) => [m.id, m])).values()
      );

      clusterMovies.set(persona.cluster, shuffleArray(uniqueMovies));
      console.log(
        `✅ Fetched ${uniqueMovies.length} movies for ${persona.cluster}\n`
      );

      // Delay between clusters to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error fetching movies for ${persona.cluster}:`, error);
      throw error;
    }
  }

  // Password for all test users: "Test@123"
  const hashedPassword = await hashPassword("Test@123");

  let userCounter = 1;
  const allUsers: string[] = [];

  // Generate users for each cluster
  for (const persona of USER_PERSONAS) {
    console.log(
      `👥 Creating ${persona.count} users for cluster: ${persona.cluster}`
    );

    const availableMovies = clusterMovies.get(persona.cluster) || [];
    if (availableMovies.length === 0) {
      console.warn(
        `⚠️  No movies available for ${persona.cluster}, skipping...`
      );
      continue;
    }

    for (let i = 0; i < persona.count; i++) {
      const userId = `user_${String(userCounter).padStart(3, "0")}`;
      const email = `${userId}@sagepick.test`;
      const name = `Test User ${userCounter}`;

      // Add variation to make users within cluster slightly different
      const variationFactor = i < 2 ? 0.1 : i < 5 ? 0.2 : 0.3;

      const genreIds =
        variationFactor > 0.25
          ? addVariation(persona.template.genreIds, 0.2)
          : persona.template.genreIds;

      const languages =
        variationFactor > 0.25
          ? addVariation(persona.template.languages, 0.15)
          : persona.template.languages;

      const releaseYearRanges =
        variationFactor > 0.25
          ? addVariation(persona.template.releaseYearRanges, 0.2)
          : persona.template.releaseYearRanges;

      const keywords =
        variationFactor > 0.25
          ? addVariation(persona.template.keywords, 0.3)
          : persona.template.keywords;

      // Ensure minimum requirements
      const finalGenreIds =
        genreIds.length >= 3 ? genreIds : persona.template.genreIds.slice(0, 3);
      const finalLanguages =
        languages.length >= 1 ? languages : [persona.template.languages[0]];
      const finalYearRanges =
        releaseYearRanges.length >= 1
          ? releaseYearRanges
          : [persona.template.releaseYearRanges[0]];

      // Create user
      const user = await prisma.user.create({
        data: {
          id: userId,
          email,
          name,
          emailVerified: true, // All users are verified
          createdAt: new Date(
            Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000
          ), // Random date in last 6 months
        },
      });

      // Create account with password
      await prisma.account.create({
        data: {
          id: `account_${userId}`,
          accountId: userId,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
        },
      });

      // Create user preferences
      const userPreferences = {
        genreIds: finalGenreIds,
        languages: finalLanguages,
        releaseYearRanges: finalYearRanges,
      };

      await prisma.userPreference.create({
        data: {
          userId: user.id,
          ...userPreferences,
          keywords: keywords,
          completedOnboarding: true,
        },
      });

      // Generate movie ratings (50-70 movies per user)
      const numRatings = Math.floor(Math.random() * 21) + 50; // 50-70 ratings
      const shuffledMovies = shuffleArray([...availableMovies]);
      const moviesToRate = shuffledMovies.slice(
        0,
        Math.min(numRatings, shuffledMovies.length)
      );

      const ratings = moviesToRate.map((movie) => ({
        userId: user.id,
        movieId: movie.id,
        rating: calculateRating(
          movie,
          userPreferences,
          persona.template.ratingBias + (Math.random() - 0.5) * 0.15
        ),
        createdAt: new Date(
          Date.now() - Math.random() * 150 * 24 * 60 * 60 * 1000
        ), // Random date in last 5 months
      }));

      await prisma.userMovieRating.createMany({
        data: ratings,
        skipDuplicates: true,
      });

      // Add some movies to watchlist (20-30% of rated movies)
      const watchlistSize = Math.floor(
        moviesToRate.length * (0.2 + Math.random() * 0.1)
      );
      const watchlistMovies = shuffledMovies
        .slice(numRatings, numRatings + watchlistSize)
        .map((movie) => ({
          userId: user.id,
          movieId: movie.id,
          status: [
            WatchlistStatus.PLAN_TO_WATCH,
            WatchlistStatus.WATCHING,
            WatchlistStatus.COMPLETED,
            WatchlistStatus.ON_HOLD,
          ][Math.floor(Math.random() * 4)],
        }));

      if (watchlistMovies.length > 0) {
        await prisma.userWatchlist.createMany({
          data: watchlistMovies,
          skipDuplicates: true,
        });
      }

      // Add some favorites (top 15-20% of highly rated movies)
      const favoriteCount = Math.ceil(
        moviesToRate.length * (0.15 + Math.random() * 0.05)
      );
      const highRatedMovies = ratings
        .filter((r) => r.rating >= 8)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, favoriteCount)
        .map((r) => ({
          userId: user.id,
          movieId: r.movieId,
        }));

      if (highRatedMovies.length > 0) {
        await prisma.userFavorite.createMany({
          data: highRatedMovies,
          skipDuplicates: true,
        });
      }

      allUsers.push(userId);
      userCounter++;
    }

    console.log(`✅ Completed cluster: ${persona.cluster}\n`);
  }

  // Generate statistics
  const totalUsers = await prisma.user.count();
  const totalRatings = await prisma.userMovieRating.count();
  const totalWatchlist = await prisma.userWatchlist.count();
  const totalFavorites = await prisma.userFavorite.count();

  // Get rating distribution
  const ratingStats = await prisma.userMovieRating.groupBy({
    by: ["rating"],
    _count: true,
  });

  console.log("📊 Seeding Summary:");
  console.log("═══════════════════════════════════════");
  console.log(`✨ Total Users Created: ${totalUsers}`);
  console.log(`⭐ Total Ratings: ${totalRatings}`);
  console.log(`📺 Total Watchlist Items: ${totalWatchlist}`);
  console.log(`❤️  Total Favorites: ${totalFavorites}`);
  console.log(
    `📈 Average Ratings per User: ${(totalRatings / totalUsers).toFixed(1)}`
  );
  console.log("═══════════════════════════════════════");

  console.log("\n🎯 User Clusters:");
  USER_PERSONAS.forEach((persona) => {
    console.log(`   • ${persona.cluster}: ${persona.count} users`);
  });

  console.log("\n📊 Rating Distribution:");
  ratingStats
    .sort((a, b) => b.rating - a.rating)
    .forEach((stat) => {
      const bar = "█".repeat(Math.ceil((stat._count / totalRatings) * 50));
      console.log(
        `   ${stat.rating.toFixed(1)} ⭐: ${bar} (${stat._count} ratings)`
      );
    });

  console.log("\n🔐 Login Credentials:");
  console.log(
    "   Email: user_001@sagepick.test (or any user_XXX@sagepick.test)"
  );
  console.log("   Password: Test@123");
  console.log("\n✅ Seeding completed successfully! 🎉\n");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

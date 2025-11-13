"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import type { WatchlistStatus } from "@/lib/types/movie";
import { revalidatePath } from "next/cache";

// Helper to get current user
async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session.user;
}

// ==================== RATINGS ====================

export async function rateMovie(
  movieId: number,
  rating: number,
  review?: string
) {
  try {
    const user = await getCurrentUser();

    // Validate rating (0-10)
    if (rating < 0 || rating > 10) {
      throw new Error("Rating must be between 0 and 10");
    }

    const userRating = await prisma.userMovieRating.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
      update: {
        rating,
        review: review || null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        movieId,
        rating,
        review: review || null,
      },
    });

    revalidatePath(`/movie/${movieId}`);
    return { success: true, data: userRating };
  } catch (error) {
    console.error("Error rating movie:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to rate movie",
    };
  }
}

export async function deleteRating(movieId: number) {
  try {
    const user = await getCurrentUser();

    await prisma.userMovieRating.delete({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    revalidatePath(`/movie/${movieId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting rating:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete rating",
    };
  }
}

export async function getUserRating(movieId: number) {
  try {
    const user = await getCurrentUser();

    const rating = await prisma.userMovieRating.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    return { success: true, data: rating };
  } catch (error) {
    return { success: false, data: null };
  }
}

export async function getUserRatings(userId?: string) {
  try {
    const user = userId ? { id: userId } : await getCurrentUser();

    const ratings = await prisma.userMovieRating.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: ratings };
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return { success: false, data: [] };
  }
}

// ==================== WATCHLIST ====================

export async function addToWatchlist(
  movieId: number,
  status: WatchlistStatus = "PLAN_TO_WATCH",
  notes?: string
) {
  try {
    const user = await getCurrentUser();

    const watchlistItem = await prisma.userWatchlist.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
      update: {
        status,
        notes: notes || null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        movieId,
        status,
        notes: notes || null,
      },
    });

    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/watchlist");
    return { success: true, data: watchlistItem };
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add to watchlist",
    };
  }
}

export async function updateWatchlistStatus(
  movieId: number,
  status: WatchlistStatus,
  notes?: string
) {
  try {
    const user = await getCurrentUser();

    const watchlistItem = await prisma.userWatchlist.update({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
      data: {
        status,
        notes: notes || null,
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/watchlist");
    return { success: true, data: watchlistItem };
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update watchlist",
    };
  }
}

export async function removeFromWatchlist(movieId: number) {
  try {
    const user = await getCurrentUser();

    await prisma.userWatchlist.delete({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/watchlist");
    return { success: true };
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove from watchlist",
    };
  }
}

export async function getWatchlistItem(movieId: number) {
  try {
    const user = await getCurrentUser();

    const item = await prisma.userWatchlist.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    return { success: true, data: item };
  } catch (error) {
    return { success: false, data: null };
  }
}

export async function getUserWatchlist(
  status?: WatchlistStatus,
  userId?: string
) {
  try {
    const user = userId ? { id: userId } : await getCurrentUser();

    const watchlist = await prisma.userWatchlist.findMany({
      where: {
        userId: user.id,
        ...(status && { status }),
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: watchlist };
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return { success: false, data: [] };
  }
}

// ==================== FAVORITES ====================

export async function addToFavorites(movieId: number) {
  try {
    const user = await getCurrentUser();

    const favorite = await prisma.userFavorite.create({
      data: {
        userId: user.id,
        movieId,
      },
    });

    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/favorites");
    return { success: true, data: favorite };
  } catch (error) {
    // Check if already exists
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return { success: true, message: "Already in favorites" };
    }

    console.error("Error adding to favorites:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add to favorites",
    };
  }
}

export async function removeFromFavorites(movieId: number) {
  try {
    const user = await getCurrentUser();

    await prisma.userFavorite.delete({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    revalidatePath(`/movie/${movieId}`);
    revalidatePath("/favorites");
    return { success: true };
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to remove from favorites",
    };
  }
}

export async function isFavorite(movieId: number) {
  try {
    const user = await getCurrentUser();

    const favorite = await prisma.userFavorite.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    return { success: true, data: !!favorite };
  } catch (error) {
    return { success: false, data: false };
  }
}

export async function toggleFavorite(movieId: number) {
  try {
    const user = await getCurrentUser();

    const existing = await prisma.userFavorite.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    if (existing) {
      await prisma.userFavorite.delete({
        where: {
          userId_movieId: {
            userId: user.id,
            movieId,
          },
        },
      });
      return {
        success: true,
        message: "Removed from favorites",
        isFavorite: false,
      };
    } else {
      await prisma.userFavorite.create({
        data: {
          userId: user.id,
          movieId,
        },
      });
      return { success: true, message: "Added to favorites", isFavorite: true };
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { success: false, message: "Failed to update favorite" };
  }
}

export async function getUserFavorites(userId?: string) {
  try {
    const user = userId ? { id: userId } : await getCurrentUser();

    const favorites = await prisma.userFavorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: favorites };
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return { success: false, data: [] };
  }
}

// ==================== COMBINED DATA ====================

export async function getUserMovieData(movieId: number) {
  try {
    const user = await getCurrentUser();

    const [rating, watchlist, favorite] = await Promise.all([
      prisma.userMovieRating.findUnique({
        where: { userId_movieId: { userId: user.id, movieId } },
      }),
      prisma.userWatchlist.findUnique({
        where: { userId_movieId: { userId: user.id, movieId } },
      }),
      prisma.userFavorite.findUnique({
        where: { userId_movieId: { userId: user.id, movieId } },
      }),
    ]);

    return {
      success: true,
      data: {
        rating,
        watchlist,
        isFavorite: !!favorite,
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {
        rating: null,
        watchlist: null,
        isFavorite: false,
      },
    };
  }
}

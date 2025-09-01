"use server";

import {
  getTrendingMovies,
  getPopularMovies,
  getMoviesInTheaters,
  getTrendingTVShows,
} from "@/lib/movies";

export async function fetchTrendingMovies() {
  try {
    return await getTrendingMovies();
  } catch (error) {
    console.error("Error in fetchTrendingMovies server action:", error);
    throw error;
  }
}

export async function fetchPopularMovies() {
  try {
    return await getPopularMovies();
  } catch (error) {
    console.error("Error in fetchPopularMovies server action:", error);
    throw error;
  }
}

export async function fetchMoviesInTheaters() {
  try {
    return await getMoviesInTheaters();
  } catch (error) {
    console.error("Error in fetchMoviesInTheaters server action:", error);
    throw error;
  }
}

export async function fetchTrendingTVShows() {
  try {
    return await getTrendingTVShows();
  } catch (error) {
    console.error("Error in fetchTrendingTVShows server action:", error);
    throw error;
  }
}

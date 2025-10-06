export const SYNC_CONFIG = {
  ITEMS_PER_CATEGORY: 25,

  RATE_LIMITS: {
    TMDB: { requests: 5, window: 1000 },
    JIKAN: { requests: 2, window: 1000 },
    MANGADEX: { requests: 2, window: 1000 },
  },

  HOURLY_SYNC: {
    ITEMS_PER_PAGE: { MOVIES: 20, TV: 20, ANIME: 25, MANGA: 20 },
    MAX_PAGES_PER_RUN: 1,
  },

  CLEANUP: {
    categoryRetentionDays: 7,
    logRetentionDays: 30,
    jobRetentionDays: 90,
  },
  RETRY: { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 },
} as const;

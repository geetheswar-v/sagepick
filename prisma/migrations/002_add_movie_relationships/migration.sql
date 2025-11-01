-- CreateEnum
CREATE TYPE "WatchlistStatus" AS ENUM ('PLAN_TO_WATCH', 'WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED');

-- CreateTable
CREATE TABLE "user_movie_rating" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_movie_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_watchlist" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "status" "WatchlistStatus" NOT NULL DEFAULT 'PLAN_TO_WATCH',
    "progress" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_favorite" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_favorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_movie_rating_userId_idx" ON "user_movie_rating"("userId");

-- CreateIndex
CREATE INDEX "user_movie_rating_tmdbId_idx" ON "user_movie_rating"("tmdbId");

-- CreateIndex
CREATE INDEX "user_movie_rating_rating_idx" ON "user_movie_rating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "user_movie_rating_userId_tmdbId_key" ON "user_movie_rating"("userId", "tmdbId");

-- CreateIndex
CREATE INDEX "user_watchlist_userId_idx" ON "user_watchlist"("userId");

-- CreateIndex
CREATE INDEX "user_watchlist_tmdbId_idx" ON "user_watchlist"("tmdbId");

-- CreateIndex
CREATE INDEX "user_watchlist_status_idx" ON "user_watchlist"("status");

-- CreateIndex
CREATE INDEX "user_watchlist_userId_status_idx" ON "user_watchlist"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_watchlist_userId_tmdbId_key" ON "user_watchlist"("userId", "tmdbId");

-- CreateIndex
CREATE INDEX "user_favorite_userId_idx" ON "user_favorite"("userId");

-- CreateIndex
CREATE INDEX "user_favorite_tmdbId_idx" ON "user_favorite"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_userId_tmdbId_key" ON "user_favorite"("userId", "tmdbId");

-- AddForeignKey
ALTER TABLE "user_movie_rating" ADD CONSTRAINT "user_movie_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watchlist" ADD CONSTRAINT "user_watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_favorite" ADD CONSTRAINT "user_favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

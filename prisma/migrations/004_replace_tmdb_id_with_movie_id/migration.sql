/*
  Warnings:

  - You are about to drop the column `tmdbId` on the `user_favorite` table. All the data in the column will be lost.
  - You are about to drop the column `tmdbId` on the `user_movie_rating` table. All the data in the column will be lost.
  - You are about to drop the column `tmdbId` on the `user_watchlist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,movieId]` on the table `user_favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,movieId]` on the table `user_movie_rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,movieId]` on the table `user_watchlist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `movieId` to the `user_favorite` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movieId` to the `user_movie_rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movieId` to the `user_watchlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."user_favorite_tmdbId_idx";

-- DropIndex
DROP INDEX "public"."user_favorite_userId_tmdbId_key";

-- DropIndex
DROP INDEX "public"."user_movie_rating_tmdbId_idx";

-- DropIndex
DROP INDEX "public"."user_movie_rating_userId_tmdbId_key";

-- DropIndex
DROP INDEX "public"."user_watchlist_tmdbId_idx";

-- DropIndex
DROP INDEX "public"."user_watchlist_userId_tmdbId_key";

-- AlterTable
ALTER TABLE "user_favorite" DROP COLUMN "tmdbId",
ADD COLUMN     "movieId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_movie_rating" DROP COLUMN "tmdbId",
ADD COLUMN     "movieId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user_watchlist" DROP COLUMN "tmdbId",
ADD COLUMN     "movieId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "user_favorite_movieId_idx" ON "user_favorite"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "user_favorite_userId_movieId_key" ON "user_favorite"("userId", "movieId");

-- CreateIndex
CREATE INDEX "user_movie_rating_movieId_idx" ON "user_movie_rating"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "user_movie_rating_userId_movieId_key" ON "user_movie_rating"("userId", "movieId");

-- CreateIndex
CREATE INDEX "user_watchlist_movieId_idx" ON "user_watchlist"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "user_watchlist_userId_movieId_key" ON "user_watchlist"("userId", "movieId");

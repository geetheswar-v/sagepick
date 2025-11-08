-- CreateEnum
CREATE TYPE "ReleaseYearRange" AS ENUM ('MODERN', 'RECENT', 'CLASSIC', 'RETRO', 'ALL');

-- CreateTable
CREATE TABLE "user_preference" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "genreIds" INTEGER[],
    "languages" TEXT[],
    "releaseYearRanges" "ReleaseYearRange"[],
    "keywords" TEXT[],
    "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preference_userId_key" ON "user_preference"("userId");

-- CreateIndex
CREATE INDEX "user_preference_userId_idx" ON "user_preference"("userId");

-- AddForeignKey
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `media_category` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `status` column on the `user_media_rating` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The required column `id` was added to the `media_category` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `media_category` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."MediaStatus" AS ENUM ('PLANNING', 'WATCHING', 'READING', 'COMPLETED', 'PAUSED', 'DROPPED', 'REWATCHING', 'REREADING');

-- CreateEnum
CREATE TYPE "public"."SyncJobType" AS ENUM ('MOVIES_SYNC', 'TV_SYNC', 'ANIME_SYNC', 'MANGA_SYNC', 'FULL_SYNC', 'CATEGORIES_UPDATE');

-- CreateEnum
CREATE TYPE "public"."SyncJobStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- AlterTable
ALTER TABLE "public"."media_category" DROP CONSTRAINT "media_category_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "media_category_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."user_media_rating" DROP COLUMN "status",
ADD COLUMN     "status" "public"."MediaStatus";

-- DropEnum
DROP TYPE "public"."WatchStatus";

-- CreateTable
CREATE TABLE "public"."sync_job" (
    "id" TEXT NOT NULL,
    "jobType" "public"."SyncJobType" NOT NULL,
    "status" "public"."SyncJobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMsg" TEXT,
    "itemsTotal" INTEGER DEFAULT 0,
    "itemsSync" INTEGER DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "sync_job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sync_log" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "level" "public"."LogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_job_jobType_startedAt_idx" ON "public"."sync_job"("jobType", "startedAt");

-- CreateIndex
CREATE INDEX "sync_job_status_idx" ON "public"."sync_job"("status");

-- CreateIndex
CREATE INDEX "sync_log_jobId_createdAt_idx" ON "public"."sync_log"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "sync_log_level_idx" ON "public"."sync_log"("level");

-- CreateIndex
CREATE INDEX "media_category_category_title_createdAt_idx" ON "public"."media_category"("category_title", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."sync_log" ADD CONSTRAINT "sync_log_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."sync_job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

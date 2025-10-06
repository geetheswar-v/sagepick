-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."SyncJobType" ADD VALUE 'TRENDING_SYNC';
ALTER TYPE "public"."SyncJobType" ADD VALUE 'POPULAR_SYNC';
ALTER TYPE "public"."SyncJobType" ADD VALUE 'TOP_RATED_SYNC';
ALTER TYPE "public"."SyncJobType" ADD VALUE 'DRAMAS_SYNC';
ALTER TYPE "public"."SyncJobType" ADD VALUE 'UPCOMING_SYNC';

-- CreateTable
CREATE TABLE "public"."sync_state" (
    "id" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "currentPage" INTEGER NOT NULL DEFAULT 1,
    "currentOffset" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "lastRun" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "sync_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sync_state_syncType_key" ON "public"."sync_state"("syncType");

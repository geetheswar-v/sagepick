-- CreateEnum
CREATE TYPE "public"."MediaType" AS ENUM ('MOVIE', 'TV', 'ANIME', 'MANGA');

-- CreateEnum
CREATE TYPE "public"."ProviderType" AS ENUM ('TMDB', 'JIKAN', 'MANGADX');

-- CreateEnum
CREATE TYPE "public"."WatchStatus" AS ENUM ('PLANNING', 'CURRENT', 'COMPLETED', 'PAUSED', 'DROPPED', 'REWATCHING');

-- CreateTable
CREATE TABLE "public"."media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alt_titles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "synopsis" TEXT,
    "type" "public"."MediaType" NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_type" "public"."ProviderType" NOT NULL,
    "cover_image" TEXT,
    "backdrop_image" TEXT,
    "status" TEXT,
    "year" INTEGER,
    "score" DOUBLE PRECISION DEFAULT 0,
    "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "adult" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movie_data" (
    "media_id" TEXT NOT NULL,
    "runtime" INTEGER,
    "revenue" BIGINT,
    "budget" BIGINT,
    "popularity" DOUBLE PRECISION,
    "release_date" TEXT,

    CONSTRAINT "movie_data_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "public"."tv_data" (
    "media_id" TEXT NOT NULL,
    "episode_count" INTEGER,
    "season_count" INTEGER,
    "last_air_date" TEXT,
    "popularity" DOUBLE PRECISION,
    "network" TEXT,
    "show_type" TEXT,

    CONSTRAINT "tv_data_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "public"."anime_data" (
    "media_id" TEXT NOT NULL,
    "anime_type" TEXT,
    "episodes" INTEGER,
    "duration" TEXT,
    "season" TEXT,
    "airing" BOOLEAN DEFAULT false,
    "airing_from" TEXT,
    "airing_to" TEXT,
    "studios" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rating" TEXT,

    CONSTRAINT "anime_data_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "public"."manga_data" (
    "media_id" TEXT NOT NULL,
    "last_chapter" TEXT,
    "last_volume" TEXT,
    "rating" TEXT,
    "publication_demographic" TEXT,

    CONSTRAINT "manga_data_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "public"."user_media_rating" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "media_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "status" "public"."WatchStatus",
    "progress" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_media_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."media_category" (
    "media_id" TEXT NOT NULL,
    "category_title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "media_category_pkey" PRIMARY KEY ("media_id")
);

-- CreateIndex
CREATE INDEX "media_type_idx" ON "public"."media"("type");

-- CreateIndex
CREATE INDEX "media_provider_type_idx" ON "public"."media"("provider_type");

-- CreateIndex
CREATE INDEX "media_score_idx" ON "public"."media"("score");

-- CreateIndex
CREATE INDEX "media_year_idx" ON "public"."media"("year");

-- CreateIndex
CREATE UNIQUE INDEX "media_provider_id_provider_type_key" ON "public"."media"("provider_id", "provider_type");

-- CreateIndex
CREATE INDEX "user_media_rating_user_id_idx" ON "public"."user_media_rating"("user_id");

-- CreateIndex
CREATE INDEX "user_media_rating_media_id_idx" ON "public"."user_media_rating"("media_id");

-- CreateIndex
CREATE INDEX "user_media_rating_rating_idx" ON "public"."user_media_rating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "user_media_rating_user_id_media_id_key" ON "public"."user_media_rating"("user_id", "media_id");

-- CreateIndex
CREATE INDEX "media_category_category_title_position_idx" ON "public"."media_category"("category_title", "position");

-- CreateIndex
CREATE UNIQUE INDEX "media_category_media_id_category_title_key" ON "public"."media_category"("media_id", "category_title");

-- AddForeignKey
ALTER TABLE "public"."movie_data" ADD CONSTRAINT "movie_data_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tv_data" ADD CONSTRAINT "tv_data_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."anime_data" ADD CONSTRAINT "anime_data_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."manga_data" ADD CONSTRAINT "manga_data_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_media_rating" ADD CONSTRAINT "user_media_rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_media_rating" ADD CONSTRAINT "user_media_rating_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."media_category" ADD CONSTRAINT "media_category_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

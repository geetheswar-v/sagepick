import { prisma } from "@/lib/prisma";
import type { MovieItem, TVItem } from "@/lib/api/types/tmdb";
import type { AnimeItem } from "@/lib/api/types/jikan";
import type { MangaItem } from "@/lib/api/types/mangadex";
import { MediaType, ProviderType } from "@prisma/client";
import type { Media, Prisma } from "@prisma/client";

type ExternalMediaItem = MovieItem | TVItem | AnimeItem | MangaItem;

const uniqueStrings = (values?: string[]): string[] => {
  if (!values || values.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    const normalized = value.trim();
    if (!normalized) continue;
    seen.add(normalized);
  }
  return Array.from(seen);
};

const normalizeString = (value?: string | null): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const resolveEnumValue = <T extends Record<string, string>>(
  enumObject: T,
  value?: string | null,
  aliases: Record<string, string> = {}
): string | undefined => {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;

  const direct = enumObject[normalized as keyof T];
  if (direct) return direct;

  const upper = normalized.toUpperCase();

  const aliasMatch = aliases[upper] || aliases[normalized];
  if (aliasMatch) {
    const aliasDirect = enumObject[aliasMatch as keyof T];
    if (aliasDirect) return aliasDirect;
  }

  const upperDirect = enumObject[upper as keyof T];
  if (upperDirect) return upperDirect;

  for (const enumValue of Object.values(enumObject)) {
    if (enumValue === normalized) return enumValue;
    if (enumValue.toUpperCase() === upper) return enumValue;
  }

  return undefined;
};

const getScore = (item: ExternalMediaItem): number | undefined => {
  if (typeof (item as { score?: number }).score === "number") {
    return (item as { score: number }).score;
  }

  if (typeof (item as { score_by_imdb?: number }).score_by_imdb === "number") {
    return (item as { score_by_imdb: number }).score_by_imdb;
  }

  if (typeof (item as { score_by_mal?: number }).score_by_mal === "number") {
    return (item as { score_by_mal: number }).score_by_mal;
  }

  return undefined;
};

const deriveYear = (item: ExternalMediaItem): number | undefined => {
  if (typeof (item as { year?: number }).year === "number") {
    const year = (item as { year?: number }).year;
    return year && year > 0 ? year : undefined;
  }

  if (
    typeof (item as { first_air_year?: number }).first_air_year === "number"
  ) {
    const year = (item as { first_air_year?: number }).first_air_year;
    return year && year > 0 ? year : undefined;
  }

  return undefined;
};

const deriveTags = (item: ExternalMediaItem): string[] => {
  if (Array.isArray((item as { tags?: string[] }).tags)) {
    return uniqueStrings((item as { tags?: string[] }).tags);
  }

  return [];
};

const deriveCountries = (item: ExternalMediaItem): string[] => {
  if (Array.isArray((item as { countries?: string[] }).countries)) {
    return uniqueStrings((item as { countries?: string[] }).countries);
  }

  return [];
};

const deriveLanguages = (item: ExternalMediaItem): string[] => {
  if (Array.isArray((item as { languages?: string[] }).languages)) {
    return uniqueStrings((item as { languages?: string[] }).languages);
  }

  return [];
};

const ensureProviderInfo = (
  item: ExternalMediaItem
): { providerId: string; providerType: ProviderType; mediaType: MediaType } => {
  const providerId = normalizeString(
    (item as { providerId?: string }).providerId ||
      ((item as { id?: number | string }).id !== undefined
        ? String((item as { id?: number | string }).id)
        : undefined)
  );

  const providerTypeString = (item as { providerType?: string }).providerType;
  const mediaTypeString = (item as { mediaType?: string }).mediaType;

  if (!providerId || !providerTypeString || !mediaTypeString) {
    throw new Error("Media item is missing provider metadata for insertion");
  }

  const providerType = resolveEnumValue(ProviderType, providerTypeString, {
    MANGADX: "MANGADEX",
  }) as ProviderType | undefined;
  const mediaType = resolveEnumValue(MediaType, mediaTypeString) as
    | MediaType
    | undefined;

  if (!providerType || !mediaType) {
    throw new Error("Unsupported media/provider type received for insertion");
  }

  return { providerId, providerType, mediaType };
};

export const insertMedia = async (
  item: ExternalMediaItem,
  transactionClient?: Prisma.TransactionClient
): Promise<Media> => {
  const title = normalizeString((item as { title?: string }).title);
  if (!title) {
    throw new Error("Media item cannot be inserted without a title");
  }

  const { providerId, providerType, mediaType } = ensureProviderInfo(item);

  const altTitles = uniqueStrings(
    (item as { alt_titles?: string[] }).alt_titles
  );
  const synopsis = normalizeString((item as { synopsis?: string }).synopsis);
  const coverImage = normalizeString(
    (item as { cover_image?: string }).cover_image
  );
  const backdropImage = normalizeString(
    (item as { backdrop_image?: string }).backdrop_image
  );
  const status = normalizeString((item as { status?: string }).status);
  const normalizedScore = getScore(item);
  const genres = uniqueStrings((item as { genres?: string[] }).genres);
  const tags = deriveTags(item);
  const countries = deriveCountries(item);
  const languages = deriveLanguages(item);
  const adult = Boolean((item as { adult?: boolean }).adult);
  const year = deriveYear(item);

  const baseCreate: Prisma.MediaUncheckedCreateInput = {
    title,
    type: mediaType,
    provider_id: providerId,
    provider_type: providerType,
    alt_titles: altTitles,
    genres,
    tags,
    countries,
    languages,
    adult,
  };

  if (synopsis !== undefined) baseCreate.synopsis = synopsis;
  if (coverImage !== undefined) baseCreate.cover_image = coverImage;
  if (backdropImage !== undefined) baseCreate.backdrop_image = backdropImage;
  if (status !== undefined) baseCreate.status = status;
  if (year !== undefined) baseCreate.year = year;
  if (normalizedScore !== undefined) baseCreate.score = normalizedScore;

  const baseUpdate: Prisma.MediaUncheckedUpdateInput = {
    title,
    alt_titles: { set: altTitles },
    genres: { set: genres },
    tags: { set: tags },
    countries: { set: countries },
    languages: { set: languages },
    adult,
  };

  if (synopsis !== undefined) baseUpdate.synopsis = synopsis;
  if (coverImage !== undefined) baseUpdate.cover_image = coverImage;
  if (backdropImage !== undefined) baseUpdate.backdrop_image = backdropImage;
  if (status !== undefined) baseUpdate.status = status;
  if (year !== undefined) baseUpdate.year = year;
  if (normalizedScore !== undefined) baseUpdate.score = normalizedScore;

  const execute = async (client: Prisma.TransactionClient): Promise<Media> => {
    const media = await client.media.upsert({
      where: {
        provider_id_provider_type: {
          provider_id: providerId,
          provider_type: providerType,
        },
      },
      create: baseCreate,
      update: baseUpdate,
    });

    switch (mediaType) {
      case MediaType.ANIME: {
        const anime = item as AnimeItem;
        const animeCreate: Prisma.AnimeDataUncheckedCreateInput = {
          media_id: media.id,
          airing: anime.airing,
          studios: uniqueStrings(anime.studios),
        };
        const animeType = normalizeString(anime.anime_type);
        if (animeType !== undefined) animeCreate.anime_type = animeType;
        if (anime.episodes !== undefined) animeCreate.episodes = anime.episodes;
        const duration = normalizeString(anime.duration);
        if (duration !== undefined) animeCreate.duration = duration;
        const season = normalizeString(anime.season);
        if (season !== undefined) animeCreate.season = season;
        const airingFrom = normalizeString(anime.airing_from);
        if (airingFrom !== undefined) animeCreate.airing_from = airingFrom;
        const airingTo = normalizeString(anime.airing_to);
        if (airingTo !== undefined) animeCreate.airing_to = airingTo;
        const rating = normalizeString(anime.rating);
        if (rating !== undefined) animeCreate.rating = rating;

        const animeUpdate: Prisma.AnimeDataUncheckedUpdateInput = {
          airing: anime.airing,
          studios: { set: uniqueStrings(anime.studios) },
        };
        if (animeType !== undefined) animeUpdate.anime_type = animeType;
        if (anime.episodes !== undefined) animeUpdate.episodes = anime.episodes;
        if (duration !== undefined) animeUpdate.duration = duration;
        if (season !== undefined) animeUpdate.season = season;
        if (airingFrom !== undefined) animeUpdate.airing_from = airingFrom;
        if (airingTo !== undefined) animeUpdate.airing_to = airingTo;
        if (rating !== undefined) animeUpdate.rating = rating;

        await client.animeData.upsert({
          where: { media_id: media.id },
          create: animeCreate,
          update: animeUpdate,
        });
        break;
      }
      case MediaType.MANGA: {
        const manga = item as MangaItem;
        const mangaCreate: Prisma.MangaDataUncheckedCreateInput = {
          media_id: media.id,
        };
        const lastChapter = normalizeString(manga.last_chapter);
        if (lastChapter !== undefined) mangaCreate.last_chapter = lastChapter;
        const lastVolume = normalizeString(manga.last_volume);
        if (lastVolume !== undefined) mangaCreate.last_volume = lastVolume;
        const rating = normalizeString(manga.rating);
        if (rating !== undefined) mangaCreate.rating = rating;
        const demographic = normalizeString(manga.publication_demographic);
        if (demographic !== undefined)
          mangaCreate.publication_demographic = demographic;

        const mangaUpdate: Prisma.MangaDataUncheckedUpdateInput = {};
        if (lastChapter !== undefined) mangaUpdate.last_chapter = lastChapter;
        if (lastVolume !== undefined) mangaUpdate.last_volume = lastVolume;
        if (rating !== undefined) mangaUpdate.rating = rating;
        if (demographic !== undefined)
          mangaUpdate.publication_demographic = demographic;

        await client.mangaData.upsert({
          where: { media_id: media.id },
          create: mangaCreate,
          update: mangaUpdate,
        });
        break;
      }
      default:
        break;
    }

    return media;
  };

  if (transactionClient) {
    return execute(transactionClient);
  }

  return prisma.$transaction((tx) => execute(tx));
};

export type { ExternalMediaItem };

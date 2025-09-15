export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface OrderParams {
  [key: string]: "asc" | "desc";
}

export interface MangaTitle {
  [language: string]: string;
}

export interface Tag {
  id: string;
  type: "tag";
  attributes: {
    name: { [language: string]: string };
    description: { [language: string]: string };
    group: string;
    version: number;
  };
  relationships: Relationship[];
}

export interface Relationship {
  id: string;
  type: string;
  related?: string;
  attributes?: unknown;
}

export interface CoverArtRelationship extends Relationship {
  type: "cover_art";
  attributes: {
    fileName: string;
    volume?: string;
    description?: string;
    locale?: string;
    version: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface MangaAttributes {
  title: MangaTitle;
  altTitles: MangaTitle[];
  description: { [language: string]: string };
  isLocked: boolean;
  links: { [key: string]: string };
  originalLanguage: string;
  lastVolume?: string;
  lastChapter?: string;
  publicationDemographic?: "shounen" | "shoujo" | "josei" | "seinen" | "none";
  status: "ongoing" | "completed" | "hiatus" | "cancelled";
  year?: number;
  contentRating: "safe" | "suggestive" | "erotica" | "pornographic";
  chapterNumbersResetOnNewVolume: boolean;
  availableTranslatedLanguages: string[];
  latestUploadedChapter?: string;
  tags: Tag[];
  state: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Manga {
  id: string;
  type: "manga";
  attributes: MangaAttributes;
  relationships: Relationship[];
}

export interface MangaResponse {
  result: string;
  response: string;
  data: Manga[];
  limit: number;
  offset: number;
  total: number;
}

export interface SearchParams extends PaginationParams {
  title?: string;
  authorOrArtist?: string;
  authors?: string[];
  artists?: string[];
  year?: number;
  includedTags?: string[];
  includedTagsMode?: "AND" | "OR";
  excludedTags?: string[];
  excludedTagsMode?: "AND" | "OR";
  status?: ("ongoing" | "completed" | "hiatus" | "cancelled")[];
  originalLanguage?: string[];
  excludedOriginalLanguage?: string[];
  availableTranslatedLanguage?: string[];
  publicationDemographic?: (
    | "shounen"
    | "shoujo"
    | "josei"
    | "seinen"
    | "none"
  )[];
  ids?: string[];
  contentRating?: ("safe" | "suggestive" | "erotica" | "pornographic")[];
  createdAtSince?: string;
  updatedAtSince?: string;
  order?: OrderParams;
  includes?: (
    | "manga"
    | "cover_art"
    | "author"
    | "artist"
    | "tag"
    | "creator"
  )[];
  hasAvailableChapters?: boolean | string;
  hasUnavailableChapters?: boolean | string;
  group?: string;
}

export interface MangaItem {
  id: string;
  title: string;
  alt_titles: string[];
  synopsis: string;
  cover_image?: string;
  backdrop_image?: string;
  genres: string[];
  tags: string[];
  status: string;
  year?: number;
  rating: string;
  publication_demographic?: string;
  last_chapter?: string;
  last_volume?: string;
  adult: boolean; // Based on rating (erotica/pornographic = adult)
}

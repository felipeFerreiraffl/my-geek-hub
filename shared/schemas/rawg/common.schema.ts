import { z } from "zod";

// Every RAWG list endpoint: { count, next, previous, results }
export const rawgListResponse = <T extends z.ZodType>(item: T) =>
  z.object({
    count: z.number().int(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(item),
  });

// Minimal reference embedded in other resources ({ id, name, slug })
export const RawgRefSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
});
export type RawgRef = z.infer<typeof RawgRefSchema>;

// Top games embedded in catalog list items (genres, tags, creators...)
export const RawgGameRefSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  added: z.number().int(),
});
export type RawgGameRef = z.infer<typeof RawgGameRefSchema>;

export const RawgRatingSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  count: z.number().int(),
  percent: z.number(),
});
export type RawgRating = z.infer<typeof RawgRatingSchema>;

// Shared shape of genres, tags, stores, developers and publishers
const RawgCatalogSchema = RawgRefSchema.extend({
  games_count: z.number().int(),
  image_background: z.string().nullable(),
});

// Items of /genres, /developers, /publishers (and embedded in games)
export const RawgGenreSchema = RawgCatalogSchema;
export type RawgGenre = z.infer<typeof RawgGenreSchema>;

export const RawgDeveloperSchema = RawgCatalogSchema;
export type RawgDeveloper = z.infer<typeof RawgDeveloperSchema>;

export const RawgPublisherSchema = RawgCatalogSchema;
export type RawgPublisher = z.infer<typeof RawgPublisherSchema>;

export const RawgTagSchema = RawgCatalogSchema.extend({
  language: z.string(),
});
export type RawgTag = z.infer<typeof RawgTagSchema>;

export const RawgStoreSchema = RawgCatalogSchema.extend({
  domain: z.string().nullable(),
});
export type RawgStore = z.infer<typeof RawgStoreSchema>;

export const RawgPlatformSchema = RawgCatalogSchema.extend({
  image: z.string().nullable(),
  year_start: z.number().int().nullable(),
  year_end: z.number().int().nullable(),
});
export type RawgPlatform = z.infer<typeof RawgPlatformSchema>;

// List items carry a few top games; detail endpoints carry an HTML description
const withGames = { games: z.array(RawgGameRefSchema) };
const withDescription = { description: z.string() };

// GET /genres, /genres/:id
export const RawgGenreListResponseSchema = rawgListResponse(RawgGenreSchema.extend(withGames));
export const RawgGenreDetailSchema = RawgGenreSchema.extend(withDescription);
export type RawgGenreDetail = z.infer<typeof RawgGenreDetailSchema>;

// GET /developers, /developers/:id
export const RawgDeveloperListResponseSchema = rawgListResponse(
  RawgDeveloperSchema.extend(withGames),
);
export const RawgDeveloperDetailSchema = RawgDeveloperSchema.extend(withDescription);
export type RawgDeveloperDetail = z.infer<typeof RawgDeveloperDetailSchema>;

// GET /publishers, /publishers/:id
export const RawgPublisherListResponseSchema = rawgListResponse(
  RawgPublisherSchema.extend(withGames),
);
export const RawgPublisherDetailSchema = RawgPublisherSchema.extend(withDescription);
export type RawgPublisherDetail = z.infer<typeof RawgPublisherDetailSchema>;

// GET /tags, /tags/:id
export const RawgTagListResponseSchema = rawgListResponse(RawgTagSchema.extend(withGames));
export const RawgTagDetailSchema = RawgCatalogSchema.extend(withDescription);
export type RawgTagDetail = z.infer<typeof RawgTagDetailSchema>;

// GET /stores, /stores/:id
export const RawgStoreListResponseSchema = rawgListResponse(RawgStoreSchema.extend(withGames));
export const RawgStoreDetailSchema = RawgStoreSchema.extend(withDescription);
export type RawgStoreDetail = z.infer<typeof RawgStoreDetailSchema>;

// GET /platforms, /platforms/:id, /platforms/parents
export const RawgPlatformListResponseSchema = rawgListResponse(
  RawgPlatformSchema.extend(withGames),
);
export const RawgPlatformDetailSchema = RawgPlatformSchema.extend(withDescription);
export type RawgPlatformDetail = z.infer<typeof RawgPlatformDetailSchema>;

export const RawgParentPlatformSchema = RawgRefSchema.extend({
  platforms: z.array(RawgPlatformSchema),
});
export type RawgParentPlatform = z.infer<typeof RawgParentPlatformSchema>;
export const RawgParentPlatformListResponseSchema = rawgListResponse(RawgParentPlatformSchema);

import { z } from "zod";
import {
  TenraiDateRangeSchema,
  TenraiExternalLinkSchema,
  TenraiImagesSchema,
  TenraiPaginationSchema,
  TenraiRelationSchema,
  TenraiResourceSchema,
  TenraiTitleSchema,
} from "./common.schema.js";

export const AnimeTrailerSchema = z.object({
  youtube_id: z.string().nullable(),
  url: z.string().nullable(),
  embed_url: z.string().nullable(),
  images: z.object({
    image_url: z.string().nullable(),
    small_image_url: z.string().nullable(),
    medium_image_url: z.string().nullable(),
    large_image_url: z.string().nullable(),
    maximum_image_url: z.string().nullable(),
  }),
  title: z.string().nullable(),
  views: z.number().int().nullable(),
  likes: z.number().int().nullable(),
  dislikes: z.number().int().nullable(),
  comment_count: z.number().int().nullable(),
  published_at: z.string().nullable(),
  duration: z.string().nullable(),
  privacy_status: z.string().nullable(),
  // Upstream sends only the list that applies (allowed or blocked)
  region_restriction: z
    .object({
      allowed: z.array(z.string()).optional(),
      blocked: z.array(z.string()).optional(),
    })
    .nullable(),
  embeddable: z.boolean().nullable(),
});
export type AnimeTrailer = z.infer<typeof AnimeTrailerSchema>;

export const AnimeBroadcastSchema = z.object({
  day: z.string().nullable(),
  time: z.string().nullable(),
  timezone: z.string().nullable(),
  string: z.string().nullable(),
});
export type AnimeBroadcast = z.infer<typeof AnimeBroadcastSchema>;

// GET /anime/:id, /random/anime, items of /anime, /top/anime, /seasons/* and /schedules
export const AnimeSchema = z.object({
  mal_id: z.number().int(),
  url: z.string(),
  images: TenraiImagesSchema,
  trailer: AnimeTrailerSchema,
  approved: z.boolean(),
  titles: z.array(TenraiTitleSchema),
  title: z.string(),
  title_english: z.string().nullable(),
  title_japanese: z.string().nullable(),
  title_synonyms: z.array(z.string()),
  type: z.string().nullable(),
  source: z.string(),
  episodes: z.number().int().nullable(),
  status: z.string(),
  airing: z.boolean(),
  aired: TenraiDateRangeSchema,
  duration: z.string().nullable(),
  rating: z.string().nullable(),
  score: z.number().nullable(),
  scored_by: z.number().int().nullable(),
  rank: z.number().int().nullable(),
  popularity: z.number().int().nullable(),
  members: z.number().int().nullable(),
  favorites: z.number().int().nullable(),
  synopsis: z.string().nullable(),
  background: z.string().nullable(),
  season: z.string().nullable(),
  year: z.number().int().nullable(),
  broadcast: AnimeBroadcastSchema,
  producers: z.array(TenraiResourceSchema),
  licensors: z.array(TenraiResourceSchema),
  studios: z.array(TenraiResourceSchema),
  genres: z.array(TenraiResourceSchema),
  explicit_genres: z.array(TenraiResourceSchema),
  themes: z.array(TenraiResourceSchema),
  demographics: z.array(TenraiResourceSchema),
});
export type Anime = z.infer<typeof AnimeSchema>;

// GET /anime/:id/full
export const AnimeFullSchema = AnimeSchema.extend({
  relations: z.array(TenraiRelationSchema),
  theme: z.object({
    openings: z.array(z.string()),
    endings: z.array(z.string()),
  }),
  external: z.array(TenraiExternalLinkSchema),
  streaming: z.array(TenraiExternalLinkSchema),
  moreinfo: z.string().nullable(),
});
export type AnimeFull = z.infer<typeof AnimeFullSchema>;

export const AnimeResponseSchema = z.object({ data: AnimeSchema });
export type AnimeResponse = z.infer<typeof AnimeResponseSchema>;

export const AnimeFullResponseSchema = z.object({ data: AnimeFullSchema });
export type AnimeFullResponse = z.infer<typeof AnimeFullResponseSchema>;

// GET /anime (search), /top/anime, /seasons/* and /schedules
export const AnimeListResponseSchema = z.object({
  pagination: TenraiPaginationSchema,
  data: z.array(AnimeSchema),
});
export type AnimeListResponse = z.infer<typeof AnimeListResponseSchema>;

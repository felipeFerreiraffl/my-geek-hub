import { z } from "zod";
import {
  TenraiDateRangeSchema,
  TenraiEntrySchema,
  TenraiExternalLinkSchema,
  TenraiGenreSchema,
  TenraiImagesSchema,
  TenraiPaginationSchema,
  TenraiRelationSchema,
  TenraiResourceSchema,
  TenraiReviewReactionsSchema,
  TenraiReviewUserSchema,
  TenraiSimplePaginationSchema,
  TenraiTitleSchema,
} from "./common.schema.js";

// GET /manga/:id, /random/manga, items of /manga and /top/manga
export const MangaSchema = z.object({
  mal_id: z.number().int(),
  url: z.string(),
  images: TenraiImagesSchema,
  approved: z.boolean(),
  titles: z.array(TenraiTitleSchema),
  title: z.string(),
  title_english: z.string().nullable(),
  title_japanese: z.string().nullable(),
  title_synonyms: z.array(z.string()),
  type: z.string().nullable(),
  chapters: z.number().int().nullable(),
  volumes: z.number().int().nullable(),
  status: z.string(),
  publishing: z.boolean(),
  published: TenraiDateRangeSchema,
  score: z.number().nullable(),
  scored_by: z.number().int().nullable(),
  rank: z.number().int().nullable(),
  popularity: z.number().int().nullable(),
  members: z.number().int().nullable(),
  favorites: z.number().int().nullable(),
  synopsis: z.string().nullable(),
  background: z.string().nullable(),
  authors: z.array(TenraiResourceSchema.extend({ role: z.string().nullable() })),
  serializations: z.array(TenraiResourceSchema),
  genres: z.array(TenraiResourceSchema),
  explicit_genres: z.array(TenraiResourceSchema),
  themes: z.array(TenraiResourceSchema),
  demographics: z.array(TenraiResourceSchema),
});
export type Manga = z.infer<typeof MangaSchema>;

// GET /manga/:id/full
export const MangaFullSchema = MangaSchema.extend({
  relations: z.array(TenraiRelationSchema),
  external: z.array(TenraiExternalLinkSchema),
  moreinfo: z.string().nullable(),
});
export type MangaFull = z.infer<typeof MangaFullSchema>;

// GET /recommendations/manga
export const MangaRecommendationSchema = z.object({
  mal_id: z.string(),
  entry: z.array(TenraiEntrySchema),
  content: z.string().nullable(),
  date: z.string().nullable(),
  user: z.object({ url: z.string(), username: z.string() }),
});
export type MangaRecommendation = z.infer<typeof MangaRecommendationSchema>;

// GET /reviews/manga
export const MangaReviewSchema = z.object({
  mal_id: z.number().int(),
  url: z.string(),
  type: z.string(),
  reactions: TenraiReviewReactionsSchema,
  date: z.string().nullable(),
  review: z.string().nullable(),
  score: z.number().int(),
  tags: z.array(z.string()),
  is_spoiler: z.boolean(),
  is_preliminary: z.boolean(),
  chapters_read: z.number().int().nullable(),
  entry: TenraiEntrySchema,
  user: TenraiReviewUserSchema,
});
export type MangaReview = z.infer<typeof MangaReviewSchema>;

export const MangaResponseSchema = z.object({ data: MangaSchema });
export type MangaResponse = z.infer<typeof MangaResponseSchema>;

export const MangaFullResponseSchema = z.object({ data: MangaFullSchema });
export type MangaFullResponse = z.infer<typeof MangaFullResponseSchema>;

// GET /manga (search) and /top/manga
export const MangaListResponseSchema = z.object({
  pagination: TenraiPaginationSchema,
  data: z.array(MangaSchema),
});
export type MangaListResponse = z.infer<typeof MangaListResponseSchema>;

export const MangaGenreListResponseSchema = z.object({ data: z.array(TenraiGenreSchema) });
export type MangaGenreListResponse = z.infer<typeof MangaGenreListResponseSchema>;

export const MangaRecommendationListResponseSchema = z.object({
  pagination: TenraiSimplePaginationSchema,
  data: z.array(MangaRecommendationSchema),
});
export type MangaRecommendationListResponse = z.infer<typeof MangaRecommendationListResponseSchema>;

export const MangaReviewListResponseSchema = z.object({
  pagination: TenraiSimplePaginationSchema,
  data: z.array(MangaReviewSchema),
});
export type MangaReviewListResponse = z.infer<typeof MangaReviewListResponseSchema>;

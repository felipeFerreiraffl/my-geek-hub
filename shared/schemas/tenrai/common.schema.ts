import { z } from "zod";

export const TenraiImageUrlsSchema = z.object({
  image_url: z.string().nullable(),
  small_image_url: z.string().nullable(),
  large_image_url: z.string().nullable(),
});
export type TenraiImageUrls = z.infer<typeof TenraiImageUrlsSchema>;

export const TenraiImagesSchema = z.object({
  jpg: TenraiImageUrlsSchema,
  webp: TenraiImageUrlsSchema,
});
export type TenraiImages = z.infer<typeof TenraiImagesSchema>;

// Entries embedded in reviews/recommendations always carry every image size
export const TenraiEntryImagesSchema = z.object({
  jpg: z.object({ image_url: z.string(), small_image_url: z.string(), large_image_url: z.string() }),
  webp: z.object({ image_url: z.string(), small_image_url: z.string(), large_image_url: z.string() }),
});
export type TenraiEntryImages = z.infer<typeof TenraiEntryImagesSchema>;

export const TenraiTitleSchema = z.object({
  type: z.string(),
  title: z.string(),
});
export type TenraiTitle = z.infer<typeof TenraiTitleSchema>;

// Reference to another MAL resource (genre, magazine, person...)
export const TenraiResourceSchema = z.object({
  mal_id: z.number().int(),
  type: z.string(),
  name: z.string(),
  url: z.string(),
});
export type TenraiResource = z.infer<typeof TenraiResourceSchema>;

export const TenraiRelationSchema = z.object({
  relation: z.string(),
  entry: z.array(
    TenraiResourceSchema.extend({
      media_type: z.string().nullable(),
      images: TenraiImagesSchema,
    }),
  ),
});
export type TenraiRelation = z.infer<typeof TenraiRelationSchema>;

export const TenraiExternalLinkSchema = z.object({
  name: z.string(),
  url: z.string(),
});
export type TenraiExternalLink = z.infer<typeof TenraiExternalLinkSchema>;

const TenraiDatePropSchema = z.object({
  day: z.number().int().nullable(),
  month: z.number().int().nullable(),
  year: z.number().int().nullable(),
});

export const TenraiDateRangeSchema = z.object({
  from: z.string().nullable(),
  to: z.string().nullable(),
  prop: z.object({
    from: TenraiDatePropSchema,
    to: TenraiDatePropSchema,
  }),
  string: z.string().nullable(),
});
export type TenraiDateRange = z.infer<typeof TenraiDateRangeSchema>;

export const TenraiSimplePaginationSchema = z.object({
  last_visible_page: z.number().int(),
  has_next_page: z.boolean(),
});
export type TenraiSimplePagination = z.infer<typeof TenraiSimplePaginationSchema>;

export const TenraiPaginationSchema = TenraiSimplePaginationSchema.extend({
  current_page: z.number().int(),
  items: z.object({
    count: z.number().int(),
    total: z.number().int(),
    per_page: z.number().int(),
  }),
});
export type TenraiPagination = z.infer<typeof TenraiPaginationSchema>;

// Compact entry embedded in reviews and recommendations
export const TenraiEntrySchema = z.object({
  mal_id: z.number().int(),
  url: z.string(),
  images: TenraiEntryImagesSchema,
  title: z.string(),
});
export type TenraiEntry = z.infer<typeof TenraiEntrySchema>;

export const TenraiReviewReactionsSchema = z.object({
  overall: z.number().int(),
  nice: z.number().int(),
  love_it: z.number().int(),
  funny: z.number().int(),
  confusing: z.number().int(),
  informative: z.number().int(),
  well_written: z.number().int(),
  creative: z.number().int(),
});
export type TenraiReviewReactions = z.infer<typeof TenraiReviewReactionsSchema>;

export const TenraiReviewUserSchema = z.object({
  username: z.string(),
  url: z.string(),
  images: z.object({
    jpg: z.object({ image_url: z.string() }),
    webp: z.object({ image_url: z.string() }),
  }),
});
export type TenraiReviewUser = z.infer<typeof TenraiReviewUserSchema>;

export const TenraiGenreSchema = z.object({
  mal_id: z.number().int(),
  name: z.string(),
  url: z.string(),
  count: z.number().int(),
});
export type TenraiGenre = z.infer<typeof TenraiGenreSchema>;

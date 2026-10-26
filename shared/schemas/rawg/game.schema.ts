import { z } from "zod";
import {
  RawgDeveloperSchema,
  RawgGenreSchema,
  RawgPlatformSchema,
  RawgPublisherSchema,
  RawgRatingSchema,
  RawgRefSchema,
  RawgStoreSchema,
  RawgTagSchema,
  rawgListResponse,
} from "./common.schema.js";

export const EsrbRatingSlugSchema = z.enum([
  "everyone",
  "everyone-10-plus",
  "teen",
  "mature",
  "adults-only",
  "rating-pending",
]);
export type EsrbRatingSlug = z.infer<typeof EsrbRatingSlugSchema>;

export const EsrbRatingSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: EsrbRatingSlugSchema,
});
export type EsrbRating = z.infer<typeof EsrbRatingSchema>;

// Counts of RAWG users per library status
export const GameAddedByStatusSchema = z.object({
  yet: z.number().int().optional(),
  owned: z.number().int().optional(),
  beaten: z.number().int().optional(),
  toplay: z.number().int().optional(),
  dropped: z.number().int().optional(),
  playing: z.number().int().optional(),
});
export type GameAddedByStatus = z.infer<typeof GameAddedByStatusSchema>;

// Search results (?search=) embed only { id, name, slug }; other lists embed full entries
const embedded = <T extends z.ZodObject>(schema: T) =>
  schema.partial().extend(RawgRefSchema.shape);

export const GamePlatformSchema = z.object({
  platform: embedded(RawgPlatformSchema),
  released_at: z.string().nullable().optional(),
  // Game detail uses `requirements`, lists use `requirements_en` / `requirements_ru`
  requirements: z
    .object({ minimum: z.string().optional(), recommended: z.string().optional() })
    .nullable()
    .optional(),
  requirements_en: z
    .object({ minimum: z.string().optional(), recommended: z.string().optional() })
    .nullable()
    .optional(),
  requirements_ru: z
    .object({ minimum: z.string().optional(), recommended: z.string().optional() })
    .nullable()
    .optional(),
});
export type GamePlatform = z.infer<typeof GamePlatformSchema>;

export const GameStoreSchema = z.object({
  id: z.number().int().optional(),
  url: z.string().optional(),
  store: embedded(RawgStoreSchema),
});
export type GameStore = z.infer<typeof GameStoreSchema>;

export const GameShortScreenshotSchema = z.object({
  id: z.number().int(),
  image: z.string(),
});
export type GameShortScreenshot = z.infer<typeof GameShortScreenshotSchema>;

// Fields shared by list items and the game detail
const GameBaseSchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  released: z.string().nullable(),
  tba: z.boolean(),
  background_image: z.string().nullable(),
  rating: z.number(),
  rating_top: z.number().int(),
  ratings: z.array(RawgRatingSchema),
  ratings_count: z.number().int(),
  reviews_text_count: z.number().int(),
  reviews_count: z.number().int(),
  added: z.number().int(),
  added_by_status: GameAddedByStatusSchema.nullable(),
  metacritic: z.number().int().nullable(),
  playtime: z.number().int(),
  suggestions_count: z.number().int(),
  updated: z.string(),
  esrb_rating: EsrbRatingSchema.nullable(),
  platforms: z.array(GamePlatformSchema).nullable(),
  parent_platforms: z.array(z.object({ platform: RawgRefSchema })),
  stores: z.array(GameStoreSchema).nullable(),
  genres: z.array(embedded(RawgGenreSchema)),
  tags: z.array(embedded(RawgTagSchema)),
  saturated_color: z.string(),
  dominant_color: z.string(),
  clip: z.unknown().nullable(),
  user_game: z.unknown().nullable(),
});

// Items of /games, /games/:id/additions, /games/:id/game-series, /games/:id/parent-games
export const GameSchema = GameBaseSchema.extend({
  short_screenshots: z.array(GameShortScreenshotSchema),
  // Only present on search results (?search=)
  score: z.string().optional(),
  community_rating: z.number().optional(),
});
export type Game = z.infer<typeof GameSchema>;

// GET /games
export const GameListResponseSchema = rawgListResponse(GameSchema);
export type GameListResponse = z.infer<typeof GameListResponseSchema>;

// GET /games/:id (numeric id or slug)
export const GameDetailSchema = GameBaseSchema.extend({
  name_original: z.string(),
  description: z.string(),
  description_raw: z.string(),
  metacritic_platforms: z.array(
    z.object({
      metascore: z.number().int(),
      url: z.string(),
      platform: z.object({ platform: z.number().int(), name: z.string(), slug: z.string() }),
    }),
  ),
  background_image_additional: z.string().nullable(),
  website: z.string(),
  reactions: z.record(z.string(), z.number().int()).nullable(),
  screenshots_count: z.number().int(),
  movies_count: z.number().int(),
  creators_count: z.number().int(),
  achievements_count: z.number().int(),
  parent_achievements_count: z.number().int(),
  reddit_url: z.string(),
  reddit_name: z.string(),
  reddit_description: z.string(),
  reddit_logo: z.string(),
  reddit_count: z.number().int(),
  twitch_count: z.number().int(),
  youtube_count: z.number().int(),
  alternative_names: z.array(z.string()),
  metacritic_url: z.string(),
  parents_count: z.number().int(),
  additions_count: z.number().int(),
  game_series_count: z.number().int(),
  developers: z.array(RawgDeveloperSchema),
  publishers: z.array(RawgPublisherSchema),
});
export type GameDetail = z.infer<typeof GameDetailSchema>;

// GET /games/:id/screenshots
export const GameScreenshotSchema = z.object({
  id: z.number().int(),
  image: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  is_deleted: z.boolean(),
});
export type GameScreenshot = z.infer<typeof GameScreenshotSchema>;
export const GameScreenshotListResponseSchema = rawgListResponse(GameScreenshotSchema);

// GET /games/:id/stores
export const GameStoreLinkSchema = z.object({
  id: z.number().int(),
  game_id: z.number().int(),
  store_id: z.number().int(),
  url: z.string(),
});
export type GameStoreLink = z.infer<typeof GameStoreLinkSchema>;
export const GameStoreLinkListResponseSchema = rawgListResponse(GameStoreLinkSchema);

// GET /games/:id/movies
export const GameMovieSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  preview: z.string(),
  data: z.object({ "480": z.string(), max: z.string() }),
});
export type GameMovie = z.infer<typeof GameMovieSchema>;
export const GameMovieListResponseSchema = rawgListResponse(GameMovieSchema);

// GET /games/:id/achievements
export const GameAchievementSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  image: z.string().nullable(),
  percent: z.string(),
});
export type GameAchievement = z.infer<typeof GameAchievementSchema>;
export const GameAchievementListResponseSchema = rawgListResponse(GameAchievementSchema);

// GET /games/:id/reddit
export const GameRedditPostSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  text: z.string(),
  image: z.string().nullable(),
  url: z.string(),
  username: z.string(),
  username_url: z.string(),
  created: z.string(),
});
export type GameRedditPost = z.infer<typeof GameRedditPostSchema>;
export const GameRedditPostListResponseSchema = rawgListResponse(GameRedditPostSchema);

// Error body for unknown ids/slugs (404) and Business-only endpoints (401)
export const RawgErrorSchema = z.object({
  detail: z.string().optional(),
  error: z.string().optional(),
});
export type RawgError = z.infer<typeof RawgErrorSchema>;

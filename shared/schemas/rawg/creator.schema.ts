import { z } from "zod";
import {
  RawgGameRefSchema,
  RawgRatingSchema,
  RawgRefSchema,
  rawgListResponse,
} from "./common.schema.js";
import { GameSchema } from "./game.schema.js";

// GET /creator-roles
export const CreatorRoleSchema = RawgRefSchema;
export type CreatorRole = z.infer<typeof CreatorRoleSchema>;
export const CreatorRoleListResponseSchema = rawgListResponse(CreatorRoleSchema);

const CreatorBaseSchema = RawgRefSchema.extend({
  image: z.string().nullable(),
  image_background: z.string().nullable(),
  games_count: z.number().int(),
  positions: z.array(CreatorRoleSchema),
});

// Items of /creators
export const CreatorSchema = CreatorBaseSchema.extend({
  games: z.array(RawgGameRefSchema),
});
export type Creator = z.infer<typeof CreatorSchema>;
export const CreatorListResponseSchema = rawgListResponse(CreatorSchema);

// GET /creators/:id
export const CreatorDetailSchema = CreatorBaseSchema.extend({
  description: z.string(),
  reviews_count: z.number().int(),
  rating: z.string(),
  rating_top: z.number().int(),
  updated: z.string(),
  platforms: z.object({
    total: z.number().int(),
    count: z.number().int(),
    results: z.array(
      z.object({
        count: z.number().int(),
        percent: z.number(),
        platform: RawgRefSchema,
      }),
    ),
  }),
  ratings: z.array(RawgRatingSchema),
  timeline: z.array(z.object({ year: z.number().int(), count: z.number().int() })),
});
export type CreatorDetail = z.infer<typeof CreatorDetailSchema>;

// Items of /games/:id/development-team
export const GameTeamMemberSchema = CreatorBaseSchema.extend({
  games: z.array(GameSchema),
});
export type GameTeamMember = z.infer<typeof GameTeamMemberSchema>;
export const GameTeamListResponseSchema = rawgListResponse(GameTeamMemberSchema);

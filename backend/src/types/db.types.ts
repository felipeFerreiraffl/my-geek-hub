import { bookmarks, ratings, refreshTokens, users } from "@/db/drizzle/index.js";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Bookmark = InferSelectModel<typeof bookmarks>;
export type NewBookmark = InferInsertModel<typeof bookmarks>;

export type Rating = InferSelectModel<typeof ratings>;
export type NewRating = InferInsertModel<typeof ratings>;

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;

export interface UserBodyReq {
  email: string;
  password: string;

  username?: string;
  role?: "ADMIN" | "USER";
}

export interface UserUpdateReq {
  username?: string;
  email?: string;
  password?: string;
}

export interface UserParams {
  id: string;
}

export interface RefreshTokenBodyReq {
  tokenHash: string;
}

export type BookmarkMediaType = "ANIME" | "MANGA" | "GAME";

export type BookmarkStatus = "IN_PROGRESS" | "COMPLETED" | "PLANNED" | "PAUSED" | "DROPPED";

export interface BookmarkBodyReq {
  userId: string;
  status: BookmarkStatus;
  mediaType: BookmarkMediaType;
  externalId: number;

  title?: string;
  imageUrl?: string;
}

export interface UpdateBookmarkBodyReq {
  status: BookmarkStatus;
}

export interface BookmarkParams {
  id: string;
  userId: string;
}

export interface RatingBodyReq {
  userId: string;
  bookmarkId: string;
  score: number;

  review?: string;
}

export interface UpdateRatingBodyReq {
  score?: number;
  review?: string;
}

export interface RatingParams {
  id: string;
  userId: string;
  bookmarkId: string;
}

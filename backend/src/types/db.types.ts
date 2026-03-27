import { bookmarks, ratings, users } from "@/db/drizzle/index.js";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Bookmark = InferSelectModel<typeof bookmarks>;
export type NewBookmark = InferInsertModel<typeof bookmarks>;

export type Rating = InferSelectModel<typeof ratings>;
export type NewRating = InferInsertModel<typeof ratings>;

export type SafeUser = Omit<User, "password">;

export interface UserBodyReq {
  email: string;
  password: string;

  username?: string;
}

export interface UserParams {
  id: string;
  email: string;
}

export interface UserQueries {
  required_id: string;
}

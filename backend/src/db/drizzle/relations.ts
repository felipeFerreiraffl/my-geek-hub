import { relations } from "drizzle-orm";
import { users } from "./schemas/users.js";
import { bookmarks } from "./schemas/bookmarks.js";
import { ratings } from "./schemas/ratings.js";
import { authUser } from "./schemas/auth.js";

export const userRelations = relations(users, ({ many }) => ({
  bookmarks: many(bookmarks),
  ratings: many(ratings),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, {
    fields: [bookmarks.userId],
    references: [users.id],
  }),
  rating: one(ratings, {
    fields: [bookmarks.id],
    references: [ratings.bookmarkId],
  }),
}));

export const ratingRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  bookmark: one(bookmarks, {
    fields: [ratings.bookmarkId],
    references: [bookmarks.id],
  }),
}));

export const authUserRelations = relations(authUser, ({ one }) => ({
  user: one(users, {
    fields: [authUser.id],
    references: [users.id],
  }),
}));

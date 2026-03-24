import { check, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users.js";
import { bookmarks } from "./bookmarks.js";
import { sql } from "drizzle-orm";

export const ratings = pgTable(
  "ratings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookmarkId: text("bookmark_id")
      .notNull()
      .unique()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    check("score_range", sql`${table.score} >= 1 AND ${table.score} <= 10`),
  ],
);

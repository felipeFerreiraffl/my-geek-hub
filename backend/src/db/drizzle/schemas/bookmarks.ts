import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const mediaTypeEnum = pgEnum("media_type", ["ANIME", "MANGA", "GAME"]);

export const bookmarkStatusEnum = pgEnum("bookmark_status", [
  "WATCHING",
  "COMPLETED",
  "PLANNED",
  "PAUSED",
  "DROPPED",
]);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    externalId: integer("external_id").notNull(),
    title: text("title").notNull(),
    imageUrl: text("image_url"),
    mediaType: mediaTypeEnum("media_type").notNull(),
    status: bookmarkStatusEnum("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("bookmark_unique_idx").on(table.userId, table.externalId, table.mediaType),
    index("bookmark_user_idx").on(table.userId),
  ],
);

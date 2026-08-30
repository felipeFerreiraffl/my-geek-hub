import { db } from "@/config/db.js";
import { Bookmark, NewBookmark } from "@/types/db.types.js";
import { bookmarks as bookmarksTable } from "@drizzle/index.js";
import { eq } from "drizzle-orm";

export const findAllBookmarks = async (): Promise<Bookmark[]> => {
  const bookmarks = await db.query.bookmarks.findMany();
  return bookmarks ?? [];
};

export const findBookmarkById = async (id: string): Promise<Bookmark | null> => {
  const [bookmark] = await db.select().from(bookmarksTable).where(eq(bookmarksTable.id, id));

  return bookmark ?? null;
};

export const findBookmarksByUserId = async (userId: string): Promise<Bookmark[]> => {
  const bookmarks = await db.select().from(bookmarksTable).where(eq(bookmarksTable.userId, userId));

  return bookmarks ?? [];
};

export const createBookmark = async (bookmark: NewBookmark): Promise<NewBookmark> => {
  const [newBookmark] = await db.insert(bookmarksTable).values(bookmark).returning();

  return newBookmark;
};

export const alterBookmark = async (id: string, bookmark: Partial<Bookmark>): Promise<Bookmark> => {
  const [newBookmark] = await db
    .update(bookmarksTable)
    .set(bookmark)
    .where(eq(bookmarksTable.id, id))
    .returning();

  return newBookmark;
};

export const deleteBookmarkById = async (id: string): Promise<void> => {
  await db.delete(bookmarksTable).where(eq(bookmarksTable.id, id));
};

export const deleteAllBookmarksByUserId = async (userId: string): Promise<void> => {
  await db.delete(bookmarksTable).where(eq(bookmarksTable.userId, userId));
};

export const deleteAllBookmarks = async () => {
  await db.delete(bookmarksTable);
};

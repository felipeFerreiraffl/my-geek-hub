import { db } from "@/config/db.js";
import { NewRating, Rating } from "@/types/db.types.js";
import { ratings as ratingsTable } from "@drizzle/index.js";
import { eq } from "drizzle-orm";

export const getRatingById = async (id: string): Promise<Rating | null> => {
  const [rating] = await db.select().from(ratingsTable).where(eq(ratingsTable.id, id));

  return rating ?? null;
};

export const getRatingByBookmarkId = async (bookmarkId: string): Promise<Rating | null> => {
  const [rating] = await db
    .select()
    .from(ratingsTable)
    .where(eq(ratingsTable.bookmarkId, bookmarkId));

  return rating ?? null;
};

export const createRating = async (rating: NewRating): Promise<NewRating> => {
  const [newRating] = await db.insert(ratingsTable).values(rating).returning();

  return newRating;
};

export const alterRating = async (id: string, rating: Partial<Rating>): Promise<Rating> => {
  const [newRating] = await db
    .update(ratingsTable)
    .set(rating)
    .where(eq(ratingsTable.id, id))
    .returning();

  return newRating;
};

export const deleteRating = async (id: string): Promise<void> => {
  await db.delete(ratingsTable).where(eq(ratingsTable.id, id));
};

export const deleteRatingByBookmark = async (bookmarkId: string): Promise<void> => {
  await db.delete(ratingsTable).where(eq(ratingsTable.bookmarkId, bookmarkId));
};

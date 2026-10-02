import * as BookmarkService from "@/api/bookmarks/bookmarks.service.js";
import * as RatingService from "@/api/ratings/ratings.service.js";
import * as UserService from "@/api/users/users.service.js";
import { MAX_RATING_SCORE, MIN_RATING_SCORE } from "@/constants/numbers.js";
import { Rating, RatingBodyReq, RatingParams, UpdateRatingBodyReq } from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { asyncFn } from "@/utils/serverFn.js";

const isValidScore = (score: unknown): score is number =>
  Number.isInteger(score) &&
  (score as number) >= MIN_RATING_SCORE &&
  (score as number) <= MAX_RATING_SCORE;

export const getRatings = asyncFn(async (_, res, __) => {
  const ratings = await RatingService.findRatings();

  databaseLogger.info(`${ratings.length !== 0 ? "All ratings found" : "No rating was found"}`);
  successRes(res, 200, ratings);
});

export const getRatingById = asyncFn<Pick<RatingParams, "id">>(async (req, res, next) => {
  const { id } = req.params;

  const rating = await RatingService.findRatingById(id);
  if (!rating) {
    databaseLogger.error(`Rating with ID ${id} not found`);
    return next({ status: 404 });
  }

  databaseLogger.info(`Rating ID ${id} was found`);
  successRes(res, 200, rating);
});

export const getRatingsByUserId = asyncFn<Pick<RatingParams, "userId">>(async (req, res, next) => {
  const { userId } = req.params;

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ${userId} not found`);
    return next({ status: 404 });
  }

  const ratings = await RatingService.findRatingsByUserId(userId);

  databaseLogger.info(`Ratings from user ${userId} found`);
  successRes(res, 200, ratings);
});

export const getMyRatings = asyncFn(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    databaseLogger.error("User ID not found");
    return next({ status: 404 });
  }

  const ratings = await RatingService.findRatingsByUserId(userId);

  databaseLogger.info("Seeing your ratings");
  successRes(res, 200, ratings);
});

export const getMyRatingByBookmarkId = asyncFn<Pick<RatingParams, "bookmarkId">>(
  async (req, res, next) => {
    const { bookmarkId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      databaseLogger.error("User ID not found");
      return next({ status: 404 });
    }

    const rating = await RatingService.findRatingByBookmarkId(bookmarkId);
    if (!rating || rating.userId !== userId) {
      databaseLogger.error(`Rating for bookmark ${bookmarkId} not found`);
      return next({ status: 404 });
    }

    databaseLogger.info(`Rating for bookmark ${bookmarkId} was found`);
    successRes(res, 200, rating);
  },
);

export const createRating = asyncFn<{}, {}, RatingBodyReq>(async (req, res, next) => {
  const { userId, bookmarkId, score, review } = req.body;

  if (!userId || !bookmarkId) {
    databaseLogger.error("User ID and bookmark ID are required");
    return next({ status: 400 });
  }

  if (!isValidScore(score)) {
    databaseLogger.error(
      `Score must be an integer between ${MIN_RATING_SCORE} and ${MAX_RATING_SCORE}`,
    );
    return next({ status: 400 });
  }

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ID ${userId} not found`);
    return next({ status: 404 });
  }

  const existingBookmark = await BookmarkService.findBookmarkById(bookmarkId);
  if (!existingBookmark || existingBookmark.userId !== userId) {
    databaseLogger.error(`Bookmark ${bookmarkId} not found for user ${userId}`);
    return next({ status: 404 });
  }

  const existingRating = await RatingService.findRatingByBookmarkId(bookmarkId);
  if (existingRating) {
    databaseLogger.error(`Bookmark ${bookmarkId} already has a rating`);
    return next({ status: 409 });
  }

  const ratingReq: Rating = {
    id: crypto.randomUUID(),
    userId,
    bookmarkId,
    score,
    review: review ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newRating = await RatingService.createRating(ratingReq);

  databaseLogger.info(`Rating ${newRating.id} created`, newRating);
  successRes(res, 201, newRating);
});

export const createMyRating = asyncFn<{}, {}, RatingBodyReq>(async (req, res, next) => {
  const userId = req.user?.id;
  const { bookmarkId, score, review } = req.body;

  if (!userId) {
    databaseLogger.error("User ID not found");
    return next({ status: 404 });
  }

  if (!bookmarkId) {
    databaseLogger.error("Bookmark ID is required");
    return next({ status: 400 });
  }

  if (!isValidScore(score)) {
    databaseLogger.error(
      `Score must be an integer between ${MIN_RATING_SCORE} and ${MAX_RATING_SCORE}`,
    );
    return next({ status: 400 });
  }

  const existingBookmark = await BookmarkService.findBookmarkById(bookmarkId);
  if (!existingBookmark || existingBookmark.userId !== userId) {
    databaseLogger.error(`Bookmark ${bookmarkId} not found for your user`);
    return next({ status: 404 });
  }

  const existingRating = await RatingService.findRatingByBookmarkId(bookmarkId);
  if (existingRating) {
    databaseLogger.error(`Bookmark ${bookmarkId} already has a rating`);
    return next({ status: 409 });
  }

  const ratingReq: Rating = {
    id: crypto.randomUUID(),
    userId,
    bookmarkId,
    score,
    review: review ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newRating = await RatingService.createRating(ratingReq);

  databaseLogger.info(`Your rating ${newRating.id} created`, newRating);
  successRes(res, 201, newRating);
});

export const updateRating = asyncFn<Pick<RatingParams, "id">, {}, UpdateRatingBodyReq>(
  async (req, res, next) => {
    const { id } = req.params;
    const { score, review } = req.body;

    if (score === undefined && review === undefined) {
      databaseLogger.error("No fields to update");
      return next({ status: 400 });
    }

    if (score !== undefined && !isValidScore(score)) {
      databaseLogger.error(
        `Score must be an integer between ${MIN_RATING_SCORE} and ${MAX_RATING_SCORE}`,
      );
      return next({ status: 400 });
    }

    const existingRating = await RatingService.findRatingById(id);
    if (!existingRating) {
      databaseLogger.error(`Rating ${id} not found`);
      return next({ status: 404 });
    }

    const fieldsToUpdate: Partial<Rating> = {
      score,
      review,
      updatedAt: new Date(),
    };

    const newRating = await RatingService.alterRating(id, fieldsToUpdate);
    if (!newRating) {
      databaseLogger.error("Couldn't update rating");
      return next({ status: 500 });
    }

    databaseLogger.info(`Rating ${id} updated`, newRating);
    successRes(res, 200, newRating);
  },
);

export const updateMyRating = asyncFn<Pick<RatingParams, "id">, {}, UpdateRatingBodyReq>(
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { score, review } = req.body;

    if (!userId) {
      databaseLogger.error("User ID not found");
      return next({ status: 404 });
    }

    if (score === undefined && review === undefined) {
      databaseLogger.error("No fields to update");
      return next({ status: 400 });
    }

    if (score !== undefined && !isValidScore(score)) {
      databaseLogger.error(
        `Score must be an integer between ${MIN_RATING_SCORE} and ${MAX_RATING_SCORE}`,
      );
      return next({ status: 400 });
    }

    const existingRating = await RatingService.findRatingById(id);
    if (!existingRating || existingRating.userId !== userId) {
      databaseLogger.error(`Rating ${id} not found for your user`);
      return next({ status: 404 });
    }

    const fieldsToUpdate: Partial<Rating> = {
      score,
      review,
      updatedAt: new Date(),
    };

    const newRating = await RatingService.alterRating(id, fieldsToUpdate);
    if (!newRating) {
      databaseLogger.error("Couldn't update rating");
      return next({ status: 500 });
    }

    databaseLogger.info(`Your rating ${id} updated`, newRating);
    successRes(res, 200, newRating);
  },
);

export const deleteRating = asyncFn<Pick<RatingParams, "id">>(async (req, res, next) => {
  const { id } = req.params;

  const existingRating = await RatingService.findRatingById(id);
  if (!existingRating) {
    databaseLogger.error(`Rating ${id} not found`);
    return next({ status: 404 });
  }

  await RatingService.deleteRatingById(id);

  databaseLogger.info(`Rating ${id} removed`);
  successRes(res, 200, null);
});

export const deleteMyRating = asyncFn<Pick<RatingParams, "id">>(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    databaseLogger.error("User ID not found");
    return next({ status: 404 });
  }

  const existingRating = await RatingService.findRatingById(id);
  if (!existingRating || existingRating.userId !== userId) {
    databaseLogger.error(`Rating ${id} not found for your user`);
    return next({ status: 404 });
  }

  await RatingService.deleteRatingById(id);

  databaseLogger.info(`Your rating ${id} removed`);
  successRes(res, 200, null);
});

export const deleteAllRatingsFromUser = asyncFn<Pick<RatingParams, "userId">>(
  async (req, res, next) => {
    const { userId } = req.params;

    const existingUser = await UserService.findUserById(userId);
    if (!existingUser) {
      databaseLogger.error(`User ${userId} not found`);
      return next({ status: 404 });
    }

    await RatingService.deleteRatingsByUserId(userId);

    databaseLogger.info(`All ratings from user ${userId} removed`);
    successRes(res, 200, null);
  },
);

export const deleteAllRatings = asyncFn(async (_, res, __) => {
  await RatingService.deleteAllRatings();

  databaseLogger.info("All ratings removed");
  successRes(res, 200, null);
});

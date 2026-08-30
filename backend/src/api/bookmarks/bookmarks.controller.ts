import {
  Bookmark,
  BookmarkBodyReq,
  BookmarkParams,
  UpdateBookmarkBodyReq,
  UserParams,
} from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { asyncFn } from "@/utils/serverFn.js";
import * as UserService from "../users/users.service.js";
import * as BookmarkService from "./bookmarks.service.js";

export const getBookmarks = asyncFn(async (_, res, __) => {
  const bookmarks = await BookmarkService.findAllBookmarks();

  if (!bookmarks) {
    databaseLogger.warn("No bookmark found");
  }

  databaseLogger.info(
    `${bookmarks.length !== 0 ? "All bookmarks found" : "No bookmark was found"}`,
  );
  successRes(res, 200, bookmarks);
});

export const getBookmarksById = asyncFn<BookmarkParams>(async (req, res, next) => {
  const { id } = req.params;

  const bookmark = await BookmarkService.findBookmarkById(id);
  if (!bookmark) {
    databaseLogger.error(`Bookmark with ID ${id} not found`);
    return next({ status: 404 });
  }

  databaseLogger.info(`Bookmark ID ${id} was found`);
  successRes(res, 200, bookmark);
});

export const getMyBookmarks = asyncFn(async (req, res, next) => {
  const id = req.user?.id;

  if (!id) {
    return next({ status: 404 });
  }

  const bookmarkMe = await BookmarkService.findBookmarksByUserId(id);

  if (!bookmarkMe) {
    databaseLogger.error(`User with ${id} not found. No bookmarks`);
    return next({ status: 404 });
  }
  databaseLogger.info("Seeing your bookmarks", bookmarkMe);
  successRes(res, 200, bookmarkMe);
});

export const createBookmark = asyncFn<{}, {}, BookmarkBodyReq>(async (req, res, next) => {
  const { userId, status, mediaType, title, imageUrl, externalId } = req.body;

  if (!userId) {
    databaseLogger.error("ID is required");
    return next({ status: 400 });
  }

  if (!status) {
    databaseLogger.error("Status is required");
    return next({ status: 400 });
  }

  if (!mediaType) {
    databaseLogger.error("Media type is required");
    return next({ status: 400 });
  }

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ID ${userId} not found`);
    return next({ status: 404 });
  }

  const bookmarkReq: Bookmark = {
    id: crypto.randomUUID(),
    userId,
    externalId: externalId ?? 0,
    title: title ?? "",
    imageUrl: imageUrl ?? "",
    mediaType,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newBookmark = await BookmarkService.createBookmark(bookmarkReq);

  databaseLogger.info(`Bookmark ${newBookmark.id} created`, newBookmark);
  successRes(res, 201, newBookmark);
});

export const createMyBookmark = asyncFn<{}, {}, BookmarkBodyReq>(async (req, res, next) => {
  const userId = req.user?.id;
  const { status, mediaType, title, imageUrl, externalId } = req.body;

  if (!userId) {
    databaseLogger.error("ID is required");
    return next({ status: 400 });
  }

  if (!status) {
    databaseLogger.error("Status is required");
    return next({ status: 400 });
  }

  if (!mediaType) {
    databaseLogger.error("Media type is required");
    return next({ status: 400 });
  }

  const bookmarkReq: Bookmark = {
    id: crypto.randomUUID(),
    userId,
    externalId: externalId ?? 0,
    title: title ?? "",
    imageUrl: imageUrl ?? "",
    mediaType,
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newBookmark = await BookmarkService.createBookmark(bookmarkReq);

  databaseLogger.info(`Bookmark ${newBookmark.id} created`, newBookmark);
  successRes(res, 201, newBookmark);
});

export const updateBookmark = asyncFn<BookmarkParams, {}, UpdateBookmarkBodyReq>(
  async (req, res, next) => {
    const { id, userId } = req.params;
    const { status } = req.body;

    if (!id) {
      databaseLogger.error("ID is required");
      return next({ status: 400 });
    }

    const existingUser = await UserService.findUserById(userId);
    if (!existingUser) {
      databaseLogger.error("User not found");
      return next({ status: 404 });
    }

    const fieldsToUpdate: Partial<Bookmark> = {
      userId,
      status,
      updatedAt: new Date(),
    };

    const hasFields = Object.keys(status).length > 0;
    if (!hasFields) {
      databaseLogger.error("No fields to update");
      return next({ status: 400 });
    }

    const newBookmark = await BookmarkService.alterBookmark(id, fieldsToUpdate);
    if (!newBookmark) {
      databaseLogger.info("Couldn't update bookmark");
      return next({ status: 500 });
    }

    databaseLogger.info(`Bookmark ${id} updated`, newBookmark);
    successRes(res, 200, newBookmark);
  },
);

export const updateMyBookmark = asyncFn<BookmarkParams & UserParams, {}, UpdateBookmarkBodyReq>(
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status } = req.body;

    if (!id) {
      databaseLogger.error("ID is required");
      return next({ status: 400 });
    }

    if (!userId) {
      databaseLogger.error(`Cannot find user with ID ${userId}`);
      return next({ status: 404 });
    }

    const existingUser = await UserService.findUserById(userId);
    if (!existingUser) {
      databaseLogger.error("User not found");
      return next({ status: 404 });
    }

    const fieldsToUpdate: Partial<Bookmark> = {
      userId,
      status,
      updatedAt: new Date(),
    };

    const hasFields = Object.keys(status).length > 0;
    if (!hasFields) {
      databaseLogger.error("No fields to update");
      return next({ status: 400 });
    }

    const newBookmark = await BookmarkService.alterBookmark(id, fieldsToUpdate);
    if (!newBookmark) {
      databaseLogger.info("Couldn't update bookmark");
      return next({ status: 500 });
    }

    databaseLogger.info(`Bookmark ${id} updated`, newBookmark);
    successRes(res, 200, newBookmark);
  },
);

export const deleteBookmark = asyncFn<BookmarkParams>(async (req, res, next) => {
  const { id, userId } = req.params;

  if (!id) {
    databaseLogger.error("ID is required");
    return next({ status: 400 });
  }

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ${userId} not found`);
    return next({ status: 404 });
  }

  await BookmarkService.deleteBookmarkById(id);

  databaseLogger.info(`Bookmark ${id} removed`);
  successRes(res, 200, null);
});

export const deleteMyBookmark = asyncFn<BookmarkParams & UserParams>(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!id) {
    databaseLogger.error("ID is required");
    return next({ status: 400 });
  }

  if (!userId) {
    databaseLogger.error("User ID not found");
    return next({ status: 404 });
  }

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ${userId} not found`);
    return next({ status: 404 });
  }

  await BookmarkService.deleteBookmarkById(id);

  databaseLogger.info(`Your bookmark ${id} removed`);
  successRes(res, 200, null);
});

export const deleteAllBookmarks = asyncFn(async (_, res, __) => {
  await BookmarkService.deleteAllBookmarks();

  databaseLogger.info(`All bookmarks removed`);
  successRes(res, 200, null);
});

export const deleteAllBookmarksFromUser = asyncFn<BookmarkParams>(async (req, res, next) => {
  const { userId } = req.params;

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ${userId} not found`);
    return next({ status: 404 });
  }

  await BookmarkService.deleteAllBookmarksByUserId(userId);

  databaseLogger.info(`All bookmarks from user ${userId} removed`);
  successRes(res, 200, null);
});

export const deleteAllMyBookmarks = asyncFn<UserParams>(async (req, res, next) => {
  const userId = req.user?.id;

  if (!userId) {
    databaseLogger.error("User ID not found");
    return next({ status: 404 });
  }

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ${userId} not found`);
    return next({ status: 404 });
  }

  await BookmarkService.deleteAllBookmarksByUserId(userId);

  databaseLogger.info(`All bookmarks from user ${userId} removed`);
  successRes(res, 200, null);
});

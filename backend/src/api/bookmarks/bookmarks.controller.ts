import * as BookmarkService from "@/api/bookmarks/bookmarks.service.js";
import * as UserService from "@/api/users/users.service.js";
import {
  Bookmark,
  BookmarkBodyReq,
  BookmarkParams,
  UpdateBookmarkBodyReq,
} from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { asyncFn } from "@/utils/serverFn.js";

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

export const getBookmarksById = asyncFn<Pick<BookmarkParams, "id">>(async (req, res, next) => {
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

  if (!externalId) {
    databaseLogger.error("External ID is required");
    return next({ status: 400 });
  }

  const existingUser = await UserService.findUserById(userId);
  if (!existingUser) {
    databaseLogger.error(`User ID ${userId} not found`);
    return next({ status: 404 });
  }

  const existingBookmark = await BookmarkService.findBookmarkByExternalId(
    userId,
    externalId,
    mediaType,
  );
  if (existingBookmark) {
    databaseLogger.error(`Work ${externalId} (${mediaType}) already bookmarked by user ${userId}`);
    return next({ status: 409 });
  }

  const bookmarkReq: Bookmark = {
    id: crypto.randomUUID(),
    userId,
    externalId,
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

  if (!externalId) {
    databaseLogger.error("External ID is required");
    return next({ status: 400 });
  }

  const existingBookmark = await BookmarkService.findBookmarkByExternalId(
    userId,
    externalId,
    mediaType,
  );
  if (existingBookmark) {
    databaseLogger.error(`Work ${externalId} (${mediaType}) already bookmarked by user ${userId}`);
    return next({ status: 409 });
  }

  const bookmarkReq: Bookmark = {
    id: crypto.randomUUID(),
    userId,
    externalId,
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

export const updateBookmark = asyncFn<Pick<BookmarkParams, "id">, {}, UpdateBookmarkBodyReq>(
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      databaseLogger.error("No fields to update");
      return next({ status: 400 });
    }

    const existingBookmark = await BookmarkService.findBookmarkById(id);
    if (!existingBookmark) {
      databaseLogger.error(`Bookmark ${id} not found`);
      return next({ status: 404 });
    }

    const fieldsToUpdate: Partial<Bookmark> = {
      status,
      updatedAt: new Date(),
    };

    const newBookmark = await BookmarkService.alterBookmark(id, fieldsToUpdate);
    if (!newBookmark) {
      databaseLogger.error("Couldn't update bookmark");
      return next({ status: 500 });
    }

    databaseLogger.info(`Bookmark ${id} updated`, newBookmark);
    successRes(res, 200, newBookmark);
  },
);

export const updateMyBookmark = asyncFn<Pick<BookmarkParams, "id">, {}, UpdateBookmarkBodyReq>(
  async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status } = req.body;

    if (!userId) {
      databaseLogger.error("User ID not found");
      return next({ status: 404 });
    }

    if (!status) {
      databaseLogger.error("No fields to update");
      return next({ status: 400 });
    }

    const existingBookmark = await BookmarkService.findBookmarkById(id);
    if (!existingBookmark || existingBookmark.userId !== userId) {
      databaseLogger.error(`Bookmark ${id} not found for your user`);
      return next({ status: 404 });
    }

    const fieldsToUpdate: Partial<Bookmark> = {
      status,
      updatedAt: new Date(),
    };

    const newBookmark = await BookmarkService.alterBookmark(id, fieldsToUpdate);
    if (!newBookmark) {
      databaseLogger.error("Couldn't update bookmark");
      return next({ status: 500 });
    }

    databaseLogger.info(`Your bookmark ${id} updated`, newBookmark);
    successRes(res, 200, newBookmark);
  },
);

export const deleteBookmark = asyncFn<Pick<BookmarkParams, "id">>(async (req, res, next) => {
  const { id } = req.params;

  const existingBookmark = await BookmarkService.findBookmarkById(id);
  if (!existingBookmark) {
    databaseLogger.error(`Bookmark ${id} not found`);
    return next({ status: 404 });
  }

  await BookmarkService.deleteBookmarkById(id);

  databaseLogger.info(`Bookmark ${id} removed`);
  successRes(res, 200, null);
});

export const deleteMyBookmark = asyncFn<Pick<BookmarkParams, "id">>(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    databaseLogger.error("User ID not found");
    return next({ status: 404 });
  }

  const existingBookmark = await BookmarkService.findBookmarkById(id);
  if (!existingBookmark || existingBookmark.userId !== userId) {
    databaseLogger.error(`Bookmark ${id} not found for your user`);
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

export const deleteAllBookmarksFromUser = asyncFn<Pick<BookmarkParams, "userId">>(
  async (req, res, next) => {
    const { userId } = req.params;

    const existingUser = await UserService.findUserById(userId);
    if (!existingUser) {
      databaseLogger.error(`User ${userId} not found`);
      return next({ status: 404 });
    }

    await BookmarkService.deleteAllBookmarksByUserId(userId);

    databaseLogger.info(`All bookmarks from user ${userId} removed`);
    successRes(res, 200, null);
  },
);

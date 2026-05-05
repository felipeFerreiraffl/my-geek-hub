import { Bookmark, BookmarkBodyReq, BookmarkParams } from "@/types/db.types.js";
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

export const getBookmarksById = asyncFn<BookmarkParams>(
  async (req, res, next) => {
    const { id } = req.params;

    const bookmark = await BookmarkService.findBookmarkById(id);
    if (!bookmark) {
      databaseLogger.error(`Bookmark with ID ${id} not found`);
      return next({ status: 404 });
    }

    databaseLogger.info(`Bookmark ID ${id} was found`);
    successRes(res, 200, bookmark);
  },
);

export const createBookmark = asyncFn<{}, {}, BookmarkBodyReq>(
  async (req, res, next) => {
    const { userId, status, mediaType, title, imageUrl, externalId } = req.body;

    if (!userId) {
      databaseLogger.error("ID is required");
      return next({ status: 400 });
    }

    if (!status) {
      databaseLogger.error("Status is required");
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
  },
);

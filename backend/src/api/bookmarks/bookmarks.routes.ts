import {
  authenticateUser,
  authorizeAdminOnly,
} from "@/middlewares/auth.middleware.js";
import * as BookmarkController from "./bookmarks.controller.js";
import { Router } from "express";

const bookmarkRouter = Router();

bookmarkRouter.get(
  "/",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.getBookmarks,
);
bookmarkRouter.get(
  "/:id",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.getBookmarksById,
);

bookmarkRouter.post(
  "/",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.createBookmark,
);

export default bookmarkRouter;

import { authenticateUser, authorize, authorizeAdminOnly } from "@/middlewares/auth.middleware.js";
import * as BookmarkController from "./bookmarks.controller.js";
import { Router } from "express";

const bookmarkRouter = Router();

bookmarkRouter.get("/", authenticateUser, authorizeAdminOnly, BookmarkController.getBookmarks);
bookmarkRouter.get("/me", authenticateUser, authorize, BookmarkController.getMyBookmarks);
bookmarkRouter.get(
  "/:id",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.getBookmarksById,
);

bookmarkRouter.post("/", authenticateUser, authorizeAdminOnly, BookmarkController.createBookmark);
bookmarkRouter.post("/me", authenticateUser, authorize, BookmarkController.createMyBookmark);

bookmarkRouter.put("/me/:id", authenticateUser, authorize, BookmarkController.updateMyBookmark);
bookmarkRouter.put("/:id", authenticateUser, authorizeAdminOnly, BookmarkController.updateBookmark);

bookmarkRouter.delete(
  "/:id",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.deleteBookmark,
);
bookmarkRouter.delete("/me/:id", authenticateUser, authorize, BookmarkController.deleteMyBookmark);
bookmarkRouter.delete("/me", authenticateUser, authorize, BookmarkController.deleteAllMyBookmarks);
bookmarkRouter.delete(
  "/",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.deleteAllBookmarksFromUser,
);
bookmarkRouter.delete(
  "/",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.deleteAllBookmarks,
);

export default bookmarkRouter;

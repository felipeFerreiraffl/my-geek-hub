import * as BookmarkController from "@/api/bookmarks/bookmarks.controller.js";
import { authenticateUser, authorizeAdminOnly } from "@/middlewares/auth.middleware.js";
import { Router } from "express";

const bookmarkRouter = Router();

bookmarkRouter.get("/me", authenticateUser, BookmarkController.getMyBookmarks);
bookmarkRouter.get("/", authenticateUser, authorizeAdminOnly, BookmarkController.getBookmarks);
bookmarkRouter.get(
  "/:id",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.getBookmarksById,
);

bookmarkRouter.post("/me", authenticateUser, BookmarkController.createMyBookmark);
bookmarkRouter.post("/", authenticateUser, authorizeAdminOnly, BookmarkController.createBookmark);

bookmarkRouter.put("/me/:id", authenticateUser, BookmarkController.updateMyBookmark);
bookmarkRouter.put("/:id", authenticateUser, authorizeAdminOnly, BookmarkController.updateBookmark);

bookmarkRouter.delete("/me/:id", authenticateUser, BookmarkController.deleteMyBookmark);
bookmarkRouter.delete(
  "/user/:userId",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.deleteAllBookmarksFromUser,
);
bookmarkRouter.delete(
  "/:id",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.deleteBookmark,
);
bookmarkRouter.delete(
  "/",
  authenticateUser,
  authorizeAdminOnly,
  BookmarkController.deleteAllBookmarks,
);

export default bookmarkRouter;

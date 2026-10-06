import * as RatingController from "@/api/ratings/ratings.controller.js";
import { authenticateUser, authorizeAdminOnly } from "@/middlewares/auth.middleware.js";
import { Router } from "express";

const ratingRouter = Router();

ratingRouter.get("/me", authenticateUser, RatingController.getMyRatings);
ratingRouter.get(
  "/me/bookmark/:bookmarkId",
  authenticateUser,
  RatingController.getMyRatingByBookmarkId,
);
ratingRouter.get("/", authenticateUser, authorizeAdminOnly, RatingController.getRatings);
ratingRouter.get(
  "/user/:userId",
  authenticateUser,
  authorizeAdminOnly,
  RatingController.getRatingsByUserId,
);
ratingRouter.get("/:id", authenticateUser, authorizeAdminOnly, RatingController.getRatingById);

ratingRouter.post("/me", authenticateUser, RatingController.createMyRating);
ratingRouter.post("/", authenticateUser, authorizeAdminOnly, RatingController.createRating);

ratingRouter.put("/me/:id", authenticateUser, RatingController.updateMyRating);
ratingRouter.put("/:id", authenticateUser, authorizeAdminOnly, RatingController.updateRating);

ratingRouter.delete("/me/:id", authenticateUser, RatingController.deleteMyRating);
ratingRouter.delete(
  "/user/:userId",
  authenticateUser,
  authorizeAdminOnly,
  RatingController.deleteAllRatingsFromUser,
);
ratingRouter.delete("/:id", authenticateUser, authorizeAdminOnly, RatingController.deleteRating);
ratingRouter.delete("/", authenticateUser, authorizeAdminOnly, RatingController.deleteAllRatings);

export default ratingRouter;

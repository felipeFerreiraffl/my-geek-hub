import * as UserController from "@/api/users/users.controller.js";
import {
  authenticateUser,
  authorize,
  authorizeAdminOnly,
} from "@/middlewares/auth.middleware.js";
import { validateUser } from "@/middlewares/validation.middleware.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get(
  "/",
  authenticateUser,
  authorizeAdminOnly,
  UserController.getUsers,
);
userRouter.get("/me", authenticateUser, authorize, UserController.getMe);
userRouter.get(
  "/:id",
  authenticateUser,
  authorizeAdminOnly,
  UserController.getUserById,
);

userRouter.post(
  "/",
  validateUser,
  authenticateUser,
  authorizeAdminOnly,
  UserController.createUser,
);

userRouter.patch(
  "/:id",
  authenticateUser,
  authorize,
  UserController.updateUser,
);

userRouter.delete(
  "/:id",
  authenticateUser,
  authorize,
  UserController.deleteUser,
);
userRouter.delete(
  "/",
  authenticateUser,
  authorizeAdminOnly,
  UserController.deleteAllUsers,
);

export default userRouter;

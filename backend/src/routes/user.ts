import * as UserController from "@/controllers/users.controller.js";
import { authenticateUser, authorize } from "@/middlewares/auth.js";
import { validateUser } from "@/middlewares/validation.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get(
  "/",
  authenticateUser,
  authorize("ADMIN"),
  UserController.getUsers,
);
userRouter.post("/", validateUser, UserController.createUser);
userRouter.delete("/:id", UserController.deleteUser);
userRouter.delete(
  "/",
  authenticateUser,
  authorize("ADMIN"),
  UserController.deleteAllUsers,
);

export default userRouter;

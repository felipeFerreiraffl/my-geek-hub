import * as UserController from "@/controllers/users.controller.js";
import { authorize } from "@/middlewares/auth.js";
import { validateUser } from "@/middlewares/validation.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", UserController.getUsers);
userRouter.post("/", validateUser, UserController.createUser);
userRouter.delete("/:id", UserController.deleteUser);
userRouter.delete("/", authorize, UserController.deleteAllUsers);

export default userRouter;

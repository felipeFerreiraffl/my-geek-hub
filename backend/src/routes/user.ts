import * as UserController from "@/controllers/users.controller.js";
import { validateUser } from "@/middlewares/validation.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", UserController.getUsers);
userRouter.post("/", validateUser, UserController.createUser);

export default userRouter;

import { UserController } from "@/controllers/users.controller.js";
import { Router } from "express";

const userRouter = Router();
const u = UserController;

userRouter.get("/", u.getAllUsers);

export default userRouter;

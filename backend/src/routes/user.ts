import { findAllUsers } from "@/controllers/users.controller.js";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/", findAllUsers);

export default userRouter;

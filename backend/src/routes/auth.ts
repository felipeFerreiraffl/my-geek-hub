import * as AuthController from "@/controllers/auth.controller.js";
import { validateUser } from "@/middlewares/validation.middleware.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/login", validateUser, AuthController.signIn);
authRouter.post("/register", validateUser, AuthController.signUp);
authRouter.post("/refresh", AuthController.refreshSign);

export default authRouter;

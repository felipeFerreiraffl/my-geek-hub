import * as AuthController from "@/controllers/auth.controller.js";
import { authLogger } from "@/utils/logger.js";
import { Router } from "express";

const authRouter = Router();

authRouter.post("/login", AuthController.signIn);

export default authRouter;

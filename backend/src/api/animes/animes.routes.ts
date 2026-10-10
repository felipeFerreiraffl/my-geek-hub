import { tenraiPerMinuteLimit, tenraiPerSecondLimit } from "@/config/rateLimit.js";
import { Router } from "express";
import { tenraiProxy } from "./animes.proxy.js";

const animesRouter = Router();

const toTenraiAnimePath = (path: string) => "/anime" + path.replace(/^\/(?=\?|$)/, "");

animesRouter.use(tenraiPerSecondLimit, tenraiPerMinuteLimit, tenraiProxy(toTenraiAnimePath));

export default animesRouter;

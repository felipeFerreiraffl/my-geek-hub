import { tenraiPerMinuteLimit, tenraiPerSecondLimit } from "@/config/rateLimit.js";
import { Router } from "express";
import { tenraiProxy } from "../tenrai.proxy.js";
import { fromPrefix, toTenraiPath } from "../tenrai.helpers.js";

const animesRouter = Router();

animesRouter.use(tenraiPerSecondLimit, tenraiPerMinuteLimit);

animesRouter.get("/top", tenraiProxy(fromPrefix("/top", "/top/anime")));
animesRouter.get("/season", tenraiProxy(fromPrefix("/season", "/seasons/now")));
animesRouter.get(
  "/season/upcoming",
  tenraiProxy(fromPrefix("/season/upcoming", "/seasons/upcoming")),
);
animesRouter.get("/season/:year/:season", tenraiProxy(fromPrefix("/season", "/seasons")));
animesRouter.get("/schedule", tenraiProxy(fromPrefix("/schedule", "/schedules")));
animesRouter.get(
  "/random",
  tenraiProxy(fromPrefix("/random", "/random/anime"), {
    on: {
      proxyRes: (proxyRes) => {
        proxyRes.headers["cache-control"] = "no-store";
      },
    },
  }),
);

animesRouter.use(tenraiProxy(toTenraiPath("/anime")));

export default animesRouter;

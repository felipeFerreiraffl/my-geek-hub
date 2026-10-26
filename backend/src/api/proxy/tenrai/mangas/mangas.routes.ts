import { tenraiPerMinuteLimit, tenraiPerSecondLimit } from "@/config/rateLimit.js";
import { Router } from "express";
import { tenraiProxy } from "../tenrai.proxy.js";
import { fromPrefix, toTenraiPath } from "../tenrai.helpers.js";

const mangasRouter = Router();

mangasRouter.use(tenraiPerSecondLimit, tenraiPerMinuteLimit);

mangasRouter.get("/top", tenraiProxy(fromPrefix("/top", "/top/manga")));
mangasRouter.get("/genres", tenraiProxy(fromPrefix("/genres", "/genres/manga")));
mangasRouter.get(
  "/recommendations",
  tenraiProxy(fromPrefix("/recommendations", "/recommendations/manga")),
);
mangasRouter.get("/reviews", tenraiProxy(fromPrefix("/reviews", "/reviews/manga")));
mangasRouter.get(
  "/random",
  tenraiProxy(fromPrefix("/random", "/random/manga"), {
    on: {
      proxyRes: (proxyRes) => {
        proxyRes.headers["cache-control"] = "no-store";
      },
    },
  }),
);

mangasRouter.use(tenraiProxy(toTenraiPath("/manga")));

export default mangasRouter;

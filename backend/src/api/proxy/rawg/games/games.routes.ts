import { rawgPerDayLimit, rawgPerSecondLimit } from "@/config/rateLimit.js";
import { Router } from "express";
import { rawgProxy } from "../rawg.proxy.js";

const fromPrefix = (localPrefix: string, rawgPrefix: string) => (path: string) =>
  rawgPrefix + path.slice(localPrefix.length);

const toRawgPath = (rawgRoot: string) => (path: string) =>
  rawgRoot + path.replace(/^\/(?=\?|$)/, "");

const gamesRouter = Router();

gamesRouter.use(rawgPerSecondLimit, rawgPerDayLimit);

gamesRouter.get(
  "/platforms/parents",
  rawgProxy(fromPrefix("/platforms/parents", "/platforms/lists/parents")),
);
gamesRouter.use("/platforms", rawgProxy(toRawgPath("/platforms")));
gamesRouter.use("/genres", rawgProxy(toRawgPath("/genres")));
gamesRouter.use("/stores", rawgProxy(toRawgPath("/stores")));
gamesRouter.use("/tags", rawgProxy(toRawgPath("/tags")));
gamesRouter.use("/developers", rawgProxy(toRawgPath("/developers")));
gamesRouter.use("/publishers", rawgProxy(toRawgPath("/publishers")));
gamesRouter.use("/creators", rawgProxy(toRawgPath("/creators")));
gamesRouter.use("/creator-roles", rawgProxy(toRawgPath("/creator-roles")));

gamesRouter.use(rawgProxy(toRawgPath("/games")));

export default gamesRouter;

import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middlewares/handleError.middleware.js";
import authRouter from "./api/auth/auth.routes.js";
import userRouter from "./api/users/users.routes.js";
import bookmarkRouter from "./api/bookmarks/bookmarks.routes.js";
import ratingRouter from "./api/ratings/ratings.routes.js";
import animesRouter from "./api/proxy/tenrai/animes/animes.routes.js";
import mangasRouter from "./api/proxy/tenrai/mangas/mangas.routes.js";
import gamesRouter from "./api/proxy/rawg/games/games.routes.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/bookmarks", bookmarkRouter);
app.use("/api/ratings", ratingRouter);

app.use("/api/animes", animesRouter);
app.use("/api/mangas", mangasRouter);
app.use("/api/games", gamesRouter);

app.use(errorHandler);

export default app;

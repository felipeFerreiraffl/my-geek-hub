import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middlewares/handleError.middleware.js";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/user.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;

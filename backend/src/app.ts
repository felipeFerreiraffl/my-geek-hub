import express from "express";
import helmet from "helmet";
import userRouter from "./routes/user.js";
import { errorHandler } from "./middlewares/handleError.js";

const app = express();

app.use(helmet());
app.use(express.json());

app.use("/api/users", userRouter);

app.use(errorHandler);

export default app;

import { Router } from "express";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.send("Rota de usuários feita");
});

export default userRouter;

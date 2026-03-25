import { getAllUsers } from "@/services/users.service.js";
import { NextFunction, Request, Response } from "express";

export class UserController {
  static getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = (await getAllUsers()) ?? [];

      res.status(200).send({
        users,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

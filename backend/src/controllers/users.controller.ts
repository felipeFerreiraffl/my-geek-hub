import { getAllUsers } from "@/services/users.service.js";
import { User } from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { NextFunction, Request, Response } from "express";

export const findAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = await getAllUsers();

    successRes<User>(users, res);
  } catch (error: unknown) {
    databaseLogger.error("Error", error);
    next(error);
  }
};

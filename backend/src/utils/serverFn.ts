import bcrypt from "bcryptjs";
import { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";

export const middlewareFn =
  <P = {}, ResB = {}, ReqB = {}, Q = {}>(
    fn: (req: Request<P, ResB, ReqB, Q>, res: Response, next: NextFunction) => void,
  ) =>
  (req: Request<P, ResB, ReqB, Q>, res: Response, next: NextFunction) => {
    fn(req, res, next);
  };

export const asyncFn =
  <P = {}, ResB = {}, ReqB = {}, Q = {}>(
    fn: (req: Request<P, ResB, ReqB, Q>, res: Response, next: NextFunction) => Promise<void>,
  ) =>
  (req: Request<P, ResB, ReqB, Q>, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: unknown) => {
      logger.error("", error);
      next(error);
    });
  };

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};

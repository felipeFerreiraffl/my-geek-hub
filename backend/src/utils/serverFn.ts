import { Request, Response, NextFunction } from "express";
import { logger } from "./logger.js";

export const middlewareFn =
  <P = {}, ResB = {}, ReqB = {}, Q = {}>(
    fn: (
      optionalProp: unknown | undefined,
      req: Request<P, ResB, ReqB, Q>,
      res: Response,
      next: NextFunction,
    ) => void,
  ) =>
  (
    optionalProp: unknown | undefined,
    req: Request<P, ResB, ReqB, Q>,
    res: Response,
    next: NextFunction,
  ) => {
    fn(optionalProp, req, res, next);
  };

export const asyncFn =
  <P = {}, ResB = {}, ReqB = {}, Q = {}>(
    fn: (
      req: Request<P, ResB, ReqB, Q>,
      res: Response,
      next: NextFunction,
    ) => Promise<void>,
  ) =>
  (req: Request<P, ResB, ReqB, Q>, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((error: unknown) => {
      logger.error("", error);
      next(error);
    });
  };

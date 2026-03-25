import { STATUS_MESSAGE } from "@/constants/status.js";
import { ErrorType } from "@/types/status.types.js";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const status = err.status ?? 500;
  const message = STATUS_MESSAGE[status];

  res.status(status).json({
    success: false,
    status,
    message,
  });
};

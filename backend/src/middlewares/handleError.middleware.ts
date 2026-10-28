import { STATUS_MESSAGE } from "@/constants/status.js";
import { ErrorType } from "@/types/status.types.js";
import { ApiError } from "@shared/schemas/response.schema.js";
import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const status = err.status ?? 500;
  const body: ApiError = {
    success: false,
    status,
    message: STATUS_MESSAGE[status] ?? "UNKNOWN ERROR",
    ...(err.code && { code: err.code }),
  };

  res.status(status).json(body);
};

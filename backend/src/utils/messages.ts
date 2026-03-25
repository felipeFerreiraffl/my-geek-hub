import { STATUS_MESSAGE } from "@/constants/status.js";
import { Response } from "express";

export const successRes = <T>(data: T[], res: Response, status = 200): void => {
  const statusMessage = STATUS_MESSAGE[status] ?? "OK";

  res.status(res.statusCode).json({
    success: true,
    status: statusMessage,
    data: data,
  });
};

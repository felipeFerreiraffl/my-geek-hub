import { STATUS_MESSAGE } from "@/constants/status.js";
import { Response } from "express";

export const successRes = <T>(data: T[], res: Response): void => {
  const statusMessage = STATUS_MESSAGE[res.statusCode];

  res.status(res.statusCode).json({
    success: true,
    status: statusMessage,
    data: data,
  });
};

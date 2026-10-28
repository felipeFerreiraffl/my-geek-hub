import { STATUS_MESSAGE } from "@/constants/status.js";
import { ApiResponse } from "@shared/schemas/response.schema.js";
import { Response } from "express";

export const successRes = <T>(res: Response, status = 200, data: T): void => {
  const body: ApiResponse<T> = {
    success: true,
    status,
    message: STATUS_MESSAGE[status] ?? "OK",
    data,
  };

  res.status(status).json(body);
};

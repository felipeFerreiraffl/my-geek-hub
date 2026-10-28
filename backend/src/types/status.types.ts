import { ApiErrorCode } from "@shared/schemas/response.schema.js";

export interface ErrorType extends Error {
  status: number;
  code?: ApiErrorCode;
}

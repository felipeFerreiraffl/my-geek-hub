import { z } from "zod";

// Machine-readable reasons the client can branch on (e.g. refresh on TOKEN_EXPIRED)
export const ApiErrorCodeSchema = z.enum(["TOKEN_EXPIRED", "TOKEN_INVALID"]);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const apiResponse = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    status: z.number().int(),
    message: z.string(),
    data: dataSchema,
  });
export type ApiResponse<T> = {
  success: true;
  status: number;
  message: string;
  data: T;
};

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  status: z.number().int(),
  message: z.string(),
  code: ApiErrorCodeSchema.optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

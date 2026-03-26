import { databaseLogger } from "@/utils/logger.js";
import { asyncFn, middlewareFn } from "@/utils/serverFn.js";
import z from "zod";

const userValidationSchema = z.object({
  email: z.email(),
});

export const validateUser = middlewareFn((_, req, res, next) => {
  const result = userValidationSchema.parse(req.body);

  if (!result.email) {
    databaseLogger.error("Invalid email format");
    return next({ status: 400 });
  }

  next();
});

import { middlewareFn } from "@/utils/serverFn.js";
import { UserBodyReq, UserUpdateReq } from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import { emailSchema, passwordSchema, UserUpdateSchema } from "@shared/schemas/user.schema.js";
import { z } from "zod";

const userUpdateReqSchema = UserUpdateSchema.extend({
  role: z.enum(["ADMIN", "USER"]).optional(),
});

export const validateUser = middlewareFn<{}, {}, UserBodyReq>((req, _, next) => {
  const { email, password } = req.body;
  const validEmail = emailSchema.safeParse(email);
  const validPassword = passwordSchema.safeParse(password);

  const passwordTooShort = validPassword.error?.issues.some((issue) => issue.code === "too_small");

  if (!validEmail.success) {
    databaseLogger.error("Invalid email format", validEmail.error.message);
    return next({ status: 400 });
  }

  if (!validPassword.success) {
    if (passwordTooShort) {
      databaseLogger.error("Password too short", validPassword.error.message);
      return next({ status: 400 });
    }

    databaseLogger.error("Weak password", validPassword.error.message);
    return next({ status: 400 });
  }

  next();
});

export const validateUserUpdate = middlewareFn<{}, {}, UserUpdateReq>((req, _, next) => {
  const result = userUpdateReqSchema.safeParse(req.body);

  if (!result.success) {
    databaseLogger.error("Invalid user update", result.error.message);
    return next({ status: 400 });
  }

  req.body = result.data;
  next();
});

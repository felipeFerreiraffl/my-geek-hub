import { middlewareFn } from "@/utils/serverFn.js";
import { UserBodyReq } from "@/types/db.types.js";
import { databaseLogger } from "@/utils/logger.js";
import z from "zod";

const emailSchema = z.email();
const passwordSchema = z
  .string()
  .min(8)
  .regex(/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/);

export const validateUser = middlewareFn<{}, {}, UserBodyReq>(
  (req, res, next) => {
    const { email, password } = req.body;
    const validEmail = emailSchema.safeParse(email);
    const validPassword = passwordSchema.safeParse(password);

    const passwordTooShort = validPassword.error?.message.includes("too_small");

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
  },
);

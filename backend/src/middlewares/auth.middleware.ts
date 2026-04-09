import { NODE_ENV } from "@/constants/dotenv.js";
import { verifyAccessToken } from "@/libs/jwt.js";
import { UserParams } from "@/types/db.types.js";
import { authLogger } from "@/utils/logger.js";
import { asyncFn, middlewareFn } from "@/utils/serverFn.js";
import { errors } from "jose";

export const authenticateUser = asyncFn(async (req, _, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next({ status: 401 });
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyAccessToken(token);
    req.user = {
      id: payload.sub as string,
      role: payload.role as "ADMIN" | "USER",
    };

    next();
  } catch (err: unknown) {
    if (err instanceof errors.JWTExpired) {
      authLogger.error("JWT Token expired", err.stack);
      return next({ status: 401, message: "TOKEN_EXPIRED" });
    }

    if (err instanceof errors.JWTInvalid) {
      authLogger.error("JWT token is invalid", err.stack);
      return next({ status: 401, message: "TOKEN_INVALID" });
    }

    return next({ status: 401 });
  }
});

const setStatusForRole = NODE_ENV !== "prod" ? 403 : 404;

export const authorizeAdminOnly = middlewareFn((req, _, next) => {
  if (!req.user) return next({ status: 401 });

  const isAdmin = req.user.role === "ADMIN";

  if (!isAdmin) {
    authLogger.error("Admin only operation");
    return next({ status: setStatusForRole });
  }

  next();
});

export const authorize = middlewareFn<UserParams>((req, _, next) => {
  if (!req.user) return next({ status: 401 });

  const isSelf = req.user.id === req.params.id;
  const isAdmin = req.user.role === "ADMIN";

  if (!isSelf && !isAdmin) {
    authLogger.error("User not authorized for this operation");
    return next({ status: setStatusForRole });
  }

  next();
});

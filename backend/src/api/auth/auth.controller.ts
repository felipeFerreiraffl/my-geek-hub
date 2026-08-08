import * as AuthService from "./auth.service.js";
import { RefreshTokenBodyReq, UserBodyReq } from "@/types/db.types.js";
import { authLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { asyncFn } from "@/utils/serverFn.js";

export const signIn = asyncFn<{}, {}, UserBodyReq>(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    authLogger.error("Email and password required");
    return next({ status: 400 });
  }

  const authenticated = await AuthService.login(email, password);

  if (!authenticated) {
    authLogger.error("Could not find user with the credentials");
    return next({ status: 401 });
  }

  const { password: _, ...userWithoutPassword } = authenticated.user;

  authLogger.info(`User ${authenticated.user.username} authenticated`, authenticated.user);
  successRes(res, 200, {
    user: userWithoutPassword,
    accessToken: authenticated.accessToken,
    refreshToken: authenticated.refreshToken,
  });
});

export const signUp = asyncFn<{}, {}, UserBodyReq>(async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!email || !password) {
    authLogger.error("Email and password required");
    return next({ status: 400 });
  }

  const result = await AuthService.register(email, password, username);

  if (!result) {
    authLogger.error("Email already exists");
    return next({ status: 409 });
  }

  const { password: _, ...userWithoutPassword } = result.newUser;

  authLogger.info(`User ${result.newUser.id} registred`);
  successRes(res, 201, {
    user: userWithoutPassword,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

export const refreshSign = asyncFn<{}, {}, RefreshTokenBodyReq>(async (req, res, next) => {
  const { tokenHash } = req.body;

  if (!tokenHash) {
    authLogger.error("Refresh token required");
    return next({ status: 400 });
  }

  const result = await AuthService.refresh(tokenHash);
  if (!result) {
    authLogger.error("Invalid or expired refresh token");
    return next({ status: 401 });
  }

  authLogger.info("Token refreshed", JSON.stringify(result));
  successRes(res, 200, {
    accessToken: result.newAccessToken,
    refreshToken: result.newRefreshToken,
  });
});

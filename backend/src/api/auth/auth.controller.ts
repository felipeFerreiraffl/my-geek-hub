import * as AuthService from "./auth.service.js";
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from "@/config/cookie.js";
import { toAuthError } from "@/libs/jwt.js";
import { UserBodyReq } from "@/types/db.types.js";
import { authLogger } from "@/utils/logger.js";
import { successRes } from "@/utils/messages.js";
import { asyncFn } from "@/utils/serverFn.js";
import { errors } from "jose";

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
  res.cookie(REFRESH_COOKIE_NAME, authenticated.refreshToken, refreshCookieOptions);
  successRes(res, 200, {
    user: userWithoutPassword,
    accessToken: authenticated.accessToken,
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
  res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
  successRes(res, 201, {
    user: userWithoutPassword,
    accessToken: result.accessToken,
  });
});

export const refreshSign = asyncFn(async (req, res, next) => {
  const refreshToken: string | undefined = req.cookies[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    authLogger.error("Refresh token cookie missing");
    return next({ status: 401 });
  }

  let result: Awaited<ReturnType<typeof AuthService.refresh>>;
  try {
    result = await AuthService.refresh(refreshToken);
  } catch (err: unknown) {
    // Only JWT verification failures are 401; anything else (e.g. DB) stays a 500
    if (!(err instanceof errors.JOSEError)) {
      authLogger.error("Refresh failed", err);
      return next(err);
    }

    const authError = toAuthError(err);
    authLogger.error("Refresh token rejected", authError.code);
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    return next(authError);
  }

  if (!result) {
    authLogger.error("Refresh token not found or already used");
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);
    return next({ status: 401, code: "TOKEN_INVALID" });
  }

  authLogger.info("Token refreshed");
  res.cookie(REFRESH_COOKIE_NAME, result.newRefreshToken, refreshCookieOptions);
  successRes(res, 200, {
    accessToken: result.newAccessToken,
  });
});

export const signOut = asyncFn(async (req, res, _) => {
  const refreshToken: string | undefined = req.cookies[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    await AuthService.logout(refreshToken);
  }

  // Always succeeds: without a valid cookie there is no session left to end
  res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);

  authLogger.info("User signed out");
  successRes(res, 200, null);
});

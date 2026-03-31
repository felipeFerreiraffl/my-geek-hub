import * as AuthService from "@/services/auth.service.js";
import { UserBodyReq } from "@/types/db.types.js";
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

  authLogger.info(
    `User ${authenticated.user.username} authenticated`,
    authenticated.user,
  );
  successRes(res, 200, {
    user: userWithoutPassword,
    accessToken: authenticated.accessToken,
    refreshToken: authenticated.refreshToken,
  });
});

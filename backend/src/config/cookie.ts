import { NODE_ENV } from "@/constants/dotenv.js";
import { REFRESH_EXPIRED_TIME } from "@/constants/numbers.js";
import { CookieOptions } from "express";

export const REFRESH_COOKIE_NAME = "mgh_refresh";

// Only sent to /api/auth/* and never readable by client JS
export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "prod",
  sameSite: "strict",
  path: "/api/auth",
  maxAge: REFRESH_EXPIRED_TIME,
};

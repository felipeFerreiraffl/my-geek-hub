import rateLimit, { Options } from "express-rate-limit";

// Forwards 429s to errorHandler so they share the standard error envelope
const handler: Options["handler"] = (_req, _res, next, options) =>
  next({ status: options.statusCode });

const tenraiLimitOptions: Partial<Options> = {
  keyGenerator: () => "tenrai",
  handler,
  standardHeaders: "draft-8",
  legacyHeaders: false,
};

export const tenraiPerSecondLimit = rateLimit({
  ...tenraiLimitOptions,
  identifier: "tenrai-per-second",
  windowMs: 1000,
  limit: 3,
});

export const tenraiPerMinuteLimit = rateLimit({
  ...tenraiLimitOptions,
  identifier: "tenrai-per-minute",
  windowMs: 60 * 1000,
  limit: 115,
});

const rawgLimitOptions: Partial<Options> = {
  keyGenerator: () => "rawg",
  handler,
  standardHeaders: "draft-8",
  legacyHeaders: false,
};

export const rawgPerSecondLimit = rateLimit({
  ...rawgLimitOptions,
  identifier: "rawg-per-second",
  windowMs: 1000,
  limit: 4,
});

export const rawgPerDayLimit = rateLimit({
  ...rawgLimitOptions,
  identifier: "rawg-per-day",
  windowMs: 24 * 60 * 60 * 1000,
  limit: 640,
});

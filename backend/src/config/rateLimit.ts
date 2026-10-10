import rateLimit, { Options } from "express-rate-limit";

const tenraiLimitOptions: Partial<Options> = {
  keyGenerator: () => "tenrai",
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
  identifier: "jikan-per-minute",
  windowMs: 60 * 1000,
  limit: 115,
});

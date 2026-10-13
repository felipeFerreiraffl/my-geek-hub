import rateLimit, { Options } from "express-rate-limit";

// Tenrai public tier: 120 req/min and 4 req/s per IP (https://api.tenrai.org/documentation)
// Kept slightly below it, and keyed globally since Tenrai limits this server's IP
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
  identifier: "tenrai-per-minute",
  windowMs: 60 * 1000,
  limit: 115,
});

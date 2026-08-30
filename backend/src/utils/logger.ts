import { NODE_ENV } from "@/constants/dotenv.js";
import pino from "pino";

const isDev = NODE_ENV !== "prod";

const pinoLogger = pino(
  { level: isDev ? "debug" : "warn", base: undefined },
  isDev ? pino.transport({ target: "pino-pretty", options: { colorize: true } }) : undefined,
);

const createLogger = (prefix: string) => ({
  info: (message: string, data?: unknown) => pinoLogger.info({ prefix, data }, message),
  error: (message: string, error?: unknown) => pinoLogger.error({ prefix, error }, message),
  warn: (message: string, warning?: unknown) => pinoLogger.warn({ prefix, warning }, message),
});

export const logger = createLogger("INFO");
export const authLogger = createLogger("AUTH");
export const databaseLogger = createLogger("DB");
export const proxyLogger = createLogger("PROXY");

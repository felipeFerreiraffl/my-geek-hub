import { NODE_ENV } from "@/constants/dotenv.js";
import { ErrorType } from "@/types/status.types.js";

const isDev = NODE_ENV !== "prod";

const createLogger = (prefix: string) => ({
  info: (message: string, data?: unknown) =>
    isDev && console.log(`[${prefix}] ${message}`, `\n${data ?? ""}`),
  error: (message: string, error?: unknown) =>
    console.error(`[${prefix}] ${message}`, `\n${error ?? ""}`),
  warn: (message: string, warning?: unknown) =>
    isDev && console.warn(`[${prefix}] ${message}`, `\n${warning ?? ""}`),
});

export const logger = createLogger("INFO");
export const authLogger = createLogger("AUTH");
export const databaseLogger = createLogger("DB");
export const proxyLogger = createLogger("PROXY");

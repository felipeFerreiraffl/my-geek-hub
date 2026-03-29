export const STATUS_MESSAGE: Record<number, string> = {
  200: "OK",
  201: "CREATED",
  400: "BAD REQUEST",
  401: "UNAUTHORIZED",
  404: "NOT FOUND",
  409: "CONFLICT",
  429: "TOO MANY REQUESTS",
  500: "INTERNAL ERROR",
} as const;

import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["prod", "dev", "test"]).default("dev"),
    HOST: z.string().default("localhost"),
    PORT: z.coerce.number().default(8000),
    DATABASE_URL: z.url(),
    JWT_ACCESS_SECRET: z.hex().min(64),
    JWT_REFRESH_SECRET: z.hex().min(64),
    JWT_ACCESS_EXP: z.string().regex(/^\d+[smhd]$/),
    JWT_REFRESH_EXP: z.string().regex(/^\d+[smhd]$/),
    RAWG_API_KEY: z.string(),
    MGH_CLIENT_URL: z
      .url()
      .transform((url) => new URL(url).origin)
      .optional(),
  })
  .refine((env) => env.NODE_ENV !== "prod" || env.MGH_CLIENT_URL, {
    message: "MGH_CLIENT_URL is required in production",
    path: ["MGH_CLIENT_URL"],
  });

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables");
  console.error(result.error);
  process.exit(1);
}

export const dotenv = result.data;

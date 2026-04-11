import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["prod", "dev", "test"]).default("dev"),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.url(),
  JWT_ACCESS_SECRET: z.hex().min(64),
  JWT_REFRESH_SECRET: z.hex().min(64),
  JWT_ACCESS_EXP: z.string().regex(/^\d+[smhd]$/),
  JWT_REFRESH_EXP: z.string().regex(/^\d+[smhd]$/),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables");
  console.error(result.error);
  process.exit(1);
}

export const dotenv = result.data;

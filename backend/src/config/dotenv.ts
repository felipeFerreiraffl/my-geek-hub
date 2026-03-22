import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["prod", "dev", "test"]).default("dev"),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.url(),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.hash("sha256").or(z.string()),
  DATABASE_HOST: z.string(),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables");
  console.error(result.error);
  process.exit(1);
}

export const dotenv = result.data;

import {
  DATABASE_HOST,
  DATABASE_PASSWORD,
  DATABASE_URL,
  DATABASE_USER,
} from "@/constants/dotenv.js";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: DATABASE_HOST,
    database: DATABASE_URL,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  },
});

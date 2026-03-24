import {
  DATABASE_HOST,
  DATABASE_PASSWORD,
  DATABASE_URL,
  DATABASE_USER,
} from "@/constants/dotenv.js";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/drizzle/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    host: DATABASE_HOST,
    url: DATABASE_URL,
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
  },
});

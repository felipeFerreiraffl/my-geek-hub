import { DATABASE_URL } from "./src/constants/dotenv";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/drizzle/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});

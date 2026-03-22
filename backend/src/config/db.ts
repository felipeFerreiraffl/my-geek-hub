import { DATABASE_URL, NODE_ENV } from "@/constants/dotenv.js";
import * as schema from "@/db/drizzle/schema.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(DATABASE_URL);

export const db = drizzle(client, {
  schema,
  logger: NODE_ENV === "dev",
});

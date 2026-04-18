import { DATABASE_URL } from "@/constants/dotenv.js";
import * as schema from "@/db/drizzle/index.js";
import * as relations from "@drizzle/relations.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(DATABASE_URL);

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
});

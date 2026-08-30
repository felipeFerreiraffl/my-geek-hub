import { DATABASE_URL, NODE_ENV } from "@/constants/dotenv.js";
import * as schema from "@/db/drizzle/index.js";
import * as relations from "@drizzle/relations.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(DATABASE_URL);

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
});

// Confirmação de conexão com o banco
export const connectDb = async (): Promise<void> => {
  const start = Date.now();

  await client`SELECT 1`;

  const latency = Date.now() - start;

  if (NODE_ENV === "dev") {
    const [dbInfo] = await client`
    SELECT current_database() AS name, 
      pg_size_pretty(pg_database_size(current_database())) AS size
    `;

    const tables = await client`
        SELECT tablename AS table
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY tablename 
    `;

    const tableNames = tables.map((t) => t.table).join(", ") || "nenhuma";

    console.group("\n [DATABASE INFOS]");
    console.log(`✓ PostgreSQL connected (${latency}ms)`);
    console.log(`• Database    →  ${dbInfo.name}`);
    console.log(`• Size        →  ${dbInfo.size}`);
    console.log(`• Tables      →  ${tableNames}`);
    console.groupEnd();
  }
};

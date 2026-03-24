import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["USER", "ADMIN"]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: rolesEnum("role").default("USER").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

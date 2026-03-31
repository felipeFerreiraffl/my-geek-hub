import { db } from "@/config/db.js";
import { users as usersTable } from "@/db/drizzle/index.js";
import { User } from "@/types/db.types.js";
import { eq } from "drizzle-orm";

export const findAllUsers = async (): Promise<User[]> => {
  const users = await db.query.users.findMany();
  return users;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return user ?? null;
};

export const findUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user ?? null;
};

export const createUser = async (user: User): Promise<User> => {
  const [newUser] = await db.insert(usersTable).values(user).returning();
  return newUser;
};

export const deleteUserById = async (id: string): Promise<void> => {
  await db.delete(usersTable).where(eq(usersTable.id, id));
};

export const deleteAllUsers = async (): Promise<void> => {
  await db.delete(usersTable);
};

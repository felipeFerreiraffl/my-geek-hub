import { db } from "@/config/db.js";
import { users as usersTable } from "@/db/drizzle/index.js";
import { createAccessToken, refreshAccessToken } from "@/libs/jwt.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const login = async (email: string, password: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user) return null;

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) return null;

  const accessToken = await createAccessToken(user.id, user.role);
  const refreshToken = await refreshAccessToken(user.id);

  return { user, accessToken, refreshToken };
};

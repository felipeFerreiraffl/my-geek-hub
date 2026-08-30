import { db } from "@/config/db.js";
import { REFRESH_EXPIRED_TIME } from "@/constants/numbers.js";
import { users as usersTable, refreshTokens as refreshTokensTable } from "@/db/drizzle/index.js";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "@/libs/jwt.js";
import { RefreshToken, User } from "@/types/db.types.js";
import { hashPassword } from "@/utils/serverFn.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export const login = async (email: string, password: string) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (!user) return null;

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) return null;

  const accessToken = await createAccessToken(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const refreshTokenVal: RefreshToken = {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRED_TIME),
  };

  await db.insert(refreshTokensTable).values(refreshTokenVal);

  return { user, accessToken, refreshToken };
};

export const register = async (email: string, password: string, username?: string) => {
  const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

  if (existingUser) return null;

  const randomizeUserSuffix = Math.floor(Math.random() * (99999 - 10000));
  const hashedPassword = await hashPassword(password);

  const user: User = {
    id: crypto.randomUUID(),
    username: username ?? `geek_${randomizeUserSuffix}`,
    email,
    password: hashedPassword,
    role: "USER",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [newUser] = await db.insert(usersTable).values(user).returning();

  const accessToken = await createAccessToken(newUser.id, newUser.role);
  const refreshToken = await createRefreshToken(newUser.id);

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const refreshTokenVal: RefreshToken = {
    id: crypto.randomUUID(),
    userId: newUser.id,
    tokenHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRED_TIME),
  };

  await db.insert(refreshTokensTable).values(refreshTokenVal);

  return { newUser, accessToken, refreshToken };
};

export const refresh = async (refreshToken: string) => {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload || !payload.sub) return null;

  const storedTokens = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.userId, payload.sub));

  let matchedToken: RefreshToken | null = null;
  for (const stored of storedTokens) {
    const matches = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (matches) {
      matchedToken = stored;
      break;
    }
  }

  if (!matchedToken) return null;
  if (matchedToken.expiresAt < new Date()) return null;

  await db.delete(refreshTokensTable).where(eq(refreshTokensTable.id, matchedToken.id));

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.sub));

  if (!user) return null;

  const newAccessToken = await createAccessToken(user.id, user.role);
  const newRefreshToken = await createRefreshToken(user.id);

  const tokenHash = await bcrypt.hash(newRefreshToken, 10);
  const refreshTokenVal: RefreshToken = {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRED_TIME),
  };

  await db.insert(refreshTokensTable).values(refreshTokenVal);

  return { newAccessToken, newRefreshToken };
};

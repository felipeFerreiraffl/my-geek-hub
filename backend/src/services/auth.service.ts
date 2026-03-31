import { db } from "@/config/db.js";
import { REFRESH_EXPIRED_TIME } from "@/constants/numbers.js";
import {
  users as usersTable,
  refreshTokens as refreshTokensTable,
} from "@/db/drizzle/index.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from "@/libs/jwt.js";
import { RefreshToken } from "@/types/db.types.js";
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
  const refreshToken = await createRefreshToken(user.id);

  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const refreshTokenVal: RefreshToken = {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash,
    created_at: new Date(),
    expires_at: new Date(Date.now() + REFRESH_EXPIRED_TIME),
  };

  await db.insert(refreshTokensTable).values(refreshTokenVal);

  return { user, accessToken, refreshToken };
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
  if (matchedToken.expires_at < new Date()) return null;

  await db.delete(refreshTokensTable).where(eq(usersTable.id, payload.sub));

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, payload.sub));

  if (!user) return null;

  const newAccessToken = await createAccessToken(user.id, user.role);
  const newRefreshToken = await createRefreshToken(user.id);

  const tokenHash = await bcrypt.hash(newRefreshToken, 10);
  const refreshTokenVal: RefreshToken = {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash,
    created_at: new Date(),
    expires_at: new Date(Date.now() + REFRESH_EXPIRED_TIME),
  };

  await db.insert(refreshTokensTable).values(refreshTokenVal);

  return { newAccessToken, newRefreshToken };
};

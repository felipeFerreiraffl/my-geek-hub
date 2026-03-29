import {
  JWT_ACCESS_EXP,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_EXP,
  JWT_REFRESH_SECRET,
} from "@/constants/dotenv.js";
import { JWTAuthPayload } from "@/types/auth.types.js";
import { errors, jwtVerify, SignJWT } from "jose";

interface SignTokenProps {
  payload: JWTAuthPayload;
  secret: Uint8Array;
  expiresIn: string;
}

interface VerifyTokenProps {
  token: string;
  secret: Uint8Array;
}

const encoder = new TextEncoder();

export const accessSecret = encoder.encode(JWT_ACCESS_SECRET);
export const refreshSecret = encoder.encode(JWT_REFRESH_SECRET);

export const signToken = async ({
  payload,
  secret,
  expiresIn,
}: SignTokenProps): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
};

export const verifyToken = async ({ token, secret }: VerifyTokenProps) => {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"],
  });

  return payload;
};

export const isValidPayload = (payload: JWTAuthPayload) => {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "sub" in payload &&
    "role" in payload &&
    typeof payload.sub === "string" &&
    (payload.role === "ADMIN" || payload.role === "USER")
  );
};

export const createAccessToken = async (
  userId: string,
  role: "ADMIN" | "USER",
) => {
  const minPayload = {
    sub: userId,
    role,
  };

  return signToken({
    payload: minPayload,
    secret: accessSecret,
    expiresIn: JWT_ACCESS_EXP,
  });
};

export const refreshAccessToken = async (userId: string) => {
  const minPayload = {
    sub: userId,
  };

  return signToken({
    payload: minPayload,
    secret: refreshSecret,
    expiresIn: JWT_REFRESH_EXP,
  });
};

export const verifyAccessToken = (token: string) => {
  return verifyToken({ token, secret: accessSecret });
};

export const verifyRefreshToken = (token: string) => {
  return verifyToken({ token, secret: refreshSecret });
};

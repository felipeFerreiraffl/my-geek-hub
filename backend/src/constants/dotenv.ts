import { dotenv } from "@/config/dotenv.js";

export const NODE_ENV = dotenv.NODE_ENV;
export const PORT = dotenv.PORT;
export const DATABASE_URL = dotenv.DATABASE_URL;
export const JWT_ACCESS_SECRET = dotenv.JWT_ACCESS_SECRET;
export const JWT_REFRESH_SECRET = dotenv.JWT_REFRESH_SECRET;
export const JWT_ACCESS_EXP = dotenv.JWT_ACCESS_EXP;
export const JWT_REFRESH_EXP = dotenv.JWT_REFRESH_EXP;

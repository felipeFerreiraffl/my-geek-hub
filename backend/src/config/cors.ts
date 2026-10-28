import { MGH_CLIENT_URL, NODE_ENV } from "@/constants/dotenv.js";
import { CorsOptions } from "cors";

const IS_PROD = NODE_ENV === "prod";
const ALLOWED_ORIGIN = IS_PROD ? (MGH_CLIENT_URL ?? false) : "http://localhost:3000";
const CORS_MAX_AGE = IS_PROD ? 7200 : 600;

export const corsOptions: CorsOptions = {
  origin: ALLOWED_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // Lets the browser send and store the refresh token cookie cross-origin
  credentials: true,
  maxAge: CORS_MAX_AGE,
};

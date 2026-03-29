import { JWTPayload } from "jose";

export interface JWTAuthPayload extends JWTPayload {
  role?: "ADMIN" | "USER";
}

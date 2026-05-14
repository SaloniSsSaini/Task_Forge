import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type AccessPayload = { sub: string; email: string; role: string };

const accessSignOptions: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions["expiresIn"] };
const refreshSignOptions: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions["expiresIn"] };

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, accessSignOptions);
}

export function signRefreshToken(sub: string): string {
  return jwt.sign({ sub }, env.JWT_REFRESH_SECRET, refreshSignOptions);
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
}

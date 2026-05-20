import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

type AccessPayload = {
  id: number;
  role: string;
};

type RefreshPayload = {
  id: number;
  jti: string;
  type: "refresh";
};

/**
 * =========================
 * ACCESS TOKEN (15 min)
 * =========================
 */
export function generateAccessToken(payload: AccessPayload) {
  return jwt.sign(
    {
      id: payload.id,
      role: payload.role,
      type: "access",
    },
    ACCESS_SECRET,
    { expiresIn: "30m" }
  );
}

/**
 * =========================
 * REFRESH TOKEN (5 days)
 * ALWAYS UNIQUE
 * =========================
 */
export function generateRefreshToken(userId: number) {
  const payload: RefreshPayload = {
    id: userId,
    jti: crypto.randomUUID(), // 🔥 makes it unique
    type: "refresh",
  };

  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: "5d",
  });
}

/**
 * =========================
 * VERIFY
 * =========================
 */
export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as RefreshPayload;
}
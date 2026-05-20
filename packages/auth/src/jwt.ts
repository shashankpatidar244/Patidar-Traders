import * as jwt from "jsonwebtoken";

function getAccessSecret() {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret) {
    throw new Error(
      "ACCESS_TOKEN_SECRET is not defined in environment variables"
    );
  }

  return secret;
}

export function generateAccessToken(payload: {
  id: number;
  role: string;
}) {
  return jwt.sign(payload, getAccessSecret(), {
    expiresIn: "30m",
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getAccessSecret()) as {
    id: number;
    role: string;
  };
}
import crypto from "node:crypto";

export function createRawToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function safeEqualToken(rawToken: string, tokenHash: string) {
  const actual = Buffer.from(hashToken(rawToken), "hex");
  const expected = Buffer.from(tokenHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

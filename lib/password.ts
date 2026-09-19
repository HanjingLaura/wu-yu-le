import bcrypt from "bcryptjs";

/** Password hashing is isolated so a hosted deployment can swap in Argon2 later. */
export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

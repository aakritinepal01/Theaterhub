import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { pbkdf2Sync, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE = "theatrehub_session";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

export async function currentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hash(token) }, include: { user: true } });
  return session && session.expiresAt > new Date() && session.user.isActive ? session.user : null;
}

export async function requireStaff() {
  const user = await currentUser();
  if (!user?.isStaff) throw new Error("UNAUTHORIZED");
  return user;
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
  await prisma.session.create({ data: { tokenHash: hash(token), userId, expiresAt } });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAt, path: "/" });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hash(token) } });
    // Also clean up expired sessions on logout
    await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
  jar.delete(COOKIE);
}

export async function verifyPassword(password:string, encoded:string){
  if(encoded.startsWith("pbkdf2_sha256$")){const [,rounds,salt,digest]=encoded.split("$");const actual=pbkdf2Sync(password,salt,Number(rounds),32,"sha256");const expected=Buffer.from(digest,"base64");return actual.length===expected.length&&timingSafeEqual(actual,expected)}
  if(encoded.startsWith("$2"))return bcrypt.compare(password,encoded);
  return false;
}

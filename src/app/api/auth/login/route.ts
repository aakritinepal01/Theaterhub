import { NextResponse } from "next/server";
import { createSession, requiresPasswordChange, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const data = await request.formData();
  const username = String(data.get("username") || "").trim();
  const password = String(data.get("password") || "");
  const user = username ? await prisma.user.findFirst({ where: { username: { equals: username, mode: "insensitive" } } }) : null;
  if (!user?.isActive || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
  await createSession(user.id);
  const destination = requiresPasswordChange(user) ? "/set-new-password" : user.isStaff || user.isSuperuser ? "/admin" : "/theatre-dashboard";
  return NextResponse.redirect(new URL(destination, request.url), 303);
}

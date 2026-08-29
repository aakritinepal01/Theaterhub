import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  const data = await request.formData();
  const password = String(data.get("password") || "");
  const confirm = String(data.get("confirmPassword") || "");
  if (password.length < 8) return NextResponse.redirect(new URL("/set-new-password?error=length", request.url), 303);
  if (password !== confirm) return NextResponse.redirect(new URL("/set-new-password?error=match", request.url), 303);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(password, 12), isPasswordChanged: true } });
  return NextResponse.redirect(new URL(user.isStaff || user.isSuperuser ? "/admin" : "/theatre-dashboard", request.url), 303);
}

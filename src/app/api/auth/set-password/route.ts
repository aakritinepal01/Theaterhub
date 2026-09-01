import bcrypt from "bcryptjs";
import { createHash, randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { sendPasswordResetCode } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const hashCode = (code: string) => createHash("sha256").update(code).digest("hex");

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url), 303);
  if (user.isStaff || user.isSuperuser || user.isPasswordChanged) {
    return NextResponse.redirect(new URL(user.isStaff || user.isSuperuser ? "/admin" : "/theatre-dashboard", request.url), 303);
  }
  const data = await request.formData();
  const action = String(data.get("action") || "request");

  if (action === "verify") {
    const code = String(data.get("code") || "").trim();
    const pending = await prisma.passwordResetCode.findUnique({ where: { userId: user.id } });
    if (!pending || pending.expiresAt <= new Date()) {
      if (pending) await prisma.passwordResetCode.delete({ where: { userId: user.id } });
      return NextResponse.redirect(new URL("/set-new-password?step=verify&error=expired", request.url), 303);
    }
    if (!/^\d{6}$/.test(code) || hashCode(code) !== pending.codeHash) {
      if (pending.attempts >= 4) {
        await prisma.passwordResetCode.delete({ where: { userId: user.id } });
        return NextResponse.redirect(new URL("/set-new-password?error=attempts", request.url), 303);
      }
      await prisma.passwordResetCode.update({ where: { userId: user.id }, data: { attempts: { increment: 1 } } });
      return NextResponse.redirect(new URL("/set-new-password?step=verify&error=code", request.url), 303);
    }
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: pending.pendingPasswordHash, isPasswordChanged: true } }),
      prisma.passwordResetCode.delete({ where: { userId: user.id } }),
    ]);
    return NextResponse.redirect(new URL("/theatre-dashboard", request.url), 303);
  }

  const password = String(data.get("password") || "");
  const confirm = String(data.get("confirmPassword") || "");
  if (password.length < 8) return NextResponse.redirect(new URL("/set-new-password?error=length", request.url), 303);
  if (password !== confirm) return NextResponse.redirect(new URL("/set-new-password?error=match", request.url), 303);
  const code = String(randomInt(100000, 1_000_000));
  await prisma.passwordResetCode.upsert({
    where: { userId: user.id },
    create: { userId: user.id, codeHash: hashCode(code), pendingPasswordHash: await bcrypt.hash(password, 12), expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    update: { codeHash: hashCode(code), pendingPasswordHash: await bcrypt.hash(password, 12), expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 },
  });
  console.log("Attempting to send password verification code to:", user.email);
  try {
    const delivery = await sendPasswordResetCode({ email: user.email, firstName: user.firstName || user.username, code });
    console.log("Password verification code sent successfully", { email: user.email, messageId: delivery.messageId, response: delivery.response });
    return NextResponse.redirect(new URL("/set-new-password?step=verify&sent=1", request.url), 303);
  } catch (error) {
    await prisma.passwordResetCode.deleteMany({ where: { userId: user.id } });
    console.error("PASSWORD VERIFICATION EMAIL FAILED:", error);
    return NextResponse.redirect(new URL("/set-new-password?error=email", request.url), 303);
  }
}

import { NextResponse } from "next/server";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const str = (data: FormData, key: string) => String(data.get(key) ?? "").trim();

export async function PATCH(request: Request) {
  let user: Awaited<ReturnType<typeof requireTheatreUser>>;
  try {
    user = await requireTheatreUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.formData();
  const firstName = str(data, "firstName");
  const lastName  = str(data, "lastName");
  const email     = str(data, "email").toLowerCase();

  if (!firstName) return NextResponse.json({ error: "First name is required." }, { status: 400 });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // Optional password change section
  const newPassword    = str(data, "newPassword");
  const confirmPassword = str(data, "confirmPassword");

  if (newPassword) {
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }
  }

  const updateData: Record<string, unknown> = { firstName, lastName, email };
  if (newPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  await prisma.user.update({ where: { id: user.id }, data: updateData });

  return NextResponse.json({ ok: true });
}

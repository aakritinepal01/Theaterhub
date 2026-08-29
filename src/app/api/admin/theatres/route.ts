import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) {
  try { await requireStaff(); } catch { return Response.json({ error: "Unauthorized" }, { status: 401 }); }
  const url = new URL(request.url), search = url.searchParams.get("search")?.trim(), unclaimed = url.searchParams.get("unclaimed") === "1";
  const theatres = await prisma.theatre.findMany({ where: { title: search ? { contains: search, mode: "insensitive" } : undefined, ownerId: unclaimed ? null : undefined }, include: { owner: { select: { username: true, email: true } }, _count: { select: { plays: true } } }, orderBy: [{ updated: "desc" }, { title: "asc" }] });
  return Response.json(theatres);
}

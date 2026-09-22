import { revalidatePath } from "next/cache";
import { requireTheatreUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MAX_POST_BYTES, validatePostFiles } from "@/lib/theatre-media-validation";
import { removeStoredAsset, storeTheatreMedia, validateMediaContent, type StoredAsset } from "@/lib/theatre-media-storage";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const uploaded: StoredAsset[] = [];
  let committed = false;
  try {
    const user = await requireTheatreUser();
    const theatre = await prisma.theatre.findUnique({ where: { ownerId: user.id }, select: { id: true } });
    if (!theatre) return Response.json({ error: "No theatre is assigned to your account." }, { status: 403 });
    if (Number(request.headers.get("content-length")) > MAX_POST_BYTES + 1024 * 1024) return Response.json({ error: "Keep the total upload under 100 MB." }, { status: 413 });
    const data = await request.formData();
    const kind = String(data.get("kind"));
    const caption = String(data.get("caption") || "").trim();
    if (kind !== "STORY" && kind !== "REEL") return Response.json({ error: "Choose Stories or Reels." }, { status: 400 });
    if (caption.length > 1000) return Response.json({ error: "Keep the caption under 1,000 characters." }, { status: 400 });
    const files = data.getAll("files").filter((file): file is File => file instanceof File);
    const error = validatePostFiles(files);
    if (error) return Response.json({ error }, { status: 400 });
    try { for (const file of files) await validateMediaContent(file); }
    catch (cause) { return Response.json({ error: cause instanceof Error ? cause.message : "Invalid media file." }, { status: 400 }); }
    for (const file of files) uploaded.push(await storeTheatreMedia(file, theatre.id));
    const post = await prisma.theatrePost.create({ data: {
      theatreId: theatre.id, kind, caption,
      assets: { create: uploaded.map((asset, position) => ({ ...asset, position })) },
    }, select: { id: true } });
    committed = true;
    revalidatePath("/");
    revalidatePath("/theatre-dashboard/media");
    return Response.json({ ok: true, id: post.id }, { status: 201 });
  } catch (error) {
    if (!committed) await Promise.allSettled(uploaded.map(removeStoredAsset));
    if (error instanceof Error && ["UNAUTHORIZED", "PASSWORD_CHANGE_REQUIRED"].includes(error.message)) return Response.json({ error: "Please sign in to your theatre account." }, { status: 401 });
    console.error("Theatre post failed", error);
    return Response.json({ error: "Unable to post. Your selected files are still here; please try again." }, { status: 500 });
  }
}

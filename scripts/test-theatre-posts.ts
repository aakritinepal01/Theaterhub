import type { TheatrePost, TheatrePostAsset } from "@prisma/client";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { validatePostFiles } from "../src/lib/theatre-media-validation";
import { validateMediaContent } from "../src/lib/theatre-media-storage";

async function main() {
  assert.ok(validatePostFiles([]));
  assert.ok(validatePostFiles([{ type: "text/html", size: 20 }]));
  assert.ok(validatePostFiles([{ type: "video/mp4", size: 51 * 1024 * 1024 }]));
  assert.equal(validatePostFiles([{ type: "video/webm", size: 1024 }]), null);
  await assert.rejects(validateMediaContent(new File(["invalid"], "fake.png", { type: "image/png" })));
  const rollback = new Error("ROLLBACK_TEST");
  try {
    await prisma.$transaction(async tx => {
      const theatre = await tx.theatre.findFirst({ select: { id: true } });
      assert.ok(theatre, "A theatre is required for the transaction test");
      for (const kind of ["STORY", "REEL"]) {
        const post: TheatrePost = await tx.theatrePost.create({ data: {
          theatreId: theatre.id, kind, caption: "Transaction test - rolled back",
          assets: { create: [
            { url: "/test-photo.png", mediaType: "image", position: 0 },
            { url: "/test-video.mp4", mediaType: "video", position: 1 },
          ] },
        } });
        const saved: (TheatrePost & { assets: TheatrePostAsset[] }) | null = await tx.theatrePost.findFirst({ where: { id: post.id, theatreId: theatre.id }, include: { assets: { orderBy: { position: "asc" } } } });
        assert.equal(saved?.kind, kind);
        assert.deepEqual(saved?.assets.map(asset => asset.mediaType), ["image", "video"]);
      }
      throw rollback;
    }, { timeout: 30000 });
  } catch (error) { if (error !== rollback) throw error; }
  console.log("PASS: upload validation, file content checks, story/reel save and ordered media read. Test writes rolled back.");
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

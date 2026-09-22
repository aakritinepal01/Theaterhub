import { readFile } from "node:fs/promises";
import { prisma } from "../src/lib/prisma";

async function main() {
  const sql = await readFile("prisma/patches/add-theatre-posts.sql", "utf8");
  await prisma.$transaction(async tx => {
    for (const statement of sql.split(";").map(value => value.trim()).filter(Boolean)) {
      await tx.$executeRawUnsafe(statement);
    }
  }, { timeout: 30000 });
  console.log("Stories & Reels tables ready.");
  console.log({ posts: await prisma.theatrePost.count(), assets: await prisma.theatrePostAsset.count() });
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());

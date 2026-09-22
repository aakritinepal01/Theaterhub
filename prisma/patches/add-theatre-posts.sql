CREATE TABLE IF NOT EXISTS "TheatrePost" (
  "id" TEXT PRIMARY KEY,
  "theatreId" INTEGER NOT NULL REFERENCES "Theatre"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "kind" TEXT NOT NULL CHECK ("kind" IN ('STORY', 'REEL')),
  "caption" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "TheatrePost_theatreId_createdAt_idx" ON "TheatrePost"("theatreId", "createdAt");
CREATE INDEX IF NOT EXISTS "TheatrePost_kind_createdAt_idx" ON "TheatrePost"("kind", "createdAt");
CREATE TABLE IF NOT EXISTS "TheatrePostAsset" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL REFERENCES "TheatrePost"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "url" TEXT NOT NULL,
  "mediaType" TEXT NOT NULL CHECK ("mediaType" IN ('image', 'video')),
  "publicId" TEXT,
  "position" INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS "TheatrePostAsset_postId_position_idx" ON "TheatrePostAsset"("postId", "position");

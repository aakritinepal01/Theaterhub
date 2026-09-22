-- Add the status already declared in schema.prisma without changing existing data.
ALTER TYPE "ContentStatus" ADD VALUE IF NOT EXISTS 'UPCOMING';

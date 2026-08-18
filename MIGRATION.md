# TheatreHub Next.js migration

The application uses the Next.js App Router, TypeScript, Tailwind CSS, Prisma, and PostgreSQL. Public pages and backend route handlers run in the same `next dev` process. The retired Python/Django source has been removed after conversion.

Application code is organized under `src/app`, `src/components`, and `src/lib`. Database and import tooling remain at the project root under `prisma` and `scripts`.

## Local setup

1. Install Node.js 20 or newer and PostgreSQL.
2. Copy `.env.example` to `.env` and set `DATABASE_URL` and `AUTH_SECRET`.
3. Create the empty PostgreSQL database referenced by `DATABASE_URL`.
4. Run:

   ```bash
   npm install
   npm run db:generate
   npm run db:push
   npm run import:legacy
   npm run dev
   ```

The importer reads `backup.zip`, loads `backup/online_data.json`, preserves legacy IDs and relationships, and restores original media to `public/uploads`. It intentionally skips Mezzanine thumbnails because browsers can use the source images directly.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

`backup.zip` is retained only as the production data and uploaded-media source for the TypeScript importer. Python is not used by the application or import process.

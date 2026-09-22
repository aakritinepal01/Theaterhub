// Exercise the route with an isolated transaction; never writes to the real database.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { Prisma } = require('@prisma/client');

async function run(fields, { failCredits = false, authorized = true } = {}) {
  let saved = null;
  const invalidations = [];
  const prisma = {
    theatre: { findUnique: async () => ({ id: 7, siteId: 1 }) },
    $transaction: async callback => {
      const staged = { profiles: [], makers: [], cast: [], crew: [] };
      const aggregate = async () => ({ _max: { id: 0 } });
      const tx = {
        play: { aggregate, create: async ({ data }) => { staged.play = data; } },
        theatre: { update: async () => {} },
        profile: {
          aggregate,
          findMany: async () => staged.profiles,
          createMany: async ({ data }) => { staged.profiles.push(...data); },
        },
      };
      for (const [model, key] of [['playMaker', 'makers'], ['playCast', 'cast'], ['playCrew', 'crew']]) {
        tx[model] = { aggregate, createMany: async ({ data }) => {
          if (failCredits) throw new Error('Simulated credits failure');
          staged[key].push(...data);
        } };
      }
      const result = await callback(tx);
      saved = staged;
      return result;
    },
  };
  const exports = {};
  const imports = {
    '@prisma/client': { Prisma },
    'next/cache': { revalidatePath: path => invalidations.push(path) },
    'next/server': { NextResponse: Response },
    '@/lib/prisma': { prisma },
    '@/lib/auth': { requireTheatreUser: async () => {
      if (!authorized) throw new Error('UNAUTHORIZED');
      return { id: 11 };
    } },
  };
  const source = ts.transpileModule(fs.readFileSync('src/app/api/theatre/plays/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(source, { exports, require: name => {
    assert.ok(name in imports, `Unexpected dependency ${name}`);
    return imports[name];
  }, Response, Error, console: { error() {} } });
  const data = new FormData();
  for (const [key, value] of fields) data.append(key, value);
  const response = await exports.POST(new Request('http://localhost/api/theatre/plays', { method: 'POST', body: data }));
  return { response, saved, invalidations };
}

(async () => {
  const fields = [['title', 'Test play'], ['status', 'UPCOMING'], ['director', 'Alex'], ['onStage', 'Sam'], ['onStage', 'sam'], ['offStage', 'Jo']];
  const result = await run(fields);
  assert.equal(result.response.status, 200);
  assert.equal(result.saved.play.status, 'UPCOMING');
  assert.equal(result.saved.play.theatreId, 7);
  assert.equal(result.saved.play.isFeatured, false);
  for (const kind of ['makers', 'cast', 'crew']) assert.equal(result.saved[kind].length, 1);
  assert.ok(result.invalidations.includes('/theatre-dashboard/productions'));
  const rollback = await run(fields, { failCredits: true });
  assert.equal(rollback.response.status, 500);
  assert.equal(rollback.saved, null);
  assert.equal((await run(fields, { authorized: false })).response.status, 401);
  assert.equal((await run([['title', 'Invalid'], ['duration', '-1']])).response.status, 400);
  for (const status of ['DRAFT', 'PUBLISHED']) {
    const other = await run([['title', 'Test'], ['status', status], ['isFeatured', 'on']]);
    assert.equal(other.saved.play.status, status);
    assert.equal(other.saved.play.isFeatured, true);
  }
  console.log('PASS: statuses, ownership, credits, deduplication, transaction rollback, authentication, validation, homepage toggle');
})().catch(error => { console.error(error); process.exitCode = 1; });

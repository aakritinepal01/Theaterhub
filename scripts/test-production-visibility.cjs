const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsForTest = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/production-visibility.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: exportsForTest, Date, Intl });
const { kathmanduToday, upcomingPlayWhere, releasedPlayWhere, playingNowWhere, publicPlayWhere, isPlayingNow } = exportsForTest;

// Evaluate the subset of Prisma filters used by these predicates against fixtures.
function matches(row, where) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'AND') return value.every(item => matches(row, item));
    if (key === 'OR') return value.some(item => matches(row, item));
    if (key === 'NOT') return !matches(row, value);
    if (value === null || typeof value !== 'object') return row[key] === value;
    if ('some' in value) return row[key].some(item => matches(item, value.some));
    return Object.entries(value).every(([operator, boundary]) => {
      if (row[key] === null) return false;
      if (operator === 'lte') return row[key] <= boundary;
      if (operator === 'gte') return row[key] >= boundary;
      if (operator === 'gt') return row[key] > boundary;
      throw new Error(`Unhandled operator ${operator}`);
    });
  });
}

const production = {
  status: 'UPCOMING', launchedOn: new Date('2026-09-18T00:00:00Z'),
  endedOn: new Date('2026-09-20T00:00:00Z'), publishDate: null, expiryDate: null, shows: [],
};
const before = new Date('2026-09-17T18:14:59Z'); // 23:59:59 in Nepal
const release = new Date('2026-09-17T18:15:00Z'); // midnight in Nepal
assert.equal(kathmanduToday(before).toISOString(), '2026-09-17T00:00:00.000Z');
assert.equal(kathmanduToday(release).toISOString(), '2026-09-18T00:00:00.000Z');
assert.equal(matches(production, upcomingPlayWhere(before)), true);
assert.equal(matches(production, releasedPlayWhere(before)), false);
assert.equal(matches(production, playingNowWhere(before)), false);
assert.equal(matches(production, publicPlayWhere(before)), true); // upcoming detail link works
assert.equal(matches(production, upcomingPlayWhere(release)), false);
assert.equal(matches(production, playingNowWhere(release)), true); // no schedule required
assert.equal(isPlayingNow(production, release), true);
assert.equal(matches(production, playingNowWhere(new Date('2026-09-20T18:14:59Z'))), true);
assert.equal(matches(production, playingNowWhere(new Date('2026-09-20T18:15:00Z'))), false);
assert.equal(matches(production, releasedPlayWhere(new Date('2026-09-20T18:15:00Z'))), true); // stays eligible for Featured and Plays archive
assert.equal(matches(production, upcomingPlayWhere(new Date('2026-09-20T18:15:00Z'))), false);
assert.equal(matches(production, publicPlayWhere(new Date('2026-09-20T18:15:00Z'))), true); // detail page remains available
assert.equal(matches({ ...production, launchedOn: null }, upcomingPlayWhere(release)), true);
assert.equal(matches({ ...production, launchedOn: null }, releasedPlayWhere(release)), false);
assert.equal(matches({ ...production, status: 'DRAFT' }, publicPlayWhere(release)), false);
assert.equal(matches({ ...production, status: 'PUBLISHED' }, upcomingPlayWhere(before)), false);
assert.equal(matches({ ...production, publishDate: new Date('2026-10-01') }, releasedPlayWhere(release)), false);
assert.equal(matches({ ...production, expiryDate: release }, releasedPlayWhere(release)), false);
console.log('PASS: Nepal midnight transition, upcoming-only before release, released without schedules, closing date, missing dates, drafts and publication windows');

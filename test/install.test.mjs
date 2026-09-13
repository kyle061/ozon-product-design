import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cli = join(root, 'bin', 'cli.mjs');
const name = 'ozon-product-design';
function run(...args) { return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' }); }
async function sandbox(t) {
  const dir = await mkdtemp(join(tmpdir(), 'ozon install test '));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test('fresh install preserves all skill resources and excludes package tooling', async t => {
  const dir = await sandbox(t);
  const result = run('install', '--codex-home', dir);
  assert.equal(result.status, 0, result.stderr);
  const target = join(dir, 'skills', name);
  assert.deepEqual((await readdir(target)).sort(), ['SKILL.md', 'agents', 'references']);
  for (const file of ['SKILL.md', 'agents/openai.yaml', 'references/platform-and-export.md', 'references/layout-and-copy.md', 'references/prompts.md']) {
    assert.deepEqual(await readFile(join(target, file)), await readFile(join(root, file)));
  }
});

test('existing custom skill is unchanged without force; force creates a complete backup', async t => {
  const dir = await sandbox(t);
  const target = join(dir, 'skills', name);
  await mkdir(target, { recursive: true });
  await writeFile(join(target, 'custom.txt'), 'user customization');
  assert.equal(run('install', '--codex-home', dir).status, 1);
  assert.equal(await readFile(join(target, 'custom.txt'), 'utf8'), 'user customization');
  const update = run('install', '--codex-home', dir, '--force');
  assert.equal(update.status, 0, update.stderr);
  const backups = await readdir(join(dir, 'skill-backups'));
  assert.equal(backups.length, 1);
  assert.equal(await readFile(join(dir, 'skill-backups', backups[0], name, 'custom.txt'), 'utf8'), 'user customization');
  assert.deepEqual(await readdir(join(dir, 'skills')), [name]);
  assert.equal((await readdir(target)).includes('custom.txt'), false);
});

test('dry run and path do not create a target; malformed options fail', async t => {
  const dir = await sandbox(t);
  const destination = join(dir, 'not yet created');
  assert.equal(run('install', '--codex-home', destination, '--dry-run').status, 0);
  const result = run('path', '--codex-home', destination);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), join(destination, 'skills', name));
  assert.deepEqual(await readdir(dir), []);
  assert.equal(run('install', '--codex-home').status, 1);
  assert.equal(run('install', '--typo').status, 1);
});

test('symlink target is not replaced even with force', async t => {
  const dir = await sandbox(t);
  const source = join(dir, 'external');
  await mkdir(source);
  await writeFile(join(source, 'keep.txt'), 'preserve');
  await mkdir(join(dir, 'skills'));
  await symlink(source, join(dir, 'skills', name), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(run('install', '--codex-home', dir, '--force').status, 1);
  assert.equal(await readFile(join(source, 'keep.txt'), 'utf8'), 'preserve');
});

test('installer lock prevents a conflicting invocation from writing files', async t => {
  const dir = await sandbox(t);
  await mkdir(join(dir, 'skills', `.${name}.install-lock`), { recursive: true });
  assert.equal(run('install', '--codex-home', dir).status, 1);
  assert.deepEqual(await readdir(join(dir, 'skills')), [`.${name}.install-lock`]);
});

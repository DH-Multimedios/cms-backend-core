import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));

test('build recreates ESM output after emitted files are removed', async () => {
  const scratchRoot = join(root, 'test-app/node_modules');
  await mkdir(scratchRoot, { recursive: true });
  const fixture = await mkdtemp(join(scratchRoot, '.esm-build-output-'));

  try {
    const output = join(fixture, 'dist');
    const build = () => spawnSync(
      join(root, 'node_modules/.bin/tsc'),
      ['--project', join(root, 'tsconfig.build.json'), '--outDir', output],
      { cwd: root, encoding: 'utf8' },
    );
    const first = build();
    assert.equal(first.status, 0, `${first.stdout}\n${first.stderr}`);
    assert.equal(first.stdout, '');
    assert.equal(first.stderr, '');
    const entry = join(output, 'index.js');
    const renderer = join(output, 'modules/notifications/template-renderer.service.js');
    const expectedEntry = await readFile(entry, 'utf8');
    const expectedRenderer = await readFile(renderer, 'utf8');

    await rm(entry);
    await rm(renderer);
    const second = build();
    assert.equal(second.status, 0, `${second.stdout}\n${second.stderr}`);
    assert.equal(second.stdout, '');
    assert.equal(second.stderr, '');
    assert.equal(await readFile(entry, 'utf8'), expectedEntry);
    assert.equal(await readFile(renderer, 'utf8'), expectedRenderer);
  } finally {
    await rm(fixture, { recursive: true, force: true });
  }
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

test('published entry is a native ESM-only v2 package with usable core exports', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  assert.equal(manifest.version, '2.0.0');
  assert.equal(manifest.type, 'module');

  const core = await import(pathToFileURL(resolve(root, manifest.main)).href);
  assert.equal(typeof core.CoreModule, 'function');
  assert.equal(typeof core.runCoreSeeds, 'function');
  assert.ok(Array.isArray(core.CORE_ENTITIES));
  assert.equal(Object.hasOwn(core, 'default'), false);
});

test('native ESM preserves notification template rendering', async () => {
  const { TemplateRendererService } = await import(
    pathToFileURL(resolve(root, 'dist/modules/notifications/template-renderer.service.js')).href
  );
  const renderer = new TemplateRendererService();
  assert.equal(renderer.render('Hello {{name}}', { name: 'Ada' }), 'Hello Ada');
  assert.equal(renderer.render('{{value}}', { value: '<b>' }), '&lt;b&gt;');
});

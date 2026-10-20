import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('client setup verifies sessions in a browser without cookie jars', async () => {
  const setup = await readFile(new URL('../docs/backend-client/00-setup.md', import.meta.url), 'utf8');
  assert.equal(setup.match(/\bcurl\b|cookie[- ]jar|\.cookies\.txt/i)?.[0], undefined);

  const session = setup.split('## 9.')[1]?.split('## 10.')[0];
  assert.ok(session, 'session verification section must exist');
  assert.match(session, /mismo navegador/);
  assert.match(session, /POST \/api\/auth\/login/);
  assert.match(session, /GET \/api\/auth\/me/);
  assert.match(session, /HttpOnly/);
});

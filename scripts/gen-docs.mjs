// Erzeugt docs/KATALOGABDECKUNG.md und docs/BILDZUORDNUNG.md aus dem echten Katalog.
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['vitest', 'run', 'tests/docs.test.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, WRITE_DOCS: '1' },
});
process.exit(r.status ?? 1);

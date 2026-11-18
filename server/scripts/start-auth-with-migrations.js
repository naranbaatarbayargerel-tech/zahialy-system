const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Run migrations before accepting requests. Both scripts are copied into
// the auth image by its Dockerfile; no shell command parsing is required.
const migration = spawnSync(process.execPath, [
  path.join(__dirname, 'apply-migrations-with-pg.js'),
], { stdio: 'inherit', env: process.env });

if (migration.error || migration.status !== 0) {
  console.error('Database migration failed; auth service was not started.');
  if (migration.error) console.error(migration.error.message);
  process.exit(migration.status || 1);
}

require('../src/server.js');

import { readdirSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const popup = 'electron/reminder-popup.test.cjs';
function findTests(directory) {
  return readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(entry => {
    const file = `${directory}/${entry.name}`;
    return entry.isDirectory() ? findTests(file) : /\.test\.(mjs|cjs|ts)$/.test(file) && file !== popup ? [file] : [];
  });
}
const unit = spawnSync(process.execPath, ['--test', ...findTests('src'), ...findTests('electron')], { cwd: root, stdio: 'inherit' });
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const userData = path.join(root, '.cache', 'reminder-test');
mkdirSync(userData, { recursive: true });
const electron = createRequire(import.meta.url)('electron');
const integration = spawnSync(electron, [popup, `--user-data-dir=${userData}`], { cwd: root, env, stdio: 'inherit' });
if (unit.error) console.error(unit.error);
if (integration.error) console.error(integration.error);
if (integration.status !== 0) console.error('Electron popup test failed. Inspect runtime/environment errors separately from assertion failures.');
process.exitCode = unit.status === 0 && integration.status === 0 ? 0 : 1;

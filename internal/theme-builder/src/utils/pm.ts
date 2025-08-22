import { spawn } from 'node:child_process';
import fs from 'node:fs';

export function detectPM(): string {
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (fs.existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}

export function run(cmd: string, args: string[]) {
  console.log(`[jerry-theme] Running: ${cmd} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' });
    p.once('error', (err) => reject(err));
    p.once('exit', (code) =>
      code === 0 ? resolve(code) : reject(new Error(`${cmd} ${args.join(',')} failed (${code})`)),
    );
  });
}

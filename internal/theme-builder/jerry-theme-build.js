#!/usr/bin/env node
// @ts-check
import themeBuild from './src/index.js';

// ✅ 전역 에러 핸들링
process.on('unhandledRejection', (err) => {
  throw err;
});
process.on('SIGINT', () => process.exit(0)); // Ctrl + C
process.on('SIGTERM', () => process.exit(0)); // kill 명령 등

await themeBuild();

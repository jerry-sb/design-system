import vitestPlugin from '@vitest/eslint-plugin';

import { baseConfigs } from './index.js';

/* ───────────────────────── Vite ─────────────────────────
 * - Vite/도구 설정 파일은 Node 런타임 가정
 * - Vitest 테스트 파일 전역(globals) 및 테스트 전용 룰
 */

/** 빌드/도구 설정 파일(노드 런타임 가정) */
const toolConfigFiles = [
  'vite.config.*',
  'vitest.config.*',
  'eslint.config.*',
  'tailwind.config.*',
  'postcss.config.*',
  'tsup.config.*',
  'rollup.config.*',
  'babel.config.*',
];
/** 테스트 파일 패턴(Vitest 기준) */
const testFiles = ['**/*.{test,spec}.{js,jsx,ts,tsx}'];
/**
 * @type {(args?: { project?: string; rootDir?: string }) => import('eslint').Linter.Config[]}
 */
const viteConfigs = (args) => [
  ...baseConfigs(args),
  // 도구 설정 파일(노드 런타임)
  {
    files: toolConfigFiles,
    // Node 런타임 가정. 필요 시 engines.node에 맞춰 추가 규칙 켤 수 있음
    rules: {
      'n/file-extension-in-import': 'off', // Vite에서 확장자 생략 허용
      'n/no-missing-import': 'off', // TS path alias와 충돌 가능 → 필요 시만 켜기
    },
  },

  // Vitest 테스트 파일
  {
    files: testFiles,
    plugins: { vitest: vitestPlugin },
    languageOptions: {
      globals: {
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'vitest/no-focused-tests': 'error', // fdescribe/fit 금지
      'vitest/no-identical-title': 'warn',
      'vitest/expect-expect': 'warn',
      'vitest/no-disabled-tests': 'warn',
    },
  },
];

export default viteConfigs;

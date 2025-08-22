import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierRecommended from 'eslint-config-prettier';
import nPlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/** 공통 무시 경로 */
const commonIgnores = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/.turbo/**',
  '**/coverage/**',
  '**/.storybook/**',
  '**/.vitest-cache/**',
  'eslint.config.js',
  'eslint.config.mjs',
];
/** 코드 파일 패턴(프로젝트 전역) */
const allCodeFiles = ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'];

/* ───────────────────────── Base (공통) ─────────────────────────
 * - JS/TS 공통 베이스
 * - import 정렬 + 미사용 import 제거
 * - Node/Promise 베스트프랙티스
 */

/**
 * @type {(args?: { project?: string; rootDir?: string }) => import('eslint').Linter.Config[]}
 */
function baseConfigs({ project = './tsconfig.json', rootDir = __dirname } = {}) {
  return [
    /* 무시 경로 */
    { ignores: commonIgnores },

    /* 모든 코드 파일 공통 규칙 */
    {
      files: allCodeFiles,
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      plugins: {
        // ✅ import 정렬(자동 정렬 fix 지원)
        'simple-import-sort': simpleImportSort,
        // ✅ 미사용 import 자동 제거 / 변수 경고
        'unused-imports': unusedImports,
        // ✅ Node.js 베스트프랙티스 (deprecated API, 누락된 import 등)
        n: nPlugin,
        // ✅ Promise 사용 시 실수 방지
        promise: promisePlugin,
      },
      rules: {
        /* === import 정렬 & 미사용 정리 === */
        'simple-import-sort/imports': 'warn', // import 순서 자동 정렬
        'simple-import-sort/exports': 'warn', // export 정렬
        'unused-imports/no-unused-imports': 'warn', // 쓰지 않는 import 제거
        'unused-imports/no-unused-vars': [
          'warn',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],

        /* === 일반 Best Practice === */
        'no-var': 'warn', // var 대신 let/const
        'prefer-const': ['warn', { destructuring: 'all' }], // 재할당 없으면 const
        eqeqeq: ['warn', 'smart'], // == 대신 === (null 비교 등 예외 허용)
        curly: ['warn', 'multi-line'], // 블록 중괄호 권장
        'object-shorthand': 'warn', // 객체 축약 표기
        'prefer-template': 'warn', // 문자열 연결 대신 템플릿 리터럴
        'dot-notation': 'warn', // 가능한 점 표기법 사용
        'no-console': ['warn', { allow: ['warn', 'error'] }], // log는 경고, warn/error 허용
        'no-debugger': 'warn',

        /* === Node 관련 === */
        'n/no-new-require': 'warn', // require를 new와 함께 쓰지 않기
        'n/prefer-global/buffer': 'warn', // 글로벌 Buffer 권장
        // 'n/no-deprecated-api': 'warn',         // Node deprecated API 사용 경고(원하면 켜기)
        // 'n/no-missing-import': 'warn',         // 외부 모듈 누락 감지(경우에 따라 alias와 충돌)

        /* === Promise 관련 === */
        'promise/no-return-wrap': 'warn', // Promise.resolve 안에 또 Promise 감싸지 않기
        'promise/param-names': 'warn', // new Promise((resolve, reject)) 인자명 일관성
        'promise/no-multiple-resolved': 'warn', // 동일 Promise를 여러 번 resolve/reject 방지
        'promise/no-nesting': 'off', // 상황 따라 허용(체인 내 중첩)

        /* === 줄 간격 === */
        'padding-line-between-statements': [
          'warn',
          { blankLine: 'always', prev: ['function', 'class'], next: '*' },
          {
            blankLine: 'always',
            prev: ['const', 'let', 'var'],
            next: ['function', 'class'],
          },
          {
            blankLine: 'never',
            prev: ['const', 'let', 'var'],
            next: ['const', 'let', 'var'],
          },
        ],
      },
    },

    /* TS 전용 블록: 파서/플러그인 및 TS 규칙 */
    {
      files: ['**/*.{ts,tsx,mts,cts}'],
      languageOptions: {
        parser: tsParser, // ✅ TS 문법 파싱
        parserOptions: {
          ...(project ? { project, tsconfigRootDir: rootDir } : {}),
          sourceType: 'module',
          ecmaVersion: 'latest',
        },
      },
      plugins: {
        '@typescript-eslint': tsPlugin,
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            args: 'after-used',
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/no-misused-promises': [
          'warn',
          { checksVoidReturn: { attributes: false } }, // onClick 등에 과도한 경고 방지
        ],

        /* JS 룰과 충돌 방지(오탐 방지) */
        'no-undef': 'off', // TS 타입 심벌 때문에 오탐 → 끄는 게 일반적
        'no-shadow': 'off',
        'no-unused-vars': 'off',
      },
    },
    prettierRecommended,
  ];
}

export default baseConfigs;

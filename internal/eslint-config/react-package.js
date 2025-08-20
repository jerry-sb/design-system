import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import { baseConfigs } from './index.js';

/* ───────────────────────── React Package ─────────────────────────
 * - React + TS 라이브러리(패키지)용
 * - Hooks/a11y 규칙 포함
 */

/**
 * @type {(args?: { project?: string; rootDir?: string }) => import('eslint').Linter.Config[]}
 */
const reactPackageConfigs = (args) => [
  ...baseConfigs(args),

  // React 파일 전용
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
    },
    settings: {
      react: { version: 'detect' }, // 설치된 React 버전 자동 탐지
    },
    rules: {
      /* React */
      'react/self-closing-comp': 'warn', // 내용 없는 태그는 self-closing
      'react/jsx-key': 'warn', // 리스트 key 누락 방지
      'react/no-array-index-key': 'warn', // index key 지양
      'react/no-danger': 'warn', // dangerouslySetInnerHTML 지양

      /* Hooks */
      'react-hooks/rules-of-hooks': 'error', // Hook은 최상위에서만
      'react-hooks/exhaustive-deps': 'warn', // deps 누락 경고

      /* 접근성(a11y) */
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',

      /* New JSX Transform */
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
    },
  },

  // React + TS 결합 시 추가 선호
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off', // UI 핸들러에서 과도한 경고 방지
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 라이브러리 성격에 따라 ON
    },
  },
];

export default reactPackageConfigs;

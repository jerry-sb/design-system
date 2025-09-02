import baseConfigs from '@jerryshim/eslint-config';

export default [
  ...baseConfigs(),
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error', 'info', 'time', 'timeEnd'] }],
    },
  },
];

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const expo = require('eslint-config-expo/flat');

export default [
  ...expo,
  { ignores: ['dist/**', '.expo/**', 'uniwind-types.d.ts'] },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    languageOptions: {
      globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly' },
    },
  },
];

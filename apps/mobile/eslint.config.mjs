import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const expo = require('eslint-config-expo/flat');

export default [
  ...expo,
  { ignores: ['dist/**', 'coverage/**', '.expo/**', 'android/**', 'ios/**', 'uniwind-types.d.ts'] },
  {
    files: ['src/**/*.tsx'],
    rules: {
      // Retain Obytes' conventions for memo components and TanStack render props.
      'react/display-name': 'off',
      'react/no-children-prop': 'off',
    },
  },
  {
    files: ['src/components/ui/modal.tsx', 'src/components/ui/select.tsx'],
    // useModal returns a ref and stable callbacks; accessing those is valid.
    rules: { 'react-hooks/refs': 'off' },
  },
  {
    files: ['**/*.test.tsx', 'jest-setup.ts'],
    languageOptions: {
      globals: { jest: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', afterEach: 'readonly' },
    },
  },
];

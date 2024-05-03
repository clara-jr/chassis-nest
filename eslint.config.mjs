import globals from 'globals';
import js from '@eslint/js';
import jsonformat from 'eslint-plugin-json-format';
import prettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';
import tsparser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier.configs.recommended, // Recommended config applied to all files
  // Override the recommended config
  {
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
      parser: tsparser,
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
      },
    },
    ignores: [
      'package-lock.json',
      'coverage/',
      'node_modules/',
      'dist/',
      'tsconfig.json',
      '*.md',
    ],
    plugins: {
      'json-format': jsonformat,
    },
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'space-in-parens': ['error', 'never'],
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

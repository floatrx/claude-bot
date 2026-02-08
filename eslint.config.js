import js from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

export default tsEslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tsEslint.configs.recommended],
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      /**
       * Enforce a convention in the order of import statements
       * @see https://github.com/lydell/eslint-plugin-simple-import-sort
       */
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^node:.*\\u0000$', '^@?\\w.*\\u0000$', '^[^.].*\\u0000$', '^\\..*\\u0000$'], // types
            ['^\\u0000'],
            ['^'], // side effect imports
            ['^@'], // alias
            ['^\\.'], // sibling
          ],
        },
      ],

      /**
       * Disallow unused variables and arguments
       * except for those that start with an underscore
       */
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_|^e',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);

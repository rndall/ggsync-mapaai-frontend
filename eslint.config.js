//  @ts-check
import { tanstackConfig } from '@tanstack/eslint-config'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default [
  ...pluginQuery.configs['flat/recommended-strict'],
  ...pluginRouter.configs['flat/recommended'],
  ...tanstackConfig,
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',

      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
    },
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
]

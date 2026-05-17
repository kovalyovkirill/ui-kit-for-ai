/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,

  env: {
    browser: true,
    es2020: true,
  },

  extends: [
    // ── Core ──────────────────────────────────────────────────────────────────
    'eslint:recommended',

    // ── TypeScript ────────────────────────────────────────────────────────────
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',

    // ── React ─────────────────────────────────────────────────────────────────
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',   // enables new JSX transform (no React import needed)
    'plugin:react-hooks/recommended',

    // ── Accessibility ─────────────────────────────────────────────────────────
    'plugin:jsx-a11y/recommended',

    // ── Imports ───────────────────────────────────────────────────────────────
    'plugin:import/recommended',

    // ── Must be last — disables ESLint rules that conflict with Prettier ──────
    'prettier',
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // __dirname pins tsconfig resolution to the package root regardless of
    // where ESLint is invoked (e.g. monorepo root during a git hook)
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json', './tsconfig.node.json'],
  },

  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'import'],

  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      node: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },
    },
  },

  // Opt in dot-directories and config files that ESLint ignores by default
  overrides: [
    {
      files: ['.storybook/**/*.ts', '.storybook/**/*.tsx', 'vite.config.ts'],
      // These files are Node/build-time — relax browser-only rules
      env: { node: true, browser: false },
    },
  ],

  rules: {
    // ── React ─────────────────────────────────────────────────────────────────
    'react/prop-types': 'off',                 // TypeScript covers prop validation
    'react/display-name': 'warn',

    // ── TypeScript ────────────────────────────────────────────────────────────
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',

    // ── Imports ───────────────────────────────────────────────────────────────
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-duplicates': 'error',
    'import/no-cycle': 'warn',
    'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
    // TypeScript's own compiler checks module resolution; node resolver gives false-positives
    'import/no-unresolved': 'off',
    // False-positive on packages with dual CJS/ESM exports (e.g. clsx)
    'import/no-named-as-default': 'off',

    // ── General best practices ────────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'prefer-const': 'error',
  },
}

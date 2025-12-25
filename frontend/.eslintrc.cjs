module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh', '@typescript-eslint', 'react', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      },
    },
  },
  rules: {
    // Complexity rules
    'max-depth': ['error', 4],
    complexity: ['error', 15],
    'max-lines-per-function': [
      'warn',
      {
        max: 400,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    // React specific rules
    'react-refresh/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
      },
    ],
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed in React 18+
    'react/no-array-index-key': 'error',
    'react/no-unescaped-entities': 'off', // Allow natural text with apostrophes
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',

    // General rules
    'no-console': [
      'error',
      {
        allow: ['warn', 'info', 'error'],
      },
    ],
    'prefer-const': 'error',
    'no-var': 'error',
    'import/order': [
      'error',
      {
        groups: ['object', 'external', 'internal', 'parent', 'sibling', 'index', 'unknown', 'type'],
        pathGroups: [
          {
            pattern: '{.,..}/*.scss',
            group: 'object',
            position: 'before',
          },
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: 'types',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'config',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'assets',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'styles',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'utils',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'hooks',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'guards',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'store',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'services',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'routes',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'components',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: 'pages',
            group: 'internal',
            position: 'after',
          },
        ],

        pathGroupsExcludedImportTypes: ['react'],

        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },

        warnOnUnassignedImports: true,
        'newlines-between': 'always',
      },
    ],
  },
};

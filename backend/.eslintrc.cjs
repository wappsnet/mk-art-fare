module.exports = {
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'prettier', // Must be last to override other configs
  ],
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    // Complexity rules
    'max-depth': ['error', 4],
    complexity: ['error', 10],
    'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
  ignorePatterns: ['dist', 'node_modules'],
};

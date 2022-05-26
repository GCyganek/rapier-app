module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    extraFileExtensions: ['.svelte'],
  },
  plugins: ['svelte3', '@typescript-eslint/eslint-plugin'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    // 'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    es6: true,
    browser: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-namespace': 'off',
  },
  settings: {
    'svelte3/typescript': () => require('typescript'),
  },
};

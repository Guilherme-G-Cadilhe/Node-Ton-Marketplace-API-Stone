const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = [
  {
    ignores: ['.build/', 'node_modules/', 'coverage/', 'dist/'],
  },

  ...tseslint.configs.recommended,
  prettierConfig,

  // Customizações do projeto
  {
    files: ['src/**/*.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node, // Globais do Node.js (ex: 'process', 'require')
        ...globals.jest, // Globais do Jest (ex: 'describe', 'expect', 'jest')
      },
    },
    rules: {
      // Estamos desligando esta regra porque usamos '!' nos nossos testes
      // para garantir ao TypeScript que os mocks não são nulos.
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    files: ['eslint.config.js'], // Aplica-se somente a este arquivo
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
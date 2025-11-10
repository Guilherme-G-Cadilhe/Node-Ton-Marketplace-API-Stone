module.exports = {
  // O preset que diz ao Jest como lidar com arquivos TypeScript
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // O padrão de glob para encontrar nossos arquivos de teste
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/integration/**/*.test.ts',
  ],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        // Isso força o ts-jest a usar o CommonJS, que resolve o
        // problema de import dinâmico do AWS SDK v3
        tsconfig: {
          module: 'commonjs',
        },
      },
    ],
  },

  // Limpa mocks entre os testes
  clearMocks: true,
  // Ignora o diretório de build para evitar a 'naming collision'
  modulePathIgnorePatterns: ['<rootDir>/.build'],
};
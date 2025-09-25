const path = require('path');
module.exports = {
  moduleNameMapper: {
    '^@makrx/auth$': path.resolve(__dirname, '../../packages/auth/src'),
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '<rootDir>/lib/utils.spec.ts'],
};

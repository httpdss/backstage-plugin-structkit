module.exports = {
  preset: '@backstage/cli/config/jest',
  transform: {
    '^.+\\.tsx?$': ['@swc/jest', { jsc: { target: 'es2021' } }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};

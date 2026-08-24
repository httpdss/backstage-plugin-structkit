module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint')],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};

const path = require('path');

module.exports = (config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      '@app/common': path.resolve(__dirname, 'libs/common/src/index.ts'),
    },
  },
});

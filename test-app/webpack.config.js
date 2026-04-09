const path = require('path');

module.exports = (options) => ({
  ...options,
  resolve: {
    ...options.resolve,
    alias: {
      ...options.resolve?.alias,
      '@dh/backend-core': path.resolve(__dirname, '../src'),
    },
  },
});

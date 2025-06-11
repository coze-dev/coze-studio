const path = require('path');
if (process.env.NODE_ENV === 'development') {
  require('sucrase/register/ts');
  module.exports = require(path.resolve(__dirname, './src/index.ts'));
} else {
  module.exports = require(path.resolve(__dirname, './lib/index.js'));
}

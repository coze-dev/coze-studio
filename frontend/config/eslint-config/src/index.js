require('sucrase/register/ts');

const { defineConfig } = require('./define-config');

// node@16 no structuredClone method causes an error:
// ReferenceError: Error while loading rule '@typescript-eslint/naming-convention': structuredClone is not defined
// Make a simple polyfill here
if (typeof structuredClone === 'undefined') {
  global.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}

module.exports = { defineConfig };

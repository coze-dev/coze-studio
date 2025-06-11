require('sucrase/register/ts');

const { defineConfig } = require('./define-config');

// node@16 没有 structuredClone 方法导致报错：
// ReferenceError: Error while loading rule '@typescript-eslint/naming-convention': structuredClone is not defined
// 此处做个简单 polyfill
if (typeof structuredClone === 'undefined') {
  global.structuredClone = obj => JSON.parse(JSON.stringify(obj));
}

module.exports = { defineConfig };

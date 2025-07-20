const globals = require('globals');
const securityPlugin = require('eslint-plugin-security');

/** @type {(import('eslint').Linter.Config[])} */
module.exports = [
  ...require('./eslint.config.base.js'),
  securityPlugin.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        NodeJS: true,
      },
    },
    rules: {},
  },
];

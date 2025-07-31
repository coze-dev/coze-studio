// apps/logistics/api.config.js

const path = require('path');

const config = [
  {
    idlRoot: '../../../../opencoze', // IDL root directory
    entries: {
      passport: './idl/passport/passport.thrift', // Entry service name and path
      explore:
        './idl/flow/marketplace/flow_marketplace_product/public_api.thrift',
    },
    commonCodePath: path.resolve(__dirname, './src/api/config.ts'), // custom profile
    output: './src', // Product location
    plugins: [], // custom plugin
  },
];

module.exports = config;

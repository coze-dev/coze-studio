require('ts-node').register({
  transpileOnly: true,
  cwd: __dirname,
  options: {},
})

const { flowPreset } = require('./index.ts')
module.exports = flowPreset

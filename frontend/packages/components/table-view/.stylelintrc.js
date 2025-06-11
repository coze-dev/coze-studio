const { defineConfig } = require('@coze-arch/stylelint-config');

module.exports = defineConfig({
  extends: [],
  rules: {
    'rule-empty-line-before': null,
    'no-descending-specificity': null,
  },
});

module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-less',
    'stylelint-config-clean-order',
  ],
  plugins: ['./plugins/plugin-disallow-nesting-level-one-global.js'],
  rules: {
    // 变量命名规则，适应仓库内的代码风格
    'custom-property-pattern': '^([A-Za-z0-9]*)([-_]+[A-Za-z0-9]+)*$',
    // 对于less函数判断有问题
    'less/no-duplicate-variables': null,
    'media-feature-range-notation': null,
    'max-nesting-depth': [
      3,
      {
        ignore: ['pseudo-classes'],
        ignoreRules: ['/:global/'],
        message: 'Expected nesting depth to be no more than 3.',
      },
    ],
    'plugin/disallow-first-level-global': true,
    'selector-class-pattern': [
      '^([a-z][a-z0-9]*)(-[a-z0-9]+)*(_[a-z0-9]+)?$',
      {
        resolveNestedSelectors: true,
        message: 'Expected class pattern is $block-$element_$modifier.',
      },
    ],
    'declaration-no-important': true,
    'color-function-notation': null,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind'],
      },
    ],
  },
};

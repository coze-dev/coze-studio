const stylelint = require('stylelint');

const ruleName = 'plugin/disallow-first-level-global';

module.exports = stylelint.createPlugin(ruleName, function (ruleValue) {
  if (ruleValue === null || ruleValue === undefined || ruleValue === false) {
    return () => {
      // Nop.
    };
  }
  return function (postcssRoot, postcssResult) {
    postcssRoot.walkRules(rule => {
      if (rule.parent.type === 'root' && /:global/.test(rule.selector)) {
        stylelint.utils.report({
          ruleName,
          result: postcssResult,
          node: rule,
          message: 'Disallow :global class with nesting level of 1',
        });
      }
    });
  };
});

module.exports.ruleName = ruleName;
module.exports.messages = stylelint.utils.ruleMessages(ruleName, {
  expected: 'Disallow :global class with nesting level of 1',
});

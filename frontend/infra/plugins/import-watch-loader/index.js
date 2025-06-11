const defaultRuleOwner = 'wangfocheng';
const rules = [
  {
    regexp: /@tailwind utilities/,
    message: '引入了多余的 @tailwind utilities,请删除',
    owner: defaultRuleOwner,
  },
  {
    regexp: /@ies\/starling_intl/,
    message: '请使用@coze-arch/i18n代替直接引入@ies/starling_intl',
    owner: defaultRuleOwner,
  },
  {
    regexp: /\@coze-arch\/bot-env(?:['"]|(?:\/(?!runtime).*)?$)/,
    message:
      '请勿在web中引入@coze-arch/bot-env。GLOBAL_ENV已注入到页面中,直接使用变量即可(例: GLOBAL_ENVS.IS_BOE❌ IS_BOE✅)',
  },
];

module.exports = function (code, map) {
  try {
    rules.forEach(rule => {
      if (rule.regexp.test(code)) {
        throw Error(
          `${this.resourcePath}:${rule.message}。如有疑问请找${
            rule.owner || defaultRuleOwner
          }`,
        );
      }
    });
    this.callback(null, code, map);
  } catch (err) {
    this.callback(err, code, map);
    throw Error(err);
  }
};

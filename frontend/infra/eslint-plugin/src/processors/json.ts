const prefix = 'module.exports = ';

export const jsonParser = {
  _prefix: prefix,
  supportsAutofix: false,
  preprocess(text: string) {
    return [`${prefix}${text}`];
  },
  postprocess(messages /* , fileName */) {
    return messages.reduce((total, next) => {
      // disable js rules running on json files
      // this becomes too noisey, and splitting js and json
      // into separate overrides so neither inherit the other
      // is lame
      // revisit once https://github.com/eslint/rfcs/pull/9 lands
      // return total.concat(next);

      return total.concat(
        next.filter(error => error.ruleId?.startsWith('@coze-arch/')),
      );
    }, []);
  },
};

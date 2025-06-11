import { I18n } from '@coze-arch/i18n';
import { UIToast } from '@coze-arch/bot-semi';

export const hasBraces = (str: string) => {
  const pattern = /{{/g;
  return pattern.test(str);
};
// 判断是所有环境还是 只是release 环境限制{{}} 并弹出toast提示
export const verifyBracesAndToast = (str: string, isAll = false) => {
  if (isAll && hasBraces(str)) {
    UIToast.warning({
      showClose: false,
      content: I18n.t('bot_prompt_bracket_error'),
    });
    return false;
  }
  return true;
};

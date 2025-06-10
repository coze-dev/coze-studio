import { getFlags } from '@coze-arch/bot-flags';
/**
 * 校验是否可以封装
 * @returns 是否可以封装
 */
export function checkEncapsulateGray() {
  const FLAGS = getFlags();
  return !!FLAGS['bot.automation.encapsulate'];
}

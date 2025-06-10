import { type MessageExtraInfoBotState } from '../types';
import { safeJSONParse } from '../../utils/safe-json-parse';

// botState 中的成员都是 optional 保证形状为 {} 即可
const isBotState = (value: unknown): value is MessageExtraInfoBotState =>
  typeof value === 'object' && value !== null;

// todo 应该注释一下这个方法跟 stores/socket 下 getMessageBotStateFromStringifyObject 的区别
export const getBotState = (
  stringifyBotState?: string,
): MessageExtraInfoBotState => {
  const result = safeJSONParse(stringifyBotState);
  if (isBotState(result)) {
    return result;
  }
  return {};
};

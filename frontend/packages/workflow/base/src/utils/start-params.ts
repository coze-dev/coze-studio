import { BOT_USER_INPUT, CONVERSATION_NAME, USER_INPUT } from '../constants';
/**
 * 是否预设的开始节点的输入参数
 */
export const isPresetStartParams = (name?: string): boolean =>
  [BOT_USER_INPUT, USER_INPUT, CONVERSATION_NAME].includes(name ?? '');

/**
 * Start 节点参数是 BOT 聊天时用户的输入内容
 * @param name
 * @returns
 */
export const isUserInputStartParams = (name?: string): boolean =>
  [BOT_USER_INPUT, USER_INPUT].includes(name ?? '');

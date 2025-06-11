import { type Message } from '../store/types';

const functionCallTypes: Message['type'][] = [
  'function_call',
  // 部分 verbose 用于展示中间状态，类似 function_call
  'verbose',
  'tool_response',
  'knowledge',
];

export const getIsFunctionCallType = (type: Message['type']) =>
  functionCallTypes.includes(type);

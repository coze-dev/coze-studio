/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface ChatContext {
  /** 上下文携带的历史消息 */
  MessageContext: Array<Message>;
}

export interface Message {
  Role: string;
  Content: string;
}

export interface SearchItem {
  /** 本轮的query */
  Query: string;
}

export interface SearchResultItem {
  /** 事件文本 */
  Text: string;
  /** 时间戳 */
  EventMs?: Int64;
}
/* eslint-enable */

import {
  type ChatASRProps,
  type BreakMessageProps,
  type DeleteMessageProps,
  type GetHistoryMessageProps,
  type ReportMessageProps,
} from '../../../message/types/message-manager';

export type GetHistoryMessageParams = Omit<
  GetHistoryMessageProps,
  'conversation_id' | 'scene' | 'bot_id' | 'preset_bot' | 'draft_mode'
>;

export type DeleteMessageParams = Omit<
  DeleteMessageProps,
  'conversation_id' | 'bot_id'
>;

export type ReportMessageParams = Omit<
  ReportMessageProps,
  'biz_conversation_id' | 'bot_id' | 'scene'
>;

export type BreakMessageParams = Omit<BreakMessageProps, 'conversation_id'>;

export type ChatASRParams = ChatASRProps;

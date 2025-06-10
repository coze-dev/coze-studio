import type { ContentType, MessageType } from './constants';

export interface Option {
  name: string;
}

export interface OptionMessageContent {
  question: string;
  options: Array<Option>;
}

export interface ReceivedMessage {
  type: MessageType;
  content_type: ContentType;
  content: string;
  id: string;
  answered?: boolean;
}

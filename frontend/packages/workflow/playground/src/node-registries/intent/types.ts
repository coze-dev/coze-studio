import {
  type InputValueVO,
  type NodeDataDTO,
  type OutputValueVO,
} from '@coze-workflow/base';

export type IntentsType = { name?: string; id?: string }[];

export interface FormData {
  inputs: {
    inputParameters: InputValueVO[];
    chatHistorySetting: {
      enableChatHistory?: boolean;
      chatHistoryRound?: number;
    };
  };
  model: { [k: string]: unknown };
  intents: IntentsType;
  quickIntents: IntentsType;
  intentMode: string;
  systemPrompt: string;
  nodeMeta: NodeDataDTO['nodeMeta'];
  outputs: OutputValueVO[];
}

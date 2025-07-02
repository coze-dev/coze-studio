import { type BatchVO, type InputValueVO } from '@coze-workflow/base';

import type { IModelValue } from '@/typing';

export enum BatchMode {
  Single = 'single',
  Batch = 'batch',
}

export interface FormData {
  batchMode: BatchMode;
  visionParam?: InputValueVO[];
  model?: IModelValue;
  $$input_decorator$$: {
    inputParameters?: InputValueVO[];
    chatHistorySetting?: {
      enableChatHistory?: boolean;
      chatHistoryRound?: number;
    };
  };
  batch: BatchVO;
}

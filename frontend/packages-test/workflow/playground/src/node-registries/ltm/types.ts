import {
  type ViewVariableMeta,
  type InputValueVO,
  type InputValueDTO,
  type VariableMetaDTO,
} from '@coze-workflow/base';

import type { NodeMeta } from '@/typing';

export interface FormData {
  nodeMeta: NodeMeta;
  inputs: {
    inputParameters: InputValueVO[];
    historySetting: {
      enableChatHistory: boolean;
      chatHistoryRound: number;
    };
  };
  outputs: ViewVariableMeta[];
}

export interface DTOData<
  InputType = InputValueDTO,
  OutputType = VariableMetaDTO,
> {
  nodeMeta: NodeMeta;
  inputs: {
    inputParameters?: InputType[];
  };
  outputs: OutputType[];
}

export type DTODataWhenInit = DTOData<InputValueVO, ViewVariableMeta>;

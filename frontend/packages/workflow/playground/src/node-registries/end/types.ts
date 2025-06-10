import {
  type InputValueVO,
  type InputValueDTO,
  type ValueExpressionDTO,
  type NodeDataDTO as BaseNodeDataDTO,
} from '@coze-workflow/base';

export enum TerminatePlan {
  ReturnVariables = 'returnVariables',
  UseAnswerContent = 'useAnswerContent',
}

export type FormData = {
  inputs: {
    inputParameters: InputValueVO[];
    terminatePlan?: TerminatePlan;
    streamingOutput?: boolean;
    content?: string;
  };
} & Pick<BaseNodeDataDTO, 'nodeMeta'>;

export interface NodeDataDTO {
  inputs: {
    inputParameters?: InputValueDTO[];
    terminatePlan?: TerminatePlan;
    streamingOutput?: boolean;
    content?: ValueExpressionDTO;
  };
}

import {
  type InputValueVO,
  type InputValueDTO,
  type ValueExpressionDTO,
  type NodeDataDTO as BaseNodeDataDTO,
} from '@coze-workflow/base';

export type FormData = {
  inputs: {
    inputParameters: InputValueVO[];
    streamingOutput?: boolean;
    content?: string;
  };
} & Pick<BaseNodeDataDTO, 'nodeMeta'>;

export interface NodeDataDTO {
  inputs: {
    inputParameters?: InputValueDTO[];
    streamingOutput?: boolean;
    content?: ValueExpressionDTO;
  };
}

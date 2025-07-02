import {
  type ViewVariableMeta,
  type NodeDataDTO as BaseNodeDataDTO,
} from '@coze-workflow/base';
export type FormData = {
  outputs: ViewVariableMeta[];
} & Pick<BaseNodeDataDTO, 'nodeMeta'>;

export type NodeDataDTO = {
  inputs: {
    // 输出参数类型信息 JSON.stringify(VariableMetaDTO[])
    outputSchema: string;
  };
} & Pick<BaseNodeDataDTO, 'outputs' | 'nodeMeta'>;

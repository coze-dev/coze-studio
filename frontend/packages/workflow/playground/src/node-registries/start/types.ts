import { type TriggerForm } from '@coze-workflow/nodes';
import {
  type ViewVariableMeta,
  type VariableMetaDTO,
  type NodeDataDTO as BaseNodeDataDTO,
} from '@coze-workflow/base';
export type FormData = {
  outputs: Array<ViewVariableMeta & { isPreset?: boolean; enabled?: boolean }>;
  inputs?: {
    auto_save_history: boolean;
  };
  [TriggerForm.TabName]?: string;
} & Pick<BaseNodeDataDTO, 'nodeMeta'>;

export type NodeDataDTO = {
  trigger_parameters?: VariableMetaDTO[];
  inputs?: {
    auto_save_history: boolean;
  };
} & Pick<BaseNodeDataDTO, 'outputs' | 'nodeMeta'>;

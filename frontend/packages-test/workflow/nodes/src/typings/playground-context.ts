import { PlaygroundContext as PlaygroudContextOrigin } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowBatchService,
  type WorkflowVariableService,
  type WorkflowVariableValidationService,
} from '@coze-workflow/variable';
import { type StandardNodeType } from '@coze-workflow/base';

import { type WorkflowNodesService } from '../service';
import { type NodeTemplateInfo } from './node';

export const PlaygroundContext = PlaygroudContextOrigin;

export interface PlaygroundContext {
  readonly variableService: WorkflowVariableService;
  readonly batchService: WorkflowBatchService;
  readonly nodesService: WorkflowNodesService;
  readonly variableValidationService: WorkflowVariableValidationService;

  /**
   * 根据meta 类型获取信息
   * @param type
   */
  getNodeTemplateInfoByType: (
    type: StandardNodeType,
  ) => NodeTemplateInfo | undefined;
  /**
   * 是否为 不可编辑模式
   */
  disabled: boolean;
}

import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import type { WorkflowCustomDragService } from '@/services';
import type { WorkflowGlobalStateEntity } from '@/typing';

import type {
  WorkflowClipboardNodeJSON,
  WorkflowClipboardSource,
} from '../../type';
import {
  ApiNodeValidator,
  CrossSpaceNodeValidator,
  DropValidator,
  LoopContextValidator,
  NestedLoopBatchValidator,
  SameSpaceValidator,
  SameWorkflowValidator,
  SceneNodeValidator,
  SubWorkflowSelfRefValidator,
} from './validators';
import { ValidationChain } from './validators/validation-chain';

/** 是否合法节点 */
export const isValidNode = (params: {
  node: WorkflowClipboardNodeJSON;
  parent?: WorkflowNodeEntity;
  source: WorkflowClipboardSource;
  globalState: WorkflowGlobalStateEntity;
  dragService: WorkflowCustomDragService;
}): boolean => {
  const validationChain = new ValidationChain();
  validationChain
    // 1. 相同空间，相同工作流
    .setNext(new DropValidator())
    .setNext(new LoopContextValidator())
    .setNext(new NestedLoopBatchValidator())
    .setNext(new SubWorkflowSelfRefValidator())
    // 2. 相同空间，不同工作流
    .setNext(new SameWorkflowValidator())
    .setNext(new SceneNodeValidator())
    // 3. 跨空间空间
    .setNext(new SameSpaceValidator())
    .setNext(new ApiNodeValidator())
    .setNext(new CrossSpaceNodeValidator());

  return validationChain.run(params);
};

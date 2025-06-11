import { isObject } from 'lodash-es';

import { type WorkflowNode } from './type';

export const isWorkflowNodeData = (value: unknown): value is WorkflowNode =>
  isObject(value) && 'content' in value && 'content_type' in value;

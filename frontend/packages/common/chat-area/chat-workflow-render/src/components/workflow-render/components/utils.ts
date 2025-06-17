import { isObject } from 'lodash-es';

import { type InputWorkflowNodeContent, type WorkflowNode } from './type';

export const isWorkflowNodeData = (value: unknown): value is WorkflowNode =>
  isObject(value) && 'content' in value && 'content_type' in value;

export const isInputWorkflowNodeContent = (
  value: unknown,
): value is InputWorkflowNodeContent =>
  isObject(value) && 'type' in value && 'name' in value;

export const isInputWorkflowNodeContentLikelyArray = (
  value: unknown,
): value is unknown[] => Array.isArray(value);

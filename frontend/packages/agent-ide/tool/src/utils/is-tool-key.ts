import {
  type AbilityKey,
  type AbilityScope,
  type ToolKey,
} from '@coze-agent-ide/tool-config';

export const isToolKey = (_?: AbilityKey, scope?: AbilityScope): _ is ToolKey =>
  scope === 'tool';

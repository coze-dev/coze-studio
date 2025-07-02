import { describe, it, expect } from 'vitest';
import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';

import { isGeneralWorkflow } from '../../src/utils/is-general-workflow';

describe('is-general-workflow', () => {
  it('应该在 flowMode 为 Workflow 时返回 true', () => {
    expect(isGeneralWorkflow(WorkflowMode.Workflow)).toBe(true);
  });

  it('应该在 flowMode 为 ChatFlow 时返回 true', () => {
    expect(isGeneralWorkflow(WorkflowMode.ChatFlow)).toBe(true);
  });

  it('应该在 flowMode 为其他值时返回 false', () => {
    // 测试其他可能的 WorkflowMode 值
    expect(isGeneralWorkflow(WorkflowMode.Imageflow)).toBe(false);
  });
});

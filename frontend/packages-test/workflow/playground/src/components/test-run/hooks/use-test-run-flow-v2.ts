import { useCallback } from 'react';

import { WorkflowMode } from '@coze-workflow/base/api';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowRunService } from '@/services';
import { useValidateWorkflow } from '@/hooks/use-validate-workflow';
import { useFloatLayoutService, useSaveService } from '@/hooks';
import { LayoutPanelKey } from '@/constants';

import { useTestFormSchema } from './use-test-form-schema';
import { useGetStartNode } from './use-get-start-node';

export const useTestRunFlowV2 = () => {
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const floatLayoutService = useFloatLayoutService();
  const saveService = useSaveService();
  const { getNode } = useGetStartNode();

  const { validate } = useValidateWorkflow();
  const { generate } = useTestFormSchema();
  const validateFlow = useCallback(async () => {
    const hasError = await validate();
    if (hasError) {
      floatLayoutService.open('problemPanel', 'bottom');
    }
    return hasError;
  }, [validate, floatLayoutService]);

  const testRunFlow = useCallback(async () => {
    const node = getNode();
    if (!node) {
      return;
    }
    // 如果流程处于保存中，先等待保存完成
    await saveService.waitSaving();
    // 保存一次流程
    await saveService.save();
    // 清空运行结果
    runService.clearTestRun();
    if (runService.globalState.flowMode === WorkflowMode.ChatFlow) {
      // 如果是 chatflow 校验需要阻塞
      if (await validateFlow()) {
        return;
      }
      floatLayoutService.open(LayoutPanelKey.TestChatFlowForm, 'right', {
        node,
      });
      return;
    }
    // 表单可以先打开
    floatLayoutService.open(LayoutPanelKey.TestFlowForm, 'right', { node });
    // 如果校验有误就停止
    if (await validateFlow()) {
      return;
    }
    const schema = await generate();
    // 如果有表单项则停止
    if (schema?.fields.length) {
      return;
    }
    runService.testRun();
  }, [validateFlow, runService, floatLayoutService]);

  return { testRunFlow };
};

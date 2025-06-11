/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze/coze-design';

export function useNavigateWorkflowOrBlockwise({
  spaceID,
  onNavigate2Edit,
}: Record<string, any>) {
  const navigateToWorkflow = useCallback(
    (workflowId?: string) => {
      if (!workflowId || workflowId === '0') {
        // 表示是脏数据，提示一下并阻止点击事件
        Toast.warning({
          content: I18n.t('workflow_error_jump_tip'),
          showClose: false,
        });
        return;
      } else {
        onNavigate2Edit(workflowId);
      }
    },
    [spaceID],
  );

  return {
    navigateToWorkflow,
  };
}

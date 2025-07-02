import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { hasSystemNodes, isAllSystemNodes } from '../copy/is-system-nodes';

export const isValid = (nodes: WorkflowNodeEntity[]): boolean => {
  if (isAllSystemNodes(nodes)) {
    Toast.warning({
      content: I18n.t('workflow_multi_choice_delete_failed'),
      showClose: false,
    });
    return false;
  } else if (hasSystemNodes(nodes)) {
    Toast.warning({
      content: I18n.t('workflow_multi_choice_delete_failed'),
      showClose: false,
    });
    return true;
  }
  return true;
};

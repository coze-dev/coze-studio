import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze/coze-design';
import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { isAllSystemNodes } from './is-system-nodes';
import { getValidNodes } from './get-valid-nodes';

export const isValid = (nodes: WorkflowNodeEntity[]): boolean => {
  if (isAllSystemNodes(nodes)) {
    Toast.warning({
      content: I18n.t('workflow_multi_choice_copy_failed'),
      showClose: false,
    });
    return false;
  }
  const validNodes = getValidNodes(nodes);
  const nodeCount = validNodes.length;
  if (nodeCount === 0) {
    return false;
  }
  return true;
};

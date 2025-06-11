import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

export const IMAGE_REFERENCE_NODE_REGISTRY: WorkflowNodeRegistry = {
  type: StandardNodeType.ImageReference,
  meta: {
    nodeDTOType: StandardNodeType.ImageReference,
  },
  formMeta: () => {
    throw new Error(I18n.t('workflow_node_invalid'));
  },
};

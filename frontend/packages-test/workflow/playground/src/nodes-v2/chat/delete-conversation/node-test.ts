import { I18n } from '@coze-arch/i18n';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import {
  generateParametersToProperties,
  generateEnvToRelatedContextProperties,
} from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateRelatedContext(node, context) {
    const { isInProject } = context;
    if (isInProject) {
      return {};
    }
    return generateEnvToRelatedContextProperties({
      isNeedBot: true,
      hasConversationNode: true,
      disableBot: true,
      disableBotTooltip: I18n.t('wf_chatflow_141'),
    });
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    return generateParametersToProperties(formData?.inputParameters, { node });
  },
};

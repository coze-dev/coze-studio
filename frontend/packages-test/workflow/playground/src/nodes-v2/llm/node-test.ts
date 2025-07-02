import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import {
  generateParametersToProperties,
  generateEnvToRelatedContextProperties,
} from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateRelatedContext(node, context) {
    const { isInProject, isChatflow } = context;
    /** 不在会话流，LLM 节点无需关联环境 */
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const enableChatHistory =
      formData?.$$input_decorator$$?.chatHistorySetting?.enableChatHistory;
    if (!isChatflow || !enableChatHistory) {
      return {};
    }
    return generateEnvToRelatedContextProperties({
      isNeedBot: !isInProject,
      isNeedConversation: true,
    });
  },
  generateFormBatchProperties(node) {
    const batchModePath = '/batchMode';
    const batchDataPath = '/batch';
    const { formModel } = node.getData(FlowNodeFormData);
    const batchMode = formModel.getFormItemValueByPath(batchModePath);
    if (batchMode !== 'batch') {
      return {};
    }
    const batchData = formModel.getFormItemValueByPath(batchDataPath);
    const parameters = batchData?.inputLists;
    return generateParametersToProperties(parameters, { node });
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const parameters = formData?.$$input_decorator$$?.inputParameters;
    return generateParametersToProperties(parameters, { node });
  },
};

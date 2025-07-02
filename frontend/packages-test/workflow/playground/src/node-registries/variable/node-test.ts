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
      hasVariableAssignNode: true,
    });
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameter = formData?.inputParameters;
    return generateParametersToProperties(inputParameter, { node });
  },
};
export type { NodeTestMeta };

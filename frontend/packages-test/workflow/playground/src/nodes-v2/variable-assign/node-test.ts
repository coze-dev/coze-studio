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
    const parameters = formData?.$$input_decorator$$?.inputParameters?.map(
      e => ({
        input: e?.right,
        name: e?.left?.content?.keyPath?.[1],
      }),
    );
    return generateParametersToProperties(parameters, { node });
  },
};

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import {
  type NodeTestMeta,
  generateParametersToProperties,
} from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const parameters = formData?.inputs?.inputParameters;

    return generateParametersToProperties(parameters, {
      node,
    });
  },
};
export type { NodeTestMeta };

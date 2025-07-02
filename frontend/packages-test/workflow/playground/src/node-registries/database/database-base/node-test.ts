import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters = formData?.inputParameters;

    return generateParametersToProperties(inputParameters, { node });
  },
};

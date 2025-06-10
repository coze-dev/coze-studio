import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const conditionList = (
      formData?.inputs?.selectParam?.condition?.conditionList ?? []
    ).map((item, idx) => {
      const { left, right } = item;
      const name = left;
      const rightValue = right;
      return {
        name: `__condition_right_${idx}`,
        title: `${name}`,
        input: rightValue,
      };
    });

    return generateParametersToProperties(conditionList, { node });
  },
};

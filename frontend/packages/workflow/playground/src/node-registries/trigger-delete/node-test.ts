import { I18n } from '@coze-arch/i18n';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const labelMap = {
      userId: I18n.t('workflow_trigger_user_create_userid'),
    };
    const requiredKeys = ['userId'];
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters = formData?.inputs?.inputParameters;

    return generateParametersToProperties(
      Object.entries(inputParameters || {}).map(([key, value]) => ({
        name: key,
        title: labelMap[key] || key,
        required: requiredKeys.includes(key),
        input: value,
      })),
      { node },
    );
  },
};

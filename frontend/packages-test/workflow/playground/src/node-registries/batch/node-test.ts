import { I18n } from '@coze-arch/i18n';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import {
  generateParametersToProperties,
  getRelatedInfo,
  generateEnvToRelatedContextProperties,
} from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  async generateRelatedContext(_, context) {
    const { isInProject, workflowId, spaceId } = context;
    if (isInProject) {
      return {};
    }
    const related = await getRelatedInfo({ workflowId, spaceId });
    return generateEnvToRelatedContextProperties(related);
  },
  generateFormSettingProperties(node) {
    const { formModel } = node.getData(FlowNodeFormData);
    const data = formModel.getFormItemValueByPath('/inputs');
    return generateParametersToProperties(
      [
        {
          name: 'concurrentSize',
          title: I18n.t('workflow_maximum_parallel_runs'),
          input: data.concurrentSize,
        },
        {
          name: 'batchSize',
          title: I18n.t('workflow_maximum_run_count'),
          input: data.batchSize,
        },
      ],
      { node },
    );
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const parameters = formData?.inputs?.inputParameters;
    return generateParametersToProperties(parameters, { node });
  },
};

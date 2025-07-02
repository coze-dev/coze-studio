import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type IFormSchema } from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const labelMap = {
      triggerName: I18n.t('workflow_trigger_user_create_name'),
      triggerId: I18n.t('workflow_trigger_user_create_id'),
      userId: I18n.t('workflow_trigger_user_create_userid'),
    };
    const requiredKeys = ['triggerName', 'userId'];
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const fixedInputs = formData?.inputs?.fixedInputs;
    const configProperties = generateParametersToProperties(
      Object.entries(fixedInputs || {}).map(([key, value]) => ({
        name: `__trigger_config_${key}`,
        title: labelMap[key] || key,
        required: requiredKeys.includes(key),
        input: value,
      })),
      { node },
    );
    const crontab = formData?.inputs?.dynamicInputs?.crontab;

    let crontabProperties: IFormSchema = {};
    if (crontab?.type === 'cronjob') {
      crontabProperties = generateParametersToProperties(
        [
          {
            name: '__trigger_config_crontab',
            title: I18n.t('workflow_trigger_user_create_schedula'),
            required: true,
            input: crontab?.content,
          },
        ],
        { node },
      );
    }
    const payload = formData?.inputs?.payload;
    const payloadProperties = generateParametersToProperties(
      Object.entries(payload || {}).map(([key, value]) => {
        const parameterKey = key?.split(',')[1] || key;
        return {
          name: `__trigger_payload_${parameterKey}`,
          title: parameterKey,
          input: value,
        };
      }),
      { node },
    );
    return {
      ...configProperties,
      ...crontabProperties,
      ...payloadProperties,
    };
  },
};

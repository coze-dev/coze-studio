import { I18n } from '@coze-arch/i18n';

import { type TestFormField } from '../types';
import { generateObjectInputParameters } from './generate-test-form-fields';

export const generateUpdateTriggerFields = (formData, context) => {
  const labelMap = {
    triggerName: I18n.t('workflow_trigger_user_create_name'),
    triggerId: I18n.t('workflow_trigger_user_create_id'),
    userId: I18n.t('workflow_trigger_user_create_userid'),
  };

  const fixedInputs = formData?.inputs?.fixedInputs;
  const configFields = generateObjectInputParameters(fixedInputs, context).map(
    i => ({
      ...i,
      name: `__trigger_config_${i.name}`,
      title: i.name ? labelMap[i.name] || i.name : i.name,
    }),
  );

  let cronjobFields: TestFormField[] = [];
  const crontab = formData?.inputs?.dynamicInputs?.crontab;
  if (crontab?.type === 'cronjob') {
    cronjobFields = generateObjectInputParameters(
      {
        crontab: crontab?.content,
      },
      context,
    ).map(i => ({
      ...i,
      name: '__trigger_config_crontab',
      title: I18n.t('workflow_trigger_user_create_schedula'),
    }));
  }

  const payload = formData?.inputs?.payload;

  const payloadFields = generateObjectInputParameters(payload, context).map(
    i => {
      // 绑定的工作流入参在表单的形式为 `${variable.type},${variable.key ?? variable.name}`
      const parameterKey = i.name?.split(',')[1] || i.name;
      return {
        ...i,
        name: `__trigger_payload_${parameterKey}`,
        title: parameterKey,
      };
    },
  );

  return [...configFields, ...cronjobFields, ...payloadFields];
};

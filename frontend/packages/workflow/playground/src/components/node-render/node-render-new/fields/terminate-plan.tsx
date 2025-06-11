import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze/coze-design';

import { defaultTerminalPlanOptions } from '@/node-registries/end/constants';

import { Field } from './field';
export const TerminatePlan = () => {
  const { data } = useWorkflowNode();

  const terminatePlan = defaultTerminalPlanOptions.find(
    item => item.value === data?.inputs?.terminatePlan,
  )?.label;
  if (!terminatePlan) {
    return null;
  }
  return (
    <Field label={I18n.t('wf_chatflow_131')}>
      <div className="flex">
        <Typography.Text className="leading-[20px]">
          {terminatePlan}
        </Typography.Text>
      </div>
    </Field>
  );
};

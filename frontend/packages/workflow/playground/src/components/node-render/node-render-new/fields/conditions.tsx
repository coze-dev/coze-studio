import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Port } from './port';
import { Field } from './field';
import { ConditionBranch } from './condition-branch';

export function Conditions() {
  const { data } = useWorkflowNode();
  const conditions = data?.condition;

  return (
    <>
      {conditions?.map((condition, index) => {
        let label = I18n.t('worklfow_condition_if', {}, 'If');

        if (index > 0) {
          label = I18n.t('worklfow_condition_else_if', {}, 'Else if');
        }

        return (
          <Field label={label}>
            <ConditionBranch branch={condition.condition} />
            <Port id={calcPortId(index)} type="output" />
          </Field>
        );
      })}
      <Field label={I18n.t('workflow_detail_condition_else')}>
        <div className="h-8 coz-stroke-plus coz-bg-max border border-solid p-1 rounded-mini" />
        <Port id={'false'} type="output" />
      </Field>
    </>
  );
}

function calcPortId(index: number) {
  if (index === 0) {
    return 'true';
  } else {
    return `true_${index}`;
  }
}

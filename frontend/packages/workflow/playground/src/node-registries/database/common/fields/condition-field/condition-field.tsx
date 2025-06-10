import { type DatabaseCondition, ConditionLogic } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import {
  type FieldProps,
  FieldArray,
  Section,
  useWatch,
  FieldEmpty,
} from '@/form';

import { ConditionLogicField } from './condition-logic-field';
import { ConditionList } from './condition-list';
import { ConditionAddButton } from './condition-add-button';

type ConditionFieldProps = Pick<FieldProps, 'name' | 'label' | 'tooltip'> & {
  min?: number;
};

export function ConditionField({
  name,
  label,
  tooltip,
  min,
}: ConditionFieldProps) {
  const conditionListName = `${name}.conditionList`;
  const conditions = useWatch<DatabaseCondition[]>(conditionListName);

  return (
    <FieldArray name={conditionListName}>
      <Section title={label} tooltip={tooltip}>
        <div>
          <div className="flex">
            {conditions?.length > 1 && (
              <ConditionLogicField
                name={`${name}.logic`}
                defaultValue={ConditionLogic.AND}
                showStroke={true}
              />
            )}
            <div className="flex-1 min-w-0">
              <ConditionList min={min} />
            </div>
          </div>
          <FieldEmpty
            isEmpty={!conditions || conditions.length === 0}
            text={I18n.t('workflow_condition_empty')}
          />
          <ConditionAddButton />
        </div>
      </Section>
    </FieldArray>
  );
}

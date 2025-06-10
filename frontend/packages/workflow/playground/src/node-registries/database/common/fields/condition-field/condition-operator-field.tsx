import {
  type ViewVariableType,
  type DatabaseConditionOperator,
  useNodeTestId,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze/coze-design';

import { withField, useField, Select } from '@/form';

import { getConditionOperatorOptions } from './get-condition-operator-options';

interface ConditionOperatorFieldProps {
  dataType?: ViewVariableType;
}

export const ConditionOperatorField = withField(
  ({ dataType }: ConditionOperatorFieldProps) => {
    const { name, value, onChange, readonly } =
      useField<DatabaseConditionOperator>();
    const options = getConditionOperatorOptions(dataType);

    const { getNodeSetterId } = useNodeTestId();

    return (
      <Select
        className="w-[42px]"
        data-testid={getNodeSetterId(name)}
        value={value}
        disabled={readonly}
        onChange={newValue => {
          onChange(newValue as DatabaseConditionOperator);
        }}
        optionList={options}
        placeholder={I18n.t('workflow_detail_condition_pleaseselect')}
        renderSelectedItem={optionsNode => (
          <Tooltip content={optionsNode.label}>
            <div className={'flex items-center h-[24px]'}>
              {optionsNode.operationIcon}
            </div>
          </Tooltip>
        )}
      />
    );
  },
);

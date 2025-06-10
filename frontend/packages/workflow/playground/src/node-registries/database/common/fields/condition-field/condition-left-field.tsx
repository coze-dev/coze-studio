import { type DatabaseConditionLeft, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useCurrentDatabaseQuery } from '@/hooks';
import { withField, Select, useField } from '@/form';

interface ConditionLeftFieldProps {
  onChange?: (value: DatabaseConditionLeft) => void;
}

export const ConditionLeftField = withField<ConditionLeftFieldProps>(
  ({ onChange: propOnChange }) => {
    const { name, value, onChange, readonly } =
      useField<DatabaseConditionLeft>();
    const { data: currentDatabase } = useCurrentDatabaseQuery();
    const { getNodeSetterId } = useNodeTestId();

    const handleChange = newValue => {
      onChange(newValue as DatabaseConditionLeft);
      propOnChange?.(newValue as DatabaseConditionLeft);
    };

    return (
      <Select
        data-testid={getNodeSetterId(name)}
        className="w-full"
        value={value}
        onChange={handleChange}
        disabled={readonly}
        placeholder={I18n.t(
          'workflow_condition_left_placeholder',
          {},
          '请选择',
        )}
        optionList={currentDatabase?.fields?.map(field => ({
          label: <span className="max-w-[220px] truncate">{field.name}</span>,
          value: field.name,
        }))}
      />
    );
  },
);

import {
  useNodeTestId,
  type ValueExpression,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { ValueExpressionInput } from '@/form-extensions/components/value-expression-input';
import { FormItem } from '@/form-extensions/components/form-item';
import { useField, withField } from '@/form';

interface BatchConcurrentSizeFieldProps {
  title?: string;
  tooltip?: string;
  testId?: string;
}

export const BatchConcurrentSizeField = withField<
  BatchConcurrentSizeFieldProps,
  ValueExpression
>(
  ({
    title = I18n.t('workflow_maximum_parallel_runs'),
    tooltip = I18n.t('workflow_maximum_parallel_runs_tips'),
    testId,
  }) => {
    const { name, value, onChange, readonly } = useField<ValueExpression>();
    const { getNodeSetterId } = useNodeTestId();

    return (
      <FormItem
        label={title}
        tooltip={tooltip}
        layout="vertical"
        style={{
          marginTop: 12,
        }}
        labelStyle={{
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--coz-fg-secondary, rgba(6, 7, 9, 0.50))',
        }}
      >
        <ValueExpressionInput
          value={value}
          onChange={onChange}
          testId={testId ?? getNodeSetterId(name)}
          disabledTypes={ViewVariableType.getComplement([
            ViewVariableType.Integer,
          ])}
          readonly={readonly}
          inputType={ViewVariableType.Integer}
          literalConfig={{
            min: 1,
            max: 10,
          }}
          literalStyle={{
            width: '100%',
          }}
        />
      </FormItem>
    );
  },
  {
    defaultValue: { type: ValueExpressionType.LITERAL, content: 10 },
  },
);

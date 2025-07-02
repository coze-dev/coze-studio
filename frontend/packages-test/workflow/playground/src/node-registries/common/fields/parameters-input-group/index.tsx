import {
  ValueExpressionType,
  ViewVariableType,
  type InputTypeValueVO,
} from '@coze-workflow/base';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import type { Column } from '@/form-extensions/components/columns-title';
import { FieldArray, type FieldProps, Section, AddButton } from '@/form';

import { ParametersInputGroupField } from './parameters-input-group-field';

interface ParametersInputGroupProps extends FieldProps<InputTypeValueVO[]> {
  name: string;
  columns?: Column[];
  title?: string;
  tooltip?: React.ReactNode;
  nameReadonly?: boolean;
  fieldEditable?: boolean;
  defaultAppendValue?: InputTypeValueVO;
  hiddenTypes?: boolean;
  inputType?: ViewVariableType;
  disabledTypes?: ViewVariableType[];
}

export const ParametersInputGroup = ({
  name,
  title,
  tooltip,
  columns,
  defaultValue,
  nameReadonly,
  fieldEditable = true,
  defaultAppendValue = {
    name: '',
    type: ViewVariableType.String,
    input: { type: ValueExpressionType.LITERAL, content: '' },
  },
  inputType,
  hiddenTypes,
  disabledTypes,
}: ParametersInputGroupProps) => {
  const readonly = useReadonly();

  return (
    <Section
      title={title}
      tooltip={tooltip}
      actions={
        fieldEditable && !readonly
          ? [
              <FieldArray name={name}>
                {({ append }) => (
                  <AddButton
                    onClick={() => {
                      append(defaultAppendValue);
                    }}
                  />
                )}
              </FieldArray>,
            ]
          : []
      }
    >
      <ParametersInputGroupField
        name={name}
        columns={columns}
        defaultValue={defaultValue}
        nameReadonly={nameReadonly}
        fieldEditable={fieldEditable && !readonly}
        hiddenTypes={hiddenTypes}
        inputType={inputType}
        disabledTypes={disabledTypes}
      />
    </Section>
  );
};

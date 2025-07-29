import {
  FieldArray,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import type { ViewVariableType, InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { FieldArrayItem, FieldRows, Section, type FieldProps } from '@/form';

interface InputsFieldProps extends FieldProps<InputValueVO[]> {
  title?: string;
  paramsTitle?: string;
  expressionTitle?: string;
  disabledTypes?: ViewVariableType[];
  onAppend?: () => InputValueVO;
  inputPlaceholder?: string;
  literalDisabled?: boolean;
  showEmptyText?: boolean;
  nthCannotDeleted?: number;
}

export const InputsField = ({
  name,
  defaultValue,
  title,
  tooltip,
  disabledTypes,
  inputPlaceholder,
  literalDisabled,
  showEmptyText = true,
}: InputsFieldProps) => {
  const readonly = useReadonly();
  return (
    <FieldArray<InputValueVO> name={name} defaultValue={defaultValue}>
      {({ field }: FieldArrayRenderProps<InputValueVO>) => {
        const { value = [] } = field;
        const length = value?.length ?? 0;
        const isEmpty = !length;
        return (
          <Section
            title={title}
            tooltip={tooltip}
            isEmpty={showEmptyText && isEmpty}
            emptyText={I18n.t('workflow_inputs_empty')}
          >
            <FieldRows>
              {field.map((item, index) => (
                <FieldArrayItem key={item.key} disableRemove hiddenRemove>
                  <div style={{ flex: 3 }}>
                    <ValueExpressionInputField
                      name={`${name}.${index}.input`}
                      disabledTypes={disabledTypes}
                      readonly={readonly}
                      inputPlaceholder={inputPlaceholder}
                      literalDisabled={literalDisabled}
                    />
                  </div>
                </FieldArrayItem>
              ))}
            </FieldRows>
          </Section>
        );
      }}
    </FieldArray>
  );
};

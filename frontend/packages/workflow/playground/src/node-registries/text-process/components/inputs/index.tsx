import React, { type PropsWithChildren } from 'react';

import {
  type InputValueVO,
  ValueExpressionType,
  type ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { ValueExpressionInputField } from '@/node-registries/common/fields';
import {
  Section,
  useFieldArray,
  useSectionRef,
  AddButton,
  ColumnTitles,
  FieldArrayList,
  FieldArrayItem,
  withFieldArray,
} from '@/form';

import { PREFIX_STR } from '../../constants';
import { getMaxIndex } from './utils';

interface InputsProps {
  minItems: number;
  maxItems: number;
  inputType?: ViewVariableType;
  disabledTypes?: ViewVariableType[];
}

export const Inputs = withFieldArray(
  ({
    children,
    minItems = 0,
    inputType,
    disabledTypes,
    maxItems = Number.MAX_SAFE_INTEGER,
  }: InputsProps & PropsWithChildren) => {
    const sectionRef = useSectionRef();
    const { value, append, remove, readonly } = useFieldArray<InputValueVO>();
    const safeValue = value || [];

    return (
      <Section
        ref={sectionRef}
        title={I18n.t('workflow_detail_node_parameter_input')}
        tooltip={I18n.t('workflow_stringprocess_input_tooltips')}
        isEmpty={!value || value?.length === 0}
        emptyText={I18n.t('workflow_inputs_empty')}
        actions={[
          safeValue.length >= maxItems ? null : (
            <AddButton
              disabled={readonly}
              onClick={() => {
                const names = safeValue.map(item => item?.name ?? '');
                const index = getMaxIndex(names, PREFIX_STR);
                append({
                  name: `${PREFIX_STR}${index}`,
                  input: { type: ValueExpressionType.REF },
                });
                sectionRef.current?.open();
              }}
            />
          ),
        ]}
      >
        <ColumnTitles
          columns={[
            {
              label: I18n.t('workflow_detail_node_parameter_name'),
              style: { width: 148 },
            },
            { label: I18n.t('workflow_detail_end_output_value') },
          ]}
        />

        <FieldArrayList>
          {value?.map(({ name }, index) => (
            <FieldArrayItem
              onRemove={() => remove(index)}
              disableRemove={readonly || safeValue.length <= minItems}
            >
              <ValueExpressionInputField
                key={index}
                label={name}
                required={false}
                inputType={inputType}
                disabledTypes={disabledTypes}
                name={`inputParameters.${index}.input`}
              />
            </FieldArrayItem>
          ))}
        </FieldArrayList>

        {children}
      </Section>
    );
  },
);

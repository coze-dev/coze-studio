/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
  FieldArray,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { type RefExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';
import {
  AddButton,
  FieldArrayItem,
  FieldRows,
  Section,
  type FieldProps,
} from '@/form';

import { type SetVariableItem } from '../types';
import { MutableVariableAssignField } from './mutable-variable-assign';

interface SetVariableFieldProps extends FieldProps<SetVariableItem[]> {
  title?: string;
  nthCannotDeleted?: number;
}

export const SetVariableField = ({
  name,
  defaultValue,
  title = I18n.t('workflow_loop_set_variable_set'),
  tooltip,
  nthCannotDeleted = 1,
}: SetVariableFieldProps) => {
  const readonly = useReadonly();
  return (
    <FieldArray<SetVariableItem> name={name} defaultValue={defaultValue ?? []}>
      {({ field }: FieldArrayRenderProps<SetVariableItem>) => {
        const { value = [], delete: remove, append } = field;
        const length = value?.length ?? 0;
        const isEmpty = !length;
        const disableRemove = nthCannotDeleted === length;
        return (
          <Section
            title={title}
            tooltip={tooltip}
            actions={
              !readonly
                ? [
                    <AddButton
                      onClick={() => {
                        append({
                          left: {} as RefExpression,
                          right: {} as RefExpression,
                        });
                      }}
                    />,
                  ]
                : []
            }
            isEmpty={isEmpty}
            emptyText={I18n.t('workflow_inputs_empty')}
          >
            <ColumnsTitleWithAction
              columns={[
                {
                  title: I18n.t('workflow_loop_set_variable_loopvariable'),
                  style: {
                    width: '50%',
                  },
                },
                {
                  title: I18n.t('workflow_loop_set_variable_variable'),
                  style: {
                    width: '50%',
                  },
                },
              ]}
              readonly={readonly}
              className="mb-[8px]"
              style={{
                display: isEmpty ? 'none' : 'flex',
              }}
            />
            <FieldRows>
              {field.map((item, index) => (
                <FieldArrayItem
                  key={item.key}
                  disableRemove={disableRemove}
                  hiddenRemove={readonly}
                  onRemove={() => remove(index)}
                >
                  <div style={{ width: '50%' }}>
                    <MutableVariableAssignField
                      name={`${item.name}.left`}
                      right={item.value.right}
                      inputParameters={value}
                      index={index}
                    />
                  </div>
                  <div style={{ width: '50%' }}>
                    <ValueExpressionInputField
                      name={`${item.name}.right`}
                      literalDisabled={true}
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

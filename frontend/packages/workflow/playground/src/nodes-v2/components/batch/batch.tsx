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

import React, { useMemo } from 'react';

import { get } from 'lodash-es';
import {
  useField,
  FieldArray,
  type FieldRenderProps,
  type FieldArrayRenderProps,
  useForm,
  Field,
  usePlayground,
} from '@flowgram-adapter/free-layout-editor';
import {
  DEFAULT_BATCH_CONCURRENT_SIZE,
  DEFAULT_BATCH_SIZE,
} from '@coze-workflow/nodes';
import {
  type BatchVOInputList,
  concatTestId,
  type RefExpression,
  type ValueExpression,
  ValueExpressionType,
  ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Popover } from '@coze-arch/bot-semi';
import { IconSetting } from '@coze-arch/bot-icons';
import { IconCozMinus, IconCozPlus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import { NodeInputName } from '@/nodes-v2/components/node-input-name';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { FormCard } from '@/form-extensions/components/form-card';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';

import {
  BatchSettingForm,
  type BatchSettingOnChangeValue,
} from './batch-setting-form';

import s from './index.module.less';

interface BatchProps {
  batchModeName: string;
  name: string;
}

export const Batch = ({ batchModeName, name }: BatchProps) => {
  const batchMode = useField(batchModeName)?.value;
  const readonly = useReadonly();

  const form = useForm();
  const playground = usePlayground();
  const { isBatchV2 } = playground.context.schemaGray;

  const actionButtonContent = useMemo(
    () => (
      <div className={s.actionButtonContent}>
        <Popover
          keepDOM
          stopPropagation
          trigger="click"
          position="bottomRight"
          content={
            <BatchSettingForm
              readonly={readonly}
              value={{
                batchSize:
                  form.getValueIn(`${name}.batchSize`) ?? DEFAULT_BATCH_SIZE,
                concurrentSize:
                  form.getValueIn(`${name}.concurrentSize`) ??
                  DEFAULT_BATCH_CONCURRENT_SIZE,
              }}
              onChange={(value: BatchSettingOnChangeValue) => {
                form.setValueIn(
                  `${name}.batchSize`,
                  get(value.values, 'batchSize'),
                );
                form.setValueIn(
                  `${name}.concurrentSize`,
                  get(value.values, 'concurrentSize'),
                );
              }}
            />
          }
        >
          <IconButton
            color="secondary"
            size={'small'}
            icon={<IconSetting size="small" />}
            style={{ marginRight: 26 }}
          />
        </Popover>
      </div>
    ),
    [form, name, readonly],
  );

  if (isBatchV2) {
    return <></>;
  }

  return batchMode === 'batch' ? (
    <div className={s['batch-container']}>
      <FieldArray
        name={`${name}.inputLists`}
        defaultValue={[
          { name: 'item1', input: { type: ValueExpressionType.REF }, id: '0' },
        ]}
      >
        {({ field }: FieldArrayRenderProps<BatchVOInputList>) => {
          const disableDelete = field.value && field.value.length < 2;
          return (
            <FormCard
              className={s['batch-content']}
              header={I18n.t('workflow_detail_node_batch')}
              tooltip={I18n.t('workflow_detail_node_batch_tooltip')}
              actionButton={actionButtonContent}
            >
              <div className={s['columns-title']}>
                <ColumnsTitleWithAction
                  columns={[
                    {
                      title: I18n.t('workflow_detail_variable_input_name'),
                      style: {
                        flex: 2,
                      },
                    },
                    {
                      title: I18n.t('workflow_detail_variable_input_value'),
                      style: {
                        flex: 3,
                      },
                    },
                  ]}
                  readonly={readonly}
                />
              </div>
              {field.map((child, index) => (
                <div key={child.key} className={s['input-item']}>
                  <Field name={`${child.name}.name`}>
                    {({
                      field: childNameField,
                      fieldState: childNameState,
                    }: FieldRenderProps<string>) => (
                      <div
                        style={{
                          flex: 2,
                        }}
                      >
                        <NodeInputName
                          {...childNameField}
                          input={form.getValueIn<RefExpression>(
                            `${child.name}.input`,
                          )}
                          inputParameters={field.value || []}
                          isError={!!childNameState?.errors?.length}
                        />
                        <FormItemFeedback errors={childNameState?.errors} />
                      </div>
                    )}
                  </Field>
                  <Field name={`${child.name}.input`}>
                    {({
                      field: childInputField,
                      fieldState: childInputState,
                    }: FieldRenderProps<ValueExpression | undefined>) => (
                      <div style={{ flex: 3, overflow: 'hidden' }}>
                        <ValueExpressionInput
                          {...childInputField}
                          key="ValueExpressionInput"
                          literalDisabled={false}
                          disabledTypes={ViewVariableType.getComplement(
                            ViewVariableType.getAllArrayType(),
                          )}
                        />
                        <FormItemFeedback errors={childInputState?.errors} />
                      </div>
                    )}
                  </Field>
                  {readonly ? (
                    <></>
                  ) : (
                    <div className="leading-none">
                      <IconButton
                        size="small"
                        color="secondary"
                        disabled={disableDelete}
                        data-testid={concatTestId(child.name, 'remove')}
                        icon={<IconCozMinus />}
                        onClick={() => {
                          if (disableDelete) {
                            return;
                          }
                          field.delete(index);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              <div className={s['input-add-icon']}>
                <IconButton
                  className="!block"
                  color="highlight"
                  size="small"
                  icon={<IconCozPlus />}
                  onClick={() => {
                    field.append({
                      id: `${field.value?.length ?? 0}`,
                      name: '',
                      input: { type: ValueExpressionType.REF },
                    });
                  }}
                />
              </div>
            </FormCard>
          );
        }}
      </FieldArray>
    </div>
  ) : null;
};

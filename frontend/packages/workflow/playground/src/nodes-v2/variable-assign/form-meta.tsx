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

import React from 'react';

import { get, isNil } from 'lodash-es';
import {
  Field,
  type FieldArrayRenderProps,
  FieldArray,
  type FieldRenderProps,
  type FormMetaV2,
  type FormRenderProps,
  ValidateTrigger,
} from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import {
  PublicScopeProvider,
  type RefExpression,
  type ValueExpression,
  type ValueExpressionDTO,
  ValueExpressionType,
  variableUtils,
  ViewVariableType,
} from '@coze-workflow/variable';
import { concatTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlus, IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';
import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { OutputSingleText } from '@/nodes-v2/components/output-single-text';
import { GlobalVariableSelect } from '@/nodes-v2/components/global-variable-select';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { useVariableService } from '@/hooks';
import { type VariableMetaWithNode } from '@/form-extensions/typings';
import { FormCard } from '@/form-extensions/components/form-card';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';

import { nodeMetaValidate } from '../materials/node-meta-validate';
import { ValueExpressionInput } from '../components/value-expression-input';
import NodeMeta from '../components/node-meta';

import styles from './index.module.less';

function getInputParametersHeaderColumns() {
  return [
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
  ];
}

interface InputValueVO {
  left: ValueExpression;
  right: ValueExpression;
}

interface FormData {
  $$input_decorator$$: {
    inputParameters?: InputValueVO[];
  };
}

const getDefaultInputValue = () => ({
  left: { type: ValueExpressionType.REF },
  right: { type: ValueExpressionType.REF },
});

const Render = ({ form }: FormRenderProps<FormData>) => {
  const readonly = useReadonly();

  const variableService = useVariableService();
  const node = useCurrentEntity();
  const getFieldType = (valuePath: string) => {
    const value = form.getValueIn(valuePath);
    return variableUtils.getValueExpressionViewType(value, variableService, {
      node,
    });
  };

  const genGlobalVariablesFilter = (valuePath: string) => {
    const currentValue: RefExpression = form.getValueIn(valuePath) || {};
    const selectedValue: InputValueVO[] =
      form.getValueIn('$$input_decorator$$.inputParameters') || [];

    return (variables: VariableMetaWithNode[]) => {
      const currentValueKeyPathStr = currentValue?.content?.keyPath?.join('.');
      const selectedValueKeyPathStrArr = selectedValue
        .map(item => (item.left as RefExpression)?.content?.keyPath?.join('.'))
        .filter(keyPathStr => currentValueKeyPathStr !== keyPathStr);

      return variables
        .filter(item => !item.readonly)
        .filter(
          item =>
            !selectedValueKeyPathStrArr.includes(
              [item.nodeId, item.key].join('.'),
            ),
        );
    };
  };

  return (
    <PublicScopeProvider>
      <>
        <NodeMeta deps={['outputs']} outputsPath={'outputs'} />

        <FieldArray
          name={'$$input_decorator$$.inputParameters'}
          defaultValue={[getDefaultInputValue()]}
        >
          {({ field: fieldArray }: FieldArrayRenderProps<InputValueVO>) => (
            <FormCard
              header={I18n.t('workflow_detail_node_input')}
              tooltip={I18n.t('workflow_detail_variable_subtitle')}
            >
              <div className={styles['columns-title']}>
                <ColumnsTitleWithAction
                  columns={getInputParametersHeaderColumns()}
                />
              </div>
              {fieldArray.map((child, index) => (
                <div
                  key={child.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    paddingBottom: 4,
                    gap: 4,
                  }}
                >
                  <Field name={`${child.name}.left`}>
                    {({
                      field: childNameField,
                      fieldState: nameFieldState,
                    }: FieldRenderProps<RefExpression | undefined>) => (
                      <div
                        style={{
                          flex: 2,
                          minWidth: 0,
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <GlobalVariableSelect
                          {...childNameField}
                          variablesFilter={genGlobalVariablesFilter(
                            `${child.name}.left`,
                          )}
                          isError={!!nameFieldState?.errors?.length}
                          disabled={readonly}
                          useMatchType={
                            !childNameField.value?.content?.keyPath?.[0]
                          }
                          matchType={getFieldType(`${child.name}.right`)}
                        />

                        <FormItemFeedback errors={nameFieldState?.errors} />
                      </div>
                    )}
                  </Field>
                  <Field name={`${child.name}.right`}>
                    {({
                      field: childInputField,
                      fieldState: inputFieldState,
                    }: FieldRenderProps<ValueExpression | undefined>) => {
                      const matchLeftType = getFieldType(`${child.name}.left`);

                      return (
                        <div style={{ flex: 3, overflow: 'hidden' }}>
                          <ValueExpressionInput
                            {...childInputField}
                            inputType={matchLeftType}
                            matchType={matchLeftType}
                            isError={!!inputFieldState?.errors?.length}
                            readonly={readonly}
                          />
                          <FormItemFeedback errors={inputFieldState?.errors} />
                        </div>
                      );
                    }}
                  </Field>
                  {readonly ? (
                    <></>
                  ) : (
                    <div>
                      <IconButton
                        size="small"
                        color="secondary"
                        data-testid={concatTestId(child.name, 'remove')}
                        icon={<IconCozMinus />}
                        onClick={() => {
                          fieldArray.delete(index);
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
              {readonly ? (
                <></>
              ) : (
                <div className={styles['input-add-icon']}>
                  <IconButton
                    className="!block"
                    color="highlight"
                    size="small"
                    icon={<IconCozPlus />}
                    onClick={() => {
                      fieldArray.append(getDefaultInputValue());
                    }}
                  />
                </div>
              )}
            </FormCard>
          )}
        </FieldArray>

        <Field name={'outputs'}>
          <FormCard
            header={I18n.t('workflow_detail_node_output')}
            tooltip={I18n.t('workflow_detail_variable_set_output_tooltip')}
          >
            <OutputSingleText label={'isSuccess'} type={'boolean'} />
          </FormCard>
        </Field>
      </>
    </PublicScopeProvider>
  );
};

export const VARIABLE_ASSIGN_FORM_META: FormMetaV2<FormData> = {
  render: props => <Render {...props} />,
  validateTrigger: ValidateTrigger.onChange,
  validate: {
    nodeMeta: nodeMetaValidate,
    '$$input_decorator$$.inputParameters.*.left':
      createValueExpressionInputValidate({
        required: true,
        emptyErrorMessage: I18n.t('variable_assignment_node_select_empty'),
      }),
    '$$input_decorator$$.inputParameters.*.right':
      createValueExpressionInputValidate({ required: true }),
  },
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },
  formatOnInit(value, context) {
    const inputParameters = get(value, 'inputs.inputParameters');

    const inputParameterDTOs: {
      left: ValueExpressionDTO;
      input: ValueExpressionDTO;
    }[] = inputParameters ?? [];

    const inputParameterVOs: {
      left: ValueExpression;
      right: ValueExpression;
    }[] = inputParameterDTOs
      .map(inputParameterDTO => {
        const leftVariableDTO = inputParameterDTO?.left;
        const rightVariableDTO = inputParameterDTO?.input;

        if (!leftVariableDTO || !rightVariableDTO) {
          return;
        }

        const leftVariableVO = variableUtils.valueExpressionToVO(
          leftVariableDTO,
          context.playgroundContext.variableService,
        );

        const rightVariableVO = variableUtils.valueExpressionToVO(
          rightVariableDTO,
          context.playgroundContext.variableService,
        );

        return {
          left: leftVariableVO,
          right: rightVariableVO,
        };
      })
      .filter(Boolean) as {
      left: ValueExpression;
      right: ValueExpression;
    }[];

    const initValue = {
      nodeMeta: value?.nodeMeta,
      $$input_decorator$$: {
        inputParameters: inputParameterVOs?.length
          ? inputParameterVOs
          : [getDefaultInputValue()],
      },
      outputs: [{ name: 'isSuccess', type: ViewVariableType.Boolean }],
    };

    return initValue;
  },
  formatOnSubmit(value, context) {
    const inputParameters = get(value, '$$input_decorator$$.inputParameters');

    const formattedValue: Record<string, unknown> = {
      nodeMeta: value?.nodeMeta || {},
      inputs: {
        inputParameters: inputParameters?.map(input => {
          const leftVariableVO = input?.left as RefExpression;
          const rightVariableVO = input?.right as RefExpression;

          const leftVariableDTO = variableUtils.valueExpressionToDTO(
            leftVariableVO,
            context.playgroundContext.variableService,
            { node: context.node },
          );

          const rightVariableDTO = variableUtils.valueExpressionToDTO(
            rightVariableVO,
            context.playgroundContext.variableService,
            { node: context.node },
          );

          return {
            name: leftVariableVO?.content?.keyPath?.slice(1).join('.'),
            left: leftVariableVO?.content ? leftVariableDTO : undefined,
            input: !isNil(rightVariableVO?.content)
              ? rightVariableDTO
              : undefined,
          };
        }),
        variableTypeMap: inputParameters.reduce((acc, cur) => {
          const type = cur?.left?.content?.keyPath?.[0];
          const key = cur?.left?.content?.keyPath?.slice(1).join('.');

          if (!acc[key]) {
            acc[key] = type;
          }

          return acc;
        }, {}),
      },

      outputs: [{ name: 'isSuccess', type: 'boolean' }],
    };

    return formattedValue;
  },
};

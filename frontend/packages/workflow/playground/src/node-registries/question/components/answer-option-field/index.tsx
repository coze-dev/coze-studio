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

import React, { useMemo, useState } from 'react';

import update from 'immutability-helper';
import classNames from 'classnames';
import { ViewVariableType } from '@coze-workflow/variable';
import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';

import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { useUpdateSortedPortLines } from '@/hooks';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';
import { RadioGroupField } from '@/form/fields';
import {
  Section,
  useFieldArray,
  SortableList,
  FieldArray,
  useWatch,
} from '@/form';
import { OptionType } from '@/constants/question-settings';

import { generatePortId } from './utils';
import { AnswerItemField } from './answer-item';
import { AddOptionButton } from './add-option-button';

import styles from './index.module.less';

export interface AnswerOptionProps {
  /** Whether to display the title line */
  showTitleRow?: boolean;

  /** Whether to display option labels */
  showOptionName?: boolean;

  /** Option placeholder */
  optionPlaceholder?: string;

  /** Default branch name */
  defaultOptionText?: string;
}

const AnswerOption = ({
  optionPlaceholder,
  defaultOptionText,
  showTitleRow = true,
  showOptionName = true,
}: AnswerOptionProps) => {
  const { value, move, name, readonly, onChange, append } = useFieldArray<{
    name: string;
  }>();
  const answerType = useWatch({ name: 'questionParams.answer_type' });
  const optionType = useWatch({ name: 'questionParams.option_type' });

  const { getNodeSetterId } = useNodeTestId();
  const updateSortedPortLines = useUpdateSortedPortLines(generatePortId);
  const [movePostion, setMovePostion] = useState<{
    start?: number;
    end?: number;
  }>({});

  const isStaticOption = useMemo(
    () => optionType === OptionType.Static,
    [optionType],
  );

  if (answerType !== 'option') {
    return;
  }

  const onItemDelete = (index: number) => {
    // Move the port to be deleted to the end so that the deletion does not affect other connection sequences
    updateSortedPortLines(index, value?.length as number);

    const newVal = update(value, { $splice: [[index, 1]] });
    onChange(newVal);
  };

  return (
    <Section
      title={
        <div className="text-xs font-normal">
          {I18n.t('workflow_ques_ans_type_option_label', {}, '设置选项内容')}
        </div>
      }
      headerClassName="pt-[12px] !mb-[4px]"
      noPadding
      collapsible={false}
    >
      <div className={`w-full p-[8px] ${styles['parameters-wrapper']}`}>
        <div className="w-full mb-[8px]">
          <RadioGroupField
            name="questionParams.option_type"
            data-testid={getNodeSetterId('questionParams.option_type')}
            type="button"
            className="w-full"
            buttonSize="middle"
            defaultValue={OptionType.Static}
            options={[
              {
                label: I18n.t(
                  'workflow_question_fixed_content',
                  {},
                  '固定内容',
                ),
                value: OptionType.Static,
                className: styles['option-radio-group'],
              },
              {
                label: I18n.t(
                  'workflow_question_ dynamic_content',
                  {},
                  '动态内容',
                ),
                value: OptionType.Dynamic,
                className: styles['option-radio-group'],
              },
            ]}
          />
        </div>
        {showTitleRow ? (
          <ColumnsTitleWithAction
            columns={[
              {
                title: I18n.t('workflow_ques_ans_type_option_title'),
                style: {
                  width: isStaticOption ? '67px' : '56px',
                },
              },
              {
                title: I18n.t('workflow_ques_ans_type_option_content'),
                style: {
                  flex: 1,
                },
              },
            ]}
            readonly={readonly}
            className={classNames(
              'mb-[8px]',
              readonly
                ? styles.parametersTitleReadonly
                : styles.parametersTitle,
            )}
          />
        ) : null}
        {!isStaticOption ? (
          <div className="flex items-center w-full text-xs mt-2">
            <div
              className="break-keep mr-[4px]"
              style={{
                minWidth: isStaticOption ? '48px' : '56px',
              }}
            >
              <Tooltip
                trigger="hover"
                content={I18n.t(
                  'workflow_question_dynamic',
                  {},
                  'dynamicOption',
                )}
              >
                <span>{I18n.t('workflow_question_az', {}, 'A~Z')}</span>
              </Tooltip>
            </div>
            <div className="w-full items-center">
              <ValueExpressionInputField
                name={'questionParams.dynamic_option'}
                availableFileTypes={[ViewVariableType.ArrayString]}
                disabledTypes={ViewVariableType.getComplement([
                  ViewVariableType.ArrayString,
                ])}
              />
            </div>
          </div>
        ) : (
          <>
            <SortableList
              onSortEnd={({ from, to }) => {
                if (readonly) {
                  return;
                }
                updateSortedPortLines(from, to);
                move(from, to);
                setMovePostion({
                  start: from,
                  end: to,
                });
              }}
            >
              <div className="w-full flex flex-col gap-[8px] text-xs leading-[24px]">
                {value?.map((_item, index) => (
                  <AnswerItemField
                    name={`${name}.${index}.name`}
                    answerOptions={value}
                    optionPlaceholder={optionPlaceholder}
                    optionIndex={index}
                    movePostion={movePostion}
                    showOptionName={showOptionName}
                    hasFeedback={false}
                    onItemDelete={onItemDelete}
                  />
                ))}
              </div>
            </SortableList>
            <AddOptionButton
              className="w-full mt-[8px]"
              dataTestId={getNodeSetterId('answer-option-add-btn')}
              readonly={readonly}
              onClick={() => {
                append({
                  name: '',
                });
              }}
              children={
                <span className="text-[12px] font-medium">
                  {I18n.t('workflow_question_add_option', {}, '新增选项')}
                </span>
              }
              value={value}
            />
          </>
        )}

        <div className="flex items-center w-full text-xs mt-2">
          <div
            className="break-keep mr-[4px]"
            style={{
              minWidth: isStaticOption ? '48px' : '56px',
              marginLeft: isStaticOption ? '16px' : '0px',
            }}
          >
            {I18n.t('workflow_ques_ans_type_option_other', {}, 'other')}
          </div>
          <div className="space-x-1 w-full leading-[16px]">
            {defaultOptionText}
          </div>
        </div>
      </div>
    </Section>
  );
};

export const AnswerOptionField = ({
  name,
  optionPlaceholder,
  defaultOptionText,
}) => (
  <FieldArray name={name} defaultValue={[{ name: '' }, { name: '' }]}>
    <AnswerOption
      optionPlaceholder={optionPlaceholder}
      defaultOptionText={defaultOptionText}
    />
  </FieldArray>
);

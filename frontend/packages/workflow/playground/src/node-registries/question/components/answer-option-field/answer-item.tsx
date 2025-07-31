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

import React, { useEffect } from 'react';

import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { ExpressionEditor } from '@/nodes-v2/components/expression-editor';
import {
  calcPortId,
  convertNumberToLetters,
} from '@/form-extensions/setters/answer-option/utils';
import { withField, useField, SortableItem, FieldArrayItem } from '@/form';

import styles from './index.module.less';

export const AnswerItemField = withField(
  ({
    showOptionName,
    optionPlaceholder,
    optionIndex,
    movePostion,
    onItemDelete,
    answerOptions,
  }: {
    showOptionName?: boolean;
    optionPlaceholder?: string;
    optionIndex: number;
    movePostion: {
      start?: number;
      end?: number;
    };
    onItemDelete: (index: number) => void;
    answerOptions: { name: string }[];
  }) => {
    const { value, onChange, onBlur, readonly, errors } = useField<string>();

    useEffect(() => {
      if (
        movePostion?.start === optionIndex ||
        movePostion?.end === optionIndex
      ) {
        onBlur?.();
      }
    }, [movePostion]);

    return (
      <div className="w-full">
        <SortableItem
          key={optionIndex}
          sortableID={calcPortId(optionIndex)}
          index={optionIndex}
          containerClassName="items-center"
          hanlderClassName="!p-0"
        >
          <FieldArrayItem
            className="!pt-[0px] items-center"
            containerClassName="items-center"
            removeIconClassName="!h-[24px] !min-w-[24px] !max-w-[24px] !p-[4px]"
            disableRemove={answerOptions?.length <= 1 || readonly}
            onRemove={() => {
              if (answerOptions?.length <= 1 || readonly) {
                return;
              }
              onItemDelete(optionIndex);
            }}
          >
            {showOptionName ? (
              <div className="break-keep w-[48px]">
                {convertNumberToLetters(optionIndex)}
              </div>
            ) : null}
            <div className="items-center space-x-1 w-full min-h-[24px] leading-[24px]">
              {!readonly ? (
                <ExpressionEditor
                  name={'/questionParams/options'}
                  value={value as string}
                  onChangeTrigger="onChange"
                  onChange={val => onChange?.(val as string)}
                  onBlur={() => {
                    onBlur?.();
                  }}
                  isError={errors && errors?.length > 0}
                  minRows={1}
                  placeholder={optionPlaceholder}
                  disableSuggestion={false}
                  className="!px-[4px] !py-[2px]"
                  containerClassName={styles['answer-editor']}
                />
              ) : (
                <div className="w-full">{value ?? ''}</div>
              )}
            </div>
          </FieldArrayItem>
        </SortableItem>
        <FormItemFeedback className="pl-[68px]" errors={errors} />
      </div>
    );
  },
);

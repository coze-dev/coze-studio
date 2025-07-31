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

import { useMemo, useState, useEffect, useRef } from 'react';

import { TextArea } from '@coze-arch/coze-design';
import { Tooltip } from '@coze-arch/bot-semi';
import { IconToastError } from '@coze-arch/bot-icons';
import { CommonE2e } from '@coze-data/e2e';

import {
  type TableViewRecord,
  type ValidatorProps,
  type TableViewValue,
} from '../types';

import styles from './index.module.less';
export interface TextRenderProps {
  value: TableViewValue;
  record: TableViewRecord;
  index: number;
  onBlur?: (v: TableViewValue, record: TableViewRecord, index: number) => void;
  onChange?: (
    v: TableViewValue,
    record: TableViewRecord,
    index: number,
  ) => void;
  validator?: ValidatorProps;
  editable?: boolean;
  isEditing?: boolean;
  dataIndex?: string;
}

export const TextRender = ({
  value,
  record,
  index,
  onBlur,
  onChange,
  dataIndex = '',
  validator = {},
  editable = false,
  isEditing,
}: TextRenderProps) => {
  const { validate, errorMsg } = validator;
  const [isEditCom, setIsEditCom] = useState(isEditing);
  const [inputValue, setInputValue] = useState<TableViewValue>(String(value));
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setIsEditCom(isEditing);
  }, [isEditing]);
  const onBlurFn = async () => {
    if (onBlur && value !== inputValue) {
      const updateRecord = { ...record, [dataIndex]: inputValue };
      delete updateRecord.tableViewKey;
      if (!isError) {
        try {
          await onBlur(inputValue, updateRecord, index);
        } catch (e) {
          // Update failed, restore original value
          console.log('update table content error', e);
          setInputValue(String(value));
        }
      } else {
        setInputValue(String(value));
      }
    }
    setIsEditCom(false);
  };
  const onChangeFn = (v: string) => {
    if (onChange) {
      onChange(v, record, index);
    }
    setInputValue(v);
  };
  // check state
  const isError = useMemo(
    () => !!validate?.(String(inputValue), record, index),
    [inputValue, validate],
  );
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const target = textAreaRef.current;
    if (!isEditCom || !target) {
      return;
    }
    const valueLength = String(inputValue).length;
    target.focus();
    if (!valueLength) {
      return;
    }
    target.setSelectionRange(valueLength, valueLength);
  }, [isEditCom]);

  return (
    <div
      className={`${styles['cell-text-render']} text-render-wrapper`}
      data-testid={CommonE2e.CommonTableViewTextRender}
    >
      {/* edit state component */}
      {isEditCom ? (
        <span
          className={`${styles['cell-text-edit']} ${
            isError ? styles['cell-text-error'] : ''
          } cell-text-area-wrapper`}
        >
          <TextArea
            ref={textAreaRef}
            autoFocus
            autosize
            validateStatus={isError ? 'error' : 'default'}
            rows={1}
            className={styles['cell-text-area']}
            value={String(inputValue)}
            onBlur={onBlurFn}
            onChange={onChangeFn}
          />
          {isError ? (
            <div className={styles['cell-text-edit-error']}>
              <Tooltip content={errorMsg}>
                <IconToastError />
              </Tooltip>
            </div>
          ) : null}
        </span>
      ) : null}

      {/* preview component */}
      {!isEditCom && (
        <div
          className={`${styles['cell-text-preview']} text-content`}
          onClick={() => setIsEditCom(true)}
        >
          {inputValue}
        </div>
      )}
    </div>
  );
};

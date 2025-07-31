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

import { useState, useEffect, type FC } from 'react';

import { KNOWLEDGE_UNIT_NAME_MAX_LEN } from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { UIInput } from '@coze-arch/bot-semi';
import { FormatType } from '@coze-arch/bot-api/memory';

import { validateField } from '@/utils';

import { getTypeIcon } from '../../utils';
import { type UnitNameProps } from '../../types';

import styles from './index.module.less';

export const UnitName: FC<UnitNameProps> = ({
  edit,
  onChange,
  disabled,
  record,
  formatType,
  canValidator = true,
  inModal = false,
}) => {
  const { type, name, validateMessage, dynamicErrorMessage } = record;
  const [value, setValue] = useState(name); // You need to use your own state, otherwise there will be a bug that cannot enter Chinese.
  const [validData, setValidData] = useState({ valid: true, errorMsg: '' });

  const getValidateMessage = (val: string) =>
    !val ? I18n.t('datasets_unit_exception_name_empty') : validateMessage;

  const validator = (val: string) => {
    const validObj = validateField(val, getValidateMessage(name));
    setValidData(
      formatType === FormatType.Table
        ? validObj
        : {
            valid: !!name,
            errorMsg: '',
          },
    );
  };
  useEffect(() => {
    setValue(name);
    canValidator && !disabled && validator(name);
  }, [name, disabled]);

  return (
    <div className={styles['unit-name-wrap']}>
      {getTypeIcon({ type, formatType, url: record.url, inModal })}
      {edit ? (
        <div className="unit-name-input">
          <UIInput
            data-dtestid={`${KnowledgeE2e.LocalUploadListName}.${record.name}`}
            disabled={disabled}
            autoFocus={true}
            value={value}
            onChange={val => {
              setValue(val);
              onChange(val);
            }}
            onBlur={() => {
              canValidator && validator(name);
            }}
            maxLength={KNOWLEDGE_UNIT_NAME_MAX_LEN}
            validateStatus={
              !validData.valid || dynamicErrorMessage ? 'error' : 'default'
            }
            suffix={
              <span className="input-suffix">
                {(name || '').length}/{KNOWLEDGE_UNIT_NAME_MAX_LEN}
              </span>
            }
          />
          <div className="error">
            {!disabled &&
              (validData.errorMsg ||
                getValidateMessage(name) ||
                dynamicErrorMessage)}
          </div>
        </div>
      ) : (
        <span
          className="view-name"
          data-dtestid={`${KnowledgeE2e.LocalUploadListNameView}.${record.name}`}
        >
          {name}
        </span>
      )}
    </div>
  );
};

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

import { useState, useEffect } from 'react';

import { KNOWLEDGE_UNIT_NAME_MAX_LEN } from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { UIInput } from '@coze-arch/bot-semi';

import { getTypeIcon } from '../../utils';
import { type UnitNameProps } from '../../types';

import styles from './index.module.less';

export const UnitName: React.FC<UnitNameProps> = ({
  edit,
  onChange,
  disabled,
  record,
  formatType,
}) => {
  const { type, name, validateMessage } = record;
  const [value, setValue] = useState(name); // You need to use your own state, otherwise there will be a bug that cannot enter Chinese.
  const getValidateMessage = (val: string) =>
    !val ? I18n.t('datasets_unit_exception_name_empty') : validateMessage;
  useEffect(() => {
    setValue(name);
  }, [name]);
  return (
    <div
      className={styles['unit-name-wrap']}
      data-testid={`${KnowledgeE2e.FeishuUploadListName}.${name}`}
    >
      {getTypeIcon({ type, formatType })}
      {edit ? (
        <div className="unit-name-input">
          <UIInput
            disabled={disabled}
            value={value}
            onChange={val => {
              setValue(val);
              onChange(val);
            }}
            maxLength={KNOWLEDGE_UNIT_NAME_MAX_LEN}
            validateStatus={!name ? 'error' : 'default'}
            suffix={
              <span className="input-suffix">
                {(name || '').length}/{KNOWLEDGE_UNIT_NAME_MAX_LEN}
              </span>
            }
          />
          <div className="error">{getValidateMessage(name)}</div>
        </div>
      ) : (
        <div className="unit-name-error">
          <span className="view-name">{name}</span>
          {validateMessage ? (
            <div className="error">{validateMessage}</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

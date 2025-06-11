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
  const [value, setValue] = useState(name); // 需要用自身state，否则出现无法输入中文的bug
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

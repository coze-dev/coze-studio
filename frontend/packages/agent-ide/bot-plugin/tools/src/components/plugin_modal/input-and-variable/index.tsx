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

import { I18n } from '@coze-arch/i18n';
import { type OptionProps } from '@coze-arch/bot-semi/Select';
import { UIInput, UISelect, InputGroup, Typography } from '@coze-arch/bot-semi';
import {
  DefaultParamSource,
  type APIParameter,
} from '@coze-arch/bot-api/plugin_develop';

import styles from './index.module.less';

interface InputAndVariableItemProps {
  record: APIParameter;
  disabled?: boolean;
  onSourceChange?: (val: number) => void;
  onReferenceChange?: (val: string) => void;
  onValueChange?: (val: string) => void;
  referenceOption?: OptionProps[];
}

export const InputAndVariableItem = ({
  record,
  disabled,
  onSourceChange,
  onReferenceChange,
  onValueChange,
  referenceOption,
}: InputAndVariableItemProps) => (
  <InputGroup style={{ width: '100%', flexWrap: 'nowrap' }}>
    <UISelect
      theme="light"
      className={styles['action-input-value-pre']}
      value={record.default_param_source || DefaultParamSource.Input}
      disabled={disabled}
      optionList={[
        {
          label: I18n.t(
            'bot_ide_plugin_setting_modal_default_value_select_mode_reference',
          ),
          value: DefaultParamSource.Variable,
        },
        {
          label: I18n.t(
            'bot_ide_plugin_setting_modal_default_value_select_mode_input',
          ),
          value: DefaultParamSource.Input,
        },
      ]}
      onChange={val => {
        onSourceChange?.(Number(val));

        // Switch source, clear default
        onReferenceChange?.('');
        onValueChange?.('');
      }}
    />
    {record.default_param_source === DefaultParamSource.Variable ? (
      <UISelect
        theme="light"
        disabled={disabled}
        style={{ width: '100%', overflow: 'hidden' }}
        className={styles['action-input-value-content']}
        placeholder={I18n.t(
          'bot_ide_plugin_setting_modal_default_value_select_mode_reference_placeholder',
        )}
        value={record.variable_ref}
        onChange={val => {
          onReferenceChange?.(String(val));
        }}
      >
        {referenceOption?.map(item => (
          <UISelect.Option key={String(item.label)} value={String(item.label)}>
            <div className={styles['reference-option-item']}>
              <Typography.Text
                className={styles['reference-option-text']}
                ellipsis={{
                  showTooltip: {
                    opts: {
                      content: item.label,
                      style: { wordBreak: 'break-word' },
                    },
                  },
                }}
              >
                {item.label}
              </Typography.Text>
              <Typography.Text
                className={styles['reference-option-subtext']}
                ellipsis={{
                  showTooltip: {
                    opts: {
                      content: item.value,
                      style: { wordBreak: 'break-word' },
                    },
                  },
                }}
              >
                {item.value}
              </Typography.Text>
            </div>
          </UISelect.Option>
        ))}
      </UISelect>
    ) : (
      <UIInput
        disabled={disabled}
        className={styles['action-input-value-content']}
        placeholder={I18n.t(
          'bot_ide_plugin_setting_modal_default_value_select_mode_input_placeholder',
        )}
        value={record.local_default}
        onChange={val => {
          onValueChange?.(String(val));
        }}
      />
    )}
  </InputGroup>
);

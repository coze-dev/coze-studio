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

import { type CSSProperties } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { RadioGroup } from '@coze-arch/bot-semi';
import { ModelStyle } from '@coze-arch/bot-api/developer_api';

import styles from './index.module.less';
export interface PresetRadioOption {
  label: string;
  value: ModelStyle;
}

const getOptions: () => PresetRadioOption[] = () => [
  { label: I18n.t('model_config_generate_precise'), value: ModelStyle.Precise },
  { label: I18n.t('model_config_generate_balance'), value: ModelStyle.Balance },
  {
    label: I18n.t('model_config_generate_creative'),
    value: ModelStyle.Creative,
  },
  {
    label: I18n.t('model_config_generate_customize'),
    value: ModelStyle.Custom,
  },
];

export interface PresetRadioGroupProps {
  onChange: (value: ModelStyle) => void;
  value: ModelStyle;
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
}

export const PresetRadioGroup: React.FC<PresetRadioGroupProps> = ({
  onChange,
  className,
  style,
  value,
  disabled,
}) => (
  <RadioGroup
    disabled={disabled}
    className={classNames(styles['button-radio'], className)}
    style={style}
    options={getOptions()}
    value={value}
    onChange={e => {
      onChange(e.target.value);
    }}
    type="button"
  />
);

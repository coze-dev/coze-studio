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
import { IconCozInfoCircle } from '@coze-arch/coze-design/icons';
import { Typography, Select, Tooltip } from '@coze-arch/coze-design';
import { InputMode } from '@coze-arch/bot-api/workflow_api';

import tooltipImg from './tooltip.png';

import css from './role-default-input.module.less';

interface RoleDefaultInputProps {
  value?: InputMode;
  disabled?: boolean;
  onChange: (v: InputMode) => void;
}

const options = [
  {
    label: I18n.t('agent_ide_default_input_option_text'),
    value: InputMode.text,
  },
  {
    label: I18n.t('agent_ide_default_input_option_voice'),
    value: InputMode.audio,
  },
];

export const RoleDefaultInput: React.FC<RoleDefaultInputProps> = ({
  value,
  disabled,
  onChange,
}) => {
  const innerValue = value ?? InputMode.text;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (v: any) => {
    onChange(v);
  };

  return (
    <div className={css['default-input']}>
      <div className={css['input-label']}>
        <Typography.Text size="small">
          {I18n.t('agent_ide_default_input_option')}
        </Typography.Text>
        <Tooltip
          className={css['tooltip-wrap']}
          theme="dark"
          content={
            <div className={css['input-tooltip']}>
              <img src={tooltipImg} />
              <Typography.Text className="coz-fg-hglt-plus">
                {I18n.t('workflow_role_config_default_input_tooltip')}
              </Typography.Text>
            </div>
          }
        >
          <IconCozInfoCircle className={css['tooltip-icon']} />
        </Tooltip>
      </div>
      <Select
        value={innerValue}
        optionList={options}
        size="small"
        disabled={disabled}
        style={{ width: 130 }}
        onChange={handleChange}
      />
    </div>
  );
};

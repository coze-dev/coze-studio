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

import { useNodeTestId } from '@coze-workflow/base';
import { IconInfo } from '@coze-arch/bot-icons';
import { Switch } from '@coze-arch/coze-design';

import AutoSizeTooltip from '@/ui-components/auto-size-tooltip';
import { withField, useField } from '@/form';

import styles from './index.module.less';
export interface SwitchFieldProps {
  customLabel?: string;
  customTooltip?: string;
  testId?: string;
  customStyles?: React.CSSProperties;
  labelStyles?: React.CSSProperties;
  switchCustomStyles?: React.CSSProperties;
}
export const SwitchField = withField<SwitchFieldProps, boolean>(
  ({
    testId,
    customLabel,
    customTooltip,
    customStyles,
    labelStyles,
    switchCustomStyles,
  }) => {
    const { getNodeSetterId } = useNodeTestId();
    const { value, onChange, readonly } = useField<boolean>();
    return (
      <div className={styles.switchContainer} style={customStyles}>
        {customLabel ? (
          <div className={styles.label} style={labelStyles}>
            {customLabel}
          </div>
        ) : null}
        {customTooltip ? (
          <AutoSizeTooltip
            showArrow
            position="top"
            className={styles.popover}
            content={customTooltip}
          >
            <IconInfo className={styles.icon} />
          </AutoSizeTooltip>
        ) : null}
        <Switch
          data-testid={getNodeSetterId(testId ?? '')}
          disabled={readonly}
          size="mini"
          checked={value}
          onChange={onChange}
          style={switchCustomStyles}
        />
      </div>
    );
  },
);

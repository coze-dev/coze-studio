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

import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/coze-design';
import { IconOfficialLabel } from '@coze-arch/bot-icons';

import styles from './index.module.less';

/**
 * small 16px
 * default 20px
 * large 32px
 */
export type OfficialLabelSize = 'small' | 'default' | 'large';

export interface OfficialLabelProps {
  size?: OfficialLabelSize;
  visible: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const OfficialLabelSizeMap = {
  small: styles.small,
  default: styles.default,
  large: styles.large,
};

export const OfficialLabel: React.FC<OfficialLabelProps> = ({
  size = 'default',
  children,
  visible,
  className,
}) => (
  <div className="relative w-fit h-fit">
    <Tooltip
      spacing={12}
      trigger={visible ? 'hover' : 'custom'}
      content={I18n.t('mkpl_plugin_tooltip_official')}
    >
      {visible ? (
        <IconOfficialLabel
          className={classNames(
            styles['official-label'],
            OfficialLabelSizeMap[size],
            className,
          )}
        />
      ) : null}
    </Tooltip>
    {children}
  </div>
);

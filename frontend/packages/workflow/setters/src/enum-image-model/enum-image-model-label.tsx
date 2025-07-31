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
import { Tooltip, Avatar } from '@coze-arch/coze-design';

import { type EnumImageModelLabelProps } from './types';

import styles from './enum-image-model-label.module.less';

export function EnumImageModelLabel({
  thumbnail,
  label,
  tooltip,
  disabled = false,
  disabledTooltip,
}: EnumImageModelLabelProps) {
  let content = (
    <div className={styles.label}>
      <Avatar
        className={classNames(
          styles.thumbnail,
          'wf-enum-image-model-thumbnail',
        )}
        style={{ width: 16, height: 16 }}
        shape="square"
        src={thumbnail}
      />
      <span className={styles.content}>{label}</span>
    </div>
  );

  if (disabled && disabledTooltip) {
    tooltip = disabledTooltip;
  }

  if (tooltip) {
    content = (
      <Tooltip content={tooltip} position="left" spacing={40}>
        {content}
      </Tooltip>
    );
  }

  return content;
}

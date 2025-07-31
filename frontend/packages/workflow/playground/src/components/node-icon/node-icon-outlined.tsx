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

import { type FC, type CSSProperties } from 'react';

import classnames from 'classnames';
import { Image } from '@coze-arch/coze-design';

import styles from './node-icon-outlined.module.less';
export interface NodeIconOutlinedProps {
  borderRadius?: CSSProperties['borderRadius'];
  size?: number;
  icon?: string;
  hideOutline?: boolean;
  outlineColor?: string;
  style?: CSSProperties;
  className?: string;
}
export const NodeIconOutlined: FC<NodeIconOutlinedProps> = ({
  icon,
  size = 18,
  hideOutline,
  borderRadius = 'var(--coze-3)',
  outlineColor = 'var(--coz-stroke-primary)',
  className,
  style,
}) => (
  <div
    className={classnames(className, styles['node-icon-wrapper'])}
    style={{ borderRadius, width: size, height: size, ...style }}
  >
    <Image
      className={styles['node-icon']}
      style={{ borderRadius }}
      width={size}
      height={size}
      src={icon}
      preview={false}
    />
    {hideOutline ? null : (
      <div
        className={styles['node-icon-border']}
        style={{
          borderRadius,
          boxShadow: `inset 0 0 0 1px ${outlineColor}`,
        }}
      ></div>
    )}
  </div>
);

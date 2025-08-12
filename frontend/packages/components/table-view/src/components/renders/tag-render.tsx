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

import { type ReactNode } from 'react';

import classNames from 'classnames';
import { type TagColor } from '@coze-arch/coze-design/types';
import { Tag } from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface TagRenderProps {
  value: string | ReactNode;
  className?: string;
  size?: 'small' | 'mini';
  color?: TagColor;
}
export const TagRender = ({
  value,
  className,
  size,
  color,
}: TagRenderProps) => (
  <Tag
    className={classNames(className, styles['tag-render'])}
    size={size}
    color={color ?? 'primary'}
  >
    {value}
  </Tag>
);

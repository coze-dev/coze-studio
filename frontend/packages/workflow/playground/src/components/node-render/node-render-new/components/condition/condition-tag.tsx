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

import { type PropsWithChildren, type FC, type ReactNode } from 'react';

import classnames from 'classnames';
import { Tag, Tooltip } from '@coze-arch/coze-design';

import styles from './condition-tag.module.less';

export const ConditionTag: FC<
  PropsWithChildren<{
    tooltip?: ReactNode;
    invalid?: boolean;
  }>
> = props => {
  const color = props.invalid ? 'yellow' : 'primary';
  if (props.tooltip && !props.invalid) {
    return (
      <Tooltip content={props.tooltip}>
        <Tag
          color={color}
          className={classnames(
            styles['condition-tag'],
            'font-medium truncate w-full',
          )}
        >
          {props.children}
        </Tag>
      </Tooltip>
    );
  } else {
    return (
      <Tag
        color={color}
        className={classnames(
          styles['condition-tag'],
          'font-medium truncate w-full',
        )}
      >
        {props.children}
      </Tag>
    );
  }
};

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

import { type FC, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { type WithCustomStyle } from '@coze-workflow/base/types';

export const VariableTypeTag: FC<
  PropsWithChildren<
    WithCustomStyle<{
      size?: 'xs' | 'default';
    }>
  >
> = props => {
  const { children, className, size = 'default' } = props;
  return (
    <div
      className={classNames(
        {
          'py-[1px] px-[3px] ml-1 rounded-[4px] h-4': size === 'xs',
          'py-0.5 px-2 rounded-[6px] ml-2': size === 'default',
        },
        'shrink-0 flex items-center coz-mg-primary',
        className,
      )}
    >
      <span
        className={classNames(
          {
            'text-mini': size === 'xs',
            'text-xs': size === 'default',
          },
          'coz-fg-primary block',
        )}
      >
        {children}
      </span>
    </div>
  );
};

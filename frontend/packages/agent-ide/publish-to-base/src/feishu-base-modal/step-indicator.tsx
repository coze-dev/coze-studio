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

import { type CSSProperties, type FC } from 'react';

import classNames from 'classnames';

export const StepIndicator: FC<{
  number: number;
  className?: string;
  style?: CSSProperties;
}> = ({ number, className, style }) => (
  <div
    style={style}
    className={classNames(
      className,
      'coz-mg-hglt',
      'w-[20px]',
      'h-[20px]',
      'coz-fg-hglt',
      'text-[14px]',
      'font-medium',
      'flex',
      'items-center',
      'justify-center',
      'rounded-[50%]',
    )}
  >
    {number}
  </div>
);

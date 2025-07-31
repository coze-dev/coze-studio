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

import { Label } from './label';

export interface FieldLayoutProps {
  label?: ReactNode;
  labelExtra?: ReactNode;
  tooltip?: ReactNode;
  required?: boolean;
  layout?: 'vertical' | 'horizontal';
  children: ReactNode;
}

export const FieldLayout = ({
  label,
  labelExtra,
  tooltip,
  required = false,
  layout = 'horizontal',
  children,
}: FieldLayoutProps) =>
  label ? (
    <div className={layout === 'horizontal' ? 'flex gap-[4px] min-w-0' : ''}>
      <Label
        className={layout === 'horizontal' ? 'w-[148px]' : ''}
        required={required}
        tooltip={tooltip}
        extra={labelExtra}
      >
        {label}
      </Label>
      <div className="last:flex-1 min-w-0">{children}</div>
    </div>
  ) : (
    children
  );

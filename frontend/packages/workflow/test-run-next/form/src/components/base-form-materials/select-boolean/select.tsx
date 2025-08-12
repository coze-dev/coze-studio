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

import React, { useCallback, useMemo } from 'react';

import { clsx } from 'clsx';
import { Select, type SelectProps } from '@coze-arch/coze-design';

import css from './select.module.less';

interface SelectBooleanProps {
  className?: string;
  value?: boolean;
  onChange?: (v?: boolean) => void;
}

export const SelectBoolean: React.FC<SelectBooleanProps> = ({
  className,
  value,
  onChange,
  ...props
}) => {
  const formattedValue = useMemo(
    () => (value === undefined ? undefined : Number(value)),
    [value],
  );

  const handleChange = useCallback(
    (v?: SelectProps['value']) => {
      const next = v === undefined ? v : Boolean(v);
      onChange?.(next);
    },
    [onChange],
  );

  return (
    <Select
      className={clsx(css['select-boolean'], className)}
      size="small"
      value={formattedValue}
      onChange={handleChange}
      {...props}
    >
      <Select.Option value={1}>True</Select.Option>
      <Select.Option value={0}>False</Select.Option>
    </Select>
  );
};

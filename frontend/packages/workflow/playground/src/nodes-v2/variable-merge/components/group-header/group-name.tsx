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

import { type FC, useState, useRef } from 'react';

import { Input, type InputProps } from '@coze-arch/coze-design';

import { MAX_GROUP_NAME_COUNT } from '../../constants';

interface Props {
  value?: string;
  onChange: InputProps['onChange'];
  onBlur: InputProps['onBlur'];
  readonly?: boolean;
  disableEdit?: boolean;
}

/**
 * Group name, support double-click editing
 * @param props
 * @returns
 */
export const GroupName: FC<Props> = props => {
  const { value, onChange, readonly, disableEdit, onBlur } = props;

  const [isEdit, setIsEdit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (readonly || disableEdit) {
      return;
    }

    setIsEdit(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleBlur = e => {
    onBlur?.(e);
    setIsEdit(false);
  };

  if (isEdit) {
    return (
      <Input
        value={value}
        ref={inputRef}
        onBlur={handleBlur}
        onChange={onChange}
        size="small"
        className="w-full"
        maxLength={MAX_GROUP_NAME_COUNT}
      />
    );
  } else {
    return (
      <div
        className="text-xs font-medium coz-fg-primary hover:coz-mg-secondary-hovered cursor-pointer p-0.5 rounded-[4px] truncate"
        onClick={handleClick}
      >
        {value}
      </div>
    );
  }
};

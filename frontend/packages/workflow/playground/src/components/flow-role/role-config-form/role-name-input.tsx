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

import { useState, useEffect } from 'react';

import { Input } from '@coze-workflow/test-run/formily';

import { useGlobalState } from '@/hooks';

export const RoleNameInput = ({ value, onChange, onBlur, ...props }) => {
  const [innerValue, setInnerValue] = useState(value);
  const { info } = useGlobalState();

  const handleChange = (val: string) => {
    setInnerValue(val);
  };

  const handleBlur = () => {
    let nextValue = innerValue;
    // If the user deletes the character name, the original value needs to be backfilled after being out of focus
    if (!nextValue && value) {
      nextValue = value;
    }
    onChange(nextValue);
    setInnerValue(nextValue);
    onBlur();
  };

  useEffect(() => {
    if (value !== innerValue) {
      setInnerValue(value);
    }
  }, [value]);

  return (
    <Input
      value={innerValue}
      placeholder={info?.name}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
};

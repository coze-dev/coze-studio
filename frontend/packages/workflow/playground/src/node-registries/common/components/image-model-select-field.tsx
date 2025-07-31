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

import { type ComponentProps } from 'react';

import { EnumImageModel } from '@coze-workflow/setters';

import { withField, useField } from '@/form';

type ImageModelSelectProps = Omit<
  ComponentProps<typeof EnumImageModel>,
  'value' | 'onChange'
>;

/**
 * Image model selector
 */
export const ImageModelSelectField = withField<ImageModelSelectProps>(props => {
  const { value, readonly, onChange, errors } = useField<number>();

  return (
    <EnumImageModel
      value={value}
      readonly={readonly}
      onChange={newValue => onChange?.(newValue as number)}
      validateStatus={errors && errors.length > 0 ? 'error' : undefined}
      {...props}
    />
  );
});

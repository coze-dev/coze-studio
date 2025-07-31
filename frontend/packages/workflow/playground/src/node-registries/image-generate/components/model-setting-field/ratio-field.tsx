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

import { SizeSelect } from '@coze-workflow/components';

import { withField, useField } from '@/form';

const ratioOptions = [
  {
    label: '16:9 (1024*576)',
    value: {
      width: 1024,
      height: 576,
    },
  },
  {
    label: '3:2 (1024*682)',
    value: {
      width: 1024,
      height: 682,
    },
  },
  {
    label: '4:3 (1024*768)',
    value: {
      width: 1024,
      height: 768,
    },
  },
  {
    label: '1:1 (1024*1024)',
    value: {
      width: 1024,
      height: 1024,
    },
  },
  {
    label: '3:4 (768*1024)',
    value: {
      width: 768,
      height: 1024,
    },
  },
  {
    label: '2:3 (682*1024)',
    value: {
      width: 682,
      height: 1024,
    },
  },
  {
    label: '9:16 (576*1024)',
    value: {
      width: 576,
      height: 1024,
    },
  },
];

export const RatioField = withField(() => {
  const { value, readonly, onChange } = useField<{
    width?: number;
    height?: number;
  }>();

  return (
    <SizeSelect
      value={value}
      onChange={onChange}
      readonly={readonly}
      minWidth={512}
      maxWidth={1536}
      minHeight={512}
      maxHeight={1536}
      options={ratioOptions}
      layoutStyle="vertical"
    />
  );
});

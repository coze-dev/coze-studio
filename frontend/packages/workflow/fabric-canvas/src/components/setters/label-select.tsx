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

import { type FC } from 'react';

import { Select, type SelectProps } from '@coze-arch/coze-design';

type IProps = SelectProps & { label: string };
export const LabelSelect: FC<IProps> = props => {
  const { label, ...rest } = props;
  return (
    <div className="w-full flex gap-[8px] justify-between items-center text-[14px]">
      <div className="min-w-[80px]">{label}</div>
      <Select {...rest} />
    </div>
  );
};

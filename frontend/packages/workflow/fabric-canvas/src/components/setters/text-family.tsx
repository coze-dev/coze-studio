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

import { Cascader } from '@coze-arch/coze-design';

import s from './text-family.module.less';

interface IProps {
  value: string;
  onChange: (value: string) => void;
}
export const TextFamily: FC<IProps> = props => {
  // (props, ref) => {
  const { onChange, value, ...rest } = props;
  return (
    <Cascader
      {...rest}
      value={value?.split('-')?.reverse()}
      onChange={v => {
        onChange?.((v as string[])?.reverse()?.join('-'));
      }}
      dropdownClassName={s['imageflow-canvas-font-family-cascader']}
    />
  );
};

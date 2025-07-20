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
 
import React from 'react';

import { Form } from '@coze-arch/bot-semi';

import style from './index.module.less';

// TODO: hzf, 取名component有点奇怪
export type FormInputWithMaxCountProps = {
  maxCount: number;
} & React.ComponentProps<typeof Form.Input>;
// input后带上suffix，表示能够输入的最大字数
export const FormInputWithMaxCount = (props: FormInputWithMaxCountProps) => {
  const [count, setCount] = React.useState(0);
  const handleChange = (v: string) => {
    setCount(v.length);
  };
  const countSuffix = (
    <div
      className={style['form-input-with-count']}
    >{`${count}/${props.maxCount}`}</div>
  );
  return (
    <Form.Input
      {...props}
      onChange={value => handleChange(value)}
      suffix={countSuffix}
    />
  );
};

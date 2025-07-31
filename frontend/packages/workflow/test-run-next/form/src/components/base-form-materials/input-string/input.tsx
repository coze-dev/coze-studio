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

import clsx from 'clsx';
import { TextArea } from '@coze-arch/coze-design';

import css from './input.module.less';

export interface InputStringProps {
  value?: string;
}

export const InputString: React.FC<InputStringProps> = props => (
  <TextArea
    className={clsx(css['input-string'], css.small)}
    autosize={{ minRows: 1, maxRows: 5 }}
    rows={1}
    showClear
    {...props}
  />
);

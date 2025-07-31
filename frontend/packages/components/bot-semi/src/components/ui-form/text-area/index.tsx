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

import { forwardRef } from 'react';

import cs from 'classnames';
import { TextArea, withField } from '@douyinfe/semi-ui';

import s from './index.module.less';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TextAreaInner: any = withField(TextArea, {});

export const UIFormTextArea: typeof TextAreaInner = forwardRef(
  // @ts-expect-error -- to fix
  ({ fieldClassName, ...props }, ref) => (
    <TextAreaInner
      ref={ref}
      {...props}
      fieldClassName={cs(fieldClassName, s.field)}
    />
  ),
);

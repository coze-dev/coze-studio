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

import { FC, useRef } from 'react';

import cs from 'classnames';
import { InputProps } from '@douyinfe/semi-ui/lib/es/input';
import { CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form';
import { withField } from '@douyinfe/semi-ui';

import { Input } from '../../ui-input';

import s from './index.module.less';

const InputInner = withField(Input, {});

export const UIFormInput: FC<CommonFieldProps & InputProps> = ({
  fieldClassName,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      style={{
        // @ts-expect-error ts cannot recognize css custom variable
        '--var-error-msg-offset': props.addonBefore
          ? `${inputRef.current?.offsetLeft ?? 0}px`
          : '0px',
      }}
    >
      <InputInner
        {...props}
        fieldClassName={cs(fieldClassName, s.field)}
        ref={inputRef}
      />
    </div>
  );
};

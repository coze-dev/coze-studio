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

import cls from 'classnames';
import { connect, mapProps } from '@formily/react';
import { TextArea as TextAreaCore } from '@coze-arch/coze-design';

import css from './text-area.module.less';

export interface TextAreaProps {
  size?: string;
  className?: string;
}

const TextAreaAdapter: React.FC<TextAreaProps> = ({
  size,
  className,
  ...props
}) => (
  <TextAreaCore
    className={cls(
      {
        [css['text-area-small']]: size === 'small',
      },
      className,
    )}
    {...props}
  />
);

export const TextArea = connect(
  TextAreaAdapter,
  mapProps({ validateStatus: true }),
);

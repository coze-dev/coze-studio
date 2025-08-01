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

import classnames from 'classnames';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

type NotifyProps = SetterComponentProps;
import { Text } from '@/form-extensions/components/text';

export const Notify: FC<{
  text: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  // Whether to wrap
  isBreakLine?: boolean;
}> = ({ text, align = 'center', className = '', isBreakLine = false }) => (
  <div
    className={classnames(
      'w-full !px-[8px] !py-[6px] flex flex-row items-center coz-mg-hglt-secondary text-[14px]',

      {
        'justify-center': align === 'center',
        'justify-end': align === 'right',
        'justify-start': align === 'left',
      },
      className,
    )}
  >
    {isBreakLine ? text : <Text text={text} />}
  </div>
);

const NotifyField: FC<NotifyProps> = props => (
  <Notify text={props.options?.text} {...props.options} />
);

export const notify = {
  key: 'Notify',
  component: NotifyField,
};

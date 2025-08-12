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

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Form, Input, type InputProps } from '@coze-arch/coze-design';

import s from './index.module.less';

export const USER_NAME_MAX_LEN = 20;

interface InputWithCountProps extends InputProps {
  // Set word limits and display word count
  getValueLength?: (value?: InputProps['value'] | string) => number;
}

export interface UsernameInputProps
  extends Omit<
    InputWithCountProps,
    'prefix' | 'placeholder' | 'maxLength' | 'validateStatus'
  > {
  scene?: 'modal' | 'page';
  errorMessage?: string;
}

export const UsernameInput: React.FC<UsernameInputProps> = ({
  className,
  scene = 'page',
  errorMessage,
  ...props
}) => {
  const isError = Boolean(errorMessage);
  return (
    <>
      <Input
        className={classNames(
          s.input,
          isError && s.error,
          scene === 'modal' ? s.modal : s.page,
          className,
        )}
        validateStatus={isError ? 'error' : 'default'}
        prefix="@"
        placeholder={I18n.t('username_placeholder')}
        maxLength={USER_NAME_MAX_LEN}
        {...props}
      />
      <Form.ErrorMessage error={errorMessage} />
    </>
  );
};

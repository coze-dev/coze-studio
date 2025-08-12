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

import classnames from 'classnames';
import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { type InputProps } from '@coze-arch/bot-semi/Input';
import { Select } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface SLSelectRefType {
  triggerFocus?: () => void;
}

export type SLSelectProps = InputProps & {
  value: SelectProps['value'];
  handleChange?: (v: SelectProps['value']) => void;
  errorMsg?: string;
  errorMsgFloat?: boolean;
  selectProps?: SelectProps & {
    'data-testid'?: string;
    'data-dtestid'?: string;
  };
};

export const SLSelect: React.FC<SLSelectProps> = props => {
  const { errorMsg, errorMsgFloat } = props;
  return (
    <div
      className={classnames({
        [s['select-wrapper']]: true,
        [s['error-wrapper']]: Boolean(errorMsg),
      })}
    >
      <Select
        {...props.selectProps}
        style={{ width: '100%' }}
        value={props.value}
        onChange={v => {
          props?.handleChange?.(v);
        }}
        dropdownClassName={s['selected-option']}
      />
      {errorMsg ? (
        <div
          className={classnames({
            [s['error-content']]: true,
            [s['error-float']]: Boolean(errorMsgFloat),
          })}
        >
          <div className={s['error-text']}>{errorMsg}</div>
        </div>
      ) : null}
    </div>
  );
};

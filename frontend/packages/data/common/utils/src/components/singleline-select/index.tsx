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

import cs from 'classnames';
import { useReactive } from 'ahooks';
import { Select, type SelectProps } from '@coze-arch/coze-design';
import type { InputProps } from '@coze-arch/bot-semi/Input';
import { CommonE2e } from '@coze-data/e2e';

import s from './index.module.less';

export interface SLSelectRefType {
  triggerFocus?: () => void;
}

export type SinglelineSelectProps = InputProps & {
  value: SelectProps['value'];
  handleChange?: (v: SelectProps['value']) => void;
  errorMsg?: string;
  selectProps?: SelectProps;
};

export const SinglelineSelect: React.FC<SinglelineSelectProps> = props => {
  const $state = useReactive({
    value: props.value,
  });

  return (
    <div
      data-testid={CommonE2e.CommonDataTypeSelect}
      className={cs(
        s['select-wapper'],
        props?.errorMsg ? s['error-wapper'] : null,
      )}
    >
      <Select
        {...props.selectProps}
        style={{ width: '100%' }}
        clickToHide={true}
        value={$state.value}
        onChange={v => {
          ($state.value as SelectProps['value']) = v;
          props?.handleChange?.(v);
        }}
      />
      {props?.errorMsg ? (
        <div className="singleline-select-error-content">
          <div className="select-error-text">{props?.errorMsg}</div>
        </div>
      ) : null}
    </div>
  );
};

export default SinglelineSelect;

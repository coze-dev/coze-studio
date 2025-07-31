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
import { Switch, withField, type SwitchProps } from '@coze-arch/coze-design';

function SwitchWithDesc({
  value,
  onChange,
  className,
  desc,
  descClassName,
  switchClassName,
  ...rest
}: Omit<SwitchProps, 'checked'> & {
  value?: boolean;
  desc: string;
  descClassName?: string;
  switchClassName?: string;
}) {
  return (
    <div className={cls('flex items-center justify-between', className)}>
      <span className={cls('coz-fg-primary', descClassName)}>{desc}</span>
      <Switch
        size="small"
        {...rest}
        checked={value}
        onChange={onChange}
        className={cls('shrink-0', switchClassName)}
      />
    </div>
  );
}

export const FormSwitch = withField(SwitchWithDesc);

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
import { CascaderProps } from '@douyinfe/semi-ui/lib/es/cascader';
import { Cascader, withField } from '@douyinfe/semi-ui';

import s from './index.module.less';

export function UICascader({
  dropdownClassName,
  className,
  ...props
}: CascaderProps) {
  return (
    <Cascader
      {...props}
      className={cls(className, s['ui-cascader'])}
      dropdownClassName={cls(dropdownClassName, s['ui-cascader-dropdown'])}
    />
  );
}

UICascader.FormItem = withField(UICascader);
export default UICascader;

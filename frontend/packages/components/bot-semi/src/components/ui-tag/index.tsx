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

import { LegacyRef, forwardRef } from 'react';

import cls from 'classnames';
import { TagProps, TagColor } from '@douyinfe/semi-ui/lib/es/tag/interface';
import { Tag } from '@douyinfe/semi-ui';

import s from './index.module.less';

export type UITagProps = TagProps;
export { TagColor };

export const UITag = forwardRef(
  ({ className, ...props }: UITagProps, ref: LegacyRef<Tag>) => (
    <Tag {...props} className={cls(s['ui-tag'], className)} ref={ref} />
  ),
);

export default UITag;

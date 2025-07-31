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

import css from './base-group-wrap.module.less';

interface BaseGroupWrapProps {
  title?: React.ReactNode;
}

export const BaseGroupWrap: React.FC<
  React.PropsWithChildren<BaseGroupWrapProps>
> = ({ title, children }) => (
  <div className={css['group-wrap']}>
    {title ? <div className={css.title}>{title}</div> : null}
    {children}
  </div>
);

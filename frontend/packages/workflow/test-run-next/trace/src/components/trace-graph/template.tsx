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

import { IconCozIllusEmpty } from '@coze-arch/coze-design/illustrations';
import { Spin } from '@coze-arch/coze-design';

import css from './template.module.less';

export const EmptyTemplate = () => (
  <div className={css['full-template']}>
    <IconCozIllusEmpty width="100px" height="100px" />
  </div>
);

export const LoadingTemplate = () => (
  <div className={css['full-template']}>
    <Spin />
  </div>
);

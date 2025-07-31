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

/* eslint-disable  @typescript-eslint/naming-convention*/
import { I18n } from '@coze-arch/i18n';
import { LoopType } from '../../constants';

export const LoopTypeOptions = [
  {
    value: LoopType.Array,
    label: I18n.t('workflow_loop_type_array'),
  },
  {
    value: LoopType.Count,
    label: I18n.t('workflow_loop_type_count'),
  },
  {
    value: LoopType.Infinite,
    label: I18n.t('workflow_loop_type_infinite'),
  },
];

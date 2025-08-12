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

import { ConditionLogic } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

export const LogicDisplay: FC<{
  logic: ConditionLogic;
}> = ({ logic }) => (
  <div className="relative text-center py-1">
    <div className="absolute top-[50%] -mt-[1px] coz-stroke-primary w-full border-0 border-b border-solid" />
    <span className="min-w-[28px] relative inline-block coz-bg-max">
      {logic === ConditionLogic.AND
        ? I18n.t('workflow_detail_condition_and')
        : I18n.t('workflow_detail_condition_or')}
    </span>
  </div>
);

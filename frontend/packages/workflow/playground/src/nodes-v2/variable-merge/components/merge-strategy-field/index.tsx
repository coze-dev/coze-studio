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

import { I18n } from '@coze-arch/i18n';
import { Select, Tooltip } from '@coze-arch/coze-design';

import { InfoIcon } from '../info-icon';

/**
 * Variable aggregation strategy
 * @param param0
 * @returns
 */
export const MergeStrategyField = ({
  readonly = false,
}: {
  readonly: boolean;
}) => (
  <p className="pb-4">
    <div className="flex items-center text-xs font-medium gap-1">
      <span>{I18n.t('workflow_var_merge_strategy')}</span>
      <InfoIcon
        tooltip={I18n.t('workflow_var_merge_ strategy_tooltips')}
      ></InfoIcon>
    </div>

    <Tooltip content={I18n.t('workflow_var_merge_strategy_hovertips')}>
      <div className="w-full mt-1">
        <Select
          disabled={readonly}
          optionList={[]}
          size="small"
          className="w-full"
        >
          <Select.Option>
            {I18n.t('workflow_var_merge_ strategy_returnnotnull')}
          </Select.Option>
        </Select>
      </div>
    </Tooltip>
  </p>
);

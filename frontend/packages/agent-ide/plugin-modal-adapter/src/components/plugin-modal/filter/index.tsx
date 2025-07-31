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

import { I18n } from '@coze-arch/i18n';
import { UISelect, Select } from '@coze-arch/bot-semi';
import { OrderBy } from '@coze-arch/bot-api/developer_api';
import { PluginFilterType } from '@coze-agent-ide/plugin-shared';
import { type From, type PluginQuery } from '@coze-agent-ide/plugin-shared';

import s from './index.module.less';

export interface PluginModalFilterProp {
  query: PluginQuery;
  setQuery: (value: Partial<PluginQuery>, refreshPage?: boolean) => void;
  from?: From;
}

const timeOptions = [
  {
    label: I18n.t('Create_time'),
    value: OrderBy.CreateTime,
  },
  {
    label: I18n.t('Update_time'),
    value: OrderBy.UpdateTime,
  },
];

export const PluginModalFilter: FC<PluginModalFilterProp> = ({
  query,
  setQuery,
}) => {
  /**
   * Space Plugin: Create and Edit Time Sorting
   * Public plugins: popularity, release time ranking
   * */
  const getFilterItem = () => {
    if (
      query.type === PluginFilterType.Mine ||
      query.type === PluginFilterType.Team ||
      query.type === PluginFilterType.Project
    ) {
      return (
        <UISelect
          label={I18n.t('Sort')}
          value={query.orderBy}
          optionList={timeOptions}
          onChange={v => {
            setQuery({
              orderBy: v as OrderBy,
            });
          }}
        >
          <Select.Option value={OrderBy.CreateTime}>
            {I18n.t('Create_time')}
          </Select.Option>
          <Select.Option value={OrderBy.UpdateTime}>
            {I18n.t('Edit_time_2')}
          </Select.Option>
        </UISelect>
      );
    }

    return null;
  };

  return <div className={s['plugin-modal-filter']}>{getFilterItem()}</div>;
};

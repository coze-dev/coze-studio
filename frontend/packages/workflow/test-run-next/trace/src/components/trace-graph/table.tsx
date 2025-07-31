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

import { isUndefined } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Table } from '@coze-arch/coze-design';
import { type TraceFrontendSpan } from '@coze-arch/bot-api/workflow_api';

import { formatDuration, getTokensFromSpan } from '../../utils';

import css from './table.module.less';

interface TraceTableProps {
  spans: TraceFrontendSpan[];
}

export const TraceTable: React.FC<TraceTableProps> = ({ spans }) => {
  const columns = [
    {
      title: I18n.t('platfrom_trigger_creat_name'),
      dataIndex: 'name',
    },
    {
      title: I18n.t('debug_asyn_task_task_status'),
      dataIndex: 'status_code',
      render: data =>
        data === 0
          ? I18n.t('debug_asyn_task_task_status_success')
          : I18n.t('debug_asyn_task_task_status_failed'),
      width: 78,
    },
    {
      title: I18n.t('analytic_query_table_title_tokens'),
      render: (_, row) => {
        const v = getTokensFromSpan(row);
        return isUndefined(v) ? '-' : v;
      },
      width: 78,
    },
    {
      title: I18n.t('db_add_table_field_type_time'),
      dataIndex: 'duration',
      render: formatDuration,
      width: 78,
    },
  ];

  return (
    <div className={css['trace-table']}>
      <Table
        tableProps={{
          dataSource: spans,
          rowKey: 'span_id',
          columns,
          size: 'small',
        }}
      />
    </div>
  );
};

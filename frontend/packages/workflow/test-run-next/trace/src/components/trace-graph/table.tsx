import { isUndefined } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import { Table } from '@coze/coze-design';
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

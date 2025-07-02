import { Table } from '@coze-arch/bot-semi';
import { type BotTable } from '@coze-arch/bot-api/memory';
import { I18n } from '@coze-arch/i18n';

import { TagList } from '../tag-list';

import styles from './table-info.module.less';

interface TableInfoProps {
  data?: BotTable[];
}

export const TableInfo: React.FC<TableInfoProps> = ({
  data = [{ table_name: 'none' }],
}) => {
  const columns = [
    {
      title: I18n.t('db_add_table_name'),
      dataIndex: 'table_name',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: I18n.t('db_add_table_field_name'),
      dataIndex: 'field_list',
      render: (fieldList: BotTable['field_list']) => {
        if (fieldList && fieldList.length > 0) {
          return (
            <TagList
              tags={(fieldList ?? []).map(({ name }) => name || '')}
              max={3}
            />
          );
        }

        return 'none';
      },
    },
  ];

  return (
    <Table
      className={styles.table}
      columns={columns}
      dataSource={data}
      pagination={false}
    />
  );
};

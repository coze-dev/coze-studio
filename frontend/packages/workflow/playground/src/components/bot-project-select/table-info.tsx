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
import { Table } from '@coze-arch/bot-semi';
import { type BotTable } from '@coze-arch/bot-api/memory';

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

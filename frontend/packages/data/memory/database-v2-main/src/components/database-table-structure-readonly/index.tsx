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

import { useEffect, useRef, useState } from 'react';

import { type TableMemoryItem } from '@coze-studio/bot-detail-store';
import {
  FIELD_TYPE_OPTIONS,
  SYSTEM_FIELDS,
} from '@coze-data/database-v2-base/constants';
import { DatabaseFieldTitle } from '@coze-data/database-v2-base/components/database-field-title';
import { I18n } from '@coze-arch/i18n';
import { Image, Table, type ColumnProps } from '@coze-arch/coze-design';

import keyExample from '../../assets/key-example.png';

import s from './index.module.less';

function getTableStructureColumns(): ColumnProps<TableMemoryItem>[] {
  // The field header content comes from../database-table-structure/index.tsx: 578
  return [
    {
      title: (
        <DatabaseFieldTitle
          field={I18n.t('db_add_table_field_name')}
          tip={
            <article className="w-[494px]">
              <p className="mb-[8px]">
                {I18n.t('db_add_table_field_name_tips')}
              </p>
              <Image
                preview={false}
                width={494}
                height={163}
                src={keyExample}
              />
            </article>
          }
        />
      ),
      dataIndex: 'name',
      width: 261,
    },
    {
      title: (
        <DatabaseFieldTitle
          field={I18n.t('db_add_table_field_desc')}
          tip={
            <article className="w-[327px]">
              {I18n.t('db_add_table_field_desc_tips')}
            </article>
          }
        />
      ),
      dataIndex: 'desc',
    },
    {
      title: (
        <DatabaseFieldTitle
          field={I18n.t('db_add_table_field_type')}
          tip={
            <article className="w-[327px]">
              {I18n.t('db_add_table_field_type_tips')}
            </article>
          }
        />
      ),
      dataIndex: 'type',
      width: 214,
      render: (_, record) =>
        FIELD_TYPE_OPTIONS.find(i => i.value === record.type)?.label ??
        record.type,
    },
    {
      title: (
        <DatabaseFieldTitle
          field={I18n.t('db_add_table_field_necessary')}
          tip={
            <article className="w-[327px]">
              <p>{I18n.t('db_add_table_field_necessary_tips1')}</p>
              <p>{I18n.t('db_add_table_field_necessary_tips2')}</p>
            </article>
          }
        />
      ),
      dataIndex: 'must_required',
      width: 108,
      render: (_, record) =>
        I18n.t(record.must_required ? 'db_optimize_037' : 'db_optimize_038'),
    },
  ];
}

export interface DatabaseTableStructureReadonlyProps {
  loading?: boolean;
  fieldList: TableMemoryItem[];
}

export function DatabaseTableStructureReadonly({
  loading,
  fieldList,
}: DatabaseTableStructureReadonlyProps) {
  const columns = getTableStructureColumns();
  const dataSource = SYSTEM_FIELDS.concat(fieldList);

  const [tableHeight, setTableHeight] = useState(0);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const e of entries) {
        if (e.target === tableWrapperRef.current) {
          setTableHeight(e.contentRect.height);
        }
      }
    });
    if (tableWrapperRef.current) {
      observer.observe(tableWrapperRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-full mt-[8px]" ref={tableWrapperRef}>
      <Table
        tableProps={{
          loading,
          columns,
          dataSource,
          scroll: {
            // The height of the watch header is 40px.
            y: tableHeight > 40 ? tableHeight - 40 : 'auto',
          },
        }}
        className={s['table-structure-wrapper']}
      />
    </div>
  );
}

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

import { useCurrentDatabaseID, useCurrentDatabaseQuery } from '@/hooks';
import { useOpenDatabaseDetail } from '@/components/database-detail-modal';

import { Field, OverflowTagList } from '../../fields';

export function Database() {
  const databaseID = useCurrentDatabaseID();
  const { data: database } = useCurrentDatabaseQuery();
  const { openDatabaseDetail } = useOpenDatabaseDetail();

  const list = database
    ? [
        {
          icon: (
            <img
              src={database.iconUrl}
              className="w-[16px] h-[16px] rounded-mini"
            />
          ),
          // The operation and maintenance platform can directly display the ID, because the operation and maintenance platform cannot pull the actual database information.
          label: IS_BOT_OP ? databaseID : database.tableName,
        },
      ]
    : [];

  return (
    <Field
      label={I18n.t('workflow_database_node_database_table_title')}
      isEmpty={!database}
    >
      <div
        className="inline-flex cursor-pointer"
        onClick={() => openDatabaseDetail()}
      >
        <OverflowTagList value={list} />
      </div>
    </Field>
  );
}

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

import { type ColumnProps } from '@coze-arch/coze-design';
import { type PersonalAccessToken } from '@coze-arch/bot-api/pat_permission_api';

import { columnStatusConf } from './column-status';
import { ColumnOpBody, columnOpConf } from './column-op';
import { columnNameConf } from './column-name';
import { columnLastUseAtConf } from './column-last-use-at';
import { columnExpireAtConf } from './column-expire-at';
import { columnCreateAtConf } from './column-create-at';
export const getTableColumnConf = ({
  onEdit,
  onDelete,
}: {
  onEdit: (v: PersonalAccessToken) => void;
  onDelete: (id: string) => void;
}): ColumnProps<PersonalAccessToken>[] => [
  columnNameConf(),
  columnCreateAtConf(),
  columnLastUseAtConf(),
  columnExpireAtConf(),
  columnStatusConf(),
  {
    ...columnOpConf(),
    render: (_, record) => (
      <ColumnOpBody {...{ record, isCurrentUser: true, onEdit, onDelete }} />
    ),
  },
];

export const patColumn = {
  columnNameConf,
  columnCreateAtConf,
  columnLastUseAtConf,
  columnExpireAtConf,
  columnStatusConf,
  ColumnOpBody,
  columnOpConf,
};

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
import { formatDate, formatNumber } from '@coze-arch/bot-utils';
import { type ColumnProps } from '@coze-arch/bot-semi/Table';
import { Avatar, Typography, UITag } from '@coze-arch/bot-semi';
import { type MockSet } from '@coze-arch/bot-api/debugger_api';
import { LongTextWithTooltip } from '@coze-agent-ide/bot-plugin-mock-set/long-text-with-tooltip';

export function getDisplayCols(isPersonal?: boolean): ColumnProps<MockSet>[] {
  const basicCols: ColumnProps<MockSet>[] = [
    {
      title: I18n.t('mockset_name'),
      dataIndex: 'name',
      className: 'min-w-[200px]',
      render: (_v, record: MockSet) => (
        <div>
          <div className="flex items-center">
            <Typography.Text
              strong
              ellipsis={{
                showTooltip: {
                  opts: { style: { wordBreak: 'break-word' } },
                },
              }}
              className="min-w-[0px]"
            >
              {record.name || '-'}
            </Typography.Text>
            {record?.schemaIncompatible ? (
              <UITag className="ml-[10px]" shape="circle" color="orange">
                {I18n.t('update_required')}
              </UITag>
            ) : null}
          </div>

          {record.description ? (
            <LongTextWithTooltip>{record.description}</LongTextWithTooltip>
          ) : (
            '-'
          )}
        </div>
      ),
    },
    {
      title: I18n.t('mock_data_counts'),
      dataIndex: 'mockRuleQuantity',
      width: 116,
      render: (_v, record) => {
        if (record.mockRuleQuantity === undefined) {
          return '-';
        }
        return (
          <Typography.Text
            ellipsis={{ showTooltip: true }}
            className="text-[#1C1D2359]"
          >
            {formatNumber(record.mockRuleQuantity)}
          </Typography.Text>
        );
      },
    },
    {
      title: I18n.t('edit_time'),
      dataIndex: 'updateTimeInSec',
      width: 150,
      sorter: true,
      render: (_v, record) => {
        if (!record.updateTimeInSec) {
          return '-';
        }
        return (
          <div>
            {formatDate(Number(record.updateTimeInSec), 'YYYY-MM-DD HH:mm')}
          </div>
        );
      },
    },
  ];
  const creatorInfoCol: ColumnProps<MockSet>[] = [
    {
      title: I18n.t('creators'),
      dataIndex: 'creatorID',
      width: 132,
      render: (_v, record) => {
        if (!record.creator?.ID) {
          return '-';
        }
        return (
          <div className="flex items-center">
            <Avatar
              src={record.creator?.avatarUrl}
              size="extra-extra-small"
              className="mr-[8px]"
              alt="User"
            ></Avatar>
            <Typography.Text
              ellipsis={{ showTooltip: true }}
              className="flex-1 text-[#1C1D2359]"
            >
              {record.creator?.name}
            </Typography.Text>
          </div>
        );
      },
    },
  ];
  return isPersonal ? basicCols : [...basicCols, ...creatorInfoCol];
}

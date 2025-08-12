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

import dayjs from 'dayjs';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { IllustrationNoContent } from '@douyinfe/semi-illustrations';
import { I18n } from '@coze-arch/i18n';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { type KVItem } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import {
  IconCozRefresh,
  IconCozCrossCircleFill,
} from '@coze-arch/coze-design/icons';
import {
  Table,
  Select,
  IconButton,
  Tooltip,
  Empty,
} from '@coze-arch/coze-design';

export interface VariablesValueProps {
  projectID: string;
  version?: string;
}

export function VariablesValue({ projectID, version }: VariablesValueProps) {
  const { loading, data, refresh } = useRequest(async () => {
    const res = await MemoryApi.GetPlayGroundMemory({
      project_id: projectID,
      ...(version ? { version } : {}),
    });
    return res.memories ?? [];
  });

  const handleClear = async (item: KVItem) => {
    if (!item.keyword) {
      return;
    }

    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      project_id: projectID,
      resource_type: 'variable',
      action: 'reset',
      source: 'app_detail_page',
      source_detail: 'memory_preview',
    });

    await MemoryApi.DelProfileMemory({
      project_id: projectID,
      keywords: [item.keyword],
    });

    refresh();
  };

  const handleReset = async () => {
    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      project_id: projectID,
      resource_type: 'variable',
      action: 'reset',
      source: 'app_detail_page',
      source_detail: 'memory_preview',
    });

    await MemoryApi.DelProfileMemory({ project_id: projectID });

    refresh();
  };

  return (
    <div
      className={classNames(
        'h-full p-4',
        '[&_.semi-table-row]:!bg-transparent',
        '[&_.semi-table-row-head]:!bg-transparent',
        '[&_.semi-table-row-cell]:text-[14px]',
      )}
    >
      <Table
        useHoverStyle={false}
        empty={
          <Empty
            image={<IllustrationNoContent className="w-[140px] h-[140px]" />}
            title={I18n.t('variables_user_data_empty')}
          />
        }
        tableProps={{
          loading,
          dataSource: data,
          columns: [
            {
              title: I18n.t('variable_Table_Title_name'),
              dataIndex: 'keyword',
              width: 300,
            },
            {
              title: (
                <div className={'flex items-center'}>
                  <span className={'mr-4px'}>
                    {I18n.t('variable_Table_Title_value')}
                  </span>
                  <Tooltip
                    theme={'dark'}
                    content={I18n.t('variable_Button_reset_variable')}
                  >
                    <IconButton
                      color={'primary'}
                      icon={<IconCozRefresh />}
                      size={'small'}
                      onClick={handleReset}
                    />
                  </Tooltip>
                </div>
              ),
              dataIndex: 'value',
              render: (value: string, item: KVItem) => {
                const schema = typeSafeJSONParse(item?.schema) as
                  | { readonly?: boolean }
                  | undefined;

                if (schema?.readonly) {
                  return value;
                }

                return (
                  <Select
                    className="w-full truncate"
                    value={value}
                    showArrow={false}
                    showClear={true}
                    emptyContent={null}
                    onClear={() => handleClear(item)}
                    clearIcon={
                      <IconButton
                        theme={'borderless'}
                        color={'secondary'}
                        icon={<IconCozCrossCircleFill />}
                        size={'large'}
                      />
                    }
                  />
                );
              },
            },
            {
              title: I18n.t('variable_Table_Title_edit_time'),
              align: 'left',
              dataIndex: 'update_time',
              width: 150,
              render: (time: number, item: KVItem) =>
                item.value && dayjs.unix(time).format('YYYY-MM-DD HH:mm'),
            },
          ],
        }}
      />
    </div>
  );
}

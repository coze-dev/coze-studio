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

import { useShallow } from 'zustand/react/shallow';
import { ToolItem, ToolItemAction, ToolItemList } from '@coze-agent-ide/tool';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  saveTableMemory,
  useBotDetailIsReadonly,
  type DatabaseInfo,
} from '@coze-studio/bot-detail-store';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { IconCozMinusCircle, IconCozEdit } from '@coze-arch/coze-design/icons';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { Popconfirm, Toast } from '@coze-arch/bot-semi';
import { IconWarningSize24 } from '@coze-arch/bot-icons';
import { type BindDatabaseToBotResponse } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { DataNamespace, dataReporter } from '@coze-data/reporter';

import { reloadDatabaseList } from '../helpers/reload-database-list';
import DatabaseIcon from '../../../assets/image/database.svg';
import { PromptSettingsButton } from './prompt-settings-button';

import s from './index.module.less';

interface DatabaseItemProps {
  handleEdit: (tableId: string) => void;
}
export const DatabaseList: React.FC<DatabaseItemProps> = ({ handleEdit }) => {
  const botId = useBotInfoStore(innerS => innerS.botId);
  const isReadonly = useBotDetailIsReadonly();

  const { databaseList } = useBotSkillStore(
    useShallow(detail => ({
      databaseList: detail.databaseList,
    })),
  );
  const hasDatabase = databaseList.length > 0;

  const editTable = (item: DatabaseInfo) => {
    if (isReadonly) {
      return;
    }
    const { tableId, name } = item;
    sendTeaEvent(EVENT_NAMES.memory_click_front, {
      bot_id: botId,
      resource_id: tableId,
      resource_name: name,
      resource_type: 'database',
      action: 'edit',
      source: 'bot_detail_page',
      source_detail: 'memory_manage',
    });

    handleEdit(item.tableId);
  };

  const deleteTable = async (item: DatabaseInfo) => {
    const { tableId } = item;

    let resp: BindDatabaseToBotResponse | undefined;
    try {
      resp = await MemoryApi.UnBindDatabase({
        database_id: tableId,
        bot_id: botId,
      });
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.DATABASE, {
        eventName: REPORT_EVENTS.DatabaseDeleteTable,
        error: error as Error,
      });
      return;
    }

    if (resp?.code === 0) {
      await reloadDatabaseList();
      await saveTableMemory();
      Toast.success({
        content: I18n.t('Delete_success'),
        showClose: false,
      });
    } else {
      Toast.warning({
        content: I18n.t('Delete_failed'),
        showClose: false,
      });
    }
  };

  return (
    <div className={s['database-list']}>
      {hasDatabase ? (
        <ToolItemList>
          {databaseList.map(item => (
            <ToolItem
              key={item.tableId}
              title={item?.name ?? ''}
              description={item?.desc ?? ''}
              avatar={DatabaseIcon}
              onClick={() => editTable(item)}
              actions={
                isReadonly ? null : (
                  <>
                    <PromptSettingsButton
                      botId={botId}
                      databaseId={item.tableId}
                      promptDisabled={item.extra_info.prompt_disabled}
                    />
                    <ToolItemAction
                      tooltips={I18n.t('db_edit_table_title')}
                      onClick={() => editTable(item)}
                    >
                      <IconCozEdit className="text-base coz-fg-secondary" />
                    </ToolItemAction>
                    <ToolItemAction tooltips={I18n.t('db_del_table_title')}>
                      <Popconfirm
                        style={{ width: 400 }}
                        okType="danger"
                        title={I18n.t('db_del_table_confirm_title')}
                        position="rightTop"
                        content={I18n.t('db_del_table_confirm_info')}
                        onConfirm={() => deleteTable(item)}
                        icon={<IconWarningSize24 />}
                      >
                        <IconCozMinusCircle
                          className="text-base coz-fg-secondary"
                          onClick={() => {
                            sendTeaEvent(EVENT_NAMES.memory_click_front, {
                              bot_id: botId,
                              resource_id: item.tableId,
                              resource_name: item.name,
                              resource_type: 'database',
                              action: 'delete',
                              source: 'bot_detail_page',
                              source_detail: 'memory_manage',
                            });
                          }}
                        />
                      </Popconfirm>
                    </ToolItemAction>
                  </>
                )
              }
            />
          ))}
        </ToolItemList>
      ) : (
        <div className={s['default-text']}>{I18n.t('db_notable_tips')}</div>
      )}
    </div>
  );
};

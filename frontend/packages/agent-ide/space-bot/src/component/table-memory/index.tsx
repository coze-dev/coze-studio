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

/* eslint-disable @coze-arch/max-line-per-function */
import { useParams, useNavigate } from 'react-router-dom';
import React, { type FC, useState, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { saveTableMemory } from '@coze-studio/bot-detail-store';
import { DataErrorBoundary, DataNamespace } from '@coze-data/reporter';
import { SelectDatabaseModal } from '@coze-data/database-v2';
import { I18n } from '@coze-arch/i18n';
import { OpenBlockEvent } from '@coze-arch/bot-utils';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { Image, Typography } from '@coze-arch/bot-semi';
import { useDefaultExPandCheck } from '@coze-arch/bot-hooks';
import { MemoryApi } from '@coze-arch/bot-api';
import { SkillKeyEnum } from '@coze-agent-ide/tool-config';
import {
  AddButton,
  ToolContentBlock,
  useToolValidData,
  type ToolEntryCommonProps,
} from '@coze-agent-ide/tool';
import { Toast } from '@coze-arch/coze-design';

import tableExample from '../../assets/image/table-memory/table-example.png';
import tableExampleCn from '../../assets/image/table-memory/table-example-cn.png';
import { useExpertModeConfig } from './hooks/use-expert-mode-config';
import { reloadDatabaseList } from './helpers/reload-database-list';
import { DatabaseList } from './datebase-list';

import s from './index.module.less';

export { reloadDatabaseList, useExpertModeConfig };

export interface TableMemoryProps extends ToolEntryCommonProps {
  actionButtonSlot?: React.ReactNode;
  onCloseSelectModal?: () => void;
}

const BaseTableMemory: FC<TableMemoryProps> = ({
  title,
  actionButtonSlot,
  onCloseSelectModal,
}) => {
  const navigate = useNavigate();

  const setToolValidData = useToolValidData();
  const [createDatabaseVisible, setCreateDatabaseVisible] =
    useState<boolean>(false);

  const { botId } = useBotInfoStore(
    useShallow(detail => ({
      botId: detail.botId,
    })),
  );
  const { databaseList } = useBotSkillStore(
    useShallow(detail => ({
      databaseList: detail.databaseList,
    })),
  );

  const { space_id: spaceId = '' } = useParams();
  const expertModeConfig = useExpertModeConfig({ botId });

  const hasDatabase = databaseList.length > 0;
  const exceedMaxDatabaseCount =
    databaseList.length >= expertModeConfig.maxTableNum;

  const defaultExpand = useDefaultExPandCheck({
    blockKey: SkillKeyEnum.TABLE_MEMORY_BLOCK,
    configured: hasDatabase,
  });

  const onRemoveDatabase = async (
    databaseId: string,
    removeCallback?: () => void,
  ) => {
    const res = await MemoryApi.UnBindDatabase({
      database_id: databaseId,
      bot_id: botId,
    });
    if (res.code === 0) {
      Toast.success(I18n.t('new_db_003'));
      if (removeCallback) {
        removeCallback?.();
      }
      // Update list
      await reloadDatabaseList();
      // Update bot draft
      await saveTableMemory();
    } else {
      Toast.error(res.msg);
    }
  };

  const onCreateDatabase = async (databaseId: string, draftId: string) => {
    // NOTE: Bind/unbind the bot database, you need to pass in the draft_id of DatabaseInfo
    await MemoryApi.BindDatabase({
      database_id: draftId,
      bot_id: botId,
    });
    // Update list
    await reloadDatabaseList();
    // Update bot draft
    await saveTableMemory();
  };

  const onAddDatabase = async (
    databaseId: string,
    addCallback?: () => void,
  ) => {
    const res = await MemoryApi.BindDatabase({
      database_id: databaseId,
      bot_id: botId,
    });
    if (res.code === 0) {
      Toast.success(I18n.t('new_db_002'));
      if (addCallback) {
        addCallback?.();
      }
      // Update list
      await reloadDatabaseList();
      // Update bot draft
      await saveTableMemory();
    } else {
      Toast.error(res.msg);
    }
  };

  const onClickDatabase = async (id: string) => {
    if (id) {
      const res = await MemoryApi.GetOnlineDatabaseId({
        id,
      });
      navigate(
        `/space/${spaceId}/database/${res.id}?page_mode=modal&bot_id=${botId}&biz=bot_add`,
      );
    }
  };

  const onEditDatabase = async (id: string) => {
    const res = await MemoryApi.GetOnlineDatabaseId({
      id,
    });
    if (res.id) {
      navigate(
        `/space/${spaceId}/database/${res.id}?page_mode=modal&bot_id=${botId}&biz=bot_remove&initial_tab=draft`,
      );
    } else {
      Toast.error('当前 Database 可能未发布');
    }
  };

  useEffect(() => {
    setToolValidData(hasDatabase);
  }, [hasDatabase]);

  return (
    <>
      <ToolContentBlock
        blockEventName={OpenBlockEvent.TABLE_MEMORY_BLOCK_OPEN}
        showBottomBorder
        header={title}
        tooltip={
          <div className={s['tip-content']}>
            <div style={{ marginBottom: '10px', width: 611 }}>
              <span>{I18n.t('db_memory_entry_tips')}</span>
              <Typography.Text
                style={{
                  fontWeight: 400,
                }}
                link={{
                  href: '/open/docs/guides/database',
                  target: '_blank',
                }}
                onClick={() => {
                  sendTeaEvent(EVENT_NAMES.database_learn_click, {
                    need_login: true,
                    have_access: true,
                    bot_id: botId,
                  });
                }}
              >
                {I18n.t('database_learnmore')}
              </Typography.Text>
            </div>
            <Image
              preview={false}
              width={611}
              height={145}
              src={
                FEATURE_ENABLE_DATABASE_TABLE ? tableExampleCn : tableExample
              }
            />
          </div>
        }
        defaultExpand={defaultExpand}
        actionButton={
          <>
            {actionButtonSlot}
            <AddButton
              tooltips={
                exceedMaxDatabaseCount
                  ? I18n.t('database_240304_01', {
                      TableNumber: expertModeConfig.maxTableNum,
                    })
                  : I18n.t('bot_edit_database_add_tooltip')
              }
              onClick={() => {
                sendTeaEvent(EVENT_NAMES.memory_click_front, {
                  bot_id: botId,
                  resource_type: 'database',
                  action: 'add',
                  source: 'bot_detail_page',
                  source_detail: 'memory_manage',
                });
                setCreateDatabaseVisible(true);
                // setVisible(true);
              }}
              enableAutoHidden={true}
              data-testid="bot.editor.tool.table-memory.add-button"
            />
          </>
        }
      >
        <DatabaseList
          handleEdit={(tableId: string) => {
            // setCurrentTableId(tableId);
            // setEditDatabaseVisible(true);
            onEditDatabase(tableId);
          }}
        />
      </ToolContentBlock>
      <SelectDatabaseModal
        visible={createDatabaseVisible}
        onClose={() => {
          sendTeaEvent(EVENT_NAMES.memory_click_front, {
            bot_id: botId,
            resource_type: 'database',
            action: 'turn_off',
            source: 'bot_detail_page',
            source_detail: 'memory_manage',
          });
          setCreateDatabaseVisible(false);
          onCloseSelectModal?.();
        }}
        enterFrom={'bot'}
        onAddDatabase={onAddDatabase}
        onRemoveDatabase={onRemoveDatabase}
        onCreateDatabase={onCreateDatabase}
        onClickDatabase={onClickDatabase}
        botId={botId}
        spaceId={spaceId}
      />
      {/* <DatabaseCreateTableModal
        visible={editDatabaseVisible}
        onClose={() => {
          sendTeaEvent(EVENT_NAMES.memory_click_front, {
            bot_id: botId,
            resource_type: 'database',
            action: 'turn_off',
            source: 'bot_detail_page',
            source_detail: 'memory_manage',
          });
          setCurrentTableId('');
          setNL2DBInfo(null);
          setEditDatabaseVisible(false);
        }}
        onSubmit={r => onSave({ response: r })}
        showDatabaseBaseInfo
        initValue={cloneDatabaseFromStore()}
        onlyShowDatabaseInfoRWMode={false}
      /> */}
    </>
  );
};

export const TableMemory: FC<TableMemoryProps> = props => (
  <DataErrorBoundary namespace={DataNamespace.DATABASE}>
    <BaseTableMemory {...props} />
  </DataErrorBoundary>
);

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

import React, { useState, useEffect, useMemo } from 'react';

import { pick } from 'lodash-es';
import classNames from 'classnames';
import { userStoreService } from '@coze-studio/user-store';
import { type DatabaseInfo as DatabaseInitInfo } from '@coze-studio/bot-detail-store';
import { type WidgetUIState } from '@coze-data/knowledge-stores';
import { BotE2e } from '@coze-data/e2e';
import { DatabaseTabs } from '@coze-data/database-v2-base/types';
import { DismissibleBanner } from '@coze-data/database-v2-base/components/dismissible-banner';
import {
  type FormData,
  ModalMode,
} from '@coze-data/database-v2-base/components/base-info-modal';
import { DatabaseModeSelect } from '@coze-data/database-v2-adapter/components/database-mode-select';
import { DatabaseCreateTableModal } from '@coze-data/database-v2-adapter/components/create-table-modal';
import { DatabaseBaseInfoModal } from '@coze-data/database-v2-adapter/components/base-info-modal';
import { DatabaseDetailWaring } from '@coze-data/database-v2-adapter';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozEdit,
  IconCozCross,
  IconCozArrowLeft,
} from '@coze-arch/coze-design/icons';
import {
  Button,
  IconButton,
  TabBar,
  Toast,
  CozAvatar,
  Typography,
  Space,
} from '@coze-arch/coze-design';
import {
  BotTableRWMode,
  TableType,
  type DatabaseInfo,
  type UpdateDatabaseRequest,
} from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import { DatabaseTableStructureReadonly } from '../database-table-structure-readonly';
import { DatabaseTableData } from '../database-table-data';

import styles from './index.module.less';

export interface DatabaseDetailProps {
  version?: string;
  needHideCloseIcon?: boolean;
  databaseId: string;
  enterFrom: string;
  initialTab?: `${DatabaseTabs}`;
  addRemoveButtonText: string;
  onClose?: () => void;
  onAfterEditBasicInfo?: () => void;
  onAfterEditRecords?: () => void;
  onIDECallback?: {
    onStatusChange?: (v: WidgetUIState) => void;
    onUpdateDisplayName?: (v: string) => void;
  };
  onClickAddRemoveButton: (databaseId?: string) => void;
}

// eslint-disable-next-line @coze-arch/max-line-per-function, max-lines-per-function, complexity
export const DatabaseDetail = ({
  version,
  enterFrom,
  initialTab,
  needHideCloseIcon = false,
  addRemoveButtonText,
  onClose,
  onClickAddRemoveButton,
  onIDECallback,
  onAfterEditBasicInfo,
  onAfterEditRecords,
  databaseId,
}: DatabaseDetailProps) => {
  const userId = userStoreService.useUserInfo()?.user_id_str;

  const [basicInfoVisible, setBasicInfoVisible] = useState(false);
  const [createTableVisible, setCreateTableVisible] = useState(false);
  // database basicInfo
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo>({});
  // tab key
  const [activeKey, setActiveKey] = useState(
    version ? DatabaseTabs.Structure : initialTab ?? DatabaseTabs.Structure,
  );
  // btn loading
  const [btnLoading, setBtnLoading] = useState(false);
  // page loading
  const [loading, setLoading] = useState(true);

  // fetch database basicInfo
  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      const res = await MemoryApi.GetDatabaseByID({
        id: databaseId,
        ...(version ? { version } : {}),
      });
      if (res.database_info) {
        setDatabaseInfo(res.database_info);
        if (res.database_info.table_name) {
          onIDECallback?.onUpdateDisplayName?.(res.database_info.table_name);
          onIDECallback?.onStatusChange?.('normal');
        }
      } else {
        onIDECallback?.onStatusChange?.('error');
      }
    } catch {
      onIDECallback?.onStatusChange?.('error');
    } finally {
      setLoading(false);
    }
  };

  // Need a store, follow-up renovation
  const isReadOnlyMode = databaseInfo.creator_id !== userId || !!version;

  const tableInitData: DatabaseInitInfo = useMemo(
    () => ({
      tableId: databaseInfo.id || '',
      name: databaseInfo.table_name || '',
      desc: databaseInfo.table_desc || '',
      icon_uri: databaseInfo.icon_uri || '',
      readAndWriteMode: databaseInfo.rw_mode || BotTableRWMode.LimitedReadWrite,
      tableMemoryList: databaseInfo.field_list || [],
    }),
    [databaseInfo],
  );

  const basicInitData: FormData = useMemo(
    () => ({
      name: databaseInfo.table_name || '',
      description: databaseInfo.table_desc || '',
      icon_uri: [
        {
          url: databaseInfo.icon_url || '',
          uri: databaseInfo.icon_uri || '',
          uid: databaseInfo.icon_uri || '',
          isDefault: true,
        },
      ],
    }),
    [databaseInfo],
  );

  const handleEditBasicInfo = async (obj: UpdateDatabaseRequest) => {
    const res = await MemoryApi.UpdateDatabase({
      ...pick(databaseInfo, [
        'id',
        'icon_uri',
        'table_name',
        'table_desc',
        'field_list',
        'rw_mode',
        'prompt_disabled',
        'extra_info',
      ]),
      ...obj,
    });
    if (res?.database_info?.id) {
      await fetchDatabaseInfo();
      // update basicInfo callback
      if (onAfterEditBasicInfo) {
        onAfterEditBasicInfo();
      }
      // close basicInfo modal
      if (basicInfoVisible) {
        setBasicInfoVisible(false);
      }
    } else {
      Toast.error('Update database failed');
    }
  };

  const handleChangeDatabaseMode = async (mode: BotTableRWMode) => {
    const res = await MemoryApi.UpdateDatabase({
      ...databaseInfo,
      rw_mode: mode,
    });
    if (res?.database_info?.id) {
      await fetchDatabaseInfo();
      // update basicInfo callback
      if (onAfterEditBasicInfo) {
        onAfterEditBasicInfo();
      }
    }
  };

  const handleEditTable = async () => {
    await fetchDatabaseInfo();
    // update basicInfo callback
    if (onAfterEditBasicInfo) {
      onAfterEditBasicInfo();
    }
  };

  const handleBtnAction = () => {
    if (onClickAddRemoveButton) {
      try {
        setBtnLoading(true);
        onClickAddRemoveButton(
          enterFrom === 'workflow' ? databaseId : databaseInfo?.draft_id,
        );
      } finally {
        setBtnLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fromLibrary = ['create', 'library'].includes(enterFrom);

  return (
    <>
      <div
        className={classNames(
          'h-full w-full max-w-[100vw] flex flex-col overflow-hidden',
          enterFrom === 'project'
            ? 'coz-bg-max rounded-b-[8px] border-solid coz-stroke-primary'
            : 'coz-bg-plus',
        )}
      >
        {/* header */}
        <div
          className={classNames(
            'flex flex-row items-center justify-between shrink-0',
            fromLibrary
              ? 'h-[40px] m-[24px]'
              : 'h-[64px] px-[16px] py-[12px] border-0 border-b border-solid coz-stroke-primary',
          )}
        >
          <div className="flex items-center gap-[8px]">
            {needHideCloseIcon ? null : (
              <IconButton
                color="secondary"
                icon={fromLibrary ? <IconCozArrowLeft /> : <IconCozCross />}
                onClick={onClose}
              />
            )}
            <CozAvatar
              type="bot"
              color="grey"
              src={basicInitData.icon_uri?.[0]?.url}
            />
            <div className="flex flex-col">
              <div className="flex flex-row items-center gap-[2px] leading-none">
                <Typography.Text weight={500} fontSize="14px">
                  {basicInitData.name}
                </Typography.Text>
                {isReadOnlyMode ? null : (
                  <IconButton
                    size="mini"
                    color="secondary"
                    icon={<IconCozEdit className="coz-fg-secondary" />}
                    onClick={() => setBasicInfoVisible(true)}
                  />
                )}
              </div>
              <Typography.Text fontSize="12px">
                {basicInitData.description}
              </Typography.Text>
            </div>
          </div>
          <div className="flex items-center gap-[8px]">
            <DatabaseModeSelect
              disabled={isReadOnlyMode}
              value={databaseInfo.rw_mode}
              onChange={handleChangeDatabaseMode}
            />
            {enterFrom.includes('bot') || enterFrom === 'workflow' ? (
              <Button
                disabled={isReadOnlyMode}
                loading={btnLoading}
                onClick={handleBtnAction}
              >
                {addRemoveButtonText}
              </Button>
            ) : null}
          </div>
        </div>
        {/* content */}
        <div
          className={classNames(
            'grow overflow-hidden',
            fromLibrary ? 'mx-[24px]' : 'mx-[16px]',
          )}
        >
          <TabBar
            className={styles.tab}
            type="text"
            align="left"
            tabBarExtraContent={
              <Space spacing={16}>
                <DatabaseDetailWaring />
                {activeKey === DatabaseTabs.Structure ? (
                  <Button
                    data-testid={BotE2e.BotDatabaseEditTableStructureBtn}
                    onClick={() => setCreateTableVisible(true)}
                    icon={<IconCozEdit />}
                    color="highlight"
                    disabled={isReadOnlyMode}
                  >
                    {I18n.t('db_new_0003')}
                  </Button>
                ) : null}
              </Space>
            }
            tabBarClassName="flex flex-row items-center w-full"
            activeKey={activeKey}
            onChange={(key: string) => setActiveKey(key as DatabaseTabs)}
            lazyRender
          >
            <TabBar.TabPanel
              tab={I18n.t('db_new_0001')}
              itemKey={DatabaseTabs.Structure}
            >
              <DatabaseTableStructureReadonly
                loading={loading}
                fieldList={databaseInfo.field_list ?? []}
              />
            </TabBar.TabPanel>
            <TabBar.TabPanel
              tab={I18n.t('db_optimize_009')}
              itemKey={DatabaseTabs.Draft}
              disabled={!!version}
            >
              <DismissibleBanner
                type="info"
                persistentKey="_coze_database_draft_data_warning"
              >
                {I18n.t('db_optimize_010')}
              </DismissibleBanner>
              <DatabaseTableData
                databaseId={databaseId}
                tableType={TableType.DraftTable}
                tableFields={databaseInfo.field_list || []}
                // Test data does not require control rights, as long as the data can be seen, it can be modified and deleted
                isReadonlyMode={false}
                enterFrom={enterFrom}
                onAfterEditRecords={onAfterEditRecords}
              />
            </TabBar.TabPanel>
            <TabBar.TabPanel
              tab={I18n.t('db_new_0002')}
              itemKey={DatabaseTabs.Online}
              disabled={!!version}
            >
              <DismissibleBanner
                type="info"
                persistentKey="_coze_database_online_data_warning"
              >
                {I18n.t('database_optimize_200')}
              </DismissibleBanner>
              <DatabaseTableData
                databaseId={databaseId}
                tableType={TableType.OnlineTable}
                tableFields={databaseInfo.field_list || []}
                isReadonlyMode={isReadOnlyMode}
                enterFrom={enterFrom}
                onAfterEditRecords={onAfterEditRecords}
              />
            </TabBar.TabPanel>
          </TabBar>
        </div>
      </div>
      <DatabaseBaseInfoModal
        visible={basicInfoVisible}
        onSubmit={formData =>
          handleEditBasicInfo({
            table_name: formData.name,
            icon_uri: formData.icon_uri?.[0]?.uri,
            table_desc: formData.description,
          })
        }
        initValues={basicInitData}
        mode={ModalMode.EDIT}
        onClose={() => setBasicInfoVisible(false)}
      />
      <DatabaseCreateTableModal
        visible={createTableVisible}
        initValue={tableInitData}
        onSubmit={handleEditTable}
        showDatabaseBaseInfo={false}
        onlyShowDatabaseInfoRWMode={true}
        onReturn={() => setCreateTableVisible(false)}
        onClose={() => setCreateTableVisible(false)}
      />
    </>
  );
};

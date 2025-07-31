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

import { useState, useRef, useMemo, useEffect } from 'react';
import type { ReactNode, RefObject } from 'react';

import {
  type DatabaseInfo,
  type TableMemoryItem,
} from '@coze-studio/bot-detail-store';
import { BotE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { IconButton, Modal, Button } from '@coze-arch/coze-design';
import {
  type BotTableRWMode,
  type AlterBotTableResponse,
  type InsertBotTableResponse,
} from '@coze-arch/bot-api/memory';

import { DismissibleBanner } from '../dismissible-banner';
import {
  DatabaseTableStructure,
  type DatabaseTableStructureRef,
} from '../database-table-structure';
import {
  CreateType,
  type TableFieldsInfo,
  type OnSave,
} from '../../types/database-field';

// import { useExpertModeConfig } from '../../hooks/use-expert-mode-config';

const MAX_COLUMNS = 20;

interface CreateTableModalExtraParams {
  botId?: string;
  spaceId?: string;
  creatorId?: string;
}

// RenderGenerate property type definition
export interface RenderGenerateProps {
  tableStructureRef: RefObject<DatabaseTableStructureRef>;
  onGenerateChange: (tableMemoryList: TableMemoryItem[]) => void;
  onGenerating: (loading: boolean) => void;
  botId: string;
}

export interface RenderModeSelectProps {
  dataTestId: string;
  field: string;
  label: string;
  type: 'select';
  options: BotTableRWMode[];
}

export interface DatabaseCreateTableModalProps {
  visible: boolean;
  onClose: () => void;
  onReturn?: () => void;
  onSubmit?: (response: InsertBotTableResponse | AlterBotTableResponse) => void;
  initValue: DatabaseInfo;
  showDatabaseBaseInfo: boolean;
  extraParams?: CreateTableModalExtraParams;
  onlyShowDatabaseInfoRWMode: boolean;
  projectID?: string;
  renderGenerate?: (props: RenderGenerateProps) => ReactNode;
  renderModeSelect?: (props: RenderModeSelectProps) => ReactNode;
}

interface UseDatabaseCreateTableModalProps {
  onClose?: () => void;
  onReturn?: () => void;
  initValue: DatabaseInfo;
  onSubmit?: (response: InsertBotTableResponse | AlterBotTableResponse) => void;
  showDatabaseBaseInfo: boolean;
  extraParams?: CreateTableModalExtraParams;
  onlyShowDatabaseInfoRWMode: boolean;
  projectID?: string;
  renderGenerate?: (props: RenderGenerateProps) => ReactNode;
  renderModeSelect?: (props: RenderModeSelectProps) => ReactNode;
}

export const useDatabaseCreateTableModal = ({
  onReturn,
  onSubmit,
  initValue,
  showDatabaseBaseInfo,
  extraParams,
  onlyShowDatabaseInfoRWMode,
  projectID,
  renderGenerate,
  renderModeSelect,
}: UseDatabaseCreateTableModalProps) => {
  const [visible, setVisible] = useState(false);

  const open = () => {
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
    // onClose?.();
  };

  return {
    visible,
    open,
    close,
    modal: (
      <DatabaseCreateTableModal
        visible={visible}
        onClose={close}
        onReturn={onReturn}
        onSubmit={onSubmit}
        initValue={initValue}
        showDatabaseBaseInfo={showDatabaseBaseInfo}
        extraParams={extraParams}
        onlyShowDatabaseInfoRWMode={onlyShowDatabaseInfoRWMode}
        projectID={projectID}
        renderGenerate={renderGenerate}
        renderModeSelect={renderModeSelect}
      />
    ),
  };
};

// eslint-disable-next-line @coze-arch/max-line-per-function
export function DatabaseCreateTableModal({
  visible,
  onClose,
  onReturn,
  onSubmit,
  initValue,
  showDatabaseBaseInfo,
  onlyShowDatabaseInfoRWMode,
  extraParams: { botId = '', spaceId = '', creatorId = '' } = {},
  projectID,
  renderGenerate,
  renderModeSelect,
}: DatabaseCreateTableModalProps) {
  // AI generate loading
  const [generateTableLoading, setGenerateTableLoading] = useState(false);
  // save button loading
  const [saveBtnLoading, setSaveBtnLoading] = useState<boolean>(false);
  // save button disabled
  const [saveBtnDisabled, setSaveBtnDisabled] = useState<boolean>(false);
  // database structure
  const [databaseInitValue, setDatabaseInitValue] =
    useState<DatabaseInfo>(initValue);

  // export mode's some config(actually nobody knows why this is here...)
  // const expertModeConfig = useExpertModeConfig({ botId });

  // DataBase Table ref
  const tableStructureRef = useRef<DatabaseTableStructureRef>(null);

  /**
   * modal mode
   * @has tableId: Edit Mode;
   * @no tableId: Create Mode
   */
  const isModify = useMemo(() => Boolean(initValue.tableId), [initValue]);

  const handleValidateTable = (list: TableFieldsInfo, isEmptyList: boolean) => {
    if (isEmptyList) {
      setSaveBtnDisabled(true);
      return;
    }
    // System fields do not count towards the number of fields limit
    if (list.filter(i => !i.isSystemField).length > MAX_COLUMNS) {
      setSaveBtnDisabled(true);
      return;
    }
    const validateRes = list.every(ele => {
      if (!ele?.errorMapper) {
        return true;
      } else {
        if (
          ele.errorMapper.name?.length > 0 ||
          ele.errorMapper.type?.length > 0
        ) {
          return false;
        }
        return true;
      }
    });
    setSaveBtnDisabled(!validateRes);
  };

  const onSave: OnSave = async ({ response }) => {
    /**
     * In DatabaseTableStructure component, commit already distinguishes between edit and create states,
     * And there is an onSave callback, so the logic after commit all converges here
     */
    await onSubmit?.(response);
  };

  const onCreateSubmit = async () => {
    if (tableStructureRef.current) {
      try {
        setSaveBtnLoading(true);
        await tableStructureRef.current.submit();
      } finally {
        setSaveBtnLoading(false);
      }
    }
  };

  useEffect(() => {
    setDatabaseInitValue(initValue);
  }, [initValue]);

  return (
    <Modal
      closable
      maskClosable={false}
      visible={visible}
      onCancel={undefined}
      onOk={onCreateSubmit}
      size="xxl"
      header={
        <>
          <div className="flex flex-row items-center">
            <div className="flex-1 text-[20px] font-medium coz-fg-plus">
              {isModify
                ? I18n.t('db_edit_title')
                : I18n.t('db_add_table_title')}
            </div>
            {!isModify
              ? renderGenerate?.({
                  tableStructureRef,
                  onGenerateChange: tableMemoryList => {
                    setDatabaseInitValue({
                      ...databaseInitValue,
                      tableMemoryList,
                    });
                  },
                  onGenerating: setGenerateTableLoading,
                  botId,
                })
              : null}
            <div>
              <IconButton
                color="secondary"
                icon={<IconCozCross className="text-[20px] coz-fg-secondary" />}
                onClick={onClose}
              />
            </div>
          </div>
          {/* Banner prompt appears in the edit pop-up window */}
          {isModify ? (
            <DismissibleBanner
              type="warning"
              persistentKey="_coze_database_edit_warning"
              className="mx-[-24px]"
            >
              {I18n.t('db_edit_tips1')}
            </DismissibleBanner>
          ) : null}
        </>
      }
      footer={
        <div className="coz-modal-footer">
          <Button
            color="primary"
            onClick={() => {
              if (onReturn) {
                onReturn();
                return;
              }
            }}
          >
            {isModify ? I18n.t('db_del_field_confirm_no') : I18n.t('db2_003')}
          </Button>
          <Button
            data-testid={BotE2e.BotDatabaseAddModalSubmitBtn}
            loading={saveBtnLoading}
            onClick={onCreateSubmit}
            disabled={saveBtnDisabled}
          >
            {I18n.t('db_edit_save')}
          </Button>
        </div>
      }
    >
      <div>
        <DatabaseTableStructure
          data={databaseInitValue}
          ref={tableStructureRef}
          loading={generateTableLoading}
          loadingTips={I18n.t('bot_database_ai_waiting')}
          botId={botId}
          spaceId={spaceId}
          creatorId={creatorId}
          // maxColumnNum={expertModeConfig.maxColumnNum}
          maxColumnNum={MAX_COLUMNS}
          useComputingEnableGoToNextStep={handleValidateTable}
          createType={CreateType.custom}
          hiddenTableBorder
          readAndWriteModeOptions="expert"
          showDatabaseBaseInfo={showDatabaseBaseInfo}
          onlyShowDatabaseInfoRWMode={onlyShowDatabaseInfoRWMode}
          onSave={onSave}
          onCancel={onClose}
          projectID={projectID}
          renderModeSelect={renderModeSelect}
        />
      </div>
    </Modal>
  );
}

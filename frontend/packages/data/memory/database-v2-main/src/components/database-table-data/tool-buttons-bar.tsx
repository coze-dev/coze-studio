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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { TableType } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import {
  IconCozArrowDown,
  IconCozImport,
  IconCozPlus,
  IconCozRefresh,
  IconCozTrashCan,
} from '@coze-arch/coze-design/icons';
import { Button, Dropdown, Modal } from '@coze-arch/coze-design';

import { BatchImportModal } from '../batch-import-modal';
import { useConnectorOptions } from '../../hooks/use-connector-options';
import { type TableFieldData } from './type';

export interface ToolButtonsBarProps {
  readonly: boolean;
  databaseId: string;
  tableType: TableType;
  tableFields: TableFieldData[];
  onNewRow: () => void;
  onRefresh: () => void;
}

export function ToolButtonsBar({
  readonly,
  databaseId,
  tableType,
  tableFields,
  onNewRow,
  onRefresh,
}: ToolButtonsBarProps) {
  const [connectorDropdownVisible, setConnectorDropdownVisible] =
    useState(false);
  const [batchImportVisible, setBatchImportVisible] = useState(false);
  const [batchImportConnectorId, setBatchImportConnectorId] = useState<
    string | undefined
  >();
  const connectorOptions = useConnectorOptions();
  const showBatchImportModal = (connectorId?: string) => {
    setConnectorDropdownVisible(false);
    setBatchImportVisible(true);
    setBatchImportConnectorId(connectorId);
  };

  const handleClearDatabase = () =>
    Modal.confirm({
      title: I18n.t('dialog_240305_01'),
      content: I18n.t('dialog_240305_02'),
      okText: I18n.t('dialog_240305_03'),
      okButtonColor: 'red',
      cancelText: I18n.t('dialog_240305_04'),
      onOk: async () => {
        await MemoryApi.ResetBotTable({
          database_info_id: databaseId,
          table_type: tableType,
        });
        onRefresh();
      },
    });

  return (
    <div className="flex gap-[8px] mt-[8px] mb-[12px]">
      <Button
        color="secondary"
        icon={<IconCozPlus className={readonly ? '' : 'coz-fg-hglt'} />}
        disabled={readonly}
        onClick={onNewRow}
      >
        <span className={readonly ? '' : 'coz-fg-hglt'}>
          {I18n.t('db_optimize_022')}
        </span>
      </Button>
      {tableType === TableType.DraftTable ? (
        <Button
          color="secondary"
          icon={<IconCozImport />}
          disabled={readonly}
          onClick={() => showBatchImportModal()}
        >
          {I18n.t('db_optimize_013')}
        </Button>
      ) : (
        <Dropdown
          trigger="custom"
          visible={connectorDropdownVisible}
          onClickOutSide={() => setConnectorDropdownVisible(false)}
          position="bottomLeft"
          render={
            <>
              <Dropdown.Title className="pl-[32px] border-0 border-b border-solid coz-stroke-primary">
                {I18n.t('database_optimize_100')}
              </Dropdown.Title>
              <div className="min-w-[170px] max-h-[220px] overflow-auto">
                <Dropdown.Menu>
                  {connectorOptions.map(item => (
                    <Dropdown.Item
                      key={item.value}
                      onClick={() => showBatchImportModal(item.value)}
                    >
                      {item.label}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </div>
            </>
          }
        >
          <Button
            color="secondary"
            icon={<IconCozImport />}
            disabled={readonly}
            onClick={() => setConnectorDropdownVisible(true)}
          >
            <span>{I18n.t('db_optimize_013')}</span>
            <IconCozArrowDown className="ml-[4px]" />
          </Button>
        </Dropdown>
      )}
      <div className="ml-auto"></div>
      {tableType === TableType.DraftTable ? (
        <Button
          color="secondary"
          icon={<IconCozTrashCan />}
          disabled={readonly}
          onClick={handleClearDatabase}
        >
          {I18n.t('db_optimize_011')}
        </Button>
      ) : null}
      <Button color="secondary" icon={<IconCozRefresh />} onClick={onRefresh}>
        {I18n.t('db_optimize_012')}
      </Button>
      <BatchImportModal
        visible={batchImportVisible}
        databaseId={databaseId}
        tableFields={tableFields}
        tableType={tableType}
        connectorId={batchImportConnectorId}
        onClose={() => setBatchImportVisible(false)}
        onComplete={onRefresh}
      />
    </div>
  );
}

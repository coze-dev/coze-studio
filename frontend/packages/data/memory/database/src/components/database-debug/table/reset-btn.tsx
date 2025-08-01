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

import { type DatabaseInfo } from '@coze-studio/bot-detail-store';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { Button, useUIModal } from '@coze-arch/bot-semi';
import { IconWarningSize24 } from '@coze-arch/bot-icons';
import { TableType } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

import s from './index.module.less';

export interface DatabaseTable {
  database: DatabaseInfo;
  botID?: string;
  workflowID?: string;
  projectID?: string;
  afterReset?: () => Promise<void> | void;
}

const ResetBtn: React.FC<DatabaseTable> = props => {
  const { database, botID, workflowID, afterReset, projectID } = props;
  const { tableId, name } = database;

  const {
    open,
    close,
    modal: clearModal,
  } = useUIModal({
    type: 'info',
    title: I18n.t('dialog_240305_01'),
    content: I18n.t('dialog_240305_02'),
    okButtonProps: {
      type: 'warning',
    },
    icon: <IconWarningSize24 />,
    onOk: async () => {
      try {
        await MemoryApi.ResetBotTable({
          ...(workflowID ? { workflow_id: workflowID } : {}),
          ...(botID ? { bot_id: botID } : {}),
          ...(projectID ? { project_id: projectID } : {}),
          table_id: tableId,
          table_type: TableType.DraftTable,
          database_info_id: tableId,
        });
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.DATABASE, {
          error: error as Error,
          eventName: REPORT_EVENTS.DatabaseResetTableRecords,
        });
        return;
      }
      close();

      afterReset?.();
    },
    onCancel: () => {
      close();
    },
    className: s['reset-confirm-modal'],
    // ToolPane's z-index is 1000, so you need to add 1001 z-index here to avoid being obscured by the database data panel
    zIndex: 1001,
  });

  return (
    <>
      <Button
        type="tertiary"
        onClick={() => {
          sendTeaEvent(EVENT_NAMES.memory_click_front, {
            bot_id: botID ?? '',
            resource_type: 'database',
            resource_id: tableId,
            resource_name: name,
            action: 'reset',
            source: 'bot_detail_page',
            source_detail: 'memory_preview',
          });
          open();
        }}
        className={s['button-reset']}
      >
        {I18n.t('database_240227_01')}
      </Button>
      {clearModal(<>{I18n.t('dialog_240305_02')}</>)}
    </>
  );
};

export default ResetBtn;

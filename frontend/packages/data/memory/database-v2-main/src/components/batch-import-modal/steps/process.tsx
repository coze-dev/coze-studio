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

import { useState, useEffect, useMemo } from 'react';

import { useRequest } from 'ahooks';
import { type UnitItem } from '@coze-data/knowledge-resource-processor-core';
import {
  type ProcessProgressItemProps,
  ProcessStatus,
} from '@coze-data/knowledge-resource-processor-base/types';
import { ProcessProgressItem } from '@coze-data/knowledge-resource-processor-base';
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { formatBytes } from '@coze-arch/bot-utils';
import { IconUploadXLS } from '@coze-arch/bot-icons';
import { type TableType, type TableSheet } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { Typography } from '@coze-arch/coze-design';

type ProcessProps = Pick<
  ProcessProgressItemProps,
  'mainText' | 'subText' | 'tipText' | 'percent' | 'status' | 'actions'
>;

const INIT_PERCENT = 10;
const COMPLETE_PERCENT = 100;

const statusTextMap: Record<ProcessStatus, I18nKeysNoOptionsType> = {
  [ProcessStatus.Processing]: 'datasets_createFileModel_step4_processing',
  [ProcessStatus.Complete]: 'datasets_createFileModel_step4_Finish',
  [ProcessStatus.Failed]: 'datasets_createFileModel_step4_failed',
};

export interface StepProcessProps {
  databaseId: string;
  tableType: TableType;
  fileItem: UnitItem;
  tableSheet?: TableSheet;
  connectorId?: string;
}

export function StepProcess({
  databaseId,
  tableType,
  fileItem,
  tableSheet,
  connectorId,
}: StepProcessProps) {
  const fileSize = useMemo(
    () => formatBytes(fileItem.fileInstance?.size ?? 0),
    [fileItem],
  );
  const [progressProps, setProgressProps] = useState<ProcessProps>({
    // First line of text (file name)
    mainText: fileItem.name,
    // Second line of text (file size)
    subText: fileSize,
    // The second line of text displayed when hovering, consistent with the above
    tipText: fileSize,
    // Progress bar percentage, initial 10% is consistent with @code-data/knowledge-resource-processor-base/unit-progress
    percent: INIT_PERCENT,
    status: ProcessStatus.Processing,
  });

  const { run, cancel } = useRequest(
    () =>
      MemoryApi.DatabaseFileProgressData({
        database_id: databaseId,
        table_type: tableType,
      }),
    {
      manual: true,
      pollingInterval: 3000,
      onSuccess: res => {
        const { data } = res;
        if (data) {
          // If there is an error message, it means the processing failed. Display the error message and stop polling.
          if (data.status_descript) {
            const msg = data.status_descript;
            setProgressProps(props => ({
              ...props,
              subText: msg,
              tipText: msg,
              status: ProcessStatus.Failed,
            }));
            cancel();
          } else {
            setProgressProps(props => ({
              ...props,
              percent: data.progress ?? 0,
            }));
            // Progress 100 represents process completion, update status and stop polling
            if (data.progress === COMPLETE_PERCENT) {
              setProgressProps(props => ({
                ...props,
                status: ProcessStatus.Complete,
                actions: [I18n.t('datasets_unit_process_success')],
              }));
              cancel();
            }
          }
        }
      },
    },
  );

  // Submit the task and start polling progress
  useEffect(() => {
    MemoryApi.SubmitDatabaseInsertTask({
      database_id: databaseId,
      table_type: tableType,
      file_uri: fileItem.uri,
      table_sheet: tableSheet,
      connector_id: connectorId,
    }).finally(() => {
      run();
    });
  }, []);

  return (
    <>
      <div className="h-[32px] leading-[32px] mb-[8px]">
        <Typography.Text fontSize="14px" weight={500}>
          {I18n.t(statusTextMap[progressProps.status])}
        </Typography.Text>
      </div>
      <ProcessProgressItem
        avatar={<IconUploadXLS />}
        {...progressProps}
        className="[&_.process-progress-item-actions]:!block"
      />
    </>
  );
}

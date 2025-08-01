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

import { useMemo } from 'react';

import { getFormatTypeFromUnitType } from '@coze-data/utils';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import {
  type ProgressItem,
  CreateUnitStatus,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { DocumentStatus } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { formatBytes } from '@coze-arch/bot-utils';

import { getTypeIcon } from '../upload-unit-table/utils';
import { ProcessProgressItem } from '../process-progress-item';
import { getFrequencyMap } from '../../utils';
import { ProcessStatus } from '../../types';

const INIT_PERCENT = 10;

import styles from './index.module.less';

interface UnitProgressProps {
  progressList: ProgressItem[];
  createStatus: CreateUnitStatus;
}

const OneHundred = 100;

function hoursToDays(hours: number | string) {
  const curHours = typeof hours === 'string' ? parseInt(hours) : hours;
  if (isNaN(curHours)) {
    return 0;
  }
  return curHours / 24;
}

function formatRemainingTime(remainingSeconds: number) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  return {
    minutes,
    seconds,
  };
}

const renderSubText = (
  status: ProcessStatus,
  item: ProgressItem,
  hasURLImport?: boolean,
) => {
  const statusDesc = item?.statusDesc || I18n.t('datasets_unit_upload_fail');
  if (status === ProcessStatus.Failed) {
    return (
      <div
        data-dtestid={`${KnowledgeE2e.CreateUnitListProgressName}.${'subText'}`}
        className={'text-12px'}
      >
        {statusDesc}
      </div>
    );
  }
  let subDesc = '';
  if (hasURLImport) {
    // update frequency
    const updateInterval = hoursToDays(item?.update_interval || 0);
    subDesc = getFrequencyMap(updateInterval);
  } else {
    subDesc = formatBytes((item?.size || 0) as number);
  }
  return (
    <div
      data-dtestid={`${KnowledgeE2e.CreateUnitListProgressName}.${item?.name}`}
      className={'coz-fg-secondary text-12px'}
    >
      {subDesc}
    </div>
  );
};

export const UnitProgress: React.FC<UnitProgressProps> = ({
  progressList,
  createStatus,
}) => {
  const params = useKnowledgeParams();

  const headerTitle = useMemo(() => {
    let msg: string = I18n.t('datasets_createFileModel_step4_processing');
    if (createStatus === CreateUnitStatus.TASK_FINISH) {
      const allFailed = progressList.every(
        status => status.status === DocumentStatus.Failed,
      );

      if (allFailed) {
        msg = I18n.t('datasets_createFileModel_step4_failed');
      } else {
        msg = I18n.t('datasets_createFileModel_step4_Finish');
      }
    }
    return msg;
  }, [createStatus, progressList]);

  const unitType = params.type as UnitType;
  const formatType = getFormatTypeFromUnitType(unitType);
  const hasURLImport = [
    UnitType.TABLE_API,
    UnitType.TABLE_FEISHU,
    UnitType.TABLE_GOOGLE_DRIVE,
    UnitType.TABLE_LARK,
    UnitType.TEXT_FEISHU,
    UnitType.TEXT_LARK,
    UnitType.TEXT_NOTION,
    UnitType.TEXT_URL,
    UnitType.TEXT_GOOGLE_DRIVE,
  ].includes(unitType);

  const percentFormat = (percent: number, remainingTime: number) => {
    const { minutes, seconds } = formatRemainingTime(remainingTime as number);
    const remainingTimeText = I18n.t('knowledge_upload_remaining_time_text', {
      minutes,
      seconds,
    });

    return percent < OneHundred
      ? `${percent}% ${
          Number(remainingTime) > 0 ? `(${remainingTimeText})` : ''
        }`
      : null;
  };

  return (
    <div className={styles['embed-progress']}>
      <div className={styles['progress-info']}>
        <div
          className={styles.text}
          data-testid={KnowledgeE2e.CreateUnitProgressTitle}
        >
          {headerTitle}
        </div>
        <div className={styles['progress-list']}>
          {progressList.map(item => {
            const { status } = item;
            const getProcessStatus = () => {
              if (
                [DocumentStatus.Failed, DocumentStatus.AuditFailed].includes(
                  status,
                )
              ) {
                return ProcessStatus.Failed;
              }

              if (
                [
                  DocumentStatus.Processing,
                  DocumentStatus.Resegment,
                  DocumentStatus.Refreshing,
                ].includes(status)
              ) {
                return ProcessStatus.Processing;
              }

              if (
                [DocumentStatus.Enable, DocumentStatus.Disable].includes(status)
              ) {
                return ProcessStatus.Complete;
              }

              return ProcessStatus.Processing;
            };

            const curStatus = getProcessStatus();
            const percent = item?.progress || INIT_PERCENT;
            return (
              <ProcessProgressItem
                className={styles['data-processing']}
                key={item?.documentId}
                mainText={item?.name}
                subText={renderSubText(curStatus, item, hasURLImport)}
                tipText={renderSubText(curStatus, item, hasURLImport)}
                status={curStatus}
                avatar={getTypeIcon({
                  type: item?.type,
                  url: item?.url,
                  formatType,
                })}
                percent={percent}
                percentFormat={percentFormat(
                  percent,
                  item?.remaining_time as number,
                )}
                actions={[
                  ProcessStatus.Complete ? (
                    <div
                      className={styles['finish-text']}
                      data-testid={`${
                        KnowledgeE2e.CreateUnitListProgressSuccessIcon
                      }.${item?.name || ''}`}
                    >
                      {I18n.t('datasets_unit_process_success')}
                    </div>
                  ) : null,
                ]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

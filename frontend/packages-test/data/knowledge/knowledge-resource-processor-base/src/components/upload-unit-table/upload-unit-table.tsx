import React, { type FC, type ReactNode } from 'react';

import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';

import { ProcessProgressItem } from '../process-progress-item/process-progress-item';
import { ProcessStatus } from '../../types';
import { getProcessStatus, getTypeIcon } from './utils';
import { type ColumnInfo, type UploadUnitTableProps } from './types';

const INIT_PERCENT = 10;

const renderSubText = (
  status: ProcessStatus,
  statusDesc: string,
  subText: ReactNode,
) => {
  if (status === ProcessStatus.Failed) {
    return (
      <div
        data-dtestid={`${KnowledgeE2e.CreateUnitListProgressName}.${'subText'}`}
        className={'text-12px'}
      >
        {statusDesc || I18n.t('datasets_unit_upload_fail')}
      </div>
    );
  }

  return subText;
};

export const UploadUnitTable: FC<UploadUnitTableProps> = props => {
  const { unitList = [], getColumns } = props;
  if (unitList.length === 0) {
    return null;
  }
  return (
    <div className="upload-container">
      {unitList.map((item, index) => {
        const curStatus = getProcessStatus(item?.status);
        const statusDescript = item?.statusDescript || '';

        // 使用getColumns获取每个项目的信息
        const columnInfo: ColumnInfo = getColumns
          ? getColumns(item, index)
          : {};
        const { subText, actions, formatType } = columnInfo;

        return (
          <ProcessProgressItem
            key={item.uid}
            mainText={item.name || '--'}
            subText={renderSubText(curStatus, statusDescript, subText)}
            tipText={
              <span
                data-dtestid={`${KnowledgeE2e.LocalUploadListStatus}.${item.name}`}
              >
                {curStatus === ProcessStatus.Failed
                  ? statusDescript || I18n.t('datasets_unit_upload_fail')
                  : I18n.t('datasets_unit_upload_success')}
              </span>
            }
            status={curStatus}
            avatar={getTypeIcon({ ...item, formatType })}
            actions={actions}
            percent={item.percent || INIT_PERCENT}
          />
        );
      })}
    </div>
  );
};

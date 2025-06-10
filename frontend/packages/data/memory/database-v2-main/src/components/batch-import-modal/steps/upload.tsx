import { useEffect } from 'react';

import classNames from 'classnames';
import {
  type UnitItem,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import {
  UploadUnitFile,
  UploadUnitTable,
} from '@coze-data/knowledge-resource-processor-base';
import { I18n } from '@coze-arch/i18n';
import { type TableType } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';
import { Typography } from '@coze/coze-design';

export interface StepUploadProps {
  databaseId: string;
  tableType: TableType;
  unitList: UnitItem[];
  onUnitListChange: (list: UnitItem[]) => void;
}

export function StepUpload({
  databaseId,
  tableType,
  unitList,
  onUnitListChange,
}: StepUploadProps) {
  useEffect(() => {
    onUnitListChange(unitList);
  }, [onUnitListChange, unitList]);

  const downloadTemplate = async () => {
    const res = await MemoryApi.GetDatabaseTemplate({
      database_id: databaseId,
      table_type: tableType,
    });
    if (res.TosUrl) {
      window.open(res.TosUrl, '_blank');
    }
  };

  return (
    <>
      <UploadUnitFile
        unitList={unitList}
        setUnitList={onUnitListChange}
        onFinish={onUnitListChange}
        limit={1}
        multiple={false}
        accept=".csv,.xlsx"
        maxSizeMB={20}
        showRetry={false}
        dragMainText={I18n.t('datasets_createFileModel_step2_UploadDoc')}
        dragSubText={I18n.t('datasets_unit_update_exception_tips3')}
        action=""
        className={classNames('[&_.semi-upload-drag-area]:!h-[290px]', {
          hidden: unitList.length > 0,
        })}
        showIllustration={false}
      />
      <Typography.Paragraph
        type="secondary"
        className={classNames('mt-[8px]', { hidden: unitList.length > 0 })}
      >
        {I18n.t('db_optimize_018')}
        <Typography.Text link className="ml-[8px]" onClick={downloadTemplate}>
          {I18n.t('db_optimize_019')}
        </Typography.Text>
      </Typography.Paragraph>
      <UploadUnitTable
        edit={false}
        type={UnitType.TABLE_DOC}
        unitList={unitList}
        onChange={onUnitListChange}
        disableRetry
      />
    </>
  );
}

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

import { useEffect } from 'react';

import classNames from 'classnames';
import {
  type UnitItem,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import { ActionRenderByDelete } from '@coze-data/knowledge-resource-processor-base/components/upload-unit-table';
import {
  UploadUnitFile,
  UploadUnitTable,
} from '@coze-data/knowledge-resource-processor-base';
import { I18n } from '@coze-arch/i18n';
import { Typography } from '@coze-arch/coze-design';
import { type TableType } from '@coze-arch/bot-api/memory';
import { MemoryApi } from '@coze-arch/bot-api';

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
        getColumns={(record, index) => ({
          actions: [
            <ActionRenderByDelete
              record={record}
              index={index}
              params={{
                unitList,
                onChange: onUnitListChange,
                type: UnitType.TABLE_DOC,
                edit: false,
              }}
            />,
          ],
        })}
      />
    </>
  );
}

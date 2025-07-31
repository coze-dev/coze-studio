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

import React, { type FC } from 'react';

import {
  UnitType,
  type UnitItem,
} from '@coze-data/knowledge-resource-processor-core';
import { FormatType } from '@coze-arch/bot-api/memory';

import { ProcessStatus } from '../../../types';
import { getProcessStatus } from '../../../components/upload-unit-table/utils';
import { UploadUnitTable } from '../../../components/upload-unit-table/upload-unit-table';
import {
  type ColumnInfo,
  type UploadUnitTableProps,
  type RenderColumnsProps,
} from '../../../components/upload-unit-table/types';
import {
  ActionRenderByDelete,
  ActionRenderByEditName,
  ActionRenderByRetry,
  getFileSizeInfo,
} from '../../../components/upload-unit-table';

export const ImageLocalTaskList: FC<
  Omit<UploadUnitTableProps, 'getColumns'>
> = props => {
  const { unitList = [] } = props;

  if (unitList.length === 0) {
    return null;
  }

  // Implement your own getImageFileInfo method
  const getImageFileInfo = (data: RenderColumnsProps) => {
    const { record } = data;
    const curStatus = getProcessStatus(record?.status);

    return {
      formatType: FormatType.Image,
      subText: getFileSizeInfo(record),
      actions: [
        curStatus === ProcessStatus.Failed ? (
          <ActionRenderByRetry {...data} />
        ) : null,
        curStatus === ProcessStatus.Complete ? (
          <ActionRenderByEditName {...data} />
        ) : null,
        <ActionRenderByDelete {...data} />,
      ],
    };
  };

  const getColumns = (record: UnitItem, index: number): ColumnInfo => {
    const result = getImageFileInfo({
      record,
      index,
      params: { ...props, type: UnitType.IMAGE_FILE },
    });

    return result as ColumnInfo;
  };

  return (
    <UploadUnitTable
      {...props}
      type={UnitType.IMAGE_FILE}
      getColumns={getColumns}
    />
  );
};

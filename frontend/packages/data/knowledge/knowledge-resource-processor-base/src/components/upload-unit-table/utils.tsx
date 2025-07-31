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

import {
  EntityStatus,
  UploadStatus,
} from '@coze-data/knowledge-resource-processor-core';
import { WebStatus } from '@coze-arch/idl/knowledge';
import { Image } from '@coze-arch/bot-semi';
import {
  IconUploadPDF,
  IconUploadCSV,
  IconUploadDoc,
  IconUploadTxt,
  IconUploadTableUrl,
  IconUploadXLS,
  IconUploadTextUrl,
  IconUploadMD,
} from '@coze-arch/bot-icons';
import { FormatType } from '@coze-arch/bot-api/knowledge';

import { ProcessStatus } from '../../types';

enum UploadType {
  PDF = 'pdf',
  DOCX = 'docx',
  TXT = 'txt',
  XLSX = 'xlsx',
  XLTX = 'xltx',
  CSV = 'csv',
  PNG = 'png',
  JPG = 'jpg',
  JPEG = 'jpeg',
  WEBP = 'webp',
  XLS = 'xls',
  MD = 'md',
}
export const getTypeIcon = (params: {
  type: string | undefined;
  formatType?: FormatType;
  url?: string;
  inModal?: boolean;
}) => {
  const { type, formatType, url } = params;
  // const iconClassName = inModal ? styles['icon-size-24'] : styles.icon;
  if (
    formatType === FormatType.Image &&
    [UploadType.JPG, UploadType.JPEG, UploadType.PNG, UploadType.WEBP].includes(
      type as UploadType,
    )
  ) {
    return (
      <Image
        src={url}
        width={24}
        height={24}
        style={{
          borderRadius: '4px',
          marginRight: '12px',
          flexShrink: 0,
        }}
      />
    );
  }
  if (type === UploadType.MD) {
    return <IconUploadMD />;
  }
  if (type === UploadType.PDF) {
    return <IconUploadPDF />;
  }
  if (type === UploadType.DOCX) {
    return <IconUploadDoc />;
  }
  if (type === UploadType.TXT) {
    return <IconUploadTxt />;
  }
  if (
    type === UploadType.XLSX ||
    type === UploadType.XLTX ||
    type === UploadType.XLS
  ) {
    return <IconUploadXLS />;
  }
  if (type === UploadType.CSV) {
    return <IconUploadCSV />;
  }

  return formatType === FormatType.Table ? (
    <IconUploadTableUrl />
  ) : (
    <IconUploadTextUrl />
  );
};

export const getProcessStatus = (
  status: UploadStatus | WebStatus | EntityStatus,
) => {
  if (
    status === UploadStatus.UPLOADING ||
    status === UploadStatus.VALIDATING ||
    status === UploadStatus.WAIT ||
    status === WebStatus.Handling ||
    status === EntityStatus.EntityStatusProcess
  ) {
    return ProcessStatus.Processing;
  }

  if (
    status === UploadStatus.SUCCESS ||
    status === WebStatus.Finish ||
    status === EntityStatus.EntityStatusSuccess
  ) {
    return ProcessStatus.Complete;
  }

  if (
    status === UploadStatus.VALIDATE_FAIL ||
    status === UploadStatus.UPLOAD_FAIL ||
    status === WebStatus.Failed ||
    status === EntityStatus.EntityStatusFail
  ) {
    return ProcessStatus.Failed;
  }
  return ProcessStatus.Processing;
};

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

import { get } from 'lodash-es';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  type UnitItem,
  OptType,
  UploadStatus,
  type CreateUnitStatus,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import {
  type DocumentInfo,
  DocumentStatus,
  type DocumentProgress,
} from '@coze-arch/bot-api/knowledge';
import { type UploadFileData } from '@coze-arch/bot-api/developer_api';
import { Toast } from '@coze-arch/coze-design';

import { SUCCESSFUL_UPLOAD_PROGRESS } from '../constants';

export const transformUnitList = ({
  unitList,
  data,
  fileInstance,
  index,
}: {
  unitList: UnitItem[];
  data: UploadFileData | undefined;
  fileInstance: File;
  index: number;
}): UnitItem[] => {
  if (!data) {
    return unitList;
  }
  const filteredList = unitList.map((unit, i) => {
    if (index === i) {
      return {
        ...unit,
        uri: data.upload_uri || '',
        status: UploadStatus.SUCCESS,
        percent: 100,
        fileInstance,
      };
    }
    return unit;
  });
  // TODO as to be solved
  return filteredList as UnitItem[];
};

export function reportFailGetProgress(data: DocumentProgress[]) {
  const failIds = data.filter(item => item.status === DocumentStatus.Failed);
  if (failIds.length) {
    dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
      eventName: REPORT_EVENTS.KnowledgeGetTaskProgress,
      error: new CustomError(
        REPORT_EVENTS.KnowledgeGetTaskProgress,
        `${
          REPORT_EVENTS.KnowledgeGetTaskProgress
        }: get progress fail. ${JSON.stringify(failIds)}`,
      ),
      meta: {
        failIds,
      },
    });
  }
}

export function isStopPolling(data: DocumentProgress[]) {
  return (
    data.length > 0 &&
    data.every(
      item =>
        item.progress === SUCCESSFUL_UPLOAD_PROGRESS ||
        item.status === DocumentStatus.Failed,
    )
  );
}

export const clearPolling = (
  pollingId: React.MutableRefObject<number | undefined>,
) => {
  if (pollingId.current) {
    clearTimeout(pollingId.current);
    pollingId.current = undefined;
  }
};

export function useOptFromQuery(): OptType {
  const query = useKnowledgeParams();
  const opt = get(query, 'opt', OptType.ADD) as OptType;
  return opt;
}

/** Why return undefined? You don't necessarily need an empty string. If you can't get it, return undefined. */
/**Is there still an entrance for docID??? */
export function useDocIdFromQuery(): string | undefined {
  const query = useKnowledgeParams();
  return get(query, 'docID', undefined);
}

export const getFileExtension = (name: string) => {
  const index = name.lastIndexOf('.');
  return name.slice(index + 1).toLowerCase();
};

export const getBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;

      if (!result || typeof result !== 'string') {
        reject(new CustomError('getBase64', 'file read invalid'));
        return;
      }

      resolve(result.replace(/^.*?,/, ''));
    };
    fileReader.onerror = () => {
      Toast.error(I18n.t('read_file_failed_please_retry'));
      reject(new CustomError('getBase64', 'file read fail'));
    };
    fileReader.onabort = () => {
      reject(new CustomError('getBase64', 'file read abort'));
    };
    fileReader.readAsDataURL(file);
  });

export const getUint8Array = (file: Blob): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onload = event => {
      if (event.target?.result) {
        const arrayBuffer = event.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      } else {
        reject(new CustomError('getUint8Array', 'file read invalid'));
      }
    };

    fileReader.readAsArrayBuffer(file);
  });

export function reportProcessDocumentFail(
  docInfos: DocumentInfo[],
  reportEventName: string,
) {
  const failDocumentIds = docInfos.filter(
    item => item.status === DocumentStatus.Failed,
  );
  failDocumentIds.length > 0 &&
    dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
      eventName: reportEventName,
      error: new CustomError(
        reportEventName,
        `${reportEventName}: fail document_ids are ${JSON.stringify(
          failDocumentIds,
        )}`,
      ),
      meta: {
        failDocumentIds,
      },
    });
}

export const getProcessingDescMsg = (taskStatus: CreateUnitStatus) =>
  I18n.t('knowledge_add_unit_process_notice');
// taskStatus === CreateUnitStatus.TASK_FINISH
//   ? ''
//   : I18n.t('knowledge_add_unit_process_notice');

export const isThirdResegment = (opt: OptType, type: UnitType | undefined) =>
  opt === OptType.RESEGMENT &&
  type &&
  [UnitType.TABLE_GOOGLE_DRIVE, UnitType.TABLE_FEISHU].includes(type);

export const isIncremental = (opt: OptType) => opt === OptType.INCREMENTAL;

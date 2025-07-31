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

import { useRef, useState, useEffect } from 'react';

import { useLocalStorageState } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';

import {
  ImportFileTaskStatus,
  type QueryTableFileTaskStatusResponse,
} from '../datamodel';

export interface ProgressInfo {
  progress: number;
  status: ImportFileTaskStatus;
  errorMessage?: string;
}

export const useUploadProgress = (params: {
  tableID: string;
  botID: string;
}): ProgressInfo | undefined => {
  const { tableID, botID } = params;
  const [pollingInfo, setPollingInfo] = useState<ProgressInfo>();

  const importResultRef = useRef<number>();

  const [
    mapOfShouldQueryDatabaseProcessStatus,
    setMapOfShouldQueryDatabaseProcessStatus,
  ] = useLocalStorageState<string | undefined>(
    'map-of-should-query-database-process-status',
    {
      defaultValue: '',
    },
  );

  const writeToLocalStorage = () => {
    try {
      const lsMap = JSON.parse(mapOfShouldQueryDatabaseProcessStatus || '{}');
      const value = lsMap?.[botID] || [];
      value.push(tableID);
      lsMap[botID] = value;
      setMapOfShouldQueryDatabaseProcessStatus(JSON.stringify(lsMap));
    } catch (error) {
      console.error(error);
    }
  };

  const readFromLocalStorage = (): Record<string, string[]> => {
    let lsMap = {};
    try {
      lsMap = JSON.parse(mapOfShouldQueryDatabaseProcessStatus || '{}');
    } catch (error) {
      console.error(error);
    }
    return lsMap;
  };

  const startReceiveTimeCheck = () => {
    try {
      let res: QueryTableFileTaskStatusResponse;
      try {
        // TODO: This demand is suspended, the backend is offline, and it will be opened later.
        // res = await DataModelApi.QueryTableFileTaskStatus({
        //   table_id: tableID,
        //   bot_id: botID,
        // });
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.DATABASE, {
          eventName: REPORT_EVENTS.DatabaseGetTaskInfo,
          error: error as Error,
        });
        throw error;
      }

      // Stop polling without Processing
      // @ts-expect-error -- linter-disable-autofix
      if (res?.status !== ImportFileTaskStatus.Enqueue) {
        clearInterval(importResultRef.current);
        importResultRef.current = undefined;
      }

      /**
       * After success --- write to localStorage
       * No task --- write to localStorage
       */
      if (
        // @ts-expect-error -- linter-disable-autofix
        !res?.status ||
        res?.status === (0 as any) ||
        res?.status === ImportFileTaskStatus.Succeed
      ) {
        writeToLocalStorage();
      }

      // @ts-expect-error -- linter-disable-autofix
      if (res) {
        setPollingInfo({
          progress: Number(res.progress),
          status: res.status,
          errorMessage: res.summary,
        });
      }
    } catch (error) {
      clearInterval(importResultRef.current);
      importResultRef.current = undefined;
      setPollingInfo({
        progress: 0,
        status: ImportFileTaskStatus.Failed,
        errorMessage: (error as Error).message,
      });
    }
  };

  useEffect(() => {
    // Read localStorage to reduce unnecessary requests
    const lsMap = readFromLocalStorage();
    const inLocaleStorage = (lsMap[botID] || []).includes(tableID);

    if (tableID && !inLocaleStorage) {
      importResultRef.current = setInterval(() => {
        startReceiveTimeCheck();
      }, 1000) as unknown as number;
    }

    return () => {
      clearInterval(importResultRef.current);
    };
  }, [tableID]);

  return pollingInfo;
};

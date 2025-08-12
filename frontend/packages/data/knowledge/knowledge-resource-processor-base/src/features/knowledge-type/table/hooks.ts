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

/**
 * pure network request & common services
 */
// TODO to be solved

import { type StoreApi, type UseBoundStore } from 'zustand';
import { debounce, get } from 'lodash-es';
import { useRequest } from 'ahooks';
import {
  useDataNavigate,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  type ProgressItem,
  CreateUnitStatus,
  FooterBtnStatus,
  OptType,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { type FormApi } from '@coze-arch/bot-semi/Form';
import { useFlags } from '@coze-arch/bot-flags';
import { CustomError } from '@coze-arch/bot-error';
import { DocumentSourceType, FormatType } from '@coze-arch/bot-api/memory';
import type {
  AssociateFileResponse,
  DocTableColumn,
  DocTableSheet,
  // DocumentTableTaskInfo,
  FileNode,
  GetDocumentTableInfoRequest,
  GetDocumentTableInfoResponse,
  // GetTableSchemaInfoRequest,
} from '@coze-arch/bot-api/memory';
import {
  type GetTableSchemaRequest,
  TableDataType,
  DocumentSource,
  type DocumentInfo,
  type CreateDocumentRequest,
  type CreateDocumentResponse,
  type ValidateTableSchemaRequest,
} from '@coze-arch/bot-api/knowledge';
import { MemoryApi, KnowledgeApi } from '@coze-arch/bot-api';

import {
  isThirdResegment as isThirdResegmentFunc,
  isIncremental as isIncrementalFunc,
} from '@/utils';
import { type CustomFormFields } from '@/types/table';
import { type TableSettings } from '@/types';
import { usePollingTaskProgress } from '@/hooks';
import { TABLE_ACCEPT_LOCAL_FILE } from '@/constants/common';
import { TableStatus } from '@/constants';

import {
  type UploadTableAction,
  type UploadTableState,
} from '../table/interface';
import { useUploadFetchTableParams } from '../table/first-party/local/add/steps/services';
import { semanticValidator, getCustomStatus } from './utils';

export interface TableSchemaInfoResponse {
  code?: number;
  msg?: string;
  sheet_list?: DocTableSheet[];
  table_meta?: Record<string, DocTableColumn[]>;
  preview_data?: Record<string, Record<number, string>[]>;
}

export interface ThirdTableState {
  tosUrlRef?: string;
  fileTreeNodesMap?: Record<string, FileNode[]>;
  docInfo?: DocumentInfo;
  fileIdsMap?: AssociateFileResponse['file_mapping'];
}
export const useFetchTableInfoReq = (
  onSuccess: (res: TableSchemaInfoResponse) => void,
  onError: () => void,
) => {
  const { run: fetchTableInfo } = useRequest(
    async (params: GetDocumentTableInfoRequest) => {
      const res = await MemoryApi.GetDocumentTableInfo(params);
      onSuccess(res);
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGetTableInfo,
          error: error as Error,
        });
        onError();
      },
      manual: true,
    },
  );

  return fetchTableInfo;
};

export const useFetchTableSchemaInfoReq = (
  onSuccess: (res: GetDocumentTableInfoResponse) => void,
  onError: () => void,
) => {
  const { run: fetchTableInfo } = useRequest(
    async (params: GetTableSchemaRequest) => {
      try {
        const { table_meta, preview_data, ...rest } =
          await KnowledgeApi.GetTableSchema(params);
        const updateParams =
          params?.table_data_type === TableDataType.OnlyPreview
            ? {
                preview_data: {
                  [`${params.table_sheet?.sheet_id || '0'}`]:
                    preview_data ?? [],
                },
              }
            : {
                ...rest,
                table_meta: {
                  [`${params.table_sheet?.sheet_id || '0'}`]: table_meta ?? [],
                },
                preview_data: {
                  [`${params.table_sheet?.sheet_id || '0'}`]:
                    preview_data ?? [],
                },
              };
        onSuccess(updateParams);
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGetTableInfo,
          error: error as Error,
        });
        onError();
      }
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeGetTableInfo,
          error: error as Error,
        });
        onError();
      },
      manual: true,
    },
  );
  return fetchTableInfo;
};

/**
 * This method is used by all table links
 * Impure, will change the store, because all table links are similar, so put it here
 */
export const useFetchTableSchemaInfo = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const tableData = useStore(state => state.tableData);
  const setSemanticValidate = useStore(state => state.setSemanticValidate);
  const setOriginTableData = useStore(state => state.setOriginTableData);
  const setTableData = useStore(state => state.setTableData);
  const setStatus = useStore(state => state.setStatus);

  return useFetchTableSchemaInfoReq(
    res => {
      const isOnlyPreview = !get(res, 'table_meta');
      const newData = isOnlyPreview
        ? {
            ...tableData,
            preview_data: get(res, 'preview_data'),
          }
        : res;
      if (!isOnlyPreview) {
        // Why is there this if, because the first request is full, and the second request is OnlyPreview.
        setOriginTableData(newData);
      }
      const validateRes = semanticValidator(newData);
      setSemanticValidate(validateRes);
      setTableData(newData);
      setStatus(TableStatus.NORMAL);
    },
    () => {
      console.log('setStatus(TableStatus.ERROR)');
      setStatus(TableStatus.ERROR);
    },
  );
};

// TODO needs to be optimized. This function contains too much logic and is very messy.
// Events action nl2ql link
export const useChangeTableSettingsNl2ql = <
  T extends UploadTableState<number> &
    UploadTableAction<number> &
    ThirdTableState,
>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const { type, docID, opt } = useKnowledgeParams();
  const setStatus = useStore(state => state.setStatus);
  const setTableSettings = useStore(state => state.setTableSettings);
  const fileIdsMap = useStore(state => state.fileIdsMap ?? {});
  const docInfo = useStore(state => state.docInfo);
  const tosUrlRef = useStore(state => state.tosUrlRef);
  const sourceFileId =
    fileIdsMap[Object.keys(fileIdsMap)?.[0]]?.[0].source_file_id ??
    docInfo?.source_file_id;
  const fetchTableInfo = useFetchTableSchemaInfo(useStore);
  const AWAIT = 500;
  const params = useUploadFetchTableParams(useStore);

  const isThirdResegment = isThirdResegmentFunc(opt ?? OptType.ADD, type); // Determine whether it is a tripartite resegment
  const isIncremental = isIncrementalFunc(opt ?? OptType.ADD);

  const onChangeTableSettings = debounce((v: TableSettings) => {
    setStatus(TableStatus.LOADING);
    const sourceFile =
      type &&
      [UnitType.TABLE_GOOGLE_DRIVE, UnitType.TABLE_FEISHU].includes(type)
        ? {
            // Feishu needs to pass tos_uri
            tos_uri: type === UnitType.TABLE_FEISHU ? tosUrlRef : undefined,
            source_file_id: sourceFileId ?? undefined,
            document_source:
              type === UnitType.TABLE_GOOGLE_DRIVE
                ? DocumentSource.GoogleDrive
                : DocumentSource.FeishuWeb,
          }
        : params;
    fetchTableInfo({
      // If it is a resegment of three parties, it will not be transmitted source_file
      source_file: isThirdResegment ? undefined : sourceFile,
      table_sheet:
        !isIncremental &&
        get(sourceFile, 'document_source') === DocumentSource.Web
          ? undefined
          : {
              sheet_id: String(v.sheet_id),
              header_line_idx: String(v.header_line_idx),
              start_line_idx: String(v.start_line_idx),
            },
      // If it is a three-party resegment and incremental import, it will pass document_id other cases will not pass
      document_id: isThirdResegment || isIncremental ? docID : undefined,
      table_data_type: TableDataType.AllData,
    });
    setTableSettings(v);
  }, AWAIT);
  return onChangeTableSettings;
};
export const useUpdateDocument = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const tableData = useStore(state => state.tableData);
  const setStatus = useStore(state => state.setStatus);
  const setCreateStatus = useStore(state => state.setCreateStatus);
  const setProgressList = useStore(state => state.setProgressList);
  const pollingTaskProgress = usePollingTaskProgress();
  const { docID: docIdFromQuery } = useKnowledgeParams();

  const { run: handleUpdateDocument } = useRequest(
    async () => {
      try {
        setStatus(TableStatus.LOADING);
        await KnowledgeApi.UpdateDocument({
          document_id: docIdFromQuery,
          table_meta: tableData.table_meta?.[0],
        });
        await pollingTaskProgress(
          [
            {
              document_id: docIdFromQuery,
            },
          ],
          {
            onProgressing: (progressList: ProgressItem[]) => {
              setProgressList(progressList);
            },
            onFinish: () => {
              setCreateStatus(CreateUnitStatus.TASK_FINISH);
            },
          },
        );
      } catch (error) {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeUpdateDocument,
          error: error as Error,
        });
      } finally {
        setStatus(TableStatus.NORMAL);
      }
    },
    {
      manual: true,
    },
  );
  return handleUpdateDocument;
};

/**
 * table custom createDocument
 * TODO will be abandoned soon, and will be deleted after cutting to the new knowledge information architecture
 * @deprecated
 * @param setStatus
 * @param formApi
 * @returns
 */
export const useCreateDocument = (
  setStatus: (v: FooterBtnStatus) => void,
  formApi: React.MutableRefObject<FormApi<CustomFormFields> | undefined>,
) => {
  const params = useKnowledgeParams();
  const resourceNavigate = useDataNavigate();
  const { run: createDocument } = useRequest(
    async () => {
      setStatus(FooterBtnStatus.LOADING);
      const data = formApi?.current?.getValues();
      const payload = {
        space_id: params.spaceID,
        dataset_id: params.datasetID,
        document: {
          source_type: DocumentSourceType.Custom,
          name: data?.unitName,
          format_type: FormatType.Table,
          table_meta: (data?.metaData ?? []).map(meta => ({
            column_name: meta.column_name,
            is_semantic: meta.is_semantic,
            column_type: meta.column_type,
            desc: meta.desc,
          })),
        },
      };
      const { id } = await MemoryApi.CreateDocument(payload);
      console.log('doc-id', id);
      resourceNavigate.toResource?.('knowledge', params.datasetID);
      setStatus(getCustomStatus(data?.metaData ?? [], data?.unitName ?? ''));
    },
    {
      onError: error => {
        const data = formApi?.current?.getValues();
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateDocument,
          error,
        });
        setStatus(getCustomStatus(data?.metaData ?? [], data?.unitName ?? ''));
      },
      manual: true,
    },
  );
  return createDocument;
};

/**
 * @deprecated
 * Table unit name verification
 * TODO to be deleted, the new link is no longer used, only the new one is used directly, because the product function is new.
 */
export const useValidateUnitName = () => {
  const { docID: docIdFromQuery, spaceID, datasetID } = useKnowledgeParams();
  return async (params: { unit_name: string | string[] }) => {
    const { unit_name: unitName, ...rest } = params;
    const unitNameList = unitName instanceof Array ? unitName : [unitName];
    return Promise.all(
      unitNameList.map(
        async (name: string) =>
          await MemoryApi.ValidateUnitName({
            space_id: spaceID ?? '',
            dataset_id: datasetID ?? '',
            document_id: docIdFromQuery ? docIdFromQuery : undefined,
            unit_name: name,
            format_type: FormatType.Table,
            ...rest,
          }),
      ),
    );
  };
};

export const useTableSchemaValid = (
  onSuccess: (res: boolean, validResult: Record<string, string>) => void,
  onError?: (error: Error) => void,
) => {
  const { run: tableSchemaValid } = useRequest(
    async (params: ValidateTableSchemaRequest) => {
      const res = await KnowledgeApi.ValidateTableSchema(params);
      const validResult = res?.column_valid_result || {};
      const validResultKeys = Object.keys(validResult);
      const state = validResultKeys.length === 0 ? res?.code === 0 : false;
      onSuccess(state, validResult);
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeTableSchemaValid,
          error: error as Error,
        });
        onError?.(error);
      },
      manual: true,
    },
  );

  return tableSchemaValid;
};

export const useFetchAddSegmentReq = (
  onSuccess: (res: CreateDocumentResponse) => void,
  onError?: () => void,
) => {
  const { run: fetchAddSegment, loading: addSegmentLoading } = useRequest(
    async (params: CreateDocumentRequest) => {
      const res = await KnowledgeApi.CreateDocument(params);
      onSuccess(res);
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeTableAddSegment,
          error: error as Error,
        });
        onError?.();
      },
      manual: true,
    },
  );

  return {
    fetchAddSegment,
    addSegmentLoading,
  };
};

export const useAddSegment = <
  T extends UploadTableState<number> & UploadTableAction<number>,
>(
  useStore: UseBoundStore<StoreApi<T>>,
) => {
  const setStatus = useStore(state => state.setStatus);
  const setCreateStatus = useStore(state => state.setCreateStatus);
  const setProgressList = useStore(state => state.setProgressList);
  const pollingTaskProgress = usePollingTaskProgress();
  const { docID: docIdFromQuery } = useKnowledgeParams();

  const { fetchAddSegment } = useFetchAddSegmentReq(
    async res => {
      await pollingTaskProgress(
        [
          {
            document_id: docIdFromQuery,
          },
        ],
        {
          onProgressing: (progressList: ProgressItem[]) => {
            setProgressList(progressList);
          },
          onFinish: () => {
            setCreateStatus(CreateUnitStatus.TASK_FINISH);
          },
        },
      );
      setStatus(TableStatus.NORMAL);
    },
    () => {
      setStatus(TableStatus.ERROR);
    },
  );

  return fetchAddSegment;
};

export const useFetchListDocumentReq = (
  onSuccess: (res: DocumentInfo) => void,
  onError?: () => void,
) => {
  const params = useKnowledgeParams();

  const { run: fetchListDocument } = useRequest(
    async () => {
      if (!params.datasetID) {
        throw new CustomError(
          REPORT_EVENTS.KnowledgeListDocument,
          `${REPORT_EVENTS.KnowledgeListDocument}: no datasetID`,
        );
      }

      if (!params.docID) {
        throw new CustomError(
          REPORT_EVENTS.KnowledgeListDocument,
          `${REPORT_EVENTS.KnowledgeListDocument}: no docId`,
        );
      }

      const listDocumentRes = await KnowledgeApi.ListDocument({
        dataset_id: params.datasetID,
        document_ids: [params.docID],
      });

      const docInfo: DocumentInfo =
        listDocumentRes?.document_infos?.find(
          i => i.document_id === params.docID,
        ) || {};
      onSuccess(docInfo);
    },
    {
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeListDocument,
          error: error as Error,
        });
        onError?.();
      },
      manual: true,
    },
  );

  return fetchListDocument;
};

export const useAcceptFiles = (): string => {
  const [FLAGS] = useFlags();

  const accept = TABLE_ACCEPT_LOCAL_FILE.filter(i => {
    if (!FLAGS['bot.data.knowledge_md_xls']) {
      return i !== '.xls';
    }
    return !!i;
  }).join(',');

  return accept;
};

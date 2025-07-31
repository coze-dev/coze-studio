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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useMemo, useRef, useState } from 'react';

import { useRequest } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { type DocTableColumn, ColumnType } from '@coze-arch/bot-api/memory';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { transSliceContentOutput } from '../utils';
import { TableSegmentModal } from './modal';

export enum ModalActionType {
  Create,
  Edit,
}

export interface DocTableColumnExt extends DocTableColumn {
  error: string;
  value: string;
  column_id: string;
}

export interface UseTableSegmentModalParams {
  title: string | JSX.Element;
  meta: DocTableColumn[];
  disabled?: boolean;
  canEdit?: boolean;
  loading?: boolean;
  onSubmit?: (actionType: ModalActionType, data: TableDataItem[]) => void;
  onFinish: (actionType: ModalActionType, data: TableDataItem[]) => void;
}

interface UseTableSegmentModalReturnValue {
  node: JSX.Element | null;
  create: () => void;
  edit: (data: TableDataItem[] | string) => void;
  close: () => void;
  fetchCreateTableSegment: (
    docId: string,
    createContent: TableDataItem[],
  ) => void;
  fetchUpdateTableSegment: (
    sliceId: string,
    updateContent: TableDataItem[],
  ) => void;
}

export interface TableDataItem {
  column_id: string;
  column_name?: string;
  column_type?: ColumnType;
  is_semantic?: boolean;
  value: string;
  error?: string;
}

const CONTENT_MAX_LENGTH = 2000;

const getFormData = (data: TableDataItem[]) => {
  const formData: Record<string, string> = {};
  data.map(item => {
    formData[item.column_id] = item.value || '';
  });
  return JSON.stringify(formData);
};

const updateWithSliceList = (
  meta: DocTableColumn[],
  slices: TableDataItem[],
) => {
  const extendedTableMeta: DocTableColumnExt[] = meta.map(column => ({
    ...column,
    error: '',
    value: '',
    column_id: column.id || '',
    column_name: column.column_name || '',
    is_semantic: Boolean(column.is_semantic),
  }));

  if (slices.length === 0) {
    return extendedTableMeta;
  }

  slices.forEach(slice => {
    const column = extendedTableMeta.find(col => col.id === slice.column_id);
    if (column) {
      column.value = slice.value || '';
    }
  });

  return extendedTableMeta;
};
export const useTableSegmentModal = ({
  title,
  meta = [],
  canEdit,
  disabled,
  onSubmit,
  onFinish,
  loading,
}: UseTableSegmentModalParams): UseTableSegmentModalReturnValue => {
  const [visible, setVisible] = useState(false);
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const tableMeta = useRef<DocTableColumn[]>(meta);
  const actionTypeRef = useRef<ModalActionType>(ModalActionType.Create);

  const getFormVerification = () => {
    let isValid = true;
    const newTextAreas = tableData.map(textArea => {
      const newTextArea = { ...textArea };

      if (newTextArea?.is_semantic) {
        if (newTextArea.value.length === 0) {
          newTextArea.error = I18n.t('knowledge_table_content_empty');
          isValid = false;
        } else if (newTextArea.value.length > CONTENT_MAX_LENGTH) {
          newTextArea.error = I18n.t('knowledge_table_content_limt', {
            number: CONTENT_MAX_LENGTH,
          });
          isValid = false;
        }
      }

      return newTextArea;
    });

    if (!isValid) {
      setTableData(newTextAreas);
    }

    return isValid;
  };

  const { run: fetchCreateTableSegment, loading: createLoading } = useRequest(
    async (docId: string, createContent: TableDataItem[]) => {
      if (!docId) {
        throw new CustomError('normal_error', 'missing doc_id');
      }
      await KnowledgeApi.CreateSlice({
        document_id: docId,
        raw_text: getFormData(createContent),
      });
      return createContent;
    },
    {
      manual: true,
      onSuccess: data => {
        onFinish(actionTypeRef.current, data);
        onCancel();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateSlice,
          error,
        });
      },
    },
  );

  const { run: fetchUpdateTableSegment, loading: uploadLoading } = useRequest(
    async (sliceId: string, updateContent: TableDataItem[]) => {
      if (!sliceId) {
        throw new CustomError('normal_error', 'missing slice_id');
      }
      const formatRecord = updateContent.map(colData => {
        if (colData.column_type === ColumnType.Image) {
          return {
            ...colData,
            value: transSliceContentOutput(colData.value),
          };
        }
        return colData;
      });
      await KnowledgeApi.UpdateSlice({
        slice_id: sliceId,
        raw_text: getFormData(formatRecord),
      });
      return updateContent;
    },
    {
      manual: true,
      onSuccess: data => {
        onFinish(actionTypeRef.current, data);
        onCancel();
      },
      onError: error => {
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeUpdateSlice,
          error,
        });
      },
    },
  );

  const modalLoading = useMemo(
    () => createLoading || uploadLoading || loading,
    [createLoading, uploadLoading, loading],
  );

  useEffect(() => {
    tableMeta.current = meta;
  }, [meta]);

  const handleSubmit = () => {
    const isValid = getFormVerification();
    if (isValid) {
      if (typeof onSubmit === 'function') {
        onSubmit(actionTypeRef.current, tableData);
      } else {
        setVisible(false);
        onFinish(actionTypeRef.current, tableData);
      }
    }
  };

  const onCancel = () => {
    setVisible(false);
  };

  const onOpen = (newTableData?: TableDataItem[]) => {
    if (newTableData && newTableData.length) {
      setTableData(updateWithSliceList(tableMeta.current, newTableData));
      setVisible(true);
    } else {
      setTableData(updateWithSliceList(tableMeta.current, []));
      setVisible(true);
    }
  };

  const handleTextAreaChange = (index: number, newValue: string) => {
    const newData = [...tableData];
    newData[index].value = newValue;

    // Verify against semantic matching rows
    if (newData[index]?.is_semantic) {
      if (newValue.length === 0) {
        newData[index].error = I18n.t('knowledge_table_content_empty');
      } else if (newValue.length > CONTENT_MAX_LENGTH) {
        newData[index].error = I18n.t('knowledge_table_content_limt', {
          number: CONTENT_MAX_LENGTH,
        });
      } else {
        newData[index].error = '';
      }
    }

    setTableData(newData);
  };

  return {
    fetchCreateTableSegment,
    fetchUpdateTableSegment,
    edit: originTableData => {
      let newTableData = originTableData;
      if (typeof originTableData === 'string') {
        newTableData = JSON.parse(originTableData) as TableDataItem[];
      }

      actionTypeRef.current = ModalActionType.Edit;
      if (Array.isArray(newTableData)) {
        onOpen(newTableData);
      }
    },
    create: () => {
      actionTypeRef.current = ModalActionType.Create;
      onOpen();
    },
    close: onCancel,
    node: visible ? (
      <TableSegmentModal
        title={title}
        visible={visible}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        canEdit={canEdit ?? true}
        tableData={tableData}
        loading={modalLoading}
        handleTextAreaChange={handleTextAreaChange}
      />
    ) : null,
  };
};

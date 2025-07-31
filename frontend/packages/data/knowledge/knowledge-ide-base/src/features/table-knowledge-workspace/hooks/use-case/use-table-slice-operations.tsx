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

import { cloneDeep } from 'lodash-es';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { transSliceContentOutput } from '@coze-data/knowledge-modal-base';
import { type TableViewRecord } from '@coze-common/table-view';
import { ColumnType } from '@coze-arch/bot-api/knowledge';

import { type DatasetDataScrollList, updateSlice } from '@/service';

import { useCreateSlice } from '../inner/use-create-slice';
import { useTableUI } from '../../context/table-ui-context';
import { useTableData } from '../../context/table-data-context';
import { useTableActions } from '../../context/table-actions-context';

export const useTableSliceOperations = ({
  openDeleteSliceModal,
  openTableSegmentModal,
}: {
  openDeleteSliceModal: () => void;
  openTableSegmentModal: (content: string) => void;
}) => {
  const documentList = useKnowledgeStore(state => state.documentList);
  const { mutateSliceListData, setDelSliceIds, setCurIndex, setCurSliceId } =
    useTableActions();
  const { createSlice } = useCreateSlice();
  const { sliceListData } = useTableData();
  const { tableViewRef } = useTableUI();
  const curDoc = documentList?.[0];
  const slices = sliceListData?.list;

  const handleDeleteSlice = (indexs: number[]) => {
    if (!slices) {
      return;
    }

    /** new row */
    const addIndex = indexs.filter(i => !slices[i].slice_id);
    const addIds = addIndex.map(i => slices[i]?.addId);
    const oldIndex = indexs.filter(v => !addIndex.includes(v));
    // Make sure to filter out undefined values
    const sliceIds = oldIndex
      .map(i => slices[i].slice_id)
      .filter(Boolean) as string[];

    if (addIds.length && sliceIds.length <= 0) {
      mutateSliceListData({
        ...sliceListData,
        total: Number(sliceListData?.total ?? '0'),
        list: slices.filter(item => !addIds.includes(item?.addId)),
      } satisfies DatasetDataScrollList);
      tableViewRef?.current?.resetSelected();
    }

    if (sliceIds.length) {
      setDelSliceIds(sliceIds);
      openDeleteSliceModal();
    }
  };

  const handleCreateSlice = (createParams: string) => {
    if (!curDoc?.document_id) {
      return;
    }

    try {
      return {
        document_id: curDoc.document_id,
        raw_text: createParams,
      };
    } catch (error) {
      console.log('error', error);
      return null;
    }
  };

  const handleUpdateSliceData = async (
    record: TableViewRecord,
    index: number,
    updateValue?: string,
  ) => {
    if (!slices) {
      return;
    }

    const oldData = cloneDeep(sliceListData);
    try {
      const sliceId = slices[index].slice_id;
      const filterRecord = Object.fromEntries(
        Object.entries(record).filter(
          ([key]) => !['tableViewKey', 'char_count', 'hit_count'].includes(key),
        ),
      );

      const ImageIds: string[] = [];
      curDoc?.table_meta?.forEach(meta => {
        if (meta.column_type === ColumnType.Image) {
          ImageIds.push(meta.id as string);
        }
      });

      const formatRecord = Object.fromEntries(
        Object.entries(filterRecord).map(([key, value]) => {
          if (ImageIds.includes(key)) {
            return [key, transSliceContentOutput(value as string)];
          }
          return [key, value];
        }),
      );

      const updateParams = { ...formatRecord };
      delete updateParams.status;
      const updateContent = JSON.stringify(updateParams);

      if (sliceId) {
        await updateSlice(sliceId as string, updateContent, updateValue);
      } else {
        /** Add sharding */
        const createParams = await handleCreateSlice(updateContent);
        if (createParams && createSlice && curDoc?.document_id) {
          // Call the createSlice method passed in to create a new sharding.
          try {
            // Here you need to use the createSlice method passed in the props to call the API.
            await createSlice({
              document_id: curDoc.document_id,
              raw_text: updateContent,
            });
          } catch (error) {
            console.log('createSlice error:', error);
          }
        }
      }

      // Change to update after the interface request is successful
      if (slices) {
        return true;
      }
    } catch (error) {
      console.log(error);
      mutateSliceListData(oldData);
      throw Error(error as string);
    }
  };

  /** Pop-up editing slice */
  const handleModalEditSlice = (_record: TableViewRecord, index: number) => {
    if (!slices || index < 0 || index >= slices.length) {
      return;
    }

    setCurIndex(index);
    setCurSliceId(slices[index]?.slice_id || '');
    openTableSegmentModal(slices[index]?.content || '');
  };

  return {
    deleteSlice: handleDeleteSlice,
    createSlice: handleCreateSlice,
    modalEditSlice: handleModalEditSlice,
    rowUpdateSliceData: handleUpdateSliceData,
  };
};

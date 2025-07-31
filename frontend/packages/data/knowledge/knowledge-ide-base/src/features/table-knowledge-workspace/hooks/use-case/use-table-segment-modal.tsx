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

import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import {
  ModalActionType,
  useTableSegmentModal as useBaseTableSegmentModal,
} from '@coze-data/knowledge-modal-base';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { SliceStatus } from '@coze-arch/bot-api/knowledge';

import { useTableData } from '../../context/table-data-context';
import { useTableActions } from '../../context/table-actions-context';

export const useTableSegmentModal = () => {
  const documentList = useKnowledgeStore(state => state.documentList);

  const { sliceListData, curIndex, curSliceId } = useTableData();
  const { mutateSliceListData } = useTableActions();
  const curDoc = documentList?.[0];

  // table segmentation pop-up
  const {
    node: tableSegmentModalNode,
    edit: openTableSegmentModal,
    fetchCreateTableSegment,
    fetchUpdateTableSegment,
  } = useBaseTableSegmentModal({
    title:
      curIndex > -1 ? (
        <div className="slice-modal-title">
          {I18n.t('datasets_segment_detailModel_title', { num: curIndex + 1 })}
        </div>
      ) : (
        I18n.t('dataset_segment_content')
      ),
    meta: curDoc?.table_meta || [],
    canEdit: true,
    onSubmit: async (actionType, tData) => {
      if (actionType === ModalActionType.Create && curDoc?.document_id) {
        await fetchCreateTableSegment(curDoc?.document_id, tData);
      } else if (actionType === ModalActionType.Edit && curSliceId) {
        await fetchUpdateTableSegment(curSliceId, tData);
      }
    },
    onFinish: (actionType, tData) => {
      if (actionType === ModalActionType.Create) {
        Toast.success({
          content: I18n.t('knowledge_tableview_03'),
          showClose: false,
        });
      } else if (actionType === ModalActionType.Edit) {
        if (sliceListData) {
          const updateContent = JSON.stringify(tData);
          const newList = sliceListData.list;
          newList[curIndex].content = updateContent;
          newList[curIndex].status = SliceStatus.FinishVectoring;
          mutateSliceListData({
            ...sliceListData,
            list: newList,
          });
        }
      }
    },
  });

  return {
    tableSegmentModalNode,
    openTableSegmentModal,
    fetchCreateTableSegment,
    fetchUpdateTableSegment,
  };
};

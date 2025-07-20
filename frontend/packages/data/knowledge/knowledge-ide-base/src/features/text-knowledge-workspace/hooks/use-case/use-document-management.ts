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
 
import { useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { UpdateType } from '@coze-arch/bot-api/knowledge';

import { useUpdateDocument } from '@/service/document';

export const useDocumentManagement = (props?: {
  reloadDataset?: () => void;
}) => {
  const { curDocId, setCurDocId, documentList } = useKnowledgeStore(
    useShallow(state => ({
      curDocId: state.curDocId,
      setCurDocId: state.setCurDocId,
      documentList: state.documentList,
    })),
  );

  // 缓存上一个文档ID，用于加载失败后回滚
  const prevDocIdRef = useRef<string | null>(null);

  // 更新文档名称
  const { run: updateDocument } = useUpdateDocument({
    onSuccess: () => {
      Toast.success(I18n.t('Update_success'));
      props?.reloadDataset?.();
    },
  });

  // 选择文档
  const handleSelectDocument = (docId: string) => {
    prevDocIdRef.current = curDocId || null;
    setCurDocId(docId);
  };

  // 重命名文档
  const handleRenameDocument = (docId: string, newName: string) => {
    updateDocument({
      document_id: docId,
      document_name: newName,
    });
  };

  // 更新文档频率
  const handleUpdateDocumentFrequency = (
    docId: string,
    formData: { updateInterval?: number; updateType?: UpdateType },
  ) => {
    if (!documentList) {
      return;
    }

    const updatedDocList = documentList.map(doc => {
      if (doc.document_id === docId) {
        return {
          ...doc,
          update_interval: formData?.updateInterval,
          update_type: formData.updateInterval
            ? UpdateType.Cover
            : UpdateType.NoUpdate,
        };
      }
      return doc;
    });

    return updatedDocList;
  };

  // 回滚文档选择
  const rollbackDocumentSelection = () => {
    if (prevDocIdRef.current) {
      setCurDocId(prevDocIdRef.current);
    }
  };

  return {
    prevDocIdRef,
    updateDocument,
    handleSelectDocument,
    handleRenameDocument,
    handleUpdateDocumentFrequency,
    rollbackDocumentSelection,
  };
};

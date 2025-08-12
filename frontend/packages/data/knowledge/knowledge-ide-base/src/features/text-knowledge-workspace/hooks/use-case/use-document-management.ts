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

  // Cache the previous document ID for rollback after load failure
  const prevDocIdRef = useRef<string | null>(null);

  // Update document name
  const { run: updateDocument } = useUpdateDocument({
    onSuccess: () => {
      Toast.success(I18n.t('Update_success'));
      props?.reloadDataset?.();
    },
  });

  // Select document
  const handleSelectDocument = (docId: string) => {
    prevDocIdRef.current = curDocId || null;
    setCurDocId(docId);
  };

  // rename document
  const handleRenameDocument = (docId: string, newName: string) => {
    updateDocument({
      document_id: docId,
      document_name: newName,
    });
  };

  // Update document frequency
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

  // Rollback document selection
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

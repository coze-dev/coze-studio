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

import { type ReactNode } from 'react';

import {
  useDeleteUnitModal,
  useUpdateFrequencyModal,
} from '@coze-data/knowledge-modal-base';
import {
  type FormatType,
  type DocumentSource,
  type UpdateType,
} from '@coze-arch/bot-api/knowledge';

export interface UseModalsProps {
  docId?: string;
  documentType?: FormatType;
  documentSource?: DocumentSource;
  onDelete?: () => void;
  onUpdateFrequency?: (formData: {
    updateInterval?: number;
    updateType?: UpdateType;
  }) => void;
}

export interface UseModalsReturn {
  deleteModalNode: ReactNode;
  showDeleteModal: () => void;
  updateFrequencyModalNode: ReactNode;
  showUpdateFrequencyModal: (params: {
    updateInterval?: number;
    updateType?: UpdateType;
  }) => void;
}

export const useModals = (props: UseModalsProps): UseModalsReturn => {
  const { docId, documentType, documentSource, onDelete, onUpdateFrequency } =
    props;

  // Delete modal box
  const { node: deleteModalNode, delete: showDeleteModal } = useDeleteUnitModal(
    {
      docId,
      onDel: () => {
        onDelete?.();
      },
    },
  );

  // Update frequency mode box
  const { node: updateFrequencyModalNode, edit: showUpdateFrequencyModal } =
    useUpdateFrequencyModal({
      docId,
      onFinish: formData => {
        onUpdateFrequency?.(formData);
      },
      type: documentType,
      documentSource,
    });

  return {
    deleteModalNode,
    showDeleteModal,
    updateFrequencyModalNode,
    showUpdateFrequencyModal,
  };
};

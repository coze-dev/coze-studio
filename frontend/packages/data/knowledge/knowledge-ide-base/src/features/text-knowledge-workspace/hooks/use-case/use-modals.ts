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

  // 删除模态框
  const { node: deleteModalNode, delete: showDeleteModal } = useDeleteUnitModal(
    {
      docId,
      onDel: () => {
        onDelete?.();
      },
    },
  );

  // 更新频率模态框
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

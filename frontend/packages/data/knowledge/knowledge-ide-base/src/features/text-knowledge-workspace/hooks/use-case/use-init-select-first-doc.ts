import { useEffect } from 'react';

import { useKnowledgeStore } from '@coze-data/knowledge-stores';

import { useDocumentManagement } from './use-document-management';

export const useInitSelectFirstDoc = () => {
  const documentList = useKnowledgeStore(state => state.documentList);
  const { handleSelectDocument } = useDocumentManagement();
  useEffect(() => {
    if (documentList?.length) {
      handleSelectDocument(documentList[0]?.document_id ?? '');
    }
  }, [documentList]);
};

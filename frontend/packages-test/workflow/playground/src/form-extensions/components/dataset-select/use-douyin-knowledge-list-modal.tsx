import React, { useState } from 'react';

import { type Dataset } from '@coze-arch/bot-api/knowledge';
import { DouyinKnowledgeListModal } from '@coze-workflow/resources-adapter';

export interface UseDouyinKnowledgeListModalParams {
  botId: string;
  spaceId: string;
  datasetList: Dataset[];
  onDatasetListChange: (list: Dataset[]) => void;
  onClickKnowledgeDetail: (knowledgeID: string) => void;
  onCancel: () => void;
}

export interface UseDouyinKnowledgeListReturnValue {
  node: JSX.Element;
  open: () => void;
  close: () => void;
}

export const useDouyinKnowledgeListModal = (
  props: UseDouyinKnowledgeListModalParams,
): UseDouyinKnowledgeListReturnValue => {
  const [visible, setVisible] = useState(false);

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  return {
    node: <DouyinKnowledgeListModal {...props} visible={visible} />,
    open: handleOpen,
    close: handleClose,
  };
};

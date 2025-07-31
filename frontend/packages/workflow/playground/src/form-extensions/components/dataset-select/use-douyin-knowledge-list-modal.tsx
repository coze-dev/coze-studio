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

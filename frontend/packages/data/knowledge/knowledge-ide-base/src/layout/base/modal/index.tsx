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

/* eslint-disable max-params */
import { useState } from 'react';

import { useDataModal } from '@coze-data/utils';
import {
  KnowledgeParamsStoreProvider,
  type IKnowledgeParams,
  type PluginNavType,
} from '@coze-data/knowledge-stores';

import styles from './index.module.less';

export interface UseKnowledgeIDEFullScreenModalProps {
  biz: IKnowledgeParams['biz'];
  renderKnowledgeIDE: (props: { onClose: () => void }) => React.ReactNode;
  createResourceNavigate?: ({
    datasetID,
  }: {
    datasetID: string;
  }) => PluginNavType;
}

export const useKnowledgeIDEFullScreenModal = ({
  biz,
  renderKnowledgeIDE,
}: UseKnowledgeIDEFullScreenModalProps) => {
  const [curDatasetID, setCurDatasetID] = useState('');
  const { modal, open, close } = useDataModal({
    hideOkButton: true,
    hideCancelButton: true,
    showCloseIcon: false,
    closable: false,
    fullScreen: true,
    footer: null,
    className: styles['knowledge-preview-modal'],
  });
  return {
    node: modal(
      <div className={styles['knowledge-preview-modal-content']}>
        <KnowledgeParamsStoreProvider
          params={{ datasetID: curDatasetID, biz }}
          resourceNavigate={{}}
        >
          {renderKnowledgeIDE({ onClose: close })}
        </KnowledgeParamsStoreProvider>
      </div>,
    ),
    open: (datasetID: string) => {
      setCurDatasetID(datasetID);
      open();
    },
    close,
  };
};

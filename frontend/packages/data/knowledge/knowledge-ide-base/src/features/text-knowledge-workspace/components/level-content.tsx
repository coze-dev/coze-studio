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

import classnames from 'classnames';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import {
  useKnowledgeStore,
  type ILevelSegment,
} from '@coze-data/knowledge-stores';
import { LevelTextKnowledgeEditor } from '@coze-data/knowledge-common-components/text-knowledge-editor';
import { I18n } from '@coze-arch/i18n';
import { EmptyState } from '@coze-arch/coze-design';
import { IconSegmentEmpty } from '@coze-arch/bot-icons';

import { createLevelDocumentChunkByLevelSegment } from '../utils/document-utils';
import styles from '../styles/index.module.less';

export interface LevelContentProps {
  isProcessing: boolean;
  documentId: string;
  levelSegments: ILevelSegment[];
  selectionIDs: string[];
  onLevelSegmentsChange: (chunks: ILevelSegment[]) => void;
  onLevelSegmentDelete: (chunk: ILevelSegment) => void;
}

export const LevelContent: React.FC<LevelContentProps> = ({
  isProcessing,
  documentId,
  levelSegments,
  selectionIDs,
  onLevelSegmentsChange,
  onLevelSegmentDelete,
}) => {
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const searchValue = useKnowledgeStore(state => state.searchValue);

  // Convert hierarchical segmented data into an editor-usable format
  const renderLevelSegmentsData = levelSegments.map(item =>
    createLevelDocumentChunkByLevelSegment(item),
  );

  if (levelSegments.length === 0) {
    return (
      <div className={classnames(styles['empty-content'])}>
        <EmptyState
          size="large"
          icon={
            searchValue ? (
              <IllustrationNoResult style={{ width: 150, height: '100%' }} />
            ) : (
              <IconSegmentEmpty style={{ width: 150, height: '100%' }} />
            )
          }
          title={
            isProcessing
              ? I18n.t('content_view_003')
              : searchValue
              ? I18n.t('knowledge_no_result')
              : I18n.t('dataset_segment_empty_desc')
          }
        />
      </div>
    );
  }

  return (
    <LevelTextKnowledgeEditor
      chunks={renderLevelSegmentsData}
      selectionIDs={selectionIDs}
      documentId={documentId}
      readonly={!canEdit}
      onChange={onLevelSegmentsChange}
      onDeleteChunk={onLevelSegmentDelete}
    />
  );
};

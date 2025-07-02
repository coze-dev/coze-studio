import classnames from 'classnames';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { useKnowledgeStore } from '@coze-data/knowledge-stores';
import { type DocumentChunk } from '@coze-data/knowledge-common-components/text-knowledge-editor/scenes/base';
import { BaseTextKnowledgeEditor } from '@coze-data/knowledge-common-components/text-knowledge-editor';
import { I18n } from '@coze-arch/i18n';
import { EmptyState } from '@coze-arch/coze-design';
import { IconSegmentEmpty } from '@coze-arch/bot-icons';

import styles from '../styles/index.module.less';

export interface BaseContentProps {
  loading: boolean;
  isProcessing: boolean;
  documentId: string;
  renderData: DocumentChunk[];
  onContentChange: (chunks: DocumentChunk[]) => void;
  onAddChunk: () => void;
  onDeleteChunk: (chunk: DocumentChunk) => void;
}

export const BaseContent: React.FC<BaseContentProps> = ({
  loading,
  isProcessing,
  documentId,
  renderData,
  onContentChange,
  onAddChunk,
  onDeleteChunk,
}) => {
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const searchValue = useKnowledgeStore(state => state.searchValue);

  if (renderData?.length === 0 && !loading) {
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
    <div className={styles['slice-article-content']}>
      <BaseTextKnowledgeEditor
        chunks={renderData}
        documentId={documentId}
        readonly={!canEdit}
        onChange={onContentChange}
        onAddChunk={onAddChunk}
        onDeleteChunk={onDeleteChunk}
      />
    </div>
  );
};

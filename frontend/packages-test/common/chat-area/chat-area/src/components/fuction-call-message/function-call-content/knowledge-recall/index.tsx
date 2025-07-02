import { I18n } from '@coze-arch/i18n';
import { RecallSlices } from '@coze-data/llmPlugins';

import { ProcessContent } from '../process-content';
// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { type KnowledgeRecallSlice } from '../../../../store/types';

const getRecallEmptyText = () => I18n.t('recall_knowledge_no_related_slices');

// 云搜索鉴权失败的错误代码
export const KNOWLEDGE_OPEN_SEARCH_ERROR = 708882003;

const getMessageWithStatusCode = (statusCode?: number) => {
  if (statusCode === KNOWLEDGE_OPEN_SEARCH_ERROR) {
    return I18n.t('knowledge_es_024');
  }
  return getRecallEmptyText();
};

export const VerboseKnowledgeRecall: React.FC<{
  chunks?: KnowledgeRecallSlice[];
  statusCode?: number;
}> = ({ chunks, statusCode }) => (
  <ProcessContent>
    {chunks?.length ? (
      <RecallSlices llmOutputs={chunks} />
    ) : (
      getMessageWithStatusCode(statusCode)
    )}
  </ProcessContent>
);

export const LegacyKnowledgeRecall: React.FC<{ content: string }> = ({
  content,
}) => <ProcessContent>{content || getRecallEmptyText()}</ProcessContent>;

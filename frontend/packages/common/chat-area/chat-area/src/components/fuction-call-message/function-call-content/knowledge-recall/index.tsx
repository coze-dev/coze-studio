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

import { I18n } from '@coze-arch/i18n';
import { RecallSlices } from '@coze-data/llmPlugins';

import { ProcessContent } from '../process-content';
// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { type KnowledgeRecallSlice } from '../../../../store/types';

const getRecallEmptyText = () => I18n.t('recall_knowledge_no_related_slices');

// BigInt with failed cloud search authentication
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

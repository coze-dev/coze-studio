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

import { type FC, useEffect, useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isUndefined } from 'lodash-es';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { type FormApi } from '@coze-arch/coze-design';

import { validateCommonDocResegmentStep } from '@/utils/validate-common-doc-next-step';
import { getSegmentCleanerParams } from '@/utils/text';
import { SegmentMode } from '@/types';
import { useListDocumentReq } from '@/services';
import { type DocumentParseFormValue } from '@/features/segment-strategys/document-parse-strategy/precision-parsing/document-parse-form';
import {
  SegmentConfig,
  type OnChangeProps,
} from '@/features/segment-config/text-local';

import type { UploadTextLocalResegmentStore } from '../../store';
import { TextLocalResegmentStep } from '../../constants';

// ! Local file upload
export const TextSegment: FC<
  ContentProps<UploadTextLocalResegmentStore>
> = props => {
  const { useStore, footer } = props;
  const parseFormApi = useRef<FormApi<DocumentParseFormValue>>();
  const {
    setCurrentStep,
    segmentRule,
    segmentMode,
    parsingStrategy,
    filterStrategy,
  } = useStore(
    useShallow(state => ({
      setCurrentStep: state.setCurrentStep,
      segmentRule: state.segmentRule,
      segmentMode: state.segmentMode || SegmentMode.AUTO,
      parsingStrategy: state.parsingStrategy,
      filterStrategy: state.filterStrategy,
    })),
  );

  const {
    setSegmentMode,
    setParsingStrategyByMerge,
    setSegmentRule,
    setFilterStrategy,
    setLevelChunkStrategy,
    setDocumentInfo,
  } = useStore.getState();

  const { datasetID, docID } = useKnowledgeParams();

  const listDocumentReq = useListDocumentReq(res => {
    const resDocumentInfo = res.document_infos?.[0];
    if (!resDocumentInfo || !resDocumentInfo.chunk_strategy) {
      return;
    }
    const chunkStrategy = resDocumentInfo.chunk_strategy;
    const segmentParams = getSegmentCleanerParams(resDocumentInfo);
    if (!segmentParams) {
      return;
    }
    setSegmentMode(segmentParams.segmentMode);
    setSegmentRule(segmentParams.segmentRule);
    setParsingStrategyByMerge(resDocumentInfo.parsing_strategy ?? {});
    parseFormApi.current?.setValues(resDocumentInfo.parsing_strategy ?? {});
    setLevelChunkStrategy('maxLevel', chunkStrategy.max_level ?? 3);
    setLevelChunkStrategy('isSaveTitle', chunkStrategy.save_title);
    setDocumentInfo(resDocumentInfo);
  });

  // TODO: Cut back
  useEffect(() => {
    if (docID) {
      listDocumentReq({
        dataset_id: datasetID || '',
        document_ids: docID ? [docID] : [],
      });
    }
  }, []);

  return (
    <>
      <SegmentConfig
        segmentRule={segmentRule}
        segmentMode={segmentMode}
        parsingStrategy={parsingStrategy}
        filterStrategy={filterStrategy}
        getParseFormApi={api => {
          parseFormApi.current = api;
        }}
        onChange={({
          segmentRule: rule,
          segmentMode: mode,
          parsingStrategy: inputParsingStrategy,
          filterStrategy: inputFilterStrategy,
        }: OnChangeProps) => {
          rule !== undefined && setSegmentRule(rule);
          mode !== undefined && setSegmentMode(mode);
          if (!isUndefined(inputParsingStrategy)) {
            setParsingStrategyByMerge(inputParsingStrategy);
          }
          if (!isUndefined(inputFilterStrategy)) {
            setFilterStrategy(inputFilterStrategy);
          }
        }}
      />
      {footer?.([
        {
          e2e: KnowledgeE2e.ResegmentUploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          onClick: () => setCurrentStep(TextLocalResegmentStep.SEGMENT_PREVIEW),
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: validateCommonDocResegmentStep(segmentMode, segmentRule),
        },
      ])}
    </>
  );
};

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

import { type FC, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { get } from 'lodash-es';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { I18n } from '@coze-arch/i18n';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { getSegmentCleanerParams, getStorageStrategyEnabled } from '@/utils';
import { SegmentMode } from '@/types';
import { useListDocumentReq } from '@/services';
import {
  SegmentConfig,
  type OnChangeProps,
} from '@/features/segment-config/base';

import type { UploadTextCustomAddUpdateStore } from '../../store';
import { TextCustomAddUpdateStep } from '../../constants';
import { getButtonNextStatus } from './utils';

export const TextSegment: FC<
  ContentProps<UploadTextCustomAddUpdateStore>
> = props => {
  const { useStore, footer } = props;
  const {
    // common store
    setCurrentStep,
    // text store
    segmentRule,
    setSegmentRule,
    segmentMode,
    setSegmentMode,
    setEnableStorageStrategy,
    storageLocation,
    testConnectionSuccess,
  } = useStore(
    useShallow(state => ({
      setCurrentStep: state.setCurrentStep,
      segmentRule: state.segmentRule,
      setSegmentRule: state.setSegmentRule,
      segmentMode: state.segmentMode || SegmentMode.AUTO,
      setSegmentMode: state.setSegmentMode,
      setEnableStorageStrategy: state.setEnableStorageStrategy,
      storageLocation: state.storageLocation,
      testConnectionSuccess: state.testConnectionSuccess,
    })),
  );

  const { datasetID, docID } = useKnowledgeParams();

  const listDocumentReq = useListDocumentReq(res => {
    const segment = getSegmentCleanerParams(get(res, 'document_infos[0]', {}));
    if (segment) {
      setSegmentRule(segment.segmentRule);
      setSegmentMode(segment.segmentMode);
    }
  });

  useEffect(() => {
    if (docID) {
      listDocumentReq({
        dataset_id: datasetID || '',
        document_ids: [docID || ''],
      });
    }
  }, []);

  useEffect(() => {
    if (datasetID) {
      KnowledgeApi.DatasetDetail({ dataset_ids: [datasetID] }).then(res => {
        const dataset = res.dataset_details?.[datasetID];
        setEnableStorageStrategy(getStorageStrategyEnabled(dataset));
      });
    }
  }, [datasetID]);

  return (
    <>
      <SegmentConfig
        segmentRule={segmentRule}
        segmentMode={segmentMode}
        onChange={({ segmentRule: rule, segmentMode: mode }: OnChangeProps) => {
          rule !== undefined && setSegmentRule(rule);
          mode !== undefined && setSegmentMode(mode);
        }}
      />
      {footer?.([
        {
          e2e: KnowledgeE2e.UploadUnitUpBtn,
          type: 'primary',
          theme: 'light',
          onClick: () => setCurrentStep(TextCustomAddUpdateStep.UPLOAD_CONTENT),
          text: I18n.t('datasets_createFileModel_previousBtn'),
        },
        {
          e2e: KnowledgeE2e.UploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          onClick: () => setCurrentStep(TextCustomAddUpdateStep.EMBED_PROGRESS),
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: getButtonNextStatus({
            segmentMode,
            segmentRule,
            storageLocation,
            testConnectionSuccess,
          }),
        },
      ])}
    </>
  );
};

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

/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useMemo, type FC } from 'react';

import { isEqual } from 'lodash-es';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import {
  FooterBtnStatus,
  type ContentProps,
} from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { ReviewStatus } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { KnowledgeApi } from '@coze-arch/bot-api';
import { Toast } from '@coze-arch/coze-design';

import { PreProcessRule, SegmentMode, SeperatorType } from '@/types';
import { SegmentPreview } from '@/features/segment-preview';
import { getCustomValues } from '@/features/knowledge-type/text/utils';
import { getSeperatorOptionList } from '@/constants';

import type { UploadTextLocalAddUpdateStore } from '../../store';
import { TextLocalAddUpdateStep } from '../../constants';

export const SegmentPreviewStep: FC<
  ContentProps<UploadTextLocalAddUpdateStore>
> = props => {
  const { useStore, footer } = props;
  const params = useKnowledgeParams();
  /** common store */
  const setCurrentStep = useStore(state => state.setCurrentStep);
  const unitList = useStore(state => state.unitList);
  const segmentMode = useStore(state => state.segmentMode);
  const docReviewList = useStore(state => state.docReviewList);
  const setDocReviewList = useStore(state => state.setDocReviewList);
  const currentReviewID = useStore(state => state.currentReviewID);
  const setCurrentReviewID = useStore(state => state.setCurrentReviewID);
  const selectionIDs = useStore(state => state.selectionIDs);
  const setSelectionIDs = useStore(state => state.setSelectionIDs);
  const levelSegments = useStore(state => state.levelSegments);
  const setLevelSegments = useStore(state => state.setLevelSegments);
  const parsingStrategy = useStore(state => state.parsingStrategy);
  const levelChunkStrategy = useStore(state => state.levelChunkStrategy);
  const segmentRule = useStore(state => state.segmentRule);

  const docReviewCreated = useMemo(
    () =>
      isEqual(
        docReviewList.map(item => item.document_name),
        unitList.map(item => item.name),
      ),
    [docReviewList, unitList],
  );

  /** Create doc review */
  useEffect(() => {
    const createDocReview = async () => {
      const { unitList: inputUnitList } = useStore.getState();
      const res = await KnowledgeApi.CreateDocumentReview({
        dataset_id: params.datasetID,
        reviews: inputUnitList.map(item => ({
          tos_uri: item.uri,
          document_name: item.name,
          document_type: item.type,
        })),
        parsing_strategy: parsingStrategy,
        chunk_strategy: getCustomValues(
          segmentMode,
          segmentRule,
          levelChunkStrategy,
        ),
      });
      if (res.code === 0 && res.reviews?.length) {
        setDocReviewList(res.reviews);
        setCurrentReviewID(res.reviews[0].review_id ?? '');
      }
    };
    if (!docReviewCreated) {
      createDocReview();
    }
    // TODO: segmentMode needs to be recreated when switching doc review
  }, [
    docReviewCreated,
    parsingStrategy,
    segmentMode,
    segmentRule,
    levelChunkStrategy,
  ]);

  /** Poll doc review status */
  const { run: pollDocReviewStatus, cancel: cancelPollDocReviewStatus } =
    useRequest(
      async () => {
        const res = await KnowledgeApi.MGetDocumentReview({
          dataset_id: params.datasetID,
          review_ids: docReviewList.map(item => item.review_id ?? ''),
        });
        if (res.code === 0) {
          setDocReviewList(res.reviews ?? []);
        }
      },
      {
        manual: true,
        pollingInterval: 2000,
      },
    );

  useEffect(() => {
    if (docReviewCreated) {
      pollDocReviewStatus();
    }
    return () => {
      cancelPollDocReviewStatus();
    };
  }, [docReviewCreated]);

  /** end polling */
  const docReviewProcessFinished =
    docReviewList.length > 0 &&
    docReviewList.every(
      item =>
        // DocReview has no status when it is first created. In other cases, check whether the status is Processing.
        typeof item.status !== 'undefined' &&
        item.status !== ReviewStatus.Processing,
    );

  useEffect(() => {
    if (docReviewProcessFinished) {
      cancelPollDocReviewStatus();
    }
  }, [docReviewProcessFinished]);

  const { loading: saveLoading, run: saveDocumentReview } = useRequest(
    async () => {
      const res = await KnowledgeApi.SaveDocumentReview({
        review_id: currentReviewID,
        dataset_id: params.datasetID,
        doc_tree_json: JSON.stringify({ chunks: levelSegments }),
      });
      return res.code === 0;
    },
    {
      manual: true,
      onSuccess: data => {
        if (data) {
          setCurrentStep(TextLocalAddUpdateStep.EMBED_PROGRESS);
        }
      },
      onError: () => {
        Toast.error('变更保存失败');
      },
    },
  );

  return (
    <>
      <SegmentPreview
        docReviewList={docReviewList}
        setDocReviewList={setDocReviewList}
        segmentMode={segmentMode}
        currentReviewID={currentReviewID}
        setCurrentReviewID={setCurrentReviewID}
        selectionIDs={selectionIDs}
        setSelectionIDs={setSelectionIDs}
        levelSegments={levelSegments}
        setLevelSegments={setLevelSegments}
        datasetID={params.datasetID}
        segmentInfo={
          segmentMode !== SegmentMode.AUTO ? (
            <div
              className={classNames(
                'flex flex-col',
                'text-[14px] font-[400] leading-[20px] coz-fg-primary',
              )}
            >
              {segmentMode === SegmentMode.LEVEL ? (
                <>
                  <span>
                    {'\u2022'} {I18n.t('knowledge_level_004')}:
                    {levelChunkStrategy.maxLevel}
                  </span>
                  {levelChunkStrategy.isSaveTitle ? (
                    <span>
                      {'\u2022'} {I18n.t('knowledge_level_005')}
                    </span>
                  ) : null}
                </>
              ) : null}
              {segmentMode === SegmentMode.CUSTOM ? (
                <>
                  <span>
                    {'\u2022'} {I18n.t('datasets_Custom_segmentID')}:
                    {segmentRule.separator.type !== SeperatorType.CUSTOM
                      ? getSeperatorOptionList().find(
                          item => item.value === segmentRule.separator.type,
                        )?.label
                      : segmentRule.separator.customValue}
                  </span>
                  <span>
                    {'\u2022'} {I18n.t('datasets_Custom_maxLength')}:
                    {segmentRule.maxTokens}
                  </span>
                  <span>
                    {'\u2022'} {I18n.t('kl_write_014')}: {segmentRule.overlap}
                  </span>
                  {segmentRule.preProcessRules.includes(
                    PreProcessRule.REMOVE_SPACES,
                  ) ? (
                    <span>
                      {'\u2022'} {I18n.t('datasets_Custom_rule_replace')}
                    </span>
                  ) : null}
                  {segmentRule.preProcessRules.includes(
                    PreProcessRule.REMOVE_EMAILS,
                  ) ? (
                    <span>
                      {'\u2022'} {I18n.t('datasets_Custom_rule_delete')}
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null
        }
      />
      {footer?.([
        {
          e2e: KnowledgeE2e.UploadUnitUpBtn,
          type: 'primary',
          theme: 'light',
          onClick: () => {
            setDocReviewList([]);
            setCurrentStep(TextLocalAddUpdateStep.SEGMENT_CLEANER);
          },
          text: I18n.t('datasets_createFileModel_previousBtn'),
        },
        {
          e2e: KnowledgeE2e.UploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          status: saveLoading
            ? FooterBtnStatus.LOADING
            : FooterBtnStatus.ENABLE,
          onClick: async () => {
            await saveDocumentReview();
          },
          text: I18n.t('datasets_createFileModel_NextBtn'),
        },
      ])}
    </>
  );
};

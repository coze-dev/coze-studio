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

/* eslint-disable complexity */
import { type FC, useEffect, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { isUndefined } from 'lodash-es';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { type ParsingStrategy } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { type FormApi } from '@coze-arch/coze-design';

import { validateCommonDocResegmentStep } from '@/utils/validate-common-doc-next-step';
import { getSegmentCleanerParams } from '@/utils';
import { SegmentMode } from '@/types';
import { useListDocumentReq } from '@/services';
import { type PDFFile } from '@/features/segment-strategys/document-parse-strategy/precision-parsing/document-parse-form/pdf-filter/filter-modal';
import { type DocumentParseFormValue } from '@/features/segment-strategys/document-parse-strategy/precision-parsing/document-parse-form';
import {
  type OnChangeProps,
  SegmentConfig,
} from '@/features/segment-config/base';
import { type UploadTextResegmentStore } from '@/features/resegment/text/store';
import { TextResegmentStep } from '@/features/resegment/text/constants';
import { type PDFDocumentFilterValue } from '@/features/knowledge-type/text/interface';

export const TextSegment: FC<
  ContentProps<UploadTextResegmentStore>
> = props => {
  const [pdfList, setPDFList] = useState<PDFFile[]>([]);
  const { useStore, footer } = props;
  const parseFormApi = useRef<FormApi<DocumentParseFormValue>>();
  const {
    // common store
    setCurrentStep,
    // text store
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
  } = useStore.getState();

  const params = useKnowledgeParams();

  // const { data: vectorModelList } = useRequest(
  //   async () => {
  //     const res = await KnowledgeApi.ListModel();
  //     return res.models.map(m => ({
  //       id: m.name ?? '',
  //       name: m.name ?? '',
  //     }));
  //   },
  //   {
  //     onSuccess: response => {
  //       indexFormApi.current?.setValue('model', response.at(0)?.id);
  //     },
  //   },
  // );

  const listDocumentReq = useListDocumentReq(res => {
    const resDocumentInfo = res.document_infos?.[0];
    if (!resDocumentInfo) {
      return;
    }
    const docSegmentParams = getSegmentCleanerParams(resDocumentInfo);
    if (!docSegmentParams) {
      return;
    }
    const { docInfo, ...restParams } = docSegmentParams;
    setSegmentRule(restParams.segmentRule);
    setSegmentMode(restParams.segmentMode);
    setParsingStrategyByMerge(docInfo.parsing_strategy ?? {});
    parseFormApi.current?.setValues(docInfo.parsing_strategy ?? {});
    const isPDF = docInfo.type?.toLocaleLowerCase() === 'pdf';
    if (docInfo.filter_strategy && isPDF) {
      const [
        topPercent = 0,
        rightPercent = 0,
        bottomPercent = 0,
        leftPercent = 0,
      ] = docInfo.filter_strategy.filter_box_position ?? [];
      const filterData = [
        {
          uri: docInfo.tos_uri ?? '',
          filterPagesConfig:
            docInfo.filter_strategy?.filter_page?.map(pageIndex => ({
              pageIndex,
              isFilter: true,
            })) ?? [],
          cropperSizePercent: {
            topPercent,
            rightPercent,
            bottomPercent,
            leftPercent,
          },
        },
      ];
      setFilterStrategy(filterData);
      parseFormApi.current?.setValue('filterStrategy', filterData);
      setPDFList([
        {
          uri: docInfo.tos_uri ?? '',
          url: docInfo.web_url ?? '',
          name: docInfo.name ?? '',
        },
      ]);
    }
  });

  useEffect(() => {
    listDocumentReq({
      dataset_id: params?.datasetID || '',
      document_ids: [params?.docID || ''],
    });
  }, []);

  return (
    <>
      <SegmentConfig
        pdfList={pdfList}
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
            setParsingStrategyByMerge(inputParsingStrategy as ParsingStrategy);
          }
          if (!isUndefined(inputFilterStrategy)) {
            setFilterStrategy(inputFilterStrategy as PDFDocumentFilterValue[]);
          }
        }}
      />
      {footer?.([
        {
          e2e: KnowledgeE2e.ResegmentUploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          onClick: () => setCurrentStep(TextResegmentStep.EMBED_PROGRESS),
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: validateCommonDocResegmentStep(segmentMode, segmentRule),
        },
      ])}
    </>
  );
};

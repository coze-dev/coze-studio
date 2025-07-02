import { type FC, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { get, isUndefined } from 'lodash-es';
import { useKnowledgeParams } from '@coze-data/knowledge-stores';
import { type ContentProps } from '@coze-data/knowledge-resource-processor-core';
import { KnowledgeE2e } from '@coze-data/e2e';
import { type ParsingStrategy } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { validateCommonDocResegmentStep } from '@/utils/validate-common-doc-next-step';
import { getSegmentCleanerParams, getStorageStrategyEnabled } from '@/utils';
import { SegmentMode } from '@/types';
import { useListDocumentReq } from '@/services';
import {
  SegmentConfig,
  type OnChangeProps,
} from '@/features/segment-config/text-local';
import { type PDFDocumentFilterValue } from '@/features/knowledge-type/text';

import type { UploadTextLocalAddUpdateStore } from '../../store';
import { TextLocalAddUpdateStep } from '../../constants';

// ! 本地文档上传
export const TextSegment: FC<
  ContentProps<UploadTextLocalAddUpdateStore>
> = props => {
  const { useStore, footer } = props;
  // const indexFormApi = useRef<FormApi<DocumentIndexFormValue>>();
  const {
    unitList,
    setCurrentStep,
    segmentRule,
    segmentMode,
    parsingStrategy,
    filterStrategy,
  } = useStore(
    useShallow(state => ({
      unitList: state.unitList,
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
    setEnableStorageStrategy,
  } = useStore.getState();

  const { datasetID, docID } = useKnowledgeParams();

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

  const segmentValid = validateCommonDocResegmentStep(segmentMode, segmentRule);
  const nextBtnStatus = segmentValid;

  return (
    <>
      <SegmentConfig
        // vectorModelList={vectorModelList}
        pdfList={unitList.filter(u => u.type.toLocaleLowerCase() === 'pdf')}
        segmentRule={segmentRule}
        segmentMode={segmentMode}
        parsingStrategy={parsingStrategy}
        // indexStrategy={indexStrategy}
        filterStrategy={filterStrategy}
        // getIndexFormApi={api => {
        //   indexFormApi.current = api;
        // }}
        onChange={({
          segmentRule: rule,
          segmentMode: mode,
          parsingStrategy: inputParsingStrategy,
          // indexStrategy: inputIndexStrategy,
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
          e2e: KnowledgeE2e.UploadUnitUpBtn,
          type: 'primary',
          theme: 'light',
          onClick: () => setCurrentStep(TextLocalAddUpdateStep.UPLOAD_FILE),
          text: I18n.t('datasets_createFileModel_previousBtn'),
        },
        {
          e2e: KnowledgeE2e.UploadUnitNextBtn,
          type: 'hgltplus',
          theme: 'solid',
          onClick: () => setCurrentStep(TextLocalAddUpdateStep.SEGMENT_PREVIEW),
          text: I18n.t('datasets_createFileModel_NextBtn'),
          status: nextBtnStatus,
        },
      ])}
    </>
  );
};

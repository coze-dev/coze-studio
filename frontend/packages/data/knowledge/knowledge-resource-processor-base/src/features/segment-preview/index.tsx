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

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable complexity */
/* eslint-disable @coze-arch/max-line-per-function */
import { useEffect, useState, type ReactNode } from 'react';

import { nanoid } from 'nanoid';
import cls from 'classnames';
import { useRequest } from 'ahooks';
import { type ILevelSegment } from '@coze-data/knowledge-stores';
import { useTosContent } from '@coze-data/knowledge-common-hooks';
import { withTitle } from '@coze-data/knowledge-common-components/text-knowledge-editor/scenes/level';
import { LevelTextKnowledgeEditor } from '@coze-data/knowledge-common-components/text-knowledge-editor';
import {
  SegmentMenu,
  usePreviewPdf,
  PreviewTxt,
  PreviewMd,
} from '@coze-data/knowledge-common-components';
import { ReviewStatus, type Review } from '@coze-arch/idl/knowledge';
import { I18n } from '@coze-arch/i18n';
import { KnowledgeApi } from '@coze-arch/bot-api';
import {
  IconCozArrowLeft,
  IconCozArrowRight,
  IconCozInfoCircle,
  IconCozMinus,
  IconCozPlus,
  IconCozSideExpand,
} from '@coze-arch/coze-design/icons';
import { IconButton, Spin, Tag, Tooltip } from '@coze-arch/coze-design';

import { SegmentMode } from '../../types';

interface ISegmentPreviewProps {
  docReviewList: Review[];
  setDocReviewList?: (list: Review[]) => void;
  currentReviewID?: string;
  setCurrentReviewID: (id: string) => void;
  selectionIDs?: string[];
  setSelectionIDs: (ids: string[]) => void;
  segmentMode: SegmentMode;
  levelSegments: ILevelSegment[];
  setLevelSegments: (segments: ILevelSegment[]) => void;
  datasetID?: string;
  segmentInfo?: ReactNode;
}

export const SegmentPreview = (props: ISegmentPreviewProps) => {
  const {
    docReviewList,
    setDocReviewList,
    currentReviewID,
    setCurrentReviewID,
    levelSegments,
    setLevelSegments,
    selectionIDs,
    setSelectionIDs,
    segmentMode,
    datasetID,
    segmentInfo,
  } = props;

  const [isMenuPanelVisible, setIsMenuPanelVisible] = useState(true);

  /** preview file */
  const currentReview = docReviewList.find(
    review => review.review_id === currentReviewID,
  );
  const fileType = currentReview?.document_type;
  // The front end is not good to display docx, so you need to use the URL in pdf format converted by the back end.
  const fileUrl = ['docx', 'doc'].includes(fileType ?? '')
    ? currentReview?.preview_tos_url ?? ''
    : currentReview?.tos_url ?? '';
  const segmentTosUrl = currentReview?.doc_tree_tos_url ?? '';
  // Save review when switching documents
  const { loading: saveLoading, runAsync: saveDocumentReview } = useRequest(
    async () => {
      const res = await KnowledgeApi.SaveDocumentReview({
        review_id: currentReviewID,
        dataset_id: datasetID,
        doc_tree_json: JSON.stringify({ chunks: levelSegments }),
      });
      return res.code === 0;
    },
    {
      manual: true,
    },
  );
  const { runAsync: getNewDocReview } = useRequest(
    async () => {
      const res = await KnowledgeApi.MGetDocumentReview({
        dataset_id: datasetID,
        review_ids: docReviewList.map(item => item.review_id ?? ''),
      });
      if (res.code === 0) {
        setDocReviewList?.(res.reviews ?? []);
      }
    },
    {
      manual: true,
    },
  );

  const {
    pdfNode,
    numPages,
    currentPage,
    onNext,
    onBack,
    scale,
    increaseScale,
    decreaseScale,
  } = usePreviewPdf({
    fileUrl,
  });

  const { content, loading: tosLoading } = useTosContent(
    currentReview?.status === ReviewStatus.Enable && segmentTosUrl
      ? segmentTosUrl
      : undefined,
  );

  useEffect(() => {
    if (content) {
      setLevelSegments(
        withTitle(content?.chunks ?? [], currentReview?.document_name),
      );
    }
  }, [content]);

  const getDocumentTag = (status: ReviewStatus) => {
    switch (status) {
      case ReviewStatus.Failed:
        return (
          <Tag size="mini" color="red">
            {I18n.t('knowlege_qqq_003')}
          </Tag>
        );
      case ReviewStatus.Processing:
        return <Tag size="mini">{I18n.t('knowlege_qqq_002')}</Tag>;
      case ReviewStatus.Enable:
      default:
        return null;
    }
  };

  return (
    <div className="w-full grow flex flex-col item-center justify-center">
      <div className="flex w-full h-full border border-solid coz-stroke-primary coz-bg-max rounded-[8px]">
        <div className="w-full h-full flex">
          <div
            className={cls(
              'w-[300px] h-full px-4 flex flex-col',
              'transition-all duration-100 ease-in-out',
              !isMenuPanelVisible && '!w-[0px] !p-0 !invisible',
            )}
          >
            <div className="w-full flex justify-between h-[48px] pl-[8px] items-center shrink-0">
              <div className="text-[14px] font-[500] leading-[20px] coz-fg-plus shrink-0 flex items-center gap-[4px]">
                {segmentMode === SegmentMode.CUSTOM
                  ? I18n.t('datasets_createFileModel_step3_custom')
                  : null}
                {segmentMode === SegmentMode.AUTO
                  ? I18n.t('datasets_createFileModel_step3_auto')
                  : null}
                {segmentMode === SegmentMode.LEVEL
                  ? I18n.t('knowledge_level_001')
                  : null}
                {segmentInfo ? (
                  <Tooltip content={segmentInfo} style={{ maxWidth: 500 }}>
                    <IconCozInfoCircle className="coz-fg-secondary cursor-pointer" />
                  </Tooltip>
                ) : null}
              </div>
              <IconButton
                icon={<IconCozSideExpand />}
                color="secondary"
                onClick={() => {
                  setIsMenuPanelVisible(false);
                }}
              ></IconButton>
            </div>
            <Spin
              wrapperClassName="w-full h-[500px] grow flex flex-col"
              childStyle={{ width: '100%', height: '100%' }}
              spinning={saveLoading || tosLoading}
            >
              <SegmentMenu
                list={docReviewList.map(item => ({
                  id: item.review_id ?? '',
                  title: item.document_name ?? '',
                  tosUrl: item.doc_tree_tos_url ?? '',
                  tag: getDocumentTag(item.status ?? ReviewStatus.Enable),
                }))}
                selectedID={currentReviewID}
                onClick={async id => {
                  if (id !== currentReviewID) {
                    await saveDocumentReview();
                    await getNewDocReview();
                    setLevelSegments([]);
                  }
                  setCurrentReviewID(id);
                }}
                levelSegments={levelSegments}
                setLevelSegments={setLevelSegments}
                setSelectionIDs={setSelectionIDs}
                treeVisible={segmentMode === SegmentMode.LEVEL}
              />
            </Spin>
          </div>

          <div className="h-full w-[calc(100%-300px)] flex grow">
            <div
              className={cls(
                'h-full w-1/2 flex-1',
                isMenuPanelVisible &&
                  'border border-r-0 border-y-0 border-solid coz-stroke-primary',
                'flex flex-col',
              )}
            >
              <div
                className={cls(
                  'w-full flex justify-between h-[48px] px-[16px] items-center coz-bg-max',
                  'border border-x-0 border-t-0 border-solid coz-stroke-primary',
                  !isMenuPanelVisible && 'rounded-tl-[8px]',
                )}
              >
                <div className="flex w-full h-full items-center justify-between">
                  <div className="flex h-full items-center">
                    {!isMenuPanelVisible ? (
                      <>
                        <IconButton
                          icon={<IconCozSideExpand className="rotate-180" />}
                          color="secondary"
                          className="mr-[8px]"
                          onClick={() => {
                            setIsMenuPanelVisible(true);
                          }}
                        ></IconButton>
                        <div className="w-[1px] h-[12px] coz-mg-primary mr-[8px]"></div>
                      </>
                    ) : null}
                    <div className="text-[14px] font-[500] leading-[20px] coz-fg-plus">
                      {I18n.t('knowledge_level_010')}
                    </div>
                  </div>
                  {['pdf', 'docx', 'doc'].includes(fileType ?? '') &&
                  numPages >= 1 ? (
                    <div className="flex h-full items-center gap-[3px]">
                      <IconButton
                        icon={<IconCozArrowLeft />}
                        size="small"
                        color="secondary"
                        onClick={onBack}
                      ></IconButton>
                      <div className="coz-fg-secondary text-[12px] font-[400] leading-[24px]">
                        {currentPage} / {numPages}
                      </div>
                      <IconButton
                        icon={<IconCozArrowRight />}
                        size="small"
                        color="secondary"
                        onClick={onNext}
                      />
                      <div className="w-[1px] h-[12px] coz-mg-primary"></div>
                      <IconButton
                        icon={<IconCozMinus />}
                        size="small"
                        color="secondary"
                        onClick={decreaseScale}
                      />
                      <div className="coz-fg-secondary text-[12px] font-[400] leading-[16px]">
                        {Math.round(scale * 100)}%
                      </div>
                      <IconButton
                        icon={<IconCozPlus />}
                        size="small"
                        color="secondary"
                        onClick={increaseScale}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="grow w-full h-[650px] flex flex-col items-center overflow-auto">
                {fileType === 'md' ? <PreviewMd fileUrl={fileUrl} /> : null}
                {fileType === 'txt' ? <PreviewTxt fileUrl={fileUrl} /> : null}
                {['docx', 'pdf', 'doc'].includes(fileType ?? '') ? (
                  <div className="grow w-full">{pdfNode}</div>
                ) : null}
              </div>
            </div>
            <div
              className={cls(
                'h-full w-1/2 flex-1 coz-bg-max',
                'border border-r-0 border-y-0 border-solid coz-stroke-primary',
                'rounded-r-[8px]',
                'flex flex-col',
              )}
            >
              <div
                className={cls(
                  'w-full flex justify-between h-[48px] px-[16px] items-center',
                  'border border-x-0 border-t-0 border-solid coz-stroke-primary',
                )}
              >
                <div className="text-[14px] font-[500] leading-[20px] coz-fg-plus">
                  {I18n.t('knowledge_level_011')}
                </div>
              </div>
              <div
                className={cls(
                  'w-full h-[650px] grow flex flex-col items-center overflow-auto',
                  'p-4 pb-0',
                )}
              >
                <Spin
                  wrapperClassName="!w-full min-h-[650px] grow"
                  childStyle={{
                    width: '100%',
                    minHeight: '100%',
                  }}
                  spinning={!content}
                >
                  <LevelTextKnowledgeEditor
                    readonly
                    documentId={currentReviewID ?? ''}
                    selectionIDs={selectionIDs}
                    chunks={levelSegments.map(item => ({
                      ...item,
                      text_knowledge_editor_chunk_uuid: nanoid(),
                      sequence: item.slice_sequence?.toString(),
                      content: item.text,
                    }))}
                  />
                </Spin>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

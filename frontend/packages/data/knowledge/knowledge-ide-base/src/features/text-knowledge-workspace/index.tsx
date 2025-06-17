/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable complexity */
/* eslint-disable react-hooks/exhaustive-deps */
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classnames from 'classnames';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { isFeishuOrLarkDocumentSource } from '@coze-data/utils';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  useDataNavigate,
  useKnowledgeStore,
  useKnowledgeParams,
} from '@coze-data/knowledge-stores';
import {
  OptType,
  UnitType,
} from '@coze-data/knowledge-resource-processor-core';
import {
  useDeleteUnitModal,
  useUpdateFrequencyModal,
} from '@coze-data/knowledge-modal-base';
import { useTosContent } from '@coze-data/knowledge-common-hooks';
import { withTitle } from '@coze-data/knowledge-common-components/text-knowledge-editor/scenes/level';
import {
  LevelTextKnowledgeEditor,
  BaseTextKnowledgeEditor,
} from '@coze-data/knowledge-common-components/text-knowledge-editor';
import {
  SegmentMenu,
  usePreviewPdf,
  PreviewMd,
  PreviewTxt,
} from '@coze-data/knowledge-common-components';
import { KnowledgeE2e } from '@coze-data/e2e';
import { REPORT_EVENTS as ReportEventNames } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import {
  IconCozAdjust,
  IconCozHistory,
  IconCozTrashCan,
  IconCozArrowLeft,
  IconCozArrowRight,
  IconCozMinus,
  IconCozPlus,
} from '@coze-arch/coze-design/icons';
import {
  EmptyState,
  Space,
  Spin,
  Toast,
  Tooltip,
  IconButton,
  Switch,
} from '@coze-arch/coze-design';
import { IconSegmentEmpty } from '@coze-arch/bot-icons';
import {
  FormatType,
  type DocumentInfo,
  DocumentStatus,
  DocumentSource,
  UpdateType,
  ChunkType,
} from '@coze-arch/bot-api/knowledge';

import { type ProgressMap } from '@/types';
import { useScrollListSliceReq } from '@/service';

import { createLevelDocumentChunkByLevelSegment } from './utils/level-segment';
import { getDocumentOptions } from './utils/document-opts';
import { createBaseDocumentChunkBySliceInfo } from './utils/base-segment';
import { DocTag } from './doc-tag';
import { DocSelector } from './doc-selector';

import styles from './index.module.less';

export interface TextKnowledgeWorkspaceProps {
  onChangeDocList?: (docList: DocumentInfo[]) => void;
  reload?: () => void;
  progressMap: ProgressMap;
  linkOriginUrlButton?: ReactNode;
  fetchSliceButton?: ReactNode;
}

export const TextKnowledgeWorkspace = ({
  onChangeDocList,
  reload: reloadDataset,
  progressMap,
  linkOriginUrlButton,
  fetchSliceButton,
}: TextKnowledgeWorkspaceProps) => {
  const knowledgeParams = useKnowledgeParams();
  const dataSetDetail = useKnowledgeStore(state => state.dataSetDetail);
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const setDataSetDetail = useKnowledgeStore(state => state.setDataSetDetail);
  const documentList = useKnowledgeStore(state => state.documentList);
  const searchValue = useKnowledgeStore(state => state.searchValue);
  const levelSegments = useKnowledgeStore(state => state.levelSegments);
  const setLevelSegments = useKnowledgeStore(state => state.setLevelSegments);
  // 用于层级分段选中滚动
  const [selectionIDs, setSelectionIDs] = useState<string[]>([]);
  const resourceNavigate = useDataNavigate();
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  /**
   * 切换文档时缓存的上一篇文档id，当前主要用于加载失败后回滚用
   */
  const prevDocIdRef = useRef<string | null>(null);
  const { curDocId, setCurDocId } = useKnowledgeStore(
    useShallow(state => ({
      curDocId: state.curDocId,
      setCurDocId: state.setCurDocId,
    })),
  );

  const curDoc = documentList?.find(i => i.document_id === curDocId);
  const isLocalText = Boolean(curDoc?.source_type === DocumentSource.Document);
  const processFinished = curDocId
    ? progressMap[curDocId]?.status === DocumentStatus.Enable
    : false;

  const curFormatType: FormatType | undefined = dataSetDetail?.format_type;
  const datasetId = dataSetDetail?.dataset_id ?? '';
  const {
    loading,
    data: sliceData,
    mutate,
    reload,
  } = useScrollListSliceReq({
    params: {
      keyword: searchValue,
      document_id:
        // 如果是层级分段则不请求
        curDoc?.chunk_strategy?.chunk_type !== ChunkType.LevelChunk
          ? curDocId
          : '',
    },
    reloadDeps: [searchValue, curDocId, datasetId, processFinished],
    target: contentWrapperRef,
    onError: error => {
      /** 拉取 slice 失败时,回退 curDocId，避免文档标题和内容不一致，用户迷惑 */

      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: ReportEventNames.KnowledgeGetSliceList,
        error,
      });

      Toast.error(I18n.t('knowledge_document_view'));

      if (prevDocIdRef.current) {
        setCurDocId(prevDocIdRef.current);
      }
    },
  });

  useEffect(() => {
    if (documentList?.length) {
      setCurDocId(documentList[0]?.document_id ?? '');
    }
  }, [documentList]);

  // TODO: 全文搜索先下掉
  useEffect(() => {
    reload();
  }, [searchValue]);

  // 获取层级分段 slice 列表
  const { content: treeContent, loading: tosLoading } = useTosContent(
    curDoc?.doc_tree_tos_url,
  );
  useEffect(() => {
    setLevelSegments(withTitle(treeContent?.chunks ?? [], curDoc?.name ?? ''));
  }, [treeContent]);

  const isProcessing = curDoc?.status === DocumentStatus.Processing;

  const showUpdateFreBtn =
    canEdit &&
    curDoc &&
    (curDoc.source_type === DocumentSource.Web ||
      isFeishuOrLarkDocumentSource(curDoc?.source_type));
  const showDeleteDocBtn = curDoc && canEdit;
  const showResegmentButton = curDoc?.format_type === FormatType.Text;
  const showFetchSliceBtn =
    canEdit &&
    curDoc &&
    ![DocumentSource.Custom, DocumentSource.Document].includes(
      curDoc.source_type as DocumentSource,
    );
  const { node: updateFrequencyModalNodeNew, edit: updateFrequencyModalNew } =
    useUpdateFrequencyModal({
      docId: curDoc?.document_id,
      onFinish: formData => {
        // @ts-expect-error -- linter-disable-autofix
        onChangeDocList(
          documentList.map(doc => {
            if (doc.document_id === curDoc?.document_id) {
              const newDocInfo = {
                ...doc,
                update_interval: formData?.updateInterval,
                update_type: formData.updateInterval
                  ? UpdateType.Cover
                  : UpdateType.NoUpdate,
              };
              setCurDocId(newDocInfo.document_id ?? '');
              return newDocInfo;
            }
            return doc;
          }),
        );
      },
      type: curFormatType,
      documentSource: curDoc?.source_type,
    });

  const { node: deleteModalNodeNew, delete: handlerDeleteNew } =
    useDeleteUnitModal({
      docId: curDoc?.document_id,
      onDel: () => {
        reloadDataset?.();
        setCurDocId('');
      },
    });

  const docOptions = useMemo(
    () => getDocumentOptions(documentList || [], progressMap),
    [documentList, progressMap],
  );

  const renderSliceCardList = () => {
    const renderData = sliceData?.list.map(item =>
      createBaseDocumentChunkBySliceInfo(item),
    );

    if (renderData?.length === 0 && !loading) {
      return (
        <div className={styles['empty-content']}>
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

    // 文本类型
    return (
      <div className={styles['slice-article-content']}>
        <BaseTextKnowledgeEditor
          chunks={renderData ?? []}
          documentId={curDoc?.document_id ?? ''}
          readonly={!canEdit}
          onChange={chunks => {
            mutate({
              ...sliceData,
              list: chunks,
              total: Number(sliceData?.total ?? '0'),
            });
          }}
          onAddChunk={() => {
            reload();
            if (dataSetDetail) {
              setDataSetDetail({
                ...dataSetDetail,
                slice_count:
                  // @ts-expect-error -- linter-disable-autofix
                  dataSetDetail.slice_count > -1
                    ? // @ts-expect-error -- linter-disable-autofix
                      dataSetDetail.slice_count + 1
                    : 0,
              });
            }
          }}
          onDeleteChunk={deletedChunk => {
            if (dataSetDetail) {
              setDataSetDetail({
                ...dataSetDetail,
                slice_count:
                  // @ts-expect-error -- linter-disable-autofix
                  dataSetDetail.slice_count > -1
                    ? // @ts-expect-error -- linter-disable-autofix
                      dataSetDetail.slice_count - 1
                    : 0,
              });
            }
          }}
        />
      </div>
    );
  };

  const renderLevelSegments = () => {
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
        chunks={levelSegments.map(item =>
          createLevelDocumentChunkByLevelSegment(item),
        )}
        selectionIDs={selectionIDs}
        documentId={curDoc?.document_id ?? ''}
        readonly={!canEdit}
        onChange={chunks => {
          setLevelSegments(chunks);
        }}
        onDeleteChunk={chunk => {
          setLevelSegments(
            levelSegments.filter(item => item.slice_id !== chunk.slice_id),
          );
        }}
      />
    );
  };

  const [showOriginalFile, setShowOriginalFile] = useState(false);
  const fileType = curDoc?.type;
  const fileUrl = curDoc?.preview_tos_url ?? '';
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

  useEffect(() => {
    if (showOriginalFile) {
      setShowOriginalFile(false);
    }
  }, [curDocId]);
  /**
   * 顶部工具栏
   */
  const TextToolbar = (
    <div
      className={classnames(
        'w-full flex items-center justify-between py-[12px] px-[16px]',
        'border border-solid coz-stroke-primary border-l-0 border-t-0 border-r-0',
      )}
    >
      <div className={classnames('flex items-center')}>
        <DocSelector
          // @ts-expect-error -- linter-disable-autofix
          reload={reloadDataset}
          type={curFormatType as FormatType}
          options={docOptions}
          canEdit={canEdit}
          value={curDocId}
          onChange={v => {
            /**
             * 保存切换前的文档id，方便加载内容失败后回滚
             */
            prevDocIdRef.current = curDocId || null;

            setCurDocId(v);
          }}
        />
        <DocTag documentInfo={curDoc} />
      </div>

      <Space spacing={8}>
        {fileUrl ? (
          <div className="flex items-center gap-2">
            <span className="coz-fg-secondary text-[12px] leading-[16px]">
              {I18n.t('knowledge_level_030')}
            </span>
            <Switch
              size="mini"
              checked={showOriginalFile}
              onChange={checked => {
                setShowOriginalFile(checked);
              }}
            ></Switch>
          </div>
        ) : null}
        {showResegmentButton && canEdit ? (
          <Tooltip theme="dark" content={I18n.t('knowledge_new_001')}>
            <IconButton
              iconPosition="left"
              color="secondary"
              size="small"
              icon={<IconCozAdjust />}
              onClick={() => {
                resourceNavigate.upload?.({
                  type: isLocalText ? UnitType.TEXT_DOC : UnitType.TEXT,
                  opt: OptType.RESEGMENT,
                  doc_id: curDocId ?? '',
                  page_mode: knowledgeParams.pageMode ?? '',
                  bot_id: knowledgeParams.botID ?? '',
                });
              }}
            />
          </Tooltip>
        ) : null}
        {showUpdateFreBtn ? (
          <Tooltip
            theme="dark"
            content={I18n.t('datasets_unit_upload_field_update_frequency')}
          >
            <IconButton
              data-dtestid={`${KnowledgeE2e.SegmentDetailContentItemFrequencyIcon}.${curDoc?.document_id}`}
              icon={<IconCozHistory className="text-[14px]" />}
              iconPosition="left"
              color="secondary"
              size="small"
              onClick={() =>
                updateFrequencyModalNew({
                  updateInterval: curDoc?.update_interval,
                  updateType: curDoc?.update_type,
                })
              }
            ></IconButton>
          </Tooltip>
        ) : null}

        {showFetchSliceBtn ? fetchSliceButton : null}
        {linkOriginUrlButton}
        {showDeleteDocBtn ? (
          <Tooltip theme="dark" content={I18n.t('kl2_006')}>
            <IconButton
              data-testid={KnowledgeE2e.SegmentDetailContentDeleteIcon}
              icon={<IconCozTrashCan className="text-[14px]" />}
              color="secondary"
              iconPosition="left"
              size="small"
              onClick={handlerDeleteNew}
            ></IconButton>
          </Tooltip>
        ) : null}
      </Space>
    </div>
  );

  // TODO: hzf biz的分化在Scene层维护
  const fromProject = knowledgeParams.biz === 'project';

  return (
    <>
      <div
        className={classnames(
          'flex grow border-solid coz-stroke-primary coz-bg-max',
          fromProject
            ? 'h-[calc(100%-64px)] border-0 border-t'
            : 'h-[calc(100%-112px)] border rounded-[8px]',
        )}
      >
        <div
          className={classnames(
            'w-[300px] h-full shrink-0 overflow-auto p-[12px]',
            'border-0 border-r border-solid coz-stroke-primary',
          )}
        >
          <SegmentMenu
            isSearchable
            list={(documentList ?? []).map(item => ({
              id: item.document_id ?? '',
              title: item.name ?? '',
              label: docOptions.find(opt => opt.value === item.document_id)
                ?.label,
            }))}
            selectedID={curDocId}
            onClick={id => {
              if (id !== curDocId) {
                setCurDocId(id);
                setLevelSegments([]);
              }
            }}
            levelSegments={levelSegments}
            setSelectionIDs={setSelectionIDs}
            treeDisabled
            treeVisible={
              curDoc?.chunk_strategy?.chunk_type === ChunkType.LevelChunk
            }
          />
        </div>
        <Spin
          spinning={loading || tosLoading}
          size="large"
          wrapperClassName="h-full !w-full grow rounded-r-[8px] overflow-hidden"
          childStyle={{ height: '100%', flexGrow: 1, width: '100%' }}
        >
          {TextToolbar}
          <div className="flex h-[calc(100%-56px)] grow w-full">
            <div
              className={classnames(
                'w-full h-full',
                'border border-solid coz-stroke-primary border-t-0 border-b-0 border-l-0',
                'flex flex-col items-center overflow-auto',
                !showOriginalFile && 'hidden',
              )}
            >
              {fileType === 'md' ? <PreviewMd fileUrl={fileUrl} /> : null}
              {fileType === 'txt' ? <PreviewTxt fileUrl={fileUrl} /> : null}
              {['docx', 'pdf', 'doc'].includes(fileType ?? '') ? (
                <div className="grow w-full relative">
                  {numPages >= 1 ? (
                    <div
                      className={classnames(
                        'flex w-fit h-[32px] items-center justify-center gap-[3px] absolute top-[8px] right-[8px]',
                        'coz-bg-max rounded-[8px] coz-shadow-default',
                        'z-10',
                        'px-[8px]',
                      )}
                    >
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
                  {pdfNode}
                </div>
              ) : null}
            </div>
            <div
              ref={contentWrapperRef}
              className={classnames(
                'w-full grow h-full overflow-auto',
                'px-[16px] pt-[16px]',
              )}
            >
              {curDoc?.chunk_strategy?.chunk_type === ChunkType.LevelChunk
                ? renderLevelSegments()
                : renderSliceCardList()}
            </div>
          </div>
        </Spin>
      </div>
      {deleteModalNodeNew}
      {updateFrequencyModalNodeNew}
    </>
  );
};

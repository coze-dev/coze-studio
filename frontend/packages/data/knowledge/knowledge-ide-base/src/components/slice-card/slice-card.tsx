/* eslint-disable @coze-arch/max-line-per-function */
import {
  Fragment,
  type MouseEvent,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';

import DOMPurify from 'dompurify';
import { useRequest } from 'ahooks';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  useTextSegmentModal,
  imageOnError,
} from '@coze-data/knowledge-modal-base';
import { KnowledgeE2e } from '@coze-data/e2e';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import {
  type DocumentInfo,
  type FormatType,
  SliceStatus,
  type SliceInfo,
  type Dataset,
  StorageLocation,
} from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';
import {
  IconCozDocumentAddBottom,
  IconCozDocumentAddTop,
  IconCozEdit,
  IconCozInfoCircle,
} from '@coze/coze-design/icons';
import { Tag, Tooltip, Space, TextArea, IconButton } from '@coze/coze-design';

import { escapeHtml } from '@/utils/preview';
import { type ISliceInfo, type TPosition } from '@/types/slice';
import { delSlice } from '@/service';

import s from './index.module.less';

interface SliceCardProps {
  sliceInfo: ISliceInfo;
  documentInfo?: DocumentInfo | null;
  initSliceList?: (id: string) => void;
  /** 该属性目前唯一用途是判断是否是抖音分身，进而控制是否允许上传图片 */
  dataSetDetail?: Dataset;
  onDelete: (slice_id: string) => void;
  onReload: () => void;
  onUpdate: (slice_id: string, content: string) => void;
  insertSuccess: (item: SliceInfo) => void;
  canEdit: boolean;
  isEditingSlice?: boolean;
  curFormatType?: FormatType;
  isContentView?: boolean;
  // isAdd?: boolean;
  onContextMenu?: (
    e: MouseEvent<HTMLDivElement>,
    params: {
      onEdit: () => void;
      onDelete: () => void;
      onInsert: (position: TPosition) => void;
    },
  ) => void;
  onInsertEntry: (position: TPosition) => void;
}

const MAX_CONTENT_LENGTH = 5000;

export const SliceCard: React.FC<SliceCardProps> = ({
  sliceInfo,
  documentInfo,
  dataSetDetail,
  initSliceList,
  onDelete,
  onReload,
  onUpdate,
  canEdit,
  curFormatType,
  isContentView,
  onContextMenu,
  isEditingSlice,
  onInsertEntry,
  insertSuccess,
}) => {
  const {
    sequence,
    content,
    status,
    char_count,
    hit_count,
    slice_id,
    // isNewAdd,
    id: sliceId,
  } = sliceInfo;
  const contentViewRef = useRef<HTMLDivElement>(null);
  const [newContent, setNewContent] = useState('');
  const docId = documentInfo?.document_id ?? '';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { run: createSlice } = useRequest(
    async () => {
      if (!docId) {
        throw new CustomError('normal_error', 'missing doc_id');
      }

      return await KnowledgeApi.CreateSlice({
        document_id: docId,
        raw_text: newContent,
        sequence,
      });
    },
    {
      manual: true,
      onSuccess: data => {
        insertSuccess({
          status: SliceStatus.FinishVectoring,
          document_id: docId,
          content: newContent,
          sequence,
          slice_id: data?.slice_id ?? '',
          hit_count: '0',
          char_count: (newContent?.length ?? 0).toString(),
        });
        // onReload();
      },
      onError: error => {
        textareaRef.current?.focus();
        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
          eventName: REPORT_EVENTS.KnowledgeCreateSlice,
          error,
        });
      },
    },
  );

  const isAudiFailed = status === SliceStatus.AuditFailed;

  const ispPendingVectoring = useMemo(
    () => status === SliceStatus.PendingVectoring,
    [status],
  );
  const onBlur = () => {
    if (!newContent) {
      initSliceList?.(sliceId ?? '');
      return;
    }
    createSlice();
  };
  const { node: updateTextSegmentModalNode, open: openTextSegmentModal } =
    useTextSegmentModal({
      canEdit,
      enableImg: dataSetDetail?.storage_location !== StorageLocation.Douyin,
      sliceID: slice_id ?? '',
      title: (
        <div className={s['slice-modal-title']}>
          {I18n.t('datasets_segment_detailModel_title', { num: sequence })}
          {ispPendingVectoring ? (
            <Tag className={s.tag} color="red">
              {I18n.t('datasets_segment_card_processing')}
            </Tag>
          ) : null}
          <Tag>{`${char_count} ${I18n.t('datasets_segment_card_bit', {
            num: char_count,
          })}`}</Tag>
          <Tag>{I18n.t('datasets_segment_card_hit', { num: hit_count })}</Tag>
        </div>
      ),
      disabled: ispPendingVectoring,
      onFinish: sContent => {
        if (slice_id) {
          onUpdate(slice_id, sContent);
        }
      },
    });
  const handleEditTextSegment = () => {
    const errMsg = isAudiFailed
      ? I18n.t('community_This_is_a_toast_Machine_review_failed')
      : '';
    openTextSegmentModal(content || '', errMsg);
  };

  const handleInsertEntry = (position: 'top' | 'bottom') => {
    if (isEditingSlice) {
      return;
    }
    onInsertEntry(position);
  };

  useEffect(() => {
    if (contentViewRef.current) {
      const imgs = contentViewRef.current.getElementsByTagName('img');
      if (imgs) {
        // @ts-expect-error -- linter-disable-autofix
        for (const img of imgs) {
          img.addEventListener('error', imageOnError);
        }
      }
    }
  }, [sliceInfo]);

  if (sliceId) {
    return (
      <Fragment key={sliceInfo.slice_id}>
        <div className={s['add-slice-section']}>
          <TextArea
            ref={textareaRef}
            autoFocus
            value={newContent}
            autosize={{ minRows: 2 }}
            validateStatus={isAudiFailed ? 'error' : 'default'}
            onChange={v => setNewContent(v)}
            maxCount={MAX_CONTENT_LENGTH}
            maxLength={MAX_CONTENT_LENGTH}
            onBlur={onBlur}
          />
          {/* {isAudiFailed && (
            <div className={s['add-slice-section-error']}>
              内容包含敏感信息，请修改后再试
            </div>
          )} */}
        </div>
      </Fragment>
    );
  }

  const html = escapeHtml(sliceInfo.content ?? '');

  return (
    <Fragment key={sliceInfo.slice_id}>
      <div
        ref={contentViewRef}
        className={s['slice-section']}
        onContextMenu={e => {
          onContextMenu?.(e, {
            onEdit: handleEditTextSegment,
            onDelete: async () => {
              // @ts-expect-error -- linter-disable-autofix
              await delSlice([sliceInfo.slice_id]);
              // @ts-expect-error -- linter-disable-autofix
              onDelete(sliceInfo.slice_id);
            },
            onInsert: handleInsertEntry,
          });
        }}
      >
        {
          <span
            // 已使用 DOMPurify 过滤 xss
            // eslint-disable-next-line risxss/catch-potential-xss-react
            dangerouslySetInnerHTML={{
              __html:
                DOMPurify.sanitize(html as string, {
                  /**
                   * 1. 防止CSS注入攻击
                   * 2. 防止用户误写入style标签，导致全局样式被修改，页面展示异常
                   */
                  FORBID_TAGS: ['style'],
                }) ?? '',
            }}
          ></span>
        }
        <div className={s['slice-section-icons']}>
          {canEdit ? (
            <div className={s['slice-section-actions']}>
              <Space spacing={3}>
                <Tooltip
                  content={I18n.t('datasets_segment_edit')}
                  clickToHide
                  autoAdjustOverflow
                >
                  <IconButton
                    data-dtestid={`${KnowledgeE2e.SegmentDetailContentItemEditIcon}.${sliceInfo.slice_id}`}
                    size="small"
                    color="secondary"
                    icon={<IconCozEdit className="text-[14px]" />}
                    iconPosition="left"
                    className={'coz-fg-secondary leading-none'}
                    onClick={handleEditTextSegment}
                  ></IconButton>
                </Tooltip>

                <Tooltip
                  content={I18n.t('knowledge_optimize_017')}
                  clickToHide
                  autoAdjustOverflow
                >
                  <IconButton
                    data-dtestid={`${KnowledgeE2e.SegmentDetailContentItemAddTopIcon}.${sliceInfo.slice_id}`}
                    size="small"
                    color="secondary"
                    icon={<IconCozDocumentAddTop className="text-[14px]" />}
                    iconPosition="left"
                    className={'coz-fg-secondary leading-none'}
                    disabled={isEditingSlice}
                    onClick={() => handleInsertEntry('top')}
                  ></IconButton>
                </Tooltip>
                <Tooltip
                  content={I18n.t('knowledge_optimize_016')}
                  clickToHide
                  autoAdjustOverflow
                >
                  <IconButton
                    data-dtestid={`${KnowledgeE2e.SegmentDetailContentItemAddBottomIcon}.${sliceInfo.slice_id}`}
                    size="small"
                    color="secondary"
                    icon={<IconCozDocumentAddBottom className="text-[14px]" />}
                    iconPosition="left"
                    className={'coz-fg-secondary leading-none'}
                    disabled={isEditingSlice}
                    onClick={() => handleInsertEntry('bottom')}
                  ></IconButton>
                </Tooltip>
              </Space>
            </div>
          ) : null}

          {isAudiFailed ? (
            <div className={s['warning-icon']}>
              <Tooltip
                content={I18n.t(
                  'community_This_is_a_toast_Machine_review_failed',
                )}
                clickToHide
                autoAdjustOverflow
              >
                <IconButton
                  icon={
                    <IconCozInfoCircle className="text-[14px] coz-fg-hglt-red" />
                  }
                  size="small"
                  color="secondary"
                  className={'coz-fg-secondary leading-none'}
                />
              </Tooltip>
            </div>
          ) : null}
        </div>
      </div>
      {updateTextSegmentModalNode}
    </Fragment>
  );
};

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
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable max-lines-per-function */
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState, type FC, useRef } from 'react';

import dayjs from 'dayjs';
import classNames from 'classnames';
import { DataNamespace, dataReporter } from '@coze-data/reporter';
import {
  useKnowledgeParams,
  useKnowledgeStore,
} from '@coze-data/knowledge-stores';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import {
  Card,
  CardGroup,
  Image,
  Space,
  Spin,
  Tooltip,
  Typography,
  UIIconButton,
  UIModal,
  UIEmpty,
} from '@coze-arch/bot-semi';
import {
  IconCloseKnowledge,
  IconDeleteOutline,
  IconEdit,
  IconWaringRed,
  IconSegmentEmpty,
  IconImageFailOutlined,
} from '@coze-arch/bot-icons';
import { DocumentStatus, type PhotoInfo } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { type ProgressItem, type ProgressMap } from '@/types';
import { usePhotoDetailModal } from '@/components/photo-detail-modal';

import { usePhotoList } from './use-photo-list';

import styles from './index.module.less';

export interface ImageKnowledgeWorkspaceProps {
  progressMap: ProgressMap;
}

export const ImageKnowledgeWorkspace: FC<
  ImageKnowledgeWorkspaceProps
> = props => {
  const { progressMap } = props;
  const [_, setSearchParams] = useSearchParams();
  const params = useKnowledgeParams();
  const firstAutoOpenEditDocumentId = params.first_auto_open_edit_document_id;
  const [currentPhotoId, setCurrentPhotoId] = useState<string>('');
  const [currentHoverCardId, setCurrentHoverCardId] = useState<string>('');

  const dataSetDetail = useKnowledgeStore(state => state.dataSetDetail);
  const canEdit = useKnowledgeStore(state => state.canEdit);
  const searchValue = useKnowledgeStore(state => state.searchValue);
  const photoFilterValue = useKnowledgeStore(state => state.photoFilterValue);
  const ref = useRef<HTMLDivElement>(null);

  const { data, loading, loadingMore, reloadAsync, noMore } = usePhotoList(
    {
      // @ts-expect-error -- linter-disable-autofix
      datasetID: dataSetDetail?.dataset_id,
      filterPhotoType: photoFilterValue,
      searchValue,
    },
    {
      // @ts-expect-error -- linter-disable-autofix
      isNoMore: d => d?.list.length >= d?.total,
      target: ref,
    },
  );

  const photoList = data?.list;

  const shouldAutoOpenDetailModal = photoList?.find(
    i => i.document_id === firstAutoOpenEditDocumentId,
  );

  const previewPhotoList = photoList?.filter(
    photo => photo.status !== DocumentStatus.AuditFailed,
  );
  const curPhoto = previewPhotoList?.find(
    i => i.document_id === currentPhotoId,
  );

  const resetUrlQueryParams = () => {
    setSearchParams((state: URLSearchParams) => {
      state.delete('action_type');
      return state;
    });
  };

  const { node, open } = usePhotoDetailModal({
    photo: curPhoto,
    progressMap,
    photoList: previewPhotoList,
    canEdit: !!canEdit,
    setCurrentPhotoId,
    reload: reloadAsync,
    onCancel: () => {
      // Reset url parameters
      resetUrlQueryParams();
    },
    onSubmit: () => {
      resetUrlQueryParams();
    },
  });

  // Manually control data loading timing
  useEffect(() => {
    if (dataSetDetail?.dataset_id) {
      reloadAsync();

      // When reloading, return to the top
      ref.current?.scrollTo?.({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [searchValue, photoFilterValue, dataSetDetail?.dataset_id]);

  // Automatically open the editing pop-up window
  useEffect(() => {
    if (shouldAutoOpenDetailModal) {
      if (firstAutoOpenEditDocumentId) {
        setCurrentPhotoId(firstAutoOpenEditDocumentId);
      }
      open();
    }
  }, [firstAutoOpenEditDocumentId, shouldAutoOpenDetailModal]);

  return (
    <>
      <div className={styles['photo-list']} ref={ref}>
        <Spin
          spinning={loading}
          wrapperClassName={styles['photo-list-spin']}
          childStyle={{
            height: '100%',
            width: '100%',
          }}
        >
          {/* @ts-expect-error -- linter-disable-autofix */}
          {photoList?.length <= 0 ? (
            <UIEmpty
              empty={{
                icon: <IconSegmentEmpty />,
                title: I18n.t('query_data_empty'),
              }}
            />
          ) : (
            <CardGroup spacing={12} className={styles['card-group']}>
              {photoList?.map(item => {
                const {
                  url,
                  document_id,
                  name,
                  update_time,
                  caption: originCaption,
                  status: originStatus,
                } = item;
                // Use progressMap here to keep refreshing until completion
                // @ts-expect-error -- linter-disable-autofix
                const status = progressMap[document_id]?.status || originStatus;
                // Use progressMap to get the latest caption
                const caption =
                  // @ts-expect-error -- linter-disable-autofix
                  (progressMap[document_id] as ProgressItem & PhotoInfo)
                    ?.caption || originCaption;

                const hasCaption =
                  typeof caption === 'string' && Boolean(caption);

                const handleEdit = () => {
                  // @ts-expect-error -- linter-disable-autofix
                  setCurrentPhotoId(document_id);
                  open();
                };

                const handleDelete = () => {
                  UIModal.error({
                    // Required parameters to confirm modal style
                    className: styles['confirm-modal'],
                    closeIcon: <IconCloseKnowledge />,

                    // custom parameters
                    title: I18n.t('kl2_007'),
                    content: I18n.t(
                      'dataset_detail_table_deleteModel_description',
                    ),
                    icon: <IconWaringRed />,
                    cancelText: I18n.t('Cancel'),
                    okText: I18n.t('Delete'),
                    okButtonProps: {
                      type: 'danger',
                    },
                    onOk: async () => {
                      try {
                        await KnowledgeApi.DeleteDocument({
                          // @ts-expect-error -- linter-disable-autofix
                          document_ids: [document_id],
                        });
                        await reloadAsync();
                      } catch (error) {
                        dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
                          eventName: REPORT_EVENTS.KnowledgeDeleteDocument,
                          error: error as Error,
                        });
                      }
                    },
                  });
                };

                const onMouseEnter = () => {
                  // @ts-expect-error -- linter-disable-autofix
                  setCurrentHoverCardId(document_id);
                };

                const onMouseLeave = () => {
                  setCurrentHoverCardId('');
                };

                const isHover = currentHoverCardId === document_id;
                const isAudiFailed =
                  originStatus === DocumentStatus.AuditFailed;
                const getCaption = () => {
                  // Illegal pictures
                  if (isAudiFailed) {
                    return (
                      <span>
                        {I18n.t('knowledge_content_illegal_error_msg')}
                      </span>
                    );
                  }

                  // Processing failed
                  if (status === DocumentStatus.Failed) {
                    return (
                      <span className={styles['failed-tag']}>
                        {I18n.t('dataset_process_fail')}
                      </span>
                    );
                  }

                  // Processing
                  if (status === DocumentStatus.Processing) {
                    return (
                      <span className={styles['processing-tag']}>
                        {I18n.t('datasets_segment_tag_processing')}
                      </span>
                    );
                  }

                  // marked
                  if (hasCaption) {
                    return caption;
                  }

                  // unmarked
                  return I18n.t('knowledge_photo_016');
                };

                return (
                  <Card
                    key={document_id}
                    cover={
                      isAudiFailed ? (
                        <div className={styles['prohibit-cover']}>
                          <IconImageFailOutlined size={'extra-small'} />
                          <p>{I18n.t('knowledge_photo_illegal_error_msg')}</p>
                        </div>
                      ) : (
                        <Image
                          src={url}
                          // Only set the width, and the height will be automatically scaled according to the original scale of the picture.
                          width={222}
                          preview={false}
                          onClick={handleEdit}
                          className={styles['card-cover']}
                        />
                      )
                    }
                    headerLine={false}
                    bodyStyle={{
                      padding: '12px 16px',
                    }}
                    className={classNames(
                      styles.card,
                      isAudiFailed ? styles['card-disabled'] : '',
                    )}
                  >
                    <div
                      onMouseEnter={onMouseEnter}
                      onMouseLeave={onMouseLeave}
                      className={styles['card-content']}
                    >
                      <Typography.Text
                        className={styles['photo-name']}
                        ellipsis={{
                          showTooltip: true,
                        }}
                      >
                        {name}
                      </Typography.Text>
                      <Typography.Paragraph
                        className={styles['photo-description']}
                        ellipsis={{
                          showTooltip: true,
                          rows: 2,
                        }}
                        style={{
                          color: hasCaption
                            ? 'rgba(29, 28, 35, 0.6)'
                            : 'rgba(255, 178, 51, 1)',
                        }}
                      >
                        {getCaption()}
                      </Typography.Paragraph>

                      <div className={styles['card-footer']}>
                        <Typography.Text className={styles['create-time']}>
                          {/* @ts-expect-error -- linter-disable-autofix */}
                          {dayjs.unix(update_time).format('YYYY-MM-DD HH:mm')}
                        </Typography.Text>
                        {isHover && canEdit ? (
                          <Space spacing={12}>
                            <Tooltip content={I18n.t('Edit')}>
                              <UIIconButton
                                icon={<IconEdit />}
                                disabled={isAudiFailed}
                                onClick={handleEdit}
                              />
                            </Tooltip>
                            <Tooltip content={I18n.t('Delete')}>
                              <UIIconButton
                                icon={<IconDeleteOutline />}
                                onClick={handleDelete}
                              />
                            </Tooltip>
                          </Space>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </CardGroup>
          )}
        </Spin>
        <div className={styles.footer}>
          {!noMore && (
            <Spin
              spinning={loadingMore}
              tip={I18n.t('loading')}
              wrapperClassName={styles.spin}
            />
          )}
        </div>
      </div>
      {node}
    </>
  );
};

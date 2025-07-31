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
import React, { useEffect, useState } from 'react';

import { DataNamespace, dataReporter } from '@coze-data/reporter';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import {
  UIModal,
  Image,
  TextArea,
  Spin,
  IconButton,
  Icon,
} from '@coze-arch/bot-semi';
import { DocumentStatus, type PhotoInfo } from '@coze-arch/bot-api/knowledge';
import { KnowledgeApi } from '@coze-arch/bot-api';

import { type ProgressMap } from '@/types';
import { ReactComponent as SvgArrowLeft } from '@/assets/icon_arrow_left.svg';

import { AutoGenerateButton } from '../auto-generate-photo-detail-button';

import styles from './index.module.less';

export interface UsePhotoDetailModalParams {
  photo: PhotoInfo | undefined;
  photoList: PhotoInfo[] | undefined;
  progressMap: ProgressMap;
  canEdit: boolean;
  setCurrentPhotoId: (v: string) => void;
  reload: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
}

export const usePhotoDetailModal = (params: UsePhotoDetailModalParams) => {
  const {
    photo = {},
    photoList = [],
    canEdit = false,
    setCurrentPhotoId,
    reload,
    progressMap,
    onCancel,
    onSubmit,
  } = params;

  const [visible, setVisible] = useState(false);
  const [textAreaLoading, setTextAreaLoading] = useState(false);
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState('');

  const { document_id, status: originStatus } = photo;

  const currentIndex = photoList.findIndex(i => i.document_id === document_id);

  const status = progressMap[document_id || '']?.status || originStatus;

  // The photo that failed to be processed is not allowed to update the caption.
  const disableUpdate =
    status === DocumentStatus.Processing ||
    status === DocumentStatus.Failed ||
    !canEdit;

  useEffect(() => {
    if (visible) {
      // @ts-expect-error -- linter-disable-autofix
      setTextAreaValue(photo.caption);
    }
  }, [
    visible,
    // The initial state needs to be updated when switching pictures.
    document_id,
  ]);

  const handleSave = async () => {
    if (disableUpdate) {
      setVisible(false);
      return;
    }

    onSubmit?.();
    setSaveButtonLoading(true);
    try {
      await KnowledgeApi.UpdatePhotoCaption({
        // @ts-expect-error -- linter-disable-autofix
        document_id,
        caption: textAreaValue,
      });
      reload();
      setSaveButtonLoading(false);
      setVisible(false);
    } catch (error) {
      dataReporter.errorEvent(DataNamespace.KNOWLEDGE, {
        eventName: REPORT_EVENTS.KnowledgeUpdatePhotoCaption,
        error: error as Error,
      });
      setSaveButtonLoading(false);
    }
  };

  return {
    node: (
      <UIModal
        visible={visible}
        onCancel={() => {
          setVisible(false);
          onCancel?.();
        }}
        centered
        title={I18n.t('knowledge_photo_019')}
        width={792}
        onOk={handleSave}
        okButtonProps={{
          disabled: disableUpdate,
          loading: saveButtonLoading,
        }}
      >
        <div className={styles['modal-content']}>
          <div className={styles['photo-large']}>
            <Image
              // Only set the height, and the width will be automatically scaled according to the original scale of the picture.
              height={300}
              src={photo.url}
            />
            {
              // Not found, or for the first one, the pre button is not displayed
              currentIndex < 1 ? null : (
                <IconButton
                  icon={<Icon svg={<SvgArrowLeft />} />}
                  className={styles['arrow-button']}
                  style={{
                    left: '24px',
                  }}
                  onClick={() => {
                    const { document_id: preId } = photoList[currentIndex - 1];
                    // @ts-expect-error -- linter-disable-autofix
                    setCurrentPhotoId(preId);
                  }}
                />
              )
            }
            {
              // Not found, or for the last one, the pre button is not displayed
              currentIndex === -1 ||
              currentIndex === photoList.length - 1 ? null : (
                <IconButton
                  icon={<Icon rotate={180} svg={<SvgArrowLeft />} />}
                  className={styles['arrow-button']}
                  style={{
                    right: '24px',
                  }}
                  onClick={() => {
                    const { document_id: nextId } = photoList[currentIndex + 1];
                    // @ts-expect-error -- linter-disable-autofix
                    setCurrentPhotoId(nextId);
                  }}
                />
              )
            }
          </div>
          <div className={styles['photo-caption-textarea']}>
            <Spin spinning={textAreaLoading}>
              <TextArea
                maxCount={2000}
                maxLength={2000}
                placeholder={I18n.t('knowledge_photo_026')}
                value={textAreaValue}
                onChange={v => setTextAreaValue(v)}
                disabled={disableUpdate}
              />
            </Spin>
            <AutoGenerateButton
              currentValue={textAreaValue}
              document_id={document_id || ''}
              disable={disableUpdate}
              onChange={setTextAreaValue}
              onProgress={setTextAreaLoading}
            />
          </div>
        </div>
      </UIModal>
    ),
    open: () => {
      setVisible(true);
    },
  };
};

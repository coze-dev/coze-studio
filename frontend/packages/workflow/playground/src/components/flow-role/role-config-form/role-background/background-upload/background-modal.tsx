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

import { type ReactCropperElement } from 'react-cropper';
import { useState, useRef, createRef } from 'react';

import { I18n } from '@coze-arch/i18n';
import {
  Modal,
  Upload,
  Toast,
  type UploadProps,
  type FileItem,
} from '@coze-arch/coze-design';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/workflow_api';

import { checkImageWidthAndHeight, getPictureValue } from './utils';
import { useSubmitCroppedImage } from './use-submit-cropped-image';
import { useDragImage } from './use-drag-image';
import { UploadModalFooter } from './upload-modal-footer';
import {
  DragUploadContent,
  FullDragUploadContent,
} from './drag-upload-content';
import { CropperImg } from './cropper';

import css from './background-modal.module.less';

export const MAX_IMG_SIZE = 10 * 1024;

interface BackgroundModalProps {
  visible?: boolean;
  value?: BackgroundImageInfo;
  onChange: (v: BackgroundImageInfo) => void;
  onCancel: () => void;
}

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  visible,
  value,
  onChange,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const { onDragEnter, onDragEnd, isDragIn, onDragOver } = useDragImage();
  const [pictureValue, setPictureValue] = useState<Partial<FileItem>>(
    getPictureValue(value),
  );
  const uploaderRef = useRef<Upload>(null);
  const cropperWebRef = createRef<ReactCropperElement>();
  const cropperMobileRef = createRef<ReactCropperElement>();

  const isEmpty = !pictureValue.url;

  const customRequest: UploadProps['customRequest'] = async options => {
    setLoading(true);
    const { onSuccess, onError, file } = options;
    if (typeof file === 'string') {
      return;
    }
    try {
      const { fileInstance } = file;
      if (fileInstance) {
        const validateSize = await checkImageWidthAndHeight(fileInstance);
        if (validateSize) {
          onSuccess(file);
          setPictureValue(file);
        } else {
          setLoading(false);
        }
      } else {
        onError({
          status: 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAllSideEffect = () => {
    [cropperWebRef, cropperMobileRef].forEach(item => {
      item.current?.cropper?.destroy();
    });
  };

  const handleCancel = () => {
    onCancel();
    clearAllSideEffect();
  };

  const { handleSubmit } = useSubmitCroppedImage({
    onSuccess: onChange,
    handleCancel,
    cropperWebRef,
    cropperMobileRef,
    currentOriginImage: pictureValue ?? {},
    setLoading,
    onAuditCheck: () => {
      Toast.error({
        content: I18n.t('audit_unsuccess_general_type', {
          link: (
            <a
              rel="noreferrer noopener"
              href="/docs/guides/content_principles"
              target="_blank"
            >
              {I18n.t('audit_unsuccess_general_type_url')}
            </a>
          ),
        }),
      });
    },
  });

  return (
    <Modal
      visible={visible}
      width={800}
      title={I18n.t('bgi_title')}
      centered
      maskClosable={false}
      onCancel={onCancel}
    >
      <Upload
        ref={uploaderRef}
        action=""
        limit={1}
        draggable
        customRequest={customRequest}
        accept=".jpeg,.jpg,.png,.webp,.gif"
        showReplace={false}
        showUploadList={false}
        maxSize={MAX_IMG_SIZE}
        onSizeError={() => {
          Toast.error({
            content: I18n.t('upload_image_size_limit', { max_size: '10M' }),
            showClose: false,
          });
        }}
      >
        {isEmpty ? (
          <DragUploadContent
            onUpload={() => {
              uploaderRef?.current?.openFileDialog();
            }}
          />
        ) : (
          <div
            className={css.preview}
            onClick={e => {
              e.stopPropagation();
            }}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragEnd}
          >
            <CropperImg
              cropperRef={cropperWebRef}
              mode="pc"
              url={pictureValue.url}
              backgroundInfo={value?.web_background_image}
              loading={loading}
              setLoading={setLoading}
            />
            <CropperImg
              cropperRef={cropperMobileRef}
              mode="mobile"
              url={pictureValue.url}
              backgroundInfo={value?.mobile_background_image}
              loading={loading}
              setLoading={setLoading}
            />
            {isDragIn ? <FullDragUploadContent /> : null}
          </div>
        )}
      </Upload>
      {!isEmpty && (
        <UploadModalFooter
          onReUpload={() => {
            uploaderRef?.current?.openFileDialog();
          }}
          onCancel={() => setPictureValue({})}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
};

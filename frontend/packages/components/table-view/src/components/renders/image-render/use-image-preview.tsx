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

import { useState } from 'react';

import { REPORT_EVENTS } from '@coze-arch/report-events';
import { I18n } from '@coze-arch/i18n';
import { IconCozUpload } from '@coze-arch/coze-design/icons';
import {
  Upload,
  Input,
  Image,
  Typography,
  Spin,
  Toast,
} from '@coze-arch/coze-design';
import { type UploadProps } from '@coze-arch/bot-semi/Upload';
import { IconImageFailOutlined } from '@coze-arch/bot-icons';
import { CustomError } from '@coze-arch/bot-error';
import { FileBizType } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';
import { useDataModalWithCoze } from '@coze-data/utils';

import styles from '../index.module.less';
import { getBase64, getFileExtension, isValidSize } from './utils';

export interface UseImagePreviewProps {
  src: string;
  setSrc: (src: string) => void;
  onChange?: (src: string, tosKey: string) => void;
  editable?: boolean;
}
export const useImagePreview = ({
  src,
  setSrc,
  onChange,
  editable = true,
}: UseImagePreviewProps) => {
  const [tosKey, setTosKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const { open, close, modal } = useDataModalWithCoze({
    width: 640,
    title: I18n.t('knowledge_insert_img_004'),
    okText: I18n.t('Confirm'),
    okButtonProps: {
      disabled: uploading,
    },
    cancelText: I18n.t('Cancel'),
    onCancel: () => {
      close();
    },
    onOk: () => {
      onChange?.(src, tosKey);
      close();
    },
  });
  const customRequest: UploadProps['customRequest'] = async options => {
    const { onSuccess, onProgress, file } = options;

    if (typeof file === 'string') {
      return;
    }
    try {
      // business
      const { name, fileInstance, url } = file;
      setUploading(true);
      if (fileInstance) {
        setSrc(url || '');
        const extension = getFileExtension(name);
        const base64 = await getBase64(fileInstance);
        const result = await DeveloperApi.UploadFile(
          {
            file_head: {
              file_type: extension,
              biz_type: FileBizType.BIZ_BOT_DATASET,
            },
            data: base64,
          },
          {
            onUploadProgress: e => {
              onProgress({
                total: e.total ?? fileInstance.size,
                loaded: e.loaded,
              });
            },
          },
        );
        onSuccess(result.data);
        setTosKey(result?.data?.upload_uri || '');
        setSrc(result?.data?.upload_url || '');
      } else {
        throw new CustomError(
          REPORT_EVENTS.KnowledgeUploadFile,
          'Upload image fail',
        );
      }
    } catch (error) {
      throw new CustomError(
        REPORT_EVENTS.KnowledgeUploadFile,
        `Upload image fail: ${error}`,
      );
    } finally {
      setUploading(false);
    }
  };
  const Empty = ({ showTips = false }) => (
    <div className={styles['image-upload-empty']}>
      <IconCozUpload className={'text-[32px] coz-fg-hglt'} />
      <div className={styles['image-upload-text']}>
        {I18n.t('knowledge_insert_img_006')}
      </div>
      {showTips ? (
        <div className={styles['image-upload-tips']}>
          {I18n.t('knowledge_insert_img_007')}
        </div>
      ) : null}
    </div>
  );
  return {
    node: modal(
      <div className={styles['image-preview-modal']}>
        <Upload
          className={styles['image-upload']}
          maxSize={20480}
          fileList={[]}
          limit={1}
          accept="image/*"
          disabled={!editable || uploading}
          customRequest={customRequest}
          draggable
          onChange={fileItem => {
            const { currentFile } = fileItem;
            if (currentFile) {
              const isValid = isValidSize(currentFile?.fileInstance?.size || 0);
              if (!isValid) {
                Toast.error(I18n.t('knowledge_insert_img_013'));
              }
            }
          }}
        >
          <Spin
            spinning={uploading}
            tip={I18n.t('knowledge_insert_img_009')}
            wrapperClassName={uploading ? 'spin-uploading' : ''}
          >
            <div className={styles['image-wrapper']}>
              {editable ? (
                <div className={styles['image-hover']}>
                  <Empty showTips />
                </div>
              ) : null}
              <Image
                src={src}
                preview={false}
                fallback={<IconImageFailOutlined />}
              ></Image>
            </div>
          </Spin>
        </Upload>

        <div className="mb-[16px]">
          <Typography className="coz-fg-secondary text-[12px] fw-[500] px-[8px]">
            {I18n.t('knowledge_insert_img_005')}
          </Typography>
          <Input
            value={src}
            onChange={v => {
              setSrc(v);
              setTosKey('');
            }}
            disabled={!editable || uploading}
          />
        </div>
      </div>,
    ),
    open,
    close,
  };
};

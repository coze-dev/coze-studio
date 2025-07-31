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

import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozUpload } from '@coze-arch/coze-design/icons';
import { Button, Tooltip } from '@coze-arch/bot-semi';

import { MAX_FILE_SIZE, MAX_IMAGE_SIZE } from '@/hooks/use-upload/constant';
import { type FileItem } from '@/hooks/use-upload';
import styles from '@/components/test-run/test-form-materials/file/index.module.less';

const genAcceptTips = (accept: string) =>
  accept.replace('image/*', 'image').replaceAll(',.', ', ');

interface Props {
  accept: string;
  fileType?: string;
  disabled?: boolean;
  fileDragging?: boolean;

  fileList?: FileItem[];
  setFileList?: (v?: FileItem[]) => void;
}

export default function CustomUploadNode({
  accept,
  fileDragging,
  disabled,
  fileType,
  fileList,
  setFileList,
}: Props) {
  return (
    <div className={'w-full h-full relative'}>
      <Tooltip
        position={'bottom'}
        content={I18n.t('imageflow_upload_type', {
          type: genAcceptTips(accept),
        })}
      >
        <div className={styles['custom-upload-drag']}>
          <div className={'flex flex-col items-center'}>
            <IconCozUpload
              style={{ visibility: fileDragging ? 'hidden' : 'visible' }}
              className={'text-[20px] coz-fg-hglt'}
            />
            <span className={'mt-[6px] text-[12px]'}>
              {fileDragging
                ? I18n.t('workflow_testset_upload_release')
                : I18n.t('workflow_testset_upload_title')}
            </span>
            <span
              style={{ visibility: fileDragging ? 'hidden' : 'visible' }}
              className={'mt-[4px] text-[12px] coz-fg-dim'}
            >
              {I18n.t('workflow_testset_upload_content', {
                xx:
                  (fileType === 'image' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE) /
                  (1024 * 1024),
              })}
            </span>
          </div>
        </div>
      </Tooltip>

      {fileList && fileList?.length > 0 ? (
        <div
          onClick={e => e.stopPropagation()}
          className={classNames(
            'w-full flex items-center justify-between text-[12px] cursor-default',
            styles['custom-upload-drag-actions'],
          )}
        >
          <span className={'coz-fg-primary font-medium  cursor-text'}>
            {I18n.t('workflow_testset_upload_uploaded')}
          </span>
          <Button
            disabled={disabled}
            onClick={() => {
              if (disabled) {
                return;
              }
              setFileList?.([]);
            }}
            theme="light"
            style={{
              borderColor: 'rgba(var(--coze-bg-1), var(--coze-bg-1-alpha))',
            }}
            className={
              'text-[12px] pl-[3px] pr-[3px] !min-w-0 font-medium !coz-fg-primary bg-background-1'
            }
            size={'small'}
          >
            {I18n.t('workflow_testset_upload_clean')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
